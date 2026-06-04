import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSellerOrders(sellerId?: number) {
  return useQuery({
    queryKey: ['seller-orders', sellerId],
    queryFn: async () => {
      if (!sellerId) return [];
      
      try {
        // 1. On tente la requête avec la jointure complexe
        const { data, error } = await supabase
          .from('spare_parts_orders')
          .select('*, spare_parts:spare_parts!spare_parts_orders_part_id_fkey(part_name, category, condition, currency, price)')
          .eq('seller_id', sellerId)
          .order('created_at', { ascending: false });
        
        // 2. Si l'erreur 406 ou 400 survient, on passe à la requête de secours simple
        if (error) {
          console.warn("Jointure de commandes échouée (Erreur 406/400). Tentative de secours simple...");
          
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('spare_parts_orders')
            .select('*')
            .eq('seller_id', sellerId)
            .order('created_at', { ascending: false });
            
          if (fallbackError) {
            console.error("La requête de secours simple a aussi échoué :", fallbackError.message);
            return []; // Évite le crash en renvoyant une liste vide
          }
          return fallbackData ?? [];
        }
        
        return data ?? [];
      } catch (err) {
        console.error("Erreur critique interceptée dans useSellerOrders :", err);
        return []; // Retourne un tableau vide au lieu de faire planter l'application
      }
    },
    enabled: !!sellerId,
    retry: false, // Évite de boucler indéfiniment sur l'erreur
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      try {
        const { error } = await supabase
          .from('spare_parts_orders')
          .update({ status })
          .eq('id', orderId);
        if (error) throw error;
      } catch (err) {
        console.error("Erreur lors de la mise à jour du statut :", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
    },
  });
}