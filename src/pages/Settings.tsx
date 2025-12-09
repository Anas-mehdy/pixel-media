import { useState, useEffect } from "react";
import { Power } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBotSettings } from "@/hooks/useBotSettings";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { settings, isLoading, toggleBot, isToggling } = useBotSettings();

  const isBotActive = settings?.bot_active ?? false;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Master Toggle */}
      <Card className={cn(
        "overflow-hidden transition-all duration-500",
        isBotActive 
          ? "ring-2 ring-success shadow-lg shadow-success/10" 
          : "ring-2 ring-destructive/50"
      )}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500",
              isBotActive 
                ? "bg-success/20 text-success animate-pulse-soft" 
                : "bg-muted text-muted-foreground"
            )}>
              <Power className="w-12 h-12" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {isBotActive ? "البوت نشط" : "البوت متوقف"}
              </h2>
              <p className="text-muted-foreground">
                {isBotActive 
                  ? "البوت يرد على الرسائل تلقائياً" 
                  : "البوت لن يرد على أي رسائل"
                }
              </p>
            </div>

            <Button
              size="lg"
              variant={isBotActive ? "destructive" : "default"}
              className="min-w-[200px]"
              onClick={() => toggleBot(!isBotActive)}
              disabled={isToggling}
            >
              {isToggling ? "جاري التحديث..." : isBotActive ? "إيقاف البوت" : "تشغيل البوت"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}