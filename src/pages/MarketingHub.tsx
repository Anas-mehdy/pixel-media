import { useState, useEffect, useMemo } from "react";
import { 
  Send, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Search,
  Target,
  Info,
  History
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useBotSettings } from "@/hooks/useBotSettings";
import { useCampaignHistory } from "@/hooks/useCampaignHistory";
import { useLeads } from "@/hooks/useLeads";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const MAX_SELECTION = 10;

const statusOptions = [
  { value: "all", label: "الكل" },
  { value: "new", label: "جديد" },
  { value: "inquiry", label: "استفسار" },
  { value: "potential", label: "مهتم/محتمل" },
  { value: "order_placed", label: "طلب نشط" },
  { value: "complaint", label: "شكوى" },
  { value: "closed", label: "مكتمل" },
];

const getStatusBadge = (status: string | null) => {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    new: { label: "جديد", variant: "secondary" },
    inquiry: { label: "استفسار", variant: "default" },
    potential: { label: "مهتم/محتمل", variant: "outline" },
    order_placed: { label: "طلب نشط", variant: "default" },
    complaint: { label: "شكوى", variant: "destructive" },
    closed: { label: "مكتمل", variant: "secondary" },
  };
  const config = statusConfig[status || "new"] || { label: status || "غير محدد", variant: "secondary" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function MarketingHub() {
  const { settings, isLoading: isLoadingSettings, updateSettings, isUpdating } = useBotSettings();
  const { leads, isLoading: isLoadingLeads } = useLeads();
  const { history: campaignHistory, isLoading: isLoadingHistory, addCampaign } = useCampaignHistory();
  
  // Hunter settings state
  const [hunterActive, setHunterActive] = useState(false);
  const [hunterMessage, setHunterMessage] = useState("");
  
  // Campaign state
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhones, setSelectedPhones] = useState<Set<string>>(new Set());
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [campaignMessage, setCampaignMessage] = useState("");
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);

  // Sync hunter settings from database
  useEffect(() => {
    if (settings) {
      setHunterActive(settings.hunter_active ?? false);
      setHunterMessage(settings.hunter_message ?? "");
    }
  }, [settings]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return (leads || []).filter((lead) => {
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesSearch = !searchQuery || 
        lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  }, [leads, statusFilter, searchQuery]);

  const handleToggleSelection = (phone: string) => {
    setSelectedPhones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phone)) {
        newSet.delete(phone);
      } else {
        newSet.add(phone);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPhones.size === filteredLeads.length) {
      setSelectedPhones(new Set());
    } else {
      const phonesToSelect = filteredLeads.slice(0, MAX_SELECTION).map(l => l.phone);
      setSelectedPhones(new Set(phonesToSelect));
    }
  };

  const handleSaveHunterSettings = () => {
    updateSettings({
      hunter_active: hunterActive,
      hunter_message: hunterMessage,
    });
  };

  const handleToggleHunter = (active: boolean) => {
    setHunterActive(active);
    updateSettings({
      hunter_active: active,
      hunter_message: hunterMessage,
    });
    toast({
      title: active ? "صائد المبيعات نشط 🎯" : "صائد المبيعات متوقف",
      description: active 
        ? "سيتم إرسال الرسائل التسويقية تلقائياً"
        : "تم إيقاف الرسائل التلقائية",
    });
  };

  const handleSendCampaign = async () => {
    if (selectedPhones.size === 0 || !campaignMessage.trim()) return;
    
    setIsSendingCampaign(true);
    try {
      const phonesArray = Array.from(selectedPhones);
      
      // Call authenticated edge function instead of direct webhook
      const { data, error } = await supabase.functions.invoke('send-campaign', {
        body: {
          phones: phonesArray,
          message: campaignMessage.trim(),
        },
      });

      if (error) {
        throw new Error(error.message || "Failed to send campaign");
      }

      // Save to campaign history
      await addCampaign({
        phones: phonesArray,
        message_text: campaignMessage.trim(),
      });

      toast({
        title: "تم إرسال الحملة بنجاح! ✅",
        description: "سيتم إرسال الرسائل بتأخير آمن لحماية حسابك",
      });
      
      setIsCampaignDialogOpen(false);
      setCampaignMessage("");
      setSelectedPhones(new Set());
    } catch (error) {
      toast({
        title: "خطأ في الإرسال",
        description: "حدث خطأ أثناء إرسال الحملة. حاول مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsSendingCampaign(false);
    }
  };

  const isOverLimit = selectedPhones.size > MAX_SELECTION;

  if (isLoadingSettings) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Part 1: Auto-Hunter Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>🕵️‍♂️ صائد المبيعات (Auto-Hunter)</CardTitle>
                <CardDescription className="mt-1">
                  إرسال رسائل متابعة تلقائية للعملاء المهتمين
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={hunterActive}
              onCheckedChange={handleToggleHunter}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 border border-border rounded-lg p-3 flex items-start gap-2">
            <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">
              عند التفعيل، سيقوم البوت بإرسال هذه الرسالة تلقائياً للعملاء "المهتمين/المحتملين" الذين لم يطلبوا خلال 24 ساعة.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hunter-message">قالب الرسالة</Label>
            <Textarea
              id="hunter-message"
              value={hunterMessage}
              onChange={(e) => setHunterMessage(e.target.value)}
              placeholder="مرحباً 👋، لاحظنا اهتمامك بمنتجاتنا..."
              className="min-h-[120px]"
              dir="rtl"
            />
          </div>

          <Button 
            onClick={handleSaveHunterSettings}
            disabled={isUpdating}
          >
            {isUpdating ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </CardContent>
      </Card>

      {/* Campaign History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>📜 سجل الحملات</CardTitle>
              <CardDescription className="mt-1">
                عرض الحملات التسويقية السابقة
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : campaignHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد حملات سابقة
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>عدد المستلمين</TableHead>
                    <TableHead>معاينة الرسالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignHistory.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(campaign.created_at), "d MMM yyyy - HH:mm", { locale: ar })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {campaign.recipient_count} عميل
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate text-sm text-muted-foreground" title={campaign.message_text}>
                          {campaign.message_text}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Part 2: Micro-Campaigns */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>📢 الحملات المصغرة</CardTitle>
                <CardDescription className="mt-1">
                  أرسل رسائل يدوية لمجموعة مختارة من العملاء
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={() => setIsCampaignDialogOpen(true)}
              disabled={selectedPhones.size === 0 || isOverLimit}
            >
              <Send className="h-4 w-4 ml-2" />
              إرسال الحملة
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters and Selection Counter */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selection Counter */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              isOverLimit 
                ? "bg-destructive/10 border-destructive text-destructive" 
                : "bg-muted/50 border-border"
            }`}>
              {isOverLimit ? (
                <AlertTriangle className="h-4 w-4" />
              ) : selectedPhones.size > 0 ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : null}
              <span className="text-sm font-medium">
                المحدد: {selectedPhones.size} / {MAX_SELECTION}
              </span>
            </div>
          </div>

          {/* Warning Message */}
          {isOverLimit && (
            <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p className="text-sm">
                ⚠️ الحد الأقصى 10 عملاء لمنع حظر حساب الواتساب
              </p>
            </div>
          )}

          {/* Leads Table */}
          {isLoadingLeads ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد عملاء مطابقين للبحث
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPhones.size === filteredLeads.length && filteredLeads.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>آخر تواصل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow 
                      key={lead.id}
                      className={selectedPhones.has(lead.phone) ? "bg-primary/5" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedPhones.has(lead.phone)}
                          onCheckedChange={() => handleToggleSelection(lead.phone)}
                          disabled={!selectedPhones.has(lead.phone) && selectedPhones.size >= MAX_SELECTION}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {lead.name || "بدون اسم"}
                      </TableCell>
                      <TableCell dir="ltr" className="text-muted-foreground">
                        {lead.phone}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(lead.status)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {lead.last_contact_at 
                          ? format(new Date(lead.last_contact_at), "d MMM yyyy", { locale: ar })
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Dialog */}
      <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إرسال حملة تسويقية</DialogTitle>
            <DialogDescription>
              سيتم إرسال الرسالة لـ {selectedPhones.size} عميل محدد
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-message">نص الرسالة</Label>
              <Textarea
                id="campaign-message"
                value={campaignMessage}
                onChange={(e) => setCampaignMessage(e.target.value)}
                placeholder="اكتب رسالتك التسويقية هنا..."
                className="min-h-[150px]"
                dir="rtl"
              />
            </div>
            <div className="bg-muted/50 border border-border rounded-lg p-3 flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">
                سيتم إرسال الرسائل بتأخير آمن بين كل رسالة لحماية حسابك من الحظر.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCampaignDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleSendCampaign}
              disabled={!campaignMessage.trim() || isSendingCampaign}
            >
              {isSendingCampaign ? "جاري الإرسال..." : "إرسال الحملة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
