import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";

export interface BotSettings {
  id: string;
  user_id: string;
  bot_active: boolean | null;
  ai_personality: string | null;
  business_hours_start: string | null;
  business_hours_end: string | null;
  client_id: string | null;
}

export function useBotSettings() {
  const queryClient = useQueryClient();
  const { user, clientId } = useAuthContext();

  const settingsQuery = useQuery({
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

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<BotSettings>) => {
      const current = settingsQuery.data;
      
      if (!current) {
        // Create new settings if none exist
        const { error } = await supabase
          .from("bot_settings")
          .insert({ 
            user_id: user?.id || crypto.randomUUID(),
            client_id: clientId,
            ...updates 
          });
        if (error) throw error;
      } else {
        // Update existing settings
        const { error } = await supabase
          .from("bot_settings")
          .update(updates)
          .eq("id", current.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot-settings"] });
      toast({
        title: "تم الحفظ",
        description: "تم حفظ الإعدادات بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      });
    },
  });

  const toggleBot = useMutation({
    mutationFn: async (active: boolean) => {
      const current = settingsQuery.data;
      
      if (!current) {
        const { error } = await supabase
          .from("bot_settings")
          .insert({ 
            user_id: user?.id || crypto.randomUUID(),
            client_id: clientId,
            bot_active: active 
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("bot_settings")
          .update({ bot_active: active })
          .eq("id", current.id);
        if (error) throw error;
      }
    },
    onSuccess: (_, active) => {
      queryClient.invalidateQueries({ queryKey: ["bot-settings"] });
      toast({
        title: active ? "البوت نشط" : "البوت متوقف",
        description: active 
          ? "سيبدأ البوت بالرد على الرسائل تلقائياً"
          : "تم إيقاف الردود التلقائية",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تغيير حالة البوت",
        variant: "destructive",
      });
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    updateSettings: updateSettings.mutate,
    toggleBot: toggleBot.mutate,
    isUpdating: updateSettings.isPending,
    isToggling: toggleBot.isPending,
  };
}
