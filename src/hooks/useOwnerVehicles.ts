import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

export type Vehicule = Tables<'vehicules'>;

export function useOwnerVehicles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['owner-vehicules', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('vehicules')
        .select('*')
        .eq('proprietaire_id', user.id);
      if (error) throw error;
      return (data ?? []) as Vehicule[];
    },
    enabled: !!user,
  });
}
