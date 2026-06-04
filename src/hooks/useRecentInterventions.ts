import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export type Intervention = Tables<'interventions'>;

export function useRecentInterventions(vehiculeId: string | null, limit = 3) {
  return useQuery({
    queryKey: ['recent-interventions', vehiculeId, limit],
    queryFn: async () => {
      if (!vehiculeId) return [];
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .eq('vehicule_id', vehiculeId)
        .order('date_intervention', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as Intervention[];
    },
    enabled: !!vehiculeId,
  });
}
