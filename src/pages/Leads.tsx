import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Edit2, Phone, Filter, ShoppingBag, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useCustomer360, Customer360 } from "@/hooks/useCustomer360";
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

const getVIPBadge = (totalOrders: number | null) => {
  if (!totalOrders || totalOrders === 0) return null;
  
  if (totalOrders >= 3) {
    return (
      <Badge className="bg-amber-500 text-white hover:bg-amber-600 mr-2">
        <Crown className="w-3 h-3 ml-1" />
        VIP
      </Badge>
    );
  }
  
  if (totalOrders >= 1) {
    return (
      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 mr-2">
        عميل جديد
      </Badge>
    );
  }
  
  return null;
};

const formatCurrency = (amount: number | null) => {
  if (amount === null || amount === undefined) return "0.00 ر.س";
  return `${amount.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;
};

export default function Leads() {
  const navigate = useNavigate();
  const { customers, isLoading, updateCustomer, isUpdating } = useCustomer360();
  const [editingCustomer, setEditingCustomer] = useState<Customer360 | null>(null);
  const [editForm, setEditForm] = useState({ status: "", notes: "", name: "" });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredCustomers = customers.filter((customer) => {
    return statusFilter === "all" || customer.lead_status === statusFilter;
  });

  const handleEdit = (customer: Customer360) => {
    setEditingCustomer(customer);
    setEditForm({ 
      status: customer.lead_status || "new", 
      notes: "", 
      name: customer.name || "" 
    });
  };

  const handleSave = () => {
    if (!editingCustomer || !editingCustomer.id) return;
    updateCustomer({ 
      id: editingCustomer.id, 
      updates: { status: editForm.status, name: editForm.name } 
    });
    setEditingCustomer(null);
  };

  const handleViewOrders = (phone: string | null) => {
    if (!phone) return;
    navigate(`/orders?phone=${encodeURIComponent(phone)}`);
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
            نظرة شاملة للعملاء
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              نظرة شاملة للعملاء (Customer 360)
              <Badge variant="secondary" className="mr-2">{filteredCustomers.length}</Badge>
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="ml-2 h-4 w-4" />
                <SelectValue placeholder="كل الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mb-3 opacity-50" />
              <p>{customers.length === 0 ? "لا يوجد عملاء حتى الآن" : "لا توجد نتائج مطابقة"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم / الهاتف</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>عدد الطلبات</TableHead>
                    <TableHead>إجمالي الإنفاق</TableHead>
                    <TableHead>آخر تواصل</TableHead>
                    <TableHead className="w-[120px]">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id || customer.phone}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="flex items-center">
                              <p className="font-medium">{customer.name || "غير محدد"}</p>
                              {getVIPBadge(customer.total_orders)}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span dir="ltr">{customer.phone}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.lead_status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {customer.total_orders || 0} طلبات
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-primary">
                          {formatCurrency(customer.total_spent)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {customer.last_contact_at
                          ? formatDistanceToNow(new Date(customer.last_contact_at), {
                              addSuffix: true,
                              locale: ar,
                            })
                          : "لم يتم التواصل"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(customer)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>تعديل</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewOrders(customer.phone)}
                                  disabled={!customer.total_orders || customer.total_orders === 0}
                                >
                                  <ShoppingBag className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>عرض الطلبات</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
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
      <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل بيانات العميل</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>الاسم</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="اسم العميل"
              />
            </div>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCustomer(null)}>
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
