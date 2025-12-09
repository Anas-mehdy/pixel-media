import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useOrders, Order } from "@/hooks/useOrders";
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
import { Plus, Trash2, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const ORDER_STATUSES = [
  { value: "Pending", label: "قيد الانتظار", color: "bg-gray-500" },
  { value: "Processing", label: "جاري التجهيز", color: "bg-blue-500" },
  { value: "Shipped", label: "تم الشحن", color: "bg-yellow-500" },
  { value: "Delivered", label: "تم التسليم", color: "bg-green-500" },
  { value: "Cancelled", label: "ملغي", color: "bg-red-500" },
];

const CURRENCIES = [
  { value: "SAR", label: "ريال سعودي (SAR)" },
  { value: "AED", label: "درهم إماراتي (AED)" },
  { value: "KWD", label: "دينار كويتي (KWD)" },
  { value: "BHD", label: "دينار بحريني (BHD)" },
  { value: "OMR", label: "ريال عماني (OMR)" },
  { value: "QAR", label: "ريال قطري (QAR)" },
  { value: "EGP", label: "جنيه مصري (EGP)" },
  { value: "JOD", label: "دينار أردني (JOD)" },
  { value: "LBP", label: "ليرة لبنانية (LBP)" },
  { value: "SYP", label: "ليرة سورية (SYP)" },
  { value: "IQD", label: "دينار عراقي (IQD)" },
  { value: "YER", label: "ريال يمني (YER)" },
  { value: "LYD", label: "دينار ليبي (LYD)" },
  { value: "TND", label: "دينار تونسي (TND)" },
  { value: "DZD", label: "دينار جزائري (DZD)" },
  { value: "MAD", label: "درهم مغربي (MAD)" },
  { value: "SDG", label: "جنيه سوداني (SDG)" },
  { value: "MRU", label: "أوقية موريتانية (MRU)" },
  { value: "SOS", label: "شلن صومالي (SOS)" },
  { value: "DJF", label: "فرنك جيبوتي (DJF)" },
  { value: "KMF", label: "فرنك قمري (KMF)" },
  { value: "USD", label: "دولار أمريكي (USD)" },
  { value: "EUR", label: "يورو (EUR)" },
];

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const phoneFilter = searchParams.get("phone");
  
  const { orders, isLoading, updateOrderStatus, createOrder, deleteOrder } = useOrders();
  const { leads } = useLeads();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const previousOrdersRef = useRef<Order[]>([]);
  const [newOrder, setNewOrder] = useState({
    customer_phone: "",
    product_details: "",
    total_amount: "",
    currency: "SAR",
  });

  // Set initial search query from URL phone filter
  useEffect(() => {
    if (phoneFilter) {
      setSearchQuery(phoneFilter);
    }
  }, [phoneFilter]);

  // Detect new orders for animation
  useEffect(() => {
    if (previousOrdersRef.current.length > 0 && orders.length > previousOrdersRef.current.length) {
      const previousIds = new Set(previousOrdersRef.current.map(o => o.id));
      const newIds = orders.filter(o => !previousIds.has(o.id)).map(o => o.id);
      if (newIds.length > 0) {
        setNewOrderIds(new Set(newIds));
        toast.success(`طلب جديد! 🎉`);
        // Remove highlight after animation
        setTimeout(() => setNewOrderIds(new Set()), 3000);
      }
    }
    previousOrdersRef.current = orders;
  }, [orders]);

  const clearPhoneFilter = () => {
    setSearchParams({});
    setSearchQuery("");
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone?.includes(searchQuery) ||
      order.product_details?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
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
        currency: newOrder.currency,
      });
      toast.success("تم إنشاء الطلب بنجاح");
      setIsDialogOpen(false);
      setNewOrder({ customer_phone: "", product_details: "", total_amount: "", currency: "SAR" });
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">إدارة الطلبات</h1>
          {phoneFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>تصفية: {phoneFilter}</span>
              <button onClick={clearPhoneFilter} className="mr-1 hover:text-destructive">×</button>
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث عن طلب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 pr-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="ml-2 h-4 w-4" />
              <SelectValue placeholder="كل الحالات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              <div className="grid grid-cols-2 gap-3">
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
                <div className="space-y-2">
                  <Label>العملة</Label>
                  <Select
                    value={newOrder.currency}
                    onValueChange={(value) =>
                      setNewOrder({ ...newOrder, currency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العملة" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreateOrder} className="w-full">
                إنشاء الطلب
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            {orders.length === 0 ? "لا توجد طلبات بعد" : "لا توجد نتائج مطابقة"}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">التفاصيل</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow 
                  key={order.id}
                  className={`transition-all duration-500 ${
                    newOrderIds.has(order.id) 
                      ? "animate-pulse bg-primary/20 ring-2 ring-primary/50" 
                      : ""
                  }`}
                >
                  <TableCell className="font-mono text-sm font-medium">
                    #{order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {order.created_at
                      ? format(new Date(order.created_at), "dd/MM/yyyy - HH:mm")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer_name || "غير معروف"}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customer_phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="text-sm whitespace-normal break-words">
                      {order.address || "-"}
                    </p>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="text-sm whitespace-normal break-words">
                      {order.product_details || "-"}
                    </p>
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">
                    {order.total_amount 
                      ? `${order.total_amount.toLocaleString()} ${order.currency || 'SAR'}` 
                      : "-"}
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
