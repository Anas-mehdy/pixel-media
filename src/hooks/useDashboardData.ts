import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDashboardData() {
  const messagesQuery = useQuery({
    queryKey: ["messages-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const newLeadsQuery = useQuery({
    queryKey: ["new-leads-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");
      if (error) throw error;
      return count || 0;
    },
  });

  const productsQuery = useQuery({
    queryKey: ["products-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const botSettingsQuery = useQuery({
    queryKey: ["bot-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bot_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const recentMessagesQuery = useQuery({
    queryKey: ["recent-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
  });

  return {
    messagesCount: messagesQuery.data,
    newLeadsCount: newLeadsQuery.data,
    productsCount: productsQuery.data,
    botSettings: botSettingsQuery.data,
    recentMessages: recentMessagesQuery.data,
    isLoading:
      messagesQuery.isLoading ||
      newLeadsQuery.isLoading ||
      productsQuery.isLoading ||
      botSettingsQuery.isLoading ||
      recentMessagesQuery.isLoading,
  };
}