import logoSrc from '@/assets/logo-icon.svg';
import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { RoleCard } from '@/components/ui/RoleCard';
import { VehiclePassportMock } from '@/components/landing/VehiclePassportMock';
import { Mail, User, AlertCircle, Loader2, ArrowLeft, CheckCircle2, RefreshCw, ShieldAlert } from 'lucide-react';
import { checkRateLimit } from '@/lib/utils/rateLimit';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

const signupSchema = z.object({
  full_name: z.string().min(2, 'Nom trop court').max(100, 'Nom trop long'),
  email: z.string().email('Email invalide'),
  password: z.string()
    .min(8, '8 caractères minimum')
    .regex(/[A-Z]/, 'Au moins une majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password'],
});

type SignupValues = z.infer<typeof signupSchema>;
type AppRole = 'owner' | 'garage' | 'seller';

/* ─── Decorative left column ─── */
function SignupDecorativeColumn({ role }: { role: AppRole }) {
  const content: Record<AppRole, { quote: string; stat: string }> = {
    owner: {
      quote: 'Vendez votre voiture plus cher avec un historique certifié.',
      stat: 'Le passeport numérique de votre véhicule',
    },
    garage: {
      quote: 'Rejoignez le réseau de garages certifiés Auto-Passeport.',
      stat: 'Visibilité et confiance auprès de vos clients',
    },
    seller: {
      quote: "Vendez vos pièces détachées en toute confiance.",
      stat: 'Une marketplace dédiée aux pièces auto',
    },
  };

  const c = content[role];

  return (
    <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-card border-r border-border relative overflow-hidden px-12">
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="dots-signup" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="currentColor" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#dots-signup)" />
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_60%,hsl(217_91%_60%/0.09),transparent_70%)]" />

      <div className="relative max-w-sm">
        <div className="w-10 h-px bg-primary mb-6" />
        <blockquote key={role} className="font-display text-3xl font-bold italic leading-snug text-foreground mb-6 transition-opacity duration-300">
          &ldquo;{c.quote}&rdquo;
        </blockquote>
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-px bg-primary" />
          <p className="text-sm text-muted-foreground">{c.stat}</p>
        </div>
        <VehiclePassportMock variant="auth" />
      </div>
    </div>
  );
}

/* ─── Step indicator ─── */
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-6">
      <p className="text-xs text-muted-foreground mb-2 font-display uppercase tracking-wider">
        Étape {current} sur {total}
      </p>
      <div className="w-full h-1 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<AppRole>((searchParams.get('role') as AppRole) || 'owner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const r = searchParams.get('role');
    if (r === 'owner' || r === 'garage' || r === 'seller') setRole(r);
  }, [searchParams]);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema as any),
  });

  const passwordValue = watch('password') || '';

  const onSubmit = async (values: SignupValues) => {
    const rl = checkRateLimit('signup');
    if (!rl.allowed) {
      setError(`Trop de tentatives. Réessayez dans ${rl.retryAfterSeconds}s.`);
      return;
    }
    setLoading(true);
    setError(null);
    const redirectTo = role === 'seller' ? `${window.location.origin}/marketplace` : `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.full_name, role },
        emailRedirectTo: redirectTo,
      },
    });
    if (!error) {
      fetch(`https://us-central1-auto-passeport.cloudfunctions.net/sendWelcomeEmail?email=${values.email}`)
        .then(() => console.log("Email de bienvenue lancé !"))
        .catch(err => console.error("Erreur email:", err));
    }
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSubmittedEmail(values.email);
    setEmailSent(true);
    setLoading(false);
  };

  const inputClass = "flex h-11 w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] transition-all duration-200";

  return (
    <div className="min-h-screen flex bg-background">
      <SignupDecorativeColumn role={role} />

      {/* ─── Right column ─── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-10">
            <img src={logoSrc} alt="Auto-Passeport" className="w-9 h-9 object-contain" />
            <span className="font-display text-sm font-bold uppercase tracking-widest text-foreground">Auto-Passeport</span>
          </Link>

          {emailSent ? (
            <div className="text-center py-8">
              <div className="mx-auto w-14 h-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7 text-success" />
              </div>
              <h2 className="font-display text-xl font-bold uppercase tracking-wide text-foreground mb-2">
                Vérifiez votre email !
              </h2>
              <p className="text-sm text-muted-foreground mb-1">
                Un lien de confirmation a été envoyé à
              </p>
              <p className="text-sm text-foreground font-mono mb-4">{submittedEmail}</p>
              <p className="text-xs text-muted-foreground/60 mb-6">
                Cliquez sur le lien pour activer votre compte. Le lien est valide 24h.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setEmailSent(false); setError(null); }}>
                  <RefreshCw className="w-3 h-3" /> Renvoyer
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setEmailSent(false); setStep(2); }}>
                  Changer l'email
                </Button>
              </div>
            </div>
          ) : (
            <>
              <StepIndicator current={step} total={2} />

              <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground mb-1">
                {step === 1 ? 'Qui êtes-vous ?' : 'Vos informations'}
              </h1>
              <p className="text-sm text-muted-foreground mb-8">
                {step === 1 ? 'Choisissez votre profil pour personnaliser votre expérience' : 'Remplissez le formulaire pour créer votre compte'}
              </p>

              {step === 1 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <RoleCard role="owner" selected={role === 'owner'} onSelect={() => setRole('owner')} />
                    <RoleCard role="garage" selected={role === 'garage'} onSelect={() => setRole('garage')} />
                    <RoleCard role="seller" selected={role === 'seller'} onSelect={() => setRole('seller')} />
                  </div>
                  <Button className="w-full py-3.5 font-display font-semibold uppercase tracking-wider active:scale-[0.97]" onClick={() => setStep(2)}>
                    Continuer
                  </Button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
                  >
                    <ArrowLeft className="w-4 h-4" /> Retour
                  </button>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="full_name" className="text-sm font-medium text-muted-foreground">Nom complet</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <input {...register('full_name')} id="full_name" placeholder="Jean Dupont" className={`${inputClass} pl-10`} />
                      </div>
                      {errors.full_name && <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.full_name.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <input {...register('email')} id="email" type="email" placeholder="jean@example.com" className={`${inputClass} pl-10`} />
                      </div>
                      {errors.email && <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">Mot de passe</Label>
                      <PasswordInput {...register('password')} id="password" placeholder="••••••••" />
                      <PasswordStrength password={passwordValue} />
                      {errors.password && <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirm_password" className="text-sm font-medium text-muted-foreground">Confirmer le mot de passe</Label>
                      <PasswordInput {...register('confirm_password')} id="confirm_password" placeholder="••••••••" />
                      {errors.confirm_password && <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirm_password.message}</p>}
                    </div>

                    {error && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                        <p className="text-destructive text-sm">{error}</p>
                      </div>
                    )}

                    <Button type="submit" className="w-full py-3.5 font-display font-semibold uppercase tracking-wider active:scale-[0.97]" disabled={loading}>
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Création en cours...</> : 'Créer mon compte →'}
                    </Button>
                  </form>

                  <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">ou</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <GoogleSignInButton label="S'inscrire avec Google" />
                </>
              )}

              <p className="text-center text-sm text-muted-foreground mt-6">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">Se connecter</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
