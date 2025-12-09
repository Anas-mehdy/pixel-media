import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { useEffect } from "react";

export interface BotRule {
  id: string;
  client_id: string | null;
  trigger_keyword: string | null;
  response_text: string | null;
  match_type: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

export interface CreateBotRuleData {
  trigger_keyword: string;
  response_text: string;
  match_type: "contains" | "ai_knowledge";
  is_active?: boolean;
}

export function useBotRules() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { clientId } = useAuthContext();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["bot_rules", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bot_rules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BotRule[];
    },
    enabled: !!clientId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!clientId) return;

    const channel = supabase
      .channel("bot_rules_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bot_rules",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["bot_rules", clientId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId, queryClient]);

  const createRule = useMutation({
    mutationFn: async (data: CreateBotRuleData) => {
      const { data: newRule, error } = await supabase
        .from("bot_rules")
        .insert({
          trigger_keyword: data.trigger_keyword,
          response_text: data.response_text,
          match_type: data.match_type,
          is_active: data.is_active ?? true,
          client_id: clientId,
        })
        .select()
        .single();

      if (error) throw error;
      return newRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot_rules", clientId] });
      toast({
        title: "تمت الإضافة",
        description: "تم إضافة القاعدة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة القاعدة",
        variant: "destructive",
      });
    },
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, ...data }: Partial<BotRule> & { id: string }) => {
      const { data: updatedRule, error } = await supabase
        .from("bot_rules")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updatedRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot_rules", clientId] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث القاعدة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث القاعدة",
        variant: "destructive",
      });
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bot_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot_rules", clientId] });
      toast({
        title: "تم الحذف",
        description: "تم حذف القاعدة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف القاعدة",
        variant: "destructive",
      });
    },
  });

  const toggleRuleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("bot_rules")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bot_rules", clientId] });
      toast({
        title: variables.is_active ? "تم التفعيل" : "تم التعطيل",
        description: variables.is_active ? "القاعدة مفعلة الآن" : "القاعدة معطلة الآن",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة القاعدة",
        variant: "destructive",
      });
    },
  });

  return {
    rules,
    isLoading,
    createRule,
    updateRule,
    deleteRule,
    toggleRuleActive,
  };
}
