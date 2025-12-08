import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Bot, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Message {
  id: string;
  content: string | null;
  contact_name: string | null;
  contact_phone: string;
  is_from_bot: boolean | null;
  created_at: string;
}

interface RecentActivityProps {
  messages: Message[];
  isLoading: boolean;
}

export function RecentActivity({ messages, isLoading }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">آخر النشاطات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">آخر النشاطات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
            <p>لا توجد رسائل حتى الآن</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">آخر النشاطات</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              message.is_from_bot 
                ? "bg-primary/10 text-primary" 
                : "bg-secondary text-secondary-foreground"
            }`}>
              {message.is_from_bot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm truncate">
                  {message.contact_name || message.contact_phone}
                </p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(message.created_at), { 
                    addSuffix: true, 
                    locale: ar 
                  })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {message.content || "رسالة فارغة"}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}