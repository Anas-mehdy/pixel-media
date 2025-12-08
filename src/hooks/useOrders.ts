import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useEffect } from "react";

export interface Order {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  product_details: string | null;
  total_amount: number | null;
  status: string | null;
  created_at: string | null;
  last_updated: string | null;
  client_id: string | null;
}

export function useOrders() {
  const { clientId } = useAuthContext();
  const queryClient = useQueryClient();

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["orders", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!clientId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!clientId) return;

    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["orders", clientId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, queryClient]);

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status, last_updated: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", clientId] });
    },
  });

  const createOrder = useMutation({
    mutationFn: async (order: {
      customer_name: string;
      customer_phone: string;
      product_details: string;
      total_amount: number;
    }) => {
      const { error } = await supabase.from("orders").insert({
        ...order,
        client_id: clientId,
        status: "Pending",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", clientId] });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", clientId] });
    },
  });

  return {
    orders: orders || [],
    isLoading,
    error,
    updateOrderStatus,
    createOrder,
    deleteOrder,
  };
}
