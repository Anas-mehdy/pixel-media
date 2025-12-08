import { useState, useEffect } from "react";
import { Users, Edit2, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLeads, Lead } from "@/hooks/useLeads";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const statusOptions = [
  { value: "new", label: "جديد", color: "bg-gray-500" },
  { value: "inquiry", label: "استفسار", color: "bg-blue-500" },
  { value: "potential", label: "مهتم/محتمل", color: "bg-yellow-500" },
  { value: "order_placed", label: "طلب نشط", color: "bg-purple-500" },
  { value: "complaint", label: "شكوى", color: "bg-red-500" },
  { value: "closed", label: "مكتمل", color: "bg-green-500" },
];

export default function Leads() {
  const { leads, isLoading, updateLead, isUpdating, refetch } = useLeads();
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editForm, setEditForm] = useState({ status: "", notes: "" });

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setEditForm({ status: lead.status || "new", notes: lead.notes || "" });
  };

  const handleSave = () => {
    if (!editingLead) return;
    updateLead({ 
      id: editingLead.id, 
      updates: { status: editForm.status, notes: editForm.notes } 
    });
    setEditingLead(null);
  };

  const getStatusBadge = (status: string | null) => {
    const statusInfo = statusOptions.find(s => s.value === status) || statusOptions[0];
    return (
      <Badge className={`${statusInfo.color} text-white hover:${statusInfo.color}`}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            تصنيف العملاء
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            تصنيف العملاء
            <Badge variant="secondary" className="mr-2">{leads.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mb-3 opacity-50" />
              <p>لا يوجد عملاء حتى الآن</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم / الهاتف</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>آخر تواصل</TableHead>
                    <TableHead>ملخص AI</TableHead>
                    <TableHead className="w-[100px]">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{lead.name || "غير محدد"}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span dir="ltr">{lead.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell>
                        {lead.last_contact_at
                          ? formatDistanceToNow(new Date(lead.last_contact_at), {
                              addSuffix: true,
                              locale: ar,
                            })
                          : "لم يتم التواصل"}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm text-muted-foreground truncate">
                          {lead.ai_summary || "-"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(lead)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل تصنيف العميل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm({ ...editForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="أضف ملاحظاتك هنا..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLead(null)}>
              إلغاء
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}