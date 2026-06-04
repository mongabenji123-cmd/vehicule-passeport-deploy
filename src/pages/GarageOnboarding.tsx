import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, Loader2, Building2, Wrench, UserCheck, ArrowRight, Search, Car, MapPin, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Schemas ──────────────────────────────────────────────────
const garageSchema = z.object({
  nom_garage: z.string().min(2, 'Nom du garage requis').max(100),
  commune: z.string().min(2, 'Commune requise').max(100),
  adresse_complete: z.string().optional().or(z.literal('')),
  telephone: z.string().min(8, 'Téléphone requis').max(20),
  whatsapp: z.string().optional().or(z.literal('')),
  specialites: z.string().optional().or(z.literal('')),
});

type GarageForm = z.infer<typeof garageSchema>;

const interventionSchema = z.object({
  vehicule_id: z.string().uuid('Sélectionnez un véhicule'),
  type_service: z.string().min(1, 'Type requis'),
  description_travaux: z.string().min(5, 'Description trop courte').max(1000),
  kilometrage_au_moment_rdv: z.coerce.number().int().min(0, 'Kilométrage invalide'),
  date_intervention: z.string().min(1, 'Date requise'),
});

type InterventionForm = z.infer<typeof interventionSchema>;

const INTERVENTION_TYPES = [
  { value: 'Vidange', icon: '🛢️' },
  { value: 'Freins', icon: '🔴' },
  { value: 'Pneus', icon: '⚫' },
  { value: 'Contrôle technique', icon: '📋' },
  { value: 'Climatisation', icon: '❄️' },
  { value: 'Carrosserie', icon: '🔧' },
  { value: 'Autre', icon: '🔩' },
];

const STEPS = [
  { n: 1, label: 'Compte', icon: UserCheck },
  { n: 2, label: 'Garage', icon: Building2 },
  { n: 3, label: 'Intervention', icon: Wrench },
];

type VehicleResult = {
  id: string;
  marque: string;
  modele: string;
  annee: number | null;
  plaque_immatriculation: string;
  kilometrage_actuel: number | null;
};

export default function GarageOnboardingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [createdGarageId, setCreatedGarageId] = useState<string | null>(null);

  // Vehicle search state for step 3
  const [searchImmat, setSearchImmat] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleResult | null>(null);

  useEffect(() => {
    if (profile && profile.onboarding_completed) {
      navigate('/dashboard', { replace: true });
    }
  }, [profile, navigate]);

  // ── Garage form ──────────────────────────────────────────
  const garageForm = useForm<GarageForm>({
    resolver: zodResolver(garageSchema as any),
    defaultValues: {
      nom_garage: '', commune: '', adresse_complete: '',
      telephone: '', whatsapp: '', specialites: '',
    },
  });

  const garageMutation = useMutation({
    mutationFn: async (values: GarageForm) => {
      const specs = values.specialites
        ? values.specialites.split(',').map(s => s.trim()).filter(Boolean)
        : null;
      if (!user) throw new Error('Non authentifié');
      const { data, error } = await supabase
        .from('garages')
        .insert({
          nom_garage: values.nom_garage,
          commune: values.commune,
          adresse_complete: values.adresse_complete || null,
          telephone: values.telephone,
          whatsapp: values.whatsapp || null,
          specialites: specs,
          est_certifie: false,
          user_id: user.id,
        })
        .select('id')
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['garages'] });
      setCreatedGarageId(data.id);
      setStep(3);
      toast.success('Garage enregistré !');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Vehicle search ───────────────────────────────────────
  const { data: foundVehicle, isFetching: isSearching } = useQuery({
    queryKey: ['search-vehicle-onboard', searchImmat],
    queryFn: async () => {
      if (!searchImmat || searchImmat.length < 3) return null;
      const { data } = await supabase
        .from('vehicules')
        .select('id, marque, modele, annee, plaque_immatriculation, kilometrage_actuel')
        .ilike('plaque_immatriculation', `%${searchImmat.replace(/\s/g, '-')}%`)
        .limit(1)
        .single();
      return data as VehicleResult | null;
    },
    enabled: searchImmat.length >= 3 && !selectedVehicle,
  });

  // ── Intervention form ────────────────────────────────────
  const interventionForm = useForm<InterventionForm>({
    resolver: zodResolver(interventionSchema as any),
    defaultValues: {
      vehicule_id: '', type_service: '', description_travaux: '',
      kilometrage_au_moment_rdv: 0,
      date_intervention: new Date().toISOString().split('T')[0],
    },
  });

  const interventionMutation = useMutation({
    mutationFn: async (values: InterventionForm) => {
      const { error } = await supabase
        .from('interventions')
        .insert({
          vehicule_id: values.vehicule_id,
          type_service: values.type_service,
          description_travaux: values.description_travaux,
          kilometrage_au_moment_rdv: values.kilometrage_au_moment_rdv,
          date_intervention: values.date_intervention,
          garage_id: createdGarageId,
        });
      if (error) throw new Error(error.message);

      // Update vehicle mileage
      if (values.kilometrage_au_moment_rdv) {
        await supabase
          .from('vehicules')
          .update({ kilometrage_actuel: values.kilometrage_au_moment_rdv })
          .eq('id', values.vehicule_id)
          .lt('kilometrage_actuel', values.kilometrage_au_moment_rdv);
      }
    },
    onSuccess: () => finishOnboarding(),
    onError: (err: Error) => toast.error(err.message),
  });

  const finishOnboarding = async () => {
    if (!user) return;
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true } as any)
      .eq('id', user.id);
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    toast.success('Bienvenue sur Auto-Passeport ! 🎉');
    navigate('/dashboard', { replace: true });
  };

  const selectVehicle = (v: VehicleResult) => {
    setSelectedVehicle(v);
    interventionForm.setValue('vehicule_id', v.id);
    interventionForm.setValue('kilometrage_au_moment_rdv', v.kilometrage_actuel ?? 0);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="font-display text-xl font-bold uppercase tracking-wide text-foreground">
          Bienvenue, partenaire 🔧
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Configurons votre garage en 3 étapes</p>
      </div>

      {/* Stepper */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-0 flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                  step > s.n && 'bg-primary text-primary-foreground',
                  step === s.n && 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-background',
                  step < s.n && 'bg-muted text-muted-foreground',
                )}>
                  {step > s.n ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span className={cn(
                  'text-[10px] font-display uppercase tracking-wider',
                  step >= s.n ? 'text-foreground' : 'text-muted-foreground/50',
                )}>{s.label}</span>
              </div>
              {i < 2 && (
                <div className={cn('flex-1 h-px mx-2 mt-[-18px]', step > s.n ? 'bg-primary' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-8">

        {/* ═══ STEP 1 — Account confirmed ═══ */}
        {step === 1 && (
          <div className="animate-fade-up space-y-6">
            <div className="border border-border rounded-xl p-6 bg-card text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
                <UserCheck className="w-8 h-8 text-success" />
              </div>
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide">Compte créé !</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Votre compte <span className="font-medium text-foreground">{user?.email}</span> est actif.
                Enregistrons maintenant votre garage.
              </p>
              <div className="pt-2 space-y-2 text-left">
                {["Visibilité sur la plateforme", "Interventions certifiées", "Badge garage vérifié"].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-success flex-shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Enregistrer mon garage <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ═══ STEP 2 — Garage info ═══ */}
        {step === 2 && (
          <form onSubmit={garageForm.handleSubmit(v => garageMutation.mutate(v))} className="animate-fade-up space-y-5">
            <div className="border border-border rounded-xl p-6 bg-card space-y-4">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">🏗️</span>
                <div>
                  <h2 className="font-display text-base font-semibold uppercase tracking-wide">Infos du garage</h2>
                  <p className="text-xs text-muted-foreground">Ces infos seront visibles par les propriétaires</p>
                </div>
              </div>

              <Field label="Nom du garage" error={garageForm.formState.errors.nom_garage?.message}>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Garage Excellence Auto" className="pl-9" {...garageForm.register('nom_garage')} />
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Commune" error={garageForm.formState.errors.commune?.message}>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Gombe" className="pl-9" {...garageForm.register('commune')} />
                  </div>
                </Field>
                <Field label="Téléphone" error={garageForm.formState.errors.telephone?.message}>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="+243..." className="pl-9 font-mono" {...garageForm.register('telephone')} />
                  </div>
                </Field>
              </div>

              <Field label="Adresse complète" hint="Optionnel">
                <Input placeholder="123 Avenue de la Paix" {...garageForm.register('adresse_complete')} />
              </Field>

              <Field label="WhatsApp" hint="Optionnel">
                <Input placeholder="+243..." className="font-mono" {...garageForm.register('whatsapp')} />
              </Field>

              <Field label="Spécialités" hint="Séparées par des virgules">
                <Input placeholder="Vidange, Freins, Climatisation" {...garageForm.register('specialites')} />
              </Field>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="px-5 py-3 text-sm border border-border rounded-lg hover:bg-secondary transition-colors">
                ← Retour
              </button>
              <button type="submit" disabled={garageMutation.isPending}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2">
                {garageMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</>
                ) : (
                  <>Enregistrer <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ═══ STEP 3 — First intervention ═══ */}
        {step === 3 && (
          <div className="animate-fade-up space-y-5">
            <div className="border border-border rounded-xl p-6 bg-card space-y-5">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">🔧</span>
                <div>
                  <h2 className="font-display text-base font-semibold uppercase tracking-wide">Première intervention</h2>
                  <p className="text-xs text-muted-foreground">Recherchez un véhicule par plaque et enregistrez</p>
                </div>
              </div>

              {/* Vehicle search */}
              {!selectedVehicle ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="KN 1234 AB"
                      value={searchImmat}
                      onChange={(e) => setSearchImmat(e.target.value.toUpperCase())}
                      className="pl-9 font-mono"
                    />
                    {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />}
                  </div>
                  {foundVehicle && !isSearching && (
                    <button type="button" onClick={() => selectVehicle(foundVehicle)}
                      className="w-full text-left rounded-xl p-4 border border-border hover:border-primary/30 bg-card transition-all">
                      <p className="text-sm font-semibold">{foundVehicle.marque} {foundVehicle.modele}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {foundVehicle.plaque_immatriculation} · {foundVehicle.annee} · {(foundVehicle.kilometrage_actuel ?? 0).toLocaleString('fr-FR')} km
                      </p>
                      <p className="text-xs text-primary mt-1">Cliquer pour sélectionner →</p>
                    </button>
                  )}
                  {searchImmat.length >= 3 && !foundVehicle && !isSearching && (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun véhicule trouvé pour « {searchImmat} »</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">{selectedVehicle.marque} {selectedVehicle.modele}</p>
                      <p className="text-xs text-muted-foreground font-mono">{selectedVehicle.plaque_immatriculation}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setSelectedVehicle(null); setSearchImmat(''); }}
                    className="text-xs text-muted-foreground hover:text-foreground">Changer</button>
                </div>
              )}

              {/* Intervention form (only when vehicle selected) */}
              {selectedVehicle && (
                <form onSubmit={interventionForm.handleSubmit(v => interventionMutation.mutate(v))} className="space-y-4 pt-2 border-t border-border">
                  {/* Type grid */}
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Type</label>
                    <div className="grid grid-cols-4 gap-2">
                      {INTERVENTION_TYPES.map(t => {
                        const selected = interventionForm.watch('type_service') === t.value;
                        return (
                          <button key={t.value} type="button"
                            onClick={() => interventionForm.setValue('type_service', t.value, { shouldValidate: true })}
                            className={cn(
                              'flex flex-col items-center gap-1 p-2.5 rounded-lg text-center border transition-all',
                              selected ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary/20',
                            )}>
                            <span className="text-base">{t.icon}</span>
                            <span className="text-[10px] font-medium leading-tight">{t.value}</span>
                          </button>
                        );
                      })}
                    </div>
                    {interventionForm.formState.errors.type_service && (
                      <p className="mt-1 text-xs text-destructive">• {interventionForm.formState.errors.type_service.message}</p>
                    )}
                  </div>

                  <Field label="Description" error={interventionForm.formState.errors.description_travaux?.message}>
                    <Textarea {...interventionForm.register('description_travaux')} placeholder="Décrivez les travaux…" rows={3} className="resize-none" />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Kilométrage" error={interventionForm.formState.errors.kilometrage_au_moment_rdv?.message}>
                      <Input type="number" className="font-mono" {...interventionForm.register('kilometrage_au_moment_rdv')} />
                    </Field>
                    <Field label="Date" error={interventionForm.formState.errors.date_intervention?.message}>
                      <Input type="date" {...interventionForm.register('date_intervention')} />
                    </Field>
                  </div>

                  <button type="submit" disabled={interventionMutation.isPending}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2">
                    {interventionMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</>
                    ) : (
                      <>Enregistrer et terminer <Check className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Skip button */}
            <button onClick={finishOnboarding}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
              Passer cette étape et aller au dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {hint && <span className="text-muted-foreground font-normal ml-1">({hint})</span>}
      </label>
      {children}
      {error && <p className="text-xs text-destructive">• {error}</p>}
    </div>
  );
}
