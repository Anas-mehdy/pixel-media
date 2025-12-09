import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

export interface CampaignHistory {
  id: string;
  created_at: string;
  recipient_count: number;
  message_text: string;
  client_id: string | null;
  phones: string[];
}

export function useCampaignHistory() {
  const queryClient = useQueryClient();
  const { clientId } = useAuthContext();

  const historyQuery = useQuery({
    queryKey: ["campaign-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as CampaignHistory[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("campaign-history-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "campaign_history",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["campaign-history"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const addCampaign = useMutation({
    mutationFn: async (campaign: { phones: string[]; message_text: string }) => {
      const { error } = await supabase
        .from("campaign_history")
        .insert({
          client_id: clientId,
          phones: campaign.phones,
          message_text: campaign.message_text,
          recipient_count: campaign.phones.length,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-history"] });
    },
  });

  return {
    history: historyQuery.data || [],
    isLoading: historyQuery.isLoading,
    addCampaign: addCampaign.mutateAsync,
  };
}
