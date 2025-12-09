import { useState } from "react";
import { Brain, Plus, Zap, Lightbulb, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useBotRules, BotRule, CreateBotRuleData } from "@/hooks/useBotRules";

export default function BotBrain() {
  const { rules, isLoading, createRule, updateRule, deleteRule, toggleRuleActive } = useBotRules();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<BotRule | null>(null);
  
  const [formData, setFormData] = useState<CreateBotRuleData>({
    trigger_keyword: "",
    response_text: "",
    match_type: "contains",
  });

  const resetForm = () => {
    setFormData({
      trigger_keyword: "",
      response_text: "",
      match_type: "contains",
    });
  };

  const handleAddRule = () => {
    if (!formData.trigger_keyword.trim() || !formData.response_text.trim()) return;
    createRule.mutate(formData, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        resetForm();
      },
    });
  };

  const handleEditRule = () => {
    if (!selectedRule || !formData.trigger_keyword.trim() || !formData.response_text.trim()) return;
    updateRule.mutate(
      {
        id: selectedRule.id,
        trigger_keyword: formData.trigger_keyword,
        response_text: formData.response_text,
        match_type: formData.match_type,
      },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setSelectedRule(null);
          resetForm();
        },
      }
    );
  };

  const handleDeleteRule = () => {
    if (!selectedRule) return;
    deleteRule.mutate(selectedRule.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSelectedRule(null);
      },
    });
  };

  const openEditDialog = (rule: BotRule) => {
    setSelectedRule(rule);
    setFormData({
      trigger_keyword: rule.trigger_keyword || "",
      response_text: rule.response_text || "",
      match_type: (rule.match_type as "contains" | "ai_knowledge") || "contains",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (rule: BotRule) => {
    setSelectedRule(rule);
    setDeleteDialogOpen(true);
  };

  const getTypeBadge = (matchType: string | null) => {
    if (matchType === "ai_knowledge") {
      return (
        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
          <Brain className="w-3 h-3 ml-1" />
          معرفة البوت
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
        <Zap className="w-3 h-3 ml-1" />
        رد تلقائي
      </Badge>
    );
  };

  const RuleFormContent = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="trigger_keyword">الكلمة المفتاحية</Label>
        <Input
          id="trigger_keyword"
          placeholder="مثال: السعر، الموقع، رقم الحساب..."
          value={formData.trigger_keyword}
          onChange={(e) => setFormData({ ...formData, trigger_keyword: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="response_text">نص الرد</Label>
        <Textarea
          id="response_text"
          placeholder="الإجابة التي سيرسلها البوت..."
          rows={4}
          value={formData.response_text}
          onChange={(e) => setFormData({ ...formData, response_text: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="match_type">نوع القاعدة</Label>
        <Select
          value={formData.match_type}
          onValueChange={(value: "contains" | "ai_knowledge") =>
            setFormData({ ...formData, match_type: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contains">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span>رد تلقائي (Keyword)</span>
              </div>
            </SelectItem>
            <SelectItem value="ai_knowledge">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <span>معرفة البوت (AI Knowledge)</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          {formData.match_type === "contains"
            ? "يرسل الرد فوراً إذا احتوت الرسالة على الكلمة المفتاحية"
            : "يعلّم البوت معلومات ليستخدمها بذكاء في الإجابة"}
        </p>
      </div>

      <Button
        className="w-full"
        onClick={isEdit ? handleEditRule : handleAddRule}
        disabled={createRule.isPending || updateRule.isPending}
      >
        {isEdit ? "حفظ التعديلات" : "إضافة القاعدة"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">عقل البوت</h1>
            <p className="text-muted-foreground">إدارة الردود التلقائية وقاعدة المعرفة</p>
          </div>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة قاعدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة قاعدة جديدة</DialogTitle>
            </DialogHeader>
            <RuleFormContent />
          </DialogContent>
        </Dialog>
      </div>

      {/* User Guide Accordion */}
      <Card className="bg-accent/30 border-accent">
        <Accordion type="single" collapsible>
          <AccordionItem value="guide" className="border-none">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center gap-2 text-right">
                <Lightbulb className="w-5 h-5 text-primary" />
                <span className="font-semibold">دليل الاستخدام: كيف تضيف قاعدة صحيحة؟</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <div className="space-y-6 text-sm">
                {/* Auto-Reply Section */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-blue-800">النوع الأول: الرد التلقائي (Auto-Reply)</h3>
                  </div>
                  <ul className="space-y-2 text-blue-900 mr-7">
                    <li><strong>الوظيفة:</strong> إجابة حرفية وسريعة جداً.</li>
                    <li><strong>متى أستخدمه؟</strong> للأسئلة الثابتة (السعر، العنوان، رقم الهاتف).</li>
                    <li><strong>مثال:</strong> إذا كتب العميل "حساب البنك"، البوت يرد فوراً برقم الآيبان.</li>
                  </ul>
                </div>

                {/* AI Knowledge Section */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-purple-800">النوع الثاني: معرفة البوت (AI Knowledge)</h3>
                  </div>
                  <ul className="space-y-2 text-purple-900 mr-7">
                    <li><strong>الوظيفة:</strong> تعليم البوت معلومات عامة ليستخدمها بذكاء.</li>
                    <li><strong>متى أستخدمه؟</strong> لشرح الخدمات، سياسة الاسترجاع، أو وصف المنتجات.</li>
                    <li><strong>مثال:</strong> لا يهم الكلمة المفتاحية هنا بقدر المحتوى. البوت سيفهم المعنى ويجيب العميل بأسلوبه.</li>
                  </ul>
                </div>

                {/* Tip Section */}
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-amber-800">نصيحة مهمة</h3>
                  </div>
                  <ul className="space-y-2 text-amber-900 mr-7">
                    <li>في <strong>"الرد التلقائي"</strong>: اختر كلمة مفتاحية فريدة (مثلاً: "منيو" أفضل من "م").</li>
                    <li>في <strong>"معرفة البوت"</strong>: اكتب تفاصيل واضحة وكأنك تشرح لموظف جديد.</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>قواعد البوت</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد قواعد بعد</p>
              <p className="text-sm">أضف قاعدة جديدة لتدريب البوت</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الكلمة المفتاحية</TableHead>
                  <TableHead className="text-right">الرد</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                  <TableHead className="text-center">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.trigger_keyword}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{rule.response_text}</TableCell>
                    <TableCell>{getTypeBadge(rule.match_type)}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={rule.is_active ?? true}
                        onCheckedChange={(checked) =>
                          toggleRuleActive.mutate({ id: rule.id, is_active: checked })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(rule)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => openDeleteDialog(rule)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تعديل القاعدة</DialogTitle>
          </DialogHeader>
          <RuleFormContent isEdit />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف هذه القاعدة نهائياً ولا يمكن استرجاعها.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRule}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
