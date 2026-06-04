import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { createVehicle } from '@/lib/actions/vehicles';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ── Schema ──────────────────────────────────────────────────
const vehicleSchema = z.object({
  marque: z.string().min(1, 'Marque requise').max(50),
  modele: z.string().min(1, 'Modèle requis').max(100),
  annee: z.coerce.number().int().min(1900).max(2030),
  couleur: z.string().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  plaque_immatriculation: z
    .string().min(2, 'Immatriculation requise').max(15)
    .regex(/^[A-Z0-9\-\s]+$/i, 'Caractères invalides'),
  vin: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform(v => (!v || v === '' ? undefined : v))
    .refine(v => !v || v.length === 17, 'Le VIN fait exactement 17 caractères'),
  kilometrage_actuel: z.coerce.number().int().min(0, 'Kilométrage invalide'),
});

type VehicleSchema = z.infer<typeof vehicleSchema>;

const STEPS = [
  { n: 1, label: 'Identification', icon: '🚗', title: 'Identification du véhicule', sub: 'Marque, modèle, année et couleur' },
  { n: 2, label: 'Immatriculation', icon: '🔢', title: 'Immatriculation & VIN', sub: 'Plaque et numéro de châssis (optionnel)' },
  { n: 3, label: 'Kilométrage', icon: '📊', title: 'Kilométrage actuel', sub: 'Confirmez le compteur et vérifiez les infos' },
];

export default function VehicleNewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);

  const form = useForm<VehicleSchema>({
    resolver: zodResolver(vehicleSchema as any),
    defaultValues: {
      marque: '',
      modele: '',
      annee: new Date().getFullYear(),
      couleur: '',
      plaque_immatriculation: '',
      vin: '',
      kilometrage_actuel: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: VehicleSchema) => {
      if (!user) throw new Error('Non authentifié');
      return createVehicle(user.id, {
        marque: values.marque,
        modele: values.modele,
        annee: values.annee,
        plaque_immatriculation: values.plaque_immatriculation.toUpperCase().replace(/\s/g, '-'),
        couleur: values.couleur,
        kilometrage_actuel: values.kilometrage_actuel,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicules'] });
      toast.success('Véhicule créé avec succès');
      navigate(`/dashboard/vehicles/${data.id}`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const goNext = async () => {
    const fields: Array<keyof VehicleSchema> =
      step === 1 ? ['marque', 'modele', 'annee'] : ['plaque_immatriculation'];
    const valid = await form.trigger(fields);
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = (values: VehicleSchema) => mutation.mutate(values);

  const currentStep = STEPS[step - 1];
  const vinValue = form.watch('vin') ?? '';

  return (
    <div className="animate-fade-in max-w-xl">
      {/* Back + title */}
      <button
        onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {step > 1 ? 'Étape précédente' : 'Retour aux véhicules'}
      </button>

      <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground mb-6">
        Ajouter un véhicule
      </h1>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center gap-0 flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-mono font-semibold transition-all',
                  step > s.n && 'bg-primary text-primary-foreground',
                  step === s.n && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
                  step < s.n && 'bg-muted text-muted-foreground'
                )}
              >
                {step > s.n ? <Check className="w-4 h-4" /> : s.n}
              </div>
              <span className={cn(
                'text-[10px] font-display uppercase tracking-wider',
                step >= s.n ? 'text-muted-foreground' : 'text-muted-foreground/50'
              )}>
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div
                className={cn(
                  'flex-1 h-px mx-3 mt-[-16px]',
                  step > s.n ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="border border-border rounded-lg p-6 bg-card space-y-5">
          {/* Mutation error */}
          {mutation.error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              ⚠ {(mutation.error as Error).message}
            </div>
          )}

          {/* Step header */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{currentStep.icon}</span>
            <div>
              <h2 className="font-display text-base font-semibold uppercase tracking-wide text-foreground">
                {currentStep.title}
              </h2>
              <p className="text-xs text-muted-foreground">{currentStep.sub}</p>
            </div>
          </div>

          {/* STEP 1 — Identification */}
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Marque" error={form.formState.errors.marque?.message}>
                <Input placeholder="Toyota" {...form.register('marque')} />
              </Field>
              <Field label="Modèle" error={form.formState.errors.modele?.message}>
                <Input placeholder="Land Cruiser" {...form.register('modele')} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Année" error={form.formState.errors.annee?.message}>
                  <Input type="number" placeholder="2019" {...form.register('annee')} />
                </Field>
                <Field label="Couleur" hint="Optionnel">
                  <Input placeholder="Blanc" {...form.register('couleur')} />
                </Field>
              </div>
            </div>
          )}

          {/* STEP 2 — Immatriculation */}
          {step === 2 && (
            <div className="space-y-4">
              <Field label="Plaque d'immatriculation" error={form.formState.errors.plaque_immatriculation?.message}>
                <Input
                  placeholder="KN 1234 AB"
                  className="font-mono uppercase"
                  {...form.register('plaque_immatriculation', {
                    onChange: (e) => {
                      e.target.value = e.target.value.toUpperCase();
                    },
                  })}
                />
              </Field>
              <Field label="Numéro VIN" hint="Optionnel — 17 caractères" error={form.formState.errors.vin?.message}>
                <Input
                  placeholder="1HGBH41JXMN109186"
                  className="font-mono uppercase"
                  maxLength={17}
                  {...form.register('vin', {
                    onChange: (e) => {
                      e.target.value = e.target.value.toUpperCase();
                    },
                  })}
                />
                <p className="text-[10px] font-mono text-muted-foreground/50 text-right mt-1">
                  {vinValue.length} / 17
                </p>
              </Field>
            </div>
          )}

          {/* STEP 3 — Kilométrage */}
          {step === 3 && (
            <div className="space-y-5">
              <Field label="Kilométrage actuel" error={form.formState.errors.kilometrage_actuel?.message}>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="87432"
                    className="font-mono pr-12"
                    {...form.register('kilometrage_actuel')}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">km</span>
                </div>
              </Field>

              {/* Summary */}
              <div className="border border-border rounded-md p-4 space-y-2 bg-muted/20">
                <p className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-2">Récapitulatif</p>
                {[
                  { label: 'Véhicule', value: `${form.watch('marque')} ${form.watch('modele')}` },
                  { label: 'Année', value: String(form.watch('annee')) },
                  { label: 'Immatriculation', value: form.watch('plaque_immatriculation') || '—' },
                  { label: 'VIN', value: vinValue || '—' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-mono text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="px-5 py-2.5 text-sm border border-border rounded-md hover:bg-secondary transition-colors"
            >
              ← Précédent
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="px-5 py-2.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors active:scale-[0.97]"
            >
              Suivant →
            </button>
          ) : (
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-6 py-2.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 active:scale-[0.97]"
            >
              {mutation.isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement…
                </span>
              ) : '✓ Créer le passeport'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────
function Field({
  label, error, hint, children,
}: {
  label: string; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {hint && <span className="text-muted-foreground font-normal ml-1">({hint})</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-destructive">• {error}</p>
      )}
    </div>
  );
}
