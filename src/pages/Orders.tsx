import { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useLeads } from "@/hooks/useLeads";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const ORDER_STATUSES = [
  { value: "Pending", label: "قيد الانتظار", color: "bg-gray-500" },
  { value: "Processing", label: "جاري التجهيز", color: "bg-blue-500" },
  { value: "Shipped", label: "تم الشحن", color: "bg-yellow-500" },
  { value: "Delivered", label: "تم التسليم", color: "bg-green-500" },
  { value: "Cancelled", label: "ملغي", color: "bg-red-500" },
];

export default function Orders() {
  const { orders, isLoading, updateOrderStatus, createOrder, deleteOrder } = useOrders();
  const { leads } = useLeads();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customer_phone: "",
    product_details: "",
    total_amount: "",
  });

  const getStatusBadge = (status: string | null) => {
    const statusConfig = ORDER_STATUSES.find((s) => s.value === status) || ORDER_STATUSES[0];
    return (
      <Badge className={`${statusConfig.color} text-white`}>
        {statusConfig.label}
      </Badge>
    );
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status: newStatus });
      toast.success("تم تحديث حالة الطلب");
    } catch (error) {
      toast.error("فشل في تحديث الحالة");
    }
  };

  const handleCreateOrder = async () => {
    if (!newOrder.customer_phone || !newOrder.product_details) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const selectedLead = leads.find((l) => l.phone === newOrder.customer_phone);

    try {
      await createOrder.mutateAsync({
        customer_name: selectedLead?.name || "غير معروف",
        customer_phone: newOrder.customer_phone,
        product_details: newOrder.product_details,
        total_amount: parseFloat(newOrder.total_amount) || 0,
      });
      toast.success("تم إنشاء الطلب بنجاح");
      setIsDialogOpen(false);
      setNewOrder({ customer_phone: "", product_details: "", total_amount: "" });
    } catch (error) {
      toast.error("فشل في إنشاء الطلب");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder.mutateAsync(id);
      toast.success("تم حذف الطلب");
    } catch (error) {
      toast.error("فشل في حذف الطلب");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">إدارة الطلبات</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="ml-2 h-4 w-4" />
              طلب جديد
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl" className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-right">إضافة طلب جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>العميل</Label>
                <Select
                  value={newOrder.customer_phone}
                  onValueChange={(value) =>
                    setNewOrder({ ...newOrder, customer_phone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.phone}>
                        {lead.name || lead.phone} - {lead.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>تفاصيل المنتج</Label>
                <Textarea
                  value={newOrder.product_details}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, product_details: e.target.value })
                  }
                  placeholder="أدخل تفاصيل المنتج أو الخدمة"
                />
              </div>
              <div className="space-y-2">
                <Label>المبلغ الإجمالي</Label>
                <Input
                  type="number"
                  value={newOrder.total_amount}
                  onChange={(e) =>
                    setNewOrder({ ...newOrder, total_amount: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <Button onClick={handleCreateOrder} className="w-full">
                إنشاء الطلب
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {orders.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">لا توجد طلبات بعد</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">التفاصيل</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer_name || "غير معروف"}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer_phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {order.product_details || "-"}
                  </TableCell>
                  <TableCell>
                    {order.total_amount ? `${order.total_amount} ر.س` : "-"}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status || "Pending"}
                      onValueChange={(value) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger className="w-36 border-0 bg-transparent p-0">
                        <SelectValue>{getStatusBadge(order.status)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            <Badge className={`${status.color} text-white`}>
                              {status.label}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.created_at
                      ? format(new Date(order.created_at), "dd MMM yyyy", {
                          locale: ar,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteOrder(order.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
