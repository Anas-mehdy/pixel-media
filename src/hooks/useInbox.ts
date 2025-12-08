import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

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
  const { clientId } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
    audioRef.current.volume = 0.3;
  }, []);

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

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, contactPhone, contactName }: { 
      content: string; 
      contactPhone: string;
      contactName: string | null;
    }) => {
      const { error } = await supabase
        .from("messages")
        .insert({
          content,
          contact_phone: contactPhone,
          contact_name: contactName,
          is_from_bot: true,
          message_type: "text",
          client_id: clientId,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox-messages", selectedContact] });
      queryClient.invalidateQueries({ queryKey: ["inbox-contacts"] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل إرسال الرسالة",
        variant: "destructive",
      });
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          // Play notification sound for incoming customer messages
          const newMessage = payload.new as Message;
          if (!newMessage.is_from_bot && audioRef.current) {
            audioRef.current.play().catch(() => {});
          }
          
          queryClient.invalidateQueries({ queryKey: ["inbox-contacts"] });
          queryClient.invalidateQueries({ queryKey: ["inbox-messages", selectedContact] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, selectedContact]);

  const sendMessage = (content: string) => {
    if (!selectedContact || !content.trim()) return;
    
    const contactInfo = contactsQuery.data?.find(c => c.phone === selectedContact);
    sendMessageMutation.mutate({
      content: content.trim(),
      contactPhone: selectedContact,
      contactName: contactInfo?.name || null,
    });
  };

  return {
    contacts: contactsQuery.data || [],
    messages: messagesQuery.data || [],
    selectedContact,
    setSelectedContact,
    isLoadingContacts: contactsQuery.isLoading,
    isLoadingMessages: messagesQuery.isLoading,
    sendMessage,
    isSending: sendMessageMutation.isPending,
  };
}