import { useState, useEffect, useRef } from "react";
import { User, Send, MessageSquare, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInbox } from "@/hooks/useInbox";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function Inbox() {
  const { 
    contacts, 
    messages, 
    selectedContact, 
    setSelectedContact,
    isLoadingContacts,
    isLoadingMessages,
    sendMessage,
    isSending,
  } = useInbox();
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedContactInfo = contacts.find(c => c.phone === selectedContact);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!messageInput.trim() || isSending) return;
    sendMessage(messageInput);
    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Contacts List */}
      <Card className={cn(
        "w-full lg:w-80 flex flex-col overflow-hidden",
        selectedContact && "hidden lg:flex"
      )}>
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-lg">المحادثات</h2>
        </div>
        <ScrollArea className="flex-1">
          {isLoadingContacts ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
              <p>لا توجد محادثات</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {contacts.map((contact) => (
                <button
                  key={contact.phone}
                  onClick={() => setSelectedContact(contact.phone)}
                  className={cn(
                    "w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-right",
                    selectedContact === contact.phone && "bg-primary/5"
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">
                        {contact.name || contact.phone}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(contact.lastMessageTime), { 
                          addSuffix: true, 
                          locale: ar 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {contact.lastMessage || "..."}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className={cn(
        "flex-1 flex flex-col overflow-hidden",
        !selectedContact && "hidden lg:flex"
      )}>
        {!selectedContact ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">اختر محادثة للبدء</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden"
                onClick={() => setSelectedContact(null)}
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">
                  {selectedContactInfo?.name || selectedContact}
                </p>
                <p className="text-sm text-muted-foreground">{selectedContact}</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {isLoadingMessages ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
                      <Skeleton className="h-12 w-48 rounded-2xl" />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p>لا توجد رسائل</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        // Bot messages (AI Agent) on the right, Customer messages on the left
                        msg.is_from_bot ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] px-4 py-2 rounded-2xl",
                          msg.is_from_bot
                            ? "bg-chat-user text-chat-user-foreground rounded-tl-md"
                            : "bg-chat-bot text-chat-bot-foreground rounded-tr-md"
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={cn(
                          "text-xs mt-1 opacity-70"
                        )}>
                          {new Date(msg.created_at).toLocaleTimeString("ar-EG", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="اكتب رسالتك..."
                  className="flex-1"
                  disabled={isSending}
                />
                <Button 
                  size="icon" 
                  onClick={handleSend}
                  disabled={!messageInput.trim() || isSending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}