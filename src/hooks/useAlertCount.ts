import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useAlertCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    async function fetchCount() {
      // Get user's vehicle IDs first
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id')
        .eq('owner_id', user!.id);

      const vehicleIds = vehicles?.map(v => v.id) ?? [];
      if (vehicleIds.length === 0) {
        setCount(0);
        return;
      }

      const { count: alertCount } = await supabase
        .from('alerts')
        .select('id', { count: 'exact', head: true })
        .eq('is_resolved', false)
        .in('vehicle_id', vehicleIds);

      setCount(alertCount ?? 0);
    }

    fetchCount();

    const channelName = `alert-count-${Date.now()}-${Math.random()}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'alerts',
      }, () => fetchCount())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return count;
}
