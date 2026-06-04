import logoSrc from '@/assets/logo-icon.svg';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Email invalide'),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema as any),
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSentEmail(values.email);
    setSent(true);
    setLoading(false);
  };

  const inputClass = "flex h-11 w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] transition-all duration-200";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="max-w-md w-full">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 mb-10">
          <img src={logoSrc} alt="Auto-Passeport" className="w-9 h-9 object-contain" />
          <span className="font-display text-sm font-bold uppercase tracking-widest text-foreground">Auto-Passeport</span>
        </Link>

        {sent ? (
          <div className="text-center py-8">
            <div className="mx-auto w-14 h-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7 text-success" />
            </div>
            <h2 className="font-display text-xl font-bold uppercase tracking-wide text-foreground mb-2">
              Email envoyé !
            </h2>
            <p className="text-sm text-muted-foreground mb-1">
              Un lien de réinitialisation a été envoyé à
            </p>
            <p className="text-sm text-foreground font-mono mb-6">{sentEmail}</p>
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
              <ArrowLeft className="w-4 h-4" /> Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground mb-1">
              Mot de passe oublié ?
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              Entrez votre email. Nous vous enverrons un lien de réinitialisation.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Adresse email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <input {...register('email')} id="email" type="email" placeholder="nom@example.com" className={`${inputClass} pl-10`} />
                </div>
                {errors.email && <p className="text-destructive text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email.message}</p>}
              </div>

              <Button type="submit" className="w-full py-3.5 font-display font-semibold uppercase tracking-wider active:scale-[0.97]" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Envoi en cours...</> : 'Envoyer le lien →'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" /> Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
