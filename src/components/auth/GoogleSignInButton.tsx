import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
// On importe le client Supabase officiel de ton projet
import { supabase } from '@/integrations/supabase/client'; 

export function GoogleSignInButton({ label = 'Continuer avec Google' }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Connexion directe via le provider natif de Supabase
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Indique à Supabase où renvoyer l'utilisateur après validation
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (authError) {
        throw authError;
      }
      
      // Note : Inutile de forcer la redirection manuelle ici. 
      // Supabase prend automatiquement le contrôle de la redirection vers Google.
    } catch (err: any) {
      console.error("Erreur Auth Google:", err);
      setError("Connexion Google impossible. Vérifiez vos configurations.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={loading}
        className="w-full py-3.5 font-medium"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4-5.5 4-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z"/>
          </svg>
        )}
        {label}
      </Button>
      {error && <p className="text-destructive text-xs text-center font-medium animate-fade-in">{error}</p>}
    </div>
  );
}