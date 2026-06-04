import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Search, Loader2, Car, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Schema ───────────────────────────────────────────────────
const interventionSchema = z.object({
  vehicule_id: z.string().uuid('Sélectionnez un véhicule'),
  type_service: z.string().min(1, 'Type requis'),
  description_travaux: z.string().min(5, 'Description trop courte').max(1000),
  kilometrage_au_moment_rdv: z.coerce.number().int().min(0, 'Kilométrage invalide'),
  montant_facture: z.coerce.number().min(0, 'Montant invalide').optional(),
  date_intervention: z.string().min(1, 'Date requise'),
});

type InterventionFormValues = z.infer<typeof interventionSchema>;

const INTERVENTION_TYPES = [
  { value: 'Vidange', icon: '🛢️' },
  { value: 'Freins', icon: '🔴' },
  { value: 'Pneus', icon: '⚫' },
  { value: 'Courroie distribution', icon: '⚙️' },
  { value: 'Contrôle technique', icon: '📋' },
  { value: 'Climatisation', icon: '❄️' },
  { value: 'Carrosserie', icon: '🔧' },
  { value: 'Autre', icon: '🔩' },
];

const STEPS = [
  { n: 1, label: 'Véhicule' },
  { n: 2, label: 'Intervention' },
  { n: 3, label: 'Photos' },
];

type VehicleResult = {
  id: string;
  marque: string;
  modele: string;
  annee: number | null;
  plaque_immatriculation: string;
  kilometrage_actuel: number | null;
  proprietaire_id: string | null;
};

// ── Search vehicle by plate ──────────────────────────────────
async function searchVehicle(immat: string): Promise<VehicleResult | null> {
  if (!immat || immat.length < 3) return null;
  const { data, error } = await supabase
    .from('vehicules')
    .select('id, marque, modele, annee, plaque_immatriculation, kilometrage_actuel, proprietaire_id')
    .ilike('plaque_immatriculation', `%${immat.replace(/\s/g, '-')}%`)
    .limit(1)
    .single();
  if (error) return null;
  return data;
}

// ── Upload photos ────────────────────────────────────────────
async function uploadPhotos(files: File[], vehicleId: string, userId: string): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${userId}/${vehicleId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from('intervention-docs')
      .upload(path, file, { contentType: file.type });
    if (!error) {
      const { data } = supabase.storage.from('intervention-docs').getPublicUrl(path);
      urls.push(data.publicUrl);
    }
  }
  return urls;
}

export default function InterventionNewPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [searchImmat, setSearchImmat] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleResult | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(false);

  const prefilledVehicleId = searchParams.get('vehicleId');

  const form = useForm<InterventionFormValues>({
    resolver: zodResolver(interventionSchema as any),
    defaultValues: {
      vehicule_id: '',
      type_service: '',
      description_travaux: '',
      kilometrage_au_moment_rdv: 0,
      montant_facture: undefined,
      date_intervention: new Date().toISOString().split('T')[0],
    },
  });

  // Fetch garage for current user
  const { data: garageData } = useQuery({
    queryKey: ['my-garage', user?.id],
      queryFn: async () => {
        if (!user) return null;
        const { data } = await supabase
          .from('garages')
          .select('id, nom_garage')
          .eq('user_id', user.id)
          .maybeSingle();
        return data;
      },
    enabled: !!user && profile?.role === 'garage',
  });

  // Search vehicle query
  const { data: foundVehicle, isFetching: isSearching } = useQuery({
    queryKey: ['search-vehicle', searchImmat],
    queryFn: () => searchVehicle(searchImmat),
    enabled: searchImmat.length >= 3 && !selectedVehicle,
  });

  // Prefill vehicle from query param
  useQuery({
    queryKey: ['vehicle-prefill', prefilledVehicleId],
    queryFn: async () => {
      if (!prefilledVehicleId) return null;
      const { data } = await supabase
        .from('vehicules')
        .select('id, marque, modele, annee, plaque_immatriculation, kilometrage_actuel, proprietaire_id')
        .eq('id', prefilledVehicleId)
        .single();
      return data as VehicleResult | null;
    },
    enabled: !!prefilledVehicleId && !selectedVehicle,
  });

  // Handle prefill effect
  const { data: prefilledVehicle } = useQuery({
    queryKey: ['vehicle-prefill', prefilledVehicleId],
    queryFn: async () => {
      if (!prefilledVehicleId) return null;
      const { data } = await supabase
        .from('vehicules')
        .select('id, marque, modele, annee, plaque_immatriculation, kilometrage_actuel, proprietaire_id')
        .eq('id', prefilledVehicleId)
        .single();
      return data as VehicleResult | null;
    },
    enabled: !!prefilledVehicleId && !selectedVehicle,
  });

  useEffect(() => {
    if (prefilledVehicle && !selectedVehicle) {
      setSelectedVehicle(prefilledVehicle);
      form.setValue('vehicule_id', prefilledVehicle.id);
      form.setValue('kilometrage_au_moment_rdv', prefilledVehicle.kilometrage_actuel ?? 0);
      setStep(2);
    }
  }, [prefilledVehicle]);

  // Mutation
  const mutation = useMutation({
    mutationFn: async (values: InterventionFormValues) => {
      if (!user) throw new Error('Non authentifié');

      setUploadProgress(true);
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        photoUrls = await uploadPhotos(photos, values.vehicule_id, user.id);
      }
      setUploadProgress(false);

      const { data, error } = await supabase
        .from('interventions')
        .insert({
          vehicule_id: values.vehicule_id,
          type_service: values.type_service,
          description_travaux: values.description_travaux,
          kilometrage_au_moment_rdv: values.kilometrage_au_moment_rdv,
          montant_facture: values.montant_facture ?? null,
          date_intervention: values.date_intervention,
          photos_url: photoUrls.length > 0 ? photoUrls : null,
          garage_id: garageData?.id ?? null,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);

      // Update vehicle mileage if higher
      if (values.kilometrage_au_moment_rdv) {
        await supabase
          .from('vehicules')
          .update({ kilometrage_actuel: values.kilometrage_au_moment_rdv })
          .eq('id', values.vehicule_id)
          .lt('kilometrage_actuel', values.kilometrage_au_moment_rdv);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', selectedVehicle?.id] });
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      toast.success('Intervention enregistrée');
      navigate(`/dashboard/vehicles/${selectedVehicle?.id}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Photo handlers
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter(f => f.type.startsWith('image/')).slice(0, 8);
    if (files.some(f => f.size > 5 * 1024 * 1024)) {
      toast.error('Taille maximale : 5 Mo par image');
      return;
    }
    setPhotos(files);
    setPhotoPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Step navigation
  const goNext = async () => {
    if (step === 1) {
      if (!selectedVehicle) return;
      setStep(2);
    } else if (step === 2) {
      const valid = await form.trigger([
        'type_service', 'description_travaux', 'kilometrage_au_moment_rdv', 'date_intervention',
      ]);
      if (valid) setStep(3);
    }
  };

  const selectVehicle = (v: VehicleResult) => {
    setSelectedVehicle(v);
    form.setValue('vehicule_id', v.id);
    form.setValue('kilometrage_au_moment_rdv', v.kilometrage_actuel ?? 0);
  };

  const clearVehicle = () => {
    setSelectedVehicle(null);
    form.setValue('vehicule_id', '');
    setSearchImmat('');
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {step > 1 ? 'Étape précédente' : 'Retour'}
        </button>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
          Saisir une intervention
        </h1>
        {garageData?.nom_garage && (
          <p className="text-sm text-muted-foreground mt-1">{garageData.nom_garage}</p>
        )}
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors',
                  step >= s.n
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground',
                  step === s.n && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                )}
              >
                {step > s.n ? '✓' : s.n}
              </div>
              <span className={cn(
                'text-xs font-medium',
                step >= s.n ? 'text-muted-foreground' : 'text-muted-foreground/50'
              )}>
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div className={cn(
                'h-px flex-1 mx-2',
                step > s.n ? 'bg-primary' : 'bg-border'
              )} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
        <div className="border border-border rounded-xl p-6 bg-card">
          {/* Mutation error */}
          {mutation.error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              ⚠ {(mutation.error as Error).message}
            </div>
          )}

          {/* ═══ STEP 1 — Vehicle selection ═══ */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <StepHeader icon="🚗" title="Sélection du véhicule" sub="Recherchez par immatriculation" />

              {selectedVehicle ? (
                <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {selectedVehicle.marque} {selectedVehicle.modele}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {selectedVehicle.plaque_immatriculation} · {selectedVehicle.annee}
                        {' '}· {(selectedVehicle.kilometrage_actuel ?? 0).toLocaleString('fr-FR')} km
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={clearVehicle} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Changer
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="KN 1234 AB"
                      value={searchImmat}
                      onChange={(e) => setSearchImmat(e.target.value.toUpperCase())}
                      className="pl-9 font-mono"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                    )}
                  </div>

                  {foundVehicle && !isSearching && (
                    <button
                      type="button"
                      onClick={() => selectVehicle(foundVehicle)}
                      className="w-full text-left rounded-xl p-4 transition-all border border-border hover:border-primary/30 bg-card"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {foundVehicle.marque} {foundVehicle.modele}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {foundVehicle.plaque_immatriculation} · {foundVehicle.annee}
                        {' '}· {(foundVehicle.kilometrage_actuel ?? 0).toLocaleString('fr-FR')} km
                      </p>
                      <p className="text-xs text-primary mt-1">Cliquer pour sélectionner →</p>
                    </button>
                  )}

                  {searchImmat.length >= 3 && !foundVehicle && !isSearching && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun véhicule trouvé pour « {searchImmat} »
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══ STEP 2 — Intervention details ═══ */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <StepHeader icon="🔧" title="Détails de l'intervention" sub="Type, description, kilométrage et coût" />

              {/* Type grid */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Type d'intervention
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {INTERVENTION_TYPES.map((t) => {
                    const selected = form.watch('type_service') === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => form.setValue('type_service', t.value, { shouldValidate: true })}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-center border',
                          selected
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'bg-secondary/50 border-border hover:border-primary/20 text-muted-foreground'
                        )}
                      >
                        <span className="text-lg">{t.icon}</span>
                        <span className="text-xs font-medium">{t.value}</span>
                      </button>
                    );
                  })}
                </div>
                {form.formState.errors.type_service && (
                  <p className="mt-1 text-xs text-destructive">• {form.formState.errors.type_service.message}</p>
                )}
              </div>

              {/* Description */}
              <FieldWrapper label="Description" error={form.formState.errors.description_travaux?.message}>
                <Textarea
                  {...form.register('description_travaux')}
                  placeholder="Décrivez l'intervention réalisée…"
                  rows={4}
                  className="resize-none"
                />
              </FieldWrapper>

              {/* Km + Cost side by side */}
              <div className="grid grid-cols-2 gap-4">
                <FieldWrapper label="Kilométrage (km)" error={form.formState.errors.kilometrage_au_moment_rdv?.message}>
                  <Input {...form.register('kilometrage_au_moment_rdv')} type="number" min={0} className="font-mono" />
                </FieldWrapper>
                <FieldWrapper label="Coût (optionnel)" error={form.formState.errors.montant_facture?.message}>
                  <Input {...form.register('montant_facture')} type="number" min={0} step="0.01" placeholder="0.00" className="font-mono" />
                </FieldWrapper>
              </div>

              {/* Date */}
              <FieldWrapper label="Date de l'intervention" error={form.formState.errors.date_intervention?.message}>
                <Input {...form.register('date_intervention')} type="date" className="font-mono" />
              </FieldWrapper>
            </div>
          )}

          {/* ═══ STEP 3 — Photos & Confirmation ═══ */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              <StepHeader icon="📷" title="Photos & Confirmation" sub="Ajoutez des photos (optionnel) puis confirmez" />

              {/* Photo upload */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Photos (max 8)
                </label>
                <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl cursor-pointer transition-all border-2 border-dashed border-border hover:border-primary/40 bg-secondary/30 hover:bg-secondary/50">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-muted-foreground/50">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21,15 16,10 5,21" />
                  </svg>
                  <span className="text-sm text-muted-foreground">
                    Cliquer pour ajouter des photos
                  </span>
                  <span className="text-xs text-muted-foreground/50">
                    JPEG, PNG, WebP — max 5 Mo chacune
                  </span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>

                {photoPreviews.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {photoPreviews.map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} alt={`Photo ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-border" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="rounded-xl p-5 border border-border bg-secondary/30">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Récapitulatif</p>
                <div className="space-y-0">
                  {[
                    { label: 'Véhicule', value: `${selectedVehicle?.marque} ${selectedVehicle?.modele}` },
                    { label: 'Immat', value: selectedVehicle?.plaque_immatriculation ?? '—' },
                    { label: 'Intervention', value: form.watch('type_service') },
                    { label: 'Kilométrage', value: `${Number(form.watch('kilometrage_au_moment_rdv')).toLocaleString('fr-FR')} km` },
                    { label: 'Date', value: form.watch('date_intervention') },
                    { label: 'Coût', value: form.watch('montant_facture') ? `${Number(form.watch('montant_facture')).toFixed(2)} $` : '—' },
                    { label: 'Photos', value: `${photos.length} photo${photos.length !== 1 ? 's' : ''}` },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between gap-4 py-2 border-b border-border last:border-0">
                      <span className="text-xs text-muted-foreground">{row.label}</span>
                      <span className="text-xs font-mono text-foreground">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6 gap-4">
          {step > 1 ? (
            <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)}>
              ← Précédent
            </Button>
          ) : <div />}

          {step < 3 ? (
            <Button type="button" onClick={goNext} disabled={step === 1 && !selectedVehicle}>
              Suivant →
            </Button>
          ) : (
            <Button type="submit" disabled={mutation.isPending || uploadProgress}>
              {mutation.isPending || uploadProgress ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {uploadProgress ? 'Upload en cours...' : 'Enregistrement...'}
                </span>
              ) : "✓ Valider l'intervention"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────
function StepHeader({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 mb-2">
      <span className="text-2xl">{icon}</span>
      <div>
        <h2 className="font-display font-bold text-lg uppercase tracking-wide text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function FieldWrapper({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-destructive">• {error}</p>
      )}
    </div>
  );
}
