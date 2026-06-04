import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, CheckCircle, Wifi, WifiOff, Smartphone } from "lucide-react";

export default function InstallPage() {
  const { canInstall, isInstalled, isOnline, install } = usePWAInstall();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12">
      <div className="max-w-sm w-full text-center space-y-6">
        <img src="/pwa-icon-512.png" alt="Auto-Passeport" className="w-24 h-24 mx-auto rounded-2xl" />

        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
          Installer Auto-Passeport
        </h1>

        <p className="text-muted-foreground text-sm leading-relaxed">
          Accédez à votre passeport véhicule même sans connexion internet.
          Installez l'app directement sur votre téléphone.
        </p>

        {/* Online status */}
        <div className="flex items-center justify-center gap-2 text-sm">
          {isOnline ? (
            <><Wifi className="w-4 h-4 text-green-500" /><span className="text-green-500">En ligne</span></>
          ) : (
            <><WifiOff className="w-4 h-4 text-accent" /><span className="text-accent">Hors ligne — mode cache actif</span></>
          )}
        </div>

        {isInstalled ? (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
            <p className="text-sm text-green-400">Auto-Passeport est déjà installé sur votre appareil !</p>
          </div>
        ) : canInstall ? (
          <Button onClick={install} size="lg" className="w-full gap-2 font-display font-semibold uppercase tracking-wider">
            <Download className="w-5 h-5" />
            Installer l'application
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-border bg-card p-4 text-left space-y-3">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                Comment installer ?
              </p>
              <div className="text-xs text-muted-foreground space-y-2">
                <p><strong className="text-foreground">Android (Chrome) :</strong> Menu ⋮ → « Ajouter à l'écran d'accueil »</p>
                <p><strong className="text-foreground">iPhone (Safari) :</strong> Partager ↑ → « Sur l'écran d'accueil »</p>
              </div>
            </div>
          </div>
        )}

        <Link to="/" className="inline-block text-sm text-primary hover:underline mt-4">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
