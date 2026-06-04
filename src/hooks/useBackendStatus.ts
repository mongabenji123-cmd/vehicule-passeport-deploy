import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const HEALTHCHECK_TABLE = 'marketplace_sellers_public';

type Status = 'online' | 'offline' | 'degraded' | 'checking';

export function useBackendStatus(intervalMs = 30000) {
  const [status, setStatus] = useState<Status>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const check = useCallback(async () => {
    const start = Date.now();
    try {
      const { error } = await supabase.from(HEALTHCHECK_TABLE).select('id').limit(1);
      const latency = Date.now() - start;
      if (error) {
        setStatus('degraded');
      } else if (latency > 5000) {
        setStatus('degraded');
      } else {
        setStatus('online');
      }
    } catch {
      setStatus('offline');
    }
    setLastChecked(new Date());
  }, []);

  useEffect(() => {
    check();
    const id = setInterval(check, intervalMs);
    return () => clearInterval(id);
  }, [check, intervalMs]);

  return { status, lastChecked, recheck: check };
}
