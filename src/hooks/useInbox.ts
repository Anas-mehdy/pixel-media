import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string | null;
  contact_name: string | null;
  contact_phone: string;
  is_from_bot: boolean | null;
  message_type: string | null;
  created_at: string;
}

interface Contact {
  phone: string;
  name: string | null;
  lastMessage: string | null;
  lastMessageTime: string;
}

export function useInbox() {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const contactsQuery = useQuery({
    queryKey: ["inbox-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Group by contact phone and get unique contacts
      const contactsMap = new Map<string, Contact>();
      data?.forEach((msg) => {
        if (!contactsMap.has(msg.contact_phone)) {
          contactsMap.set(msg.contact_phone, {
            phone: msg.contact_phone,
            name: msg.contact_name,
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
          });
        }
      });
      
      return Array.from(contactsMap.values());
    },
  });

  const messagesQuery = useQuery({
    queryKey: ["inbox-messages", selectedContact],
    queryFn: async () => {
      if (!selectedContact) return [];
      
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("contact_phone", selectedContact)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedContact,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["inbox-contacts"] });
          queryClient.invalidateQueries({ queryKey: ["inbox-messages", selectedContact] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, selectedContact]);

  return {
    contacts: contactsQuery.data || [],
    messages: messagesQuery.data || [],
    selectedContact,
    setSelectedContact,
    isLoadingContacts: contactsQuery.isLoading,
    isLoadingMessages: messagesQuery.isLoading,
  };
}