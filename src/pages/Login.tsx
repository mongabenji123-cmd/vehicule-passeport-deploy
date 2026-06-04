import logoSrc from '@/assets/logo-icon.svg';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { VehiclePassportMock } from '@/components/landing/VehiclePassportMock';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { Mail, AlertCircle, Loader2, ShieldAlert } from 'lucide-react';
import { checkRateLimit } from '@/lib/utils/rateLimit';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
});
type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema as any),
  });

  const onSubmit = async (values: LoginValues) => {
    const rl = checkRateLimit('login');
    if (!rl.allowed) {
      setError(`Trop de tentatives. Réessayez dans ${rl.retryAfterSeconds}s.`);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect'
          : 'Une erreur est survenue. Réessayez.'
      );
      setLoading(false);
      return;
    }
    const role = data.user?.user_metadata?.role;
    navigate(role === 'seller' ? '/marketplace' : '/dashboard');
  };

  const inputClass = "flex h-11 w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] transition-all duration-200";

  return (
    <div className="min-h-screen flex bg-background">
      {/* ─── Left column (decorative) ─── */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-card border-r border-border relative overflow-hidden px-12">
        {/* Dot pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="dots-login" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="currentColor" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#dots-login)" />
        </svg>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_60%,hsl(217_91%_60%/0.09),transparent_70%)]" />

        <div className="relative max-w-sm">
          <div className="w-10 h-px bg-primary mb-6" />
          <blockquote className="font-display text-3xl font-bold italic leading-snug text-foreground mb-6">
            &ldquo;Votre véhicule a une histoire. Racontez-la correctement.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-px bg-primary" />
            <p className="text-sm text-muted-foreground">
              87% des acheteurs vérifient l'historique avant d'acheter.
            </p>
          </div>
          <VehiclePassportMock variant="auth" />
        </div>
      </div>

      {/* ─── Right column (form) ─── */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-10">
            <img src={logoSrc} alt="Auto-Passeport" className="w-9 h-9 object-contain" />
            <span className="font-display text-sm font-bold uppercase tracking-widest text-foreground">Auto-Passeport</span>
          </Link>

          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground mb-1">
            Bienvenue 👋
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Connectez-vous à votre espace Auto-Passeport
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Adresse email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="nom@example.com"
                  className={`${inputClass} pl-10`}
                />
              </div>
              {errors.email && <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">Mot de passe</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Oublié ?</Link>
              </div>
              <PasswordInput {...register('password')} id="password" placeholder="••••••••" />
              {errors.password && <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password.message}</p>}
            </div>

            {/* Error banner */}
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full py-3.5 font-display font-semibold uppercase tracking-wider active:scale-[0.97]" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Connexion en cours...</> : 'Se connecter →'}
            </Button>
          </form>

          {/* Separator */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <GoogleSignInButton label="Se connecter avec Google" />

          <p className="text-center text-sm text-muted-foreground mt-6">
            Pas encore de compte ?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">Créer un compte gratuit</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
