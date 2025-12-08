import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";

export interface Lead {
  id: string;
  name: string | null;
  phone: string;
  status: string | null;
  notes: string | null;
  last_contact_at: string | null;
  created_at: string;
  client_id: string | null;
}

export type LeadInput = Omit<Lead, "id" | "created_at" | "client_id">;

export function useLeads() {
  const queryClient = useQueryClient();
  const { clientId } = useAuthContext();

  const leadsQuery = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const addLead = useMutation({
    mutationFn: async (lead: LeadInput) => {
      const { error } = await supabase.from("leads").insert({
        ...lead,
        client_id: clientId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["new-leads-count"] });
      toast({
        title: "تمت الإضافة",
        description: "تم إضافة العميل بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة العميل",
        variant: "destructive",
      });
    },
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Lead> }) => {
      const { error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
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
    leads: leadsQuery.data || [],
    isLoading: leadsQuery.isLoading,
    addLead: addLead.mutate,
    updateLead: updateLead.mutate,
    isAdding: addLead.isPending,
    isUpdating: updateLead.isPending,
  };
}
