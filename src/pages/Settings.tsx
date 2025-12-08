import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Bot, Clock, Brain, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useBotSettings } from "@/hooks/useBotSettings";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { settings, isLoading, updateSettings, toggleBot, isUpdating, isToggling } = useBotSettings();
  const [form, setForm] = useState({
    business_hours_start: "",
    business_hours_end: "",
    ai_personality: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        business_hours_start: settings.business_hours_start || "",
        business_hours_end: settings.business_hours_end || "",
        ai_personality: settings.ai_personality || "",
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings(form);
  };

  const isBotActive = settings?.bot_active ?? false;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
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

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            ساعات العمل
          </CardTitle>
          <CardDescription>
            حدد الفترة التي سيكون فيها البوت نشطاً
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>وقت البداية</Label>
              <Input
                type="time"
                value={form.business_hours_start}
                onChange={(e) => setForm({ ...form, business_hours_start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>وقت النهاية</Label>
              <Input
                type="time"
                value={form.business_hours_end}
                onChange={(e) => setForm({ ...form, business_hours_end: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Personality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            شخصية الذكاء الاصطناعي
          </CardTitle>
          <CardDescription>
            اكتب التعليمات التي ستوجه أسلوب الردود
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={form.ai_personality}
            onChange={(e) => setForm({ ...form, ai_personality: e.target.value })}
            placeholder="مثال: أنت مساعد ودود ومحترف، ترد بإيجاز واحترام..."
            rows={6}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}