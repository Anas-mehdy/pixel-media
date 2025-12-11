import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

export interface Customer360 {
  id: string | null;
  name: string | null;
  phone: string | null;
  lead_status: string | null;
  total_orders: number | null;
  total_spent: number | null;
  last_order_date: string | null;
  last_contact_at: string | null;
  client_id: string | null;
}

export function useCustomer360() {
  const queryClient = useQueryClient();

  const customersQuery = useQuery({
    queryKey: ["customer-360"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_360")
        .select("*")
        .order("last_contact_at", { ascending: false, nullsFirst: false });
      
      if (error) throw error;
      return (data || []) as Customer360[];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Real-time subscription for leads updates (which affects the view)
  useEffect(() => {
    const channel = supabase
      .channel("customer-360-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
        },
        (payload) => {
          console.log("Leads table changed:", payload);
          // Force immediate refetch
          queryClient.invalidateQueries({ queryKey: ["customer-360"] });
          customersQuery.refetch();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["customer-360"] });
          customersQuery.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, customersQuery]);

  // Update mutation targets the leads table, not the view
  const updateCustomer = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { status?: string; notes?: string; name?: string } }) => {
      const { error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-360"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات العميل بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث البيانات",
        variant: "destructive",
      });
    },
  });

  return {
    customers: customersQuery.data || [],
    isLoading: customersQuery.isLoading,
    updateCustomer: updateCustomer.mutate,
    isUpdating: updateCustomer.isPending,
    refetch: customersQuery.refetch,
  };
}
