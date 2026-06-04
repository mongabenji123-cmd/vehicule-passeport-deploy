import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Download, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PWAInstallBanner() {
  const { canInstall, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 lg:hidden animate-in slide-in-from-bottom-4">
      <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3 shadow-lg">
        <img src="/pwa-icon-192.png" alt="" className="w-10 h-10 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">Installer Auto-Passeport</p>
          <p className="text-xs text-muted-foreground">Accès rapide & mode hors ligne</p>
        </div>
        <Button size="sm" onClick={install} className="gap-1 flex-shrink-0">
          <Download className="w-3.5 h-3.5" />
          Installer
        </Button>
        <button onClick={() => setDismissed(true)} className="p-1 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
