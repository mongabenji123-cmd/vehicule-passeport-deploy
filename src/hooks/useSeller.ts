import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useSeller() {
  const { user } = useAuth();

  const { data: seller = null, isLoading } = useQuery({
    queryKey: ['seller', user?.id],
    queryFn: async () => {
      if (!user) return null;
      try {
        const { data, error } = await supabase
          .from('sellers')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.warn("Erreur d'authentification ou de table 'sellers' interceptée :", error.message);
          return null; // Retourne null au lieu de lever une exception
        }
        return data;
      } catch (err) {
        console.error("Erreur critique interceptée dans useSeller :", err);
        return null;
      }
    },
    enabled: !!user,
    retry: false
  });

  const queryClient = useQueryClient();

  const createSeller = useMutation({
    mutationFn: async (values: { store_name: string; address?: string; commune?: string; phone_contact?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('sellers')
        .insert({ ...values, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seller'] }),
  });

  return { seller, isLoading, createSeller };
}

export function useSpareParts(sellerId?: number) {
  const queryClient = useQueryClient();

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ['spare_parts', sellerId],
    queryFn: async () => {
      if (!sellerId) return [];
      try {
        const { data, error } = await supabase
          .from('spare_parts')
          .select('*')
          .eq('seller_id', sellerId)
          .order('id', { ascending: false });
        if (error) {
          console.warn("Erreur de récupération des pièces :", error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        return [];
      }
    },
    enabled: !!sellerId,
    retry: false
  });

  const addPart = useMutation({
    mutationFn: async (values: {
      part_name: string;
      category?: string;
      price?: number;
      currency?: string;
      condition?: string;
      compatibility_tags?: string;
      stock_quantity?: number;
    }) => {
      if (!sellerId) throw new Error('No seller');
      const { data, error } = await supabase
        .from('spare_parts')
        .insert({ ...values, seller_id: sellerId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spare_parts'] }),
  });

  const updatePart = useMutation({
    mutationFn: async ({ id, ...values }: { id: number } & Partial<{
      part_name: string;
      category: string;
      price: number;
      currency: string;
      condition: string;
      compatibility_tags: string;
      stock_quantity: number;
    }>) => {
      const { error } = await supabase.from('spare_parts').update(values).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spare_parts'] }),
  });

  const deletePart = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('spare_parts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spare_parts'] }),
  });

  return { parts, isLoading, addPart, updatePart, deletePart };
}

export function useMarketplaceParts(filters?: { category?: string; condition?: string; commune?: string; search?: string }) {
  return useQuery({
    queryKey: ['marketplace_parts', filters],
    queryFn: async () => {
      try {
        // Sécurité : On tente de récupérer la jointure complexe
        let query = supabase
          .from('spare_parts')
          .select('*, marketplace_sellers_public!spare_parts_seller_id_fkey(store_name, commune, is_verified)')
          .order('id', { ascending: false });

        if (filters?.category) query = query.eq('category', filters.category);
        if (filters?.condition) query = query.eq('condition', filters.condition);
        if (filters?.search) query = query.ilike('part_name', `%${filters.search}%`);

        const { data, error } = await query;
        
        // Si l'erreur 406 survient à cause de la jointure manquante, on bascule sur une requête simple de secours !
        if (error) {
          console.warn("Jointure complexe échouée (erreur 406), bascule sur la requête simple de secours...");
          let fallbackQuery = supabase
            .from('spare_parts')
            .select('*')
            .order('id', { ascending: false });

          if (filters?.category) fallbackQuery = fallbackQuery.eq('category', filters.category);
          if (filters?.condition) fallbackQuery = fallbackQuery.eq('condition', filters.condition);
          if (filters?.search) fallbackQuery = fallbackQuery.ilike('part_name', `%${filters.search}%`);

          const { data: fallbackData, error: fallbackError } = await fallbackQuery;
          if (fallbackError) throw fallbackError;
          return fallbackData || [];
        }

        let results = data || [];
        if (filters?.commune) {
          results = results.filter((p: any) => p.marketplace_sellers_public?.commune === filters.commune);
        }
        return results;
      } catch (err) {
        console.error("Erreur critique marketplace_parts :", err);
        return []; // On retourne un tableau vide pour éviter que React ne crash
      }
    },
    retry: false
  });
}