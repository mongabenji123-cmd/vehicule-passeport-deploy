import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type PaymentMode = 'coupon' | 'deposit' | 'full_online';

export function calculateCommission(mode: PaymentMode, totalPrice: number): number {
  switch (mode) {
    case 'coupon': return 0;
    case 'deposit': return 2500; // fixed fee in FC (~$1)
    case 'full_online': return Math.round(totalPrice * 0.1 * 100) / 100; // 10%
  }
}

export function useCreateOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      part_id: number;
      seller_id: number;
      quantity: number;
      total_price: number;
      payment_mode: PaymentMode;
    }) => {
      if (!user) throw new Error('Non authentifié');
      const commission = calculateCommission(params.payment_mode, params.total_price);
      const { data, error } = await supabase
        .from('spare_parts_orders')
        .insert({
          buyer_id: user.id as any, // now UUID
          part_id: params.part_id,
          seller_id: params.seller_id,
          quantity: params.quantity,
          total_price: params.total_price,
          payment_mode: params.payment_mode,
          platform_commission: commission,
          status: 'pending',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] });
    },
  });
}

export function useBuyerOrders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['buyer-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('spare_parts_orders')
        .select('*, spare_parts:spare_parts!spare_parts_orders_part_id_fkey(part_name, category, condition, currency), sellers:sellers!spare_parts_orders_seller_id_fkey(store_name, commune)')
        .eq('buyer_id', user.id as any)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useConfirmDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: number) => {
      const { error } = await supabase
        .from('spare_parts_orders')
        .update({ status: 'completed' })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: number) => {
      const { error } = await supabase
        .from('spare_parts_orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] });
    },
  });
}
