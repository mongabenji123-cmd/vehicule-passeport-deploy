import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { createVehicle } from '@/lib/actions/vehicles';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Check, Loader2, Car, QrCode, UserCheck, ArrowRight, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

const vehicleSchema = z.object({
  marque: z.string().min(1, 'Marque requise').max(50),
  modele: z.string().min(1, 'Modèle requis').max(100),
  annee: z.coerce.number().int().min(1900).max(2030),
  plaque_immatriculation: z.string().min(2, 'Immatriculation requise').max(15)
    .regex(/^[A-Z0-9\-\s]+$/i, 'Caractères invalides'),
  kilometrage_actuel: z.coerce.number().int().min(0, 'Kilométrage invalide'),
});

type VehicleForm = z.infer<typeof vehicleSchema>;

const STEPS = [
  { n: 1, label: 'Compte', icon: UserCheck, emoji: '✅' },
  { n: 2, label: 'Véhicule', icon: Car, emoji: '🚗' },
  { n: 3, label: 'QR Code', icon: QrCode, emoji: '📱' },
];

export default function OnboardingPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [createdVehicle, setCreatedVehicle] = useState<{ id: string; plaque: string } | null>(null);

  // Redirect if already onboarded
  useEffect(() => {
    if (profile && (profile as any).onboarding_completed) {
      navigate('/dashboard', { replace: true });
    }
  }, [profile, navigate]);

  const form = useForm<VehicleForm>({
    resolver: zodResolver(vehicleSchema as any),
    defaultValues: { marque: '', modele: '', annee: new Date().getFullYear(), plaque_immatriculation: '', kilometrage_actuel: 0 },
  });

  const createMutation = useMutation({
    mutationFn: async (values: VehicleForm) => {
      if (!user) throw new Error('Non authentifié');
      return createVehicle(user.id, {
        marque: values.marque,
        modele: values.modele,
        annee: values.annee,
        plaque_immatriculation: values.plaque_immatriculation.toUpperCase().replace(/\s/g, '-'),
        kilometrage_actuel: values.kilometrage_actuel,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicules'] });
      setCreatedVehicle({ id: data.id, plaque: data.plaque_immatriculation });
      setStep(3);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const finishMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Non authentifié');
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true } as any)
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Bienvenue sur Auto-Passeport ! 🎉');
      navigate('/dashboard', { replace: true });
    },
  });

  const passportUrl = createdVehicle
    ? `${window.location.origin}/dashboard/vehicles/${createdVehicle.id}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(passportUrl);
    toast.success('Lien copié !');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <h1 className="font-display text-xl font-bold uppercase tracking-wide text-foreground">
          Bienvenue{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Configurons votre espace en 3 étapes</p>
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
        {/* STEP 1 — Account confirmed */}
        {step === 1 && (
          <div className="animate-fade-up space-y-6">
            <div className="border border-border rounded-xl p-6 bg-card text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
                <UserCheck className="w-8 h-8 text-success" />
              </div>
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide">Compte créé !</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Votre compte <span className="font-medium text-foreground">{user?.email}</span> est actif.
                Passons à {"l'ajout"} de votre premier véhicule.
              </p>
              <div className="pt-2 space-y-2 text-left">
                {["Suivi complet de l'entretien", "Alertes kilométrage automatiques", "Passeport véhicule certifié"].map(f => (
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
              Ajouter mon véhicule <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2 — Add vehicle */}
        {step === 2 && (
          <form onSubmit={form.handleSubmit(v => createMutation.mutate(v))} className="animate-fade-up space-y-5">
            <div className="border border-border rounded-xl p-6 bg-card space-y-4">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">🚗</span>
                <div>
                  <h2 className="font-display text-base font-semibold uppercase tracking-wide">Mon premier véhicule</h2>
                  <p className="text-xs text-muted-foreground">Renseignez les infos de base</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Marque" error={form.formState.errors.marque?.message}>
                  <Input placeholder="Toyota" {...form.register('marque')} />
                </Field>
                <Field label="Modèle" error={form.formState.errors.modele?.message}>
                  <Input placeholder="Land Cruiser" {...form.register('modele')} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Année" error={form.formState.errors.annee?.message}>
                  <Input type="number" placeholder="2019" {...form.register('annee')} />
                </Field>
                <Field label="Kilométrage" error={form.formState.errors.kilometrage_actuel?.message}>
                  <div className="relative">
                    <Input type="number" placeholder="87000" className="pr-10 font-mono" {...form.register('kilometrage_actuel')} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">km</span>
                  </div>
                </Field>
              </div>

              <Field label="Plaque d'immatriculation" error={form.formState.errors.plaque_immatriculation?.message}>
                <Input
                  placeholder="KN 1234 AB"
                  className="font-mono uppercase"
                  {...form.register('plaque_immatriculation', {
                    onChange: (e) => { e.target.value = e.target.value.toUpperCase(); },
                  })}
                />
              </Field>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 text-sm border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                ← Retour
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Création…</>
                ) : (
                  <>Créer le passeport <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3 — QR Code / Passport link */}
        {step === 3 && createdVehicle && (
          <div className="animate-fade-up space-y-6">
            <div className="border border-border rounded-xl p-6 bg-card text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
                Passeport créé ! 🎉
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Votre véhicule <span className="font-mono font-semibold text-foreground">{createdVehicle.plaque}</span> a son passeport digital.
                Partagez ce lien ou scannez le QR code lors de votre prochaine visite au garage.
              </p>

              {/* QR placeholder with link */}
              <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-3">
                <div className="w-32 h-32 mx-auto bg-foreground/5 border-2 border-dashed border-border rounded-xl flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-muted-foreground/30" />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Le QR code sera généré automatiquement avec votre passeport
                </p>
              </div>

              {/* Copy link */}
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs border border-border rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              >
                <Copy className="w-3.5 h-3.5" />
                Copier le lien du passeport
              </button>
            </div>

            <button
              onClick={() => finishMutation.mutate()}
              disabled={finishMutation.isPending}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {finishMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Finalisation…</>
              ) : (
                <>Accéder à mon dashboard <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            <button
              onClick={() => finishMutation.mutate()}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Passer cette étape →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">• {error}</p>}
    </div>
  );
}
