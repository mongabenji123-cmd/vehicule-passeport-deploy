import { useBackendStatus } from '@/hooks/useBackendStatus';
import { AlertTriangle, WifiOff, RefreshCw, CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { stripTypeScriptTypes } from 'module';

export function StatusBanner() {
  const { status, recheck } = useBackendStatus();
  const [dismissed, setDismissed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  return null;
    if (status === 'online' || status === 'checking' || dismissed) return null;

  const config = {
    offline: {
      icon: WifiOff,
      bg: 'bg-destructive',
      text: 'text-destructive-foreground',
      message: 'Service indisponible — vérifiez votre connexion ou réessayez.',
    },
    degraded: {
      icon: AlertTriangle,
      bg: 'bg-accent',
      text: 'text-accent-foreground',
      message: 'Le service est lent ou partiellement disponible.',
    },
  }[status];

  const Icon = config.icon;

  const handleRetry = async () => {
    setRefreshing(true);
    await recheck();
    setRefreshing(false);
  };

  return (
    <div className={cn('fixed top-0 inset-x-0 z-[100] px-4 py-2.5 flex items-center gap-3 text-sm', config.bg, config.text)}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 font-medium">{config.message}</span>
      <button
        onClick={handleRetry}
        disabled={refreshing}
        className="p-1 rounded hover:bg-white/20 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded hover:bg-white/20 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
