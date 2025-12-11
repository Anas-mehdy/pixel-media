
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useProducts, ProductInput } from '../hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CURRENCIES } from "./Orders"; // Assuming CURRENCIES is exported from Orders.tsx

const productSchema = z.object({
  name: z.string().min(1, 'اسم المنتج مطلوب'),
  price: z.number().min(0, 'يجب أن يكون السعر رقمًا موجبًا'),
  currency: z.string().min(1, 'العملة مطلوبة'),
  stock_quantity: z.number().int().min(0, 'يجب أن تكون الكمية عددًا صحيحًا غير سالب'),
  description: z.string().optional(),
  bot_notes: z.string().optional(),
  image_url: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const ProductsPage = () => {
  const { products, isLoading, isAdding, addProduct, refetch } = useProducts();
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      currency: 'SAR',
    },
  });

  const handleAddProduct = async (data: ProductFormValues) => {
    addProduct(data as ProductInput, {
      onSuccess: () => {
        reset();
        setShowAddForm(false);
        refetch();
        toast({
          title: 'تم إضافة المنتج',
          description: `تمت إضافة المنتج ${data.name} بنجاح.`,
        });
      },
      onError: (error) => {
        toast({
          title: 'خطأ في إضافة المنتج',
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="p-4 md:p-8" dir="rtl">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">إدارة المنتجات</CardTitle>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="transition-all">
              {showAddForm ? 'إلغاء' : 'إضافة منتج'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="bg-gray-50 p-6 rounded-md border">
              <form onSubmit={handleSubmit(handleAddProduct)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="font-medium">اسم المنتج</label>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => <Input id="name" {...field} placeholder="مثال: حذاء رياضي" />}
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="stock_quantity" className="font-medium">الكمية المتاحة</label>
                    <Controller
                      name="stock_quantity"
                      control={control}
                      render={({ field }) => <Input id="stock_quantity" type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))} placeholder="0" />}
                    />
                    {errors.stock_quantity && <p className="text-red-500 text-sm">{errors.stock_quantity.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="price" className="font-medium">السعر</label>
                    <Controller
                      name="price"
                      control={control}
                      render={({ field }) => <Input id="price" type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} placeholder="0.00" />}
                    />
                    {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="currency" className="font-medium">العملة</label>
                    <Controller
                      name="currency"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر العملة" />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.currency && <p className="text-red-500 text-sm">{errors.currency.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="font-medium">وصف المنتج</label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => <Textarea id="description" {...field} placeholder="اكتب وصفًا موجزًا للمنتج..." rows={4} />}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="bot_notes" className="font-medium">ملاحظات للشات بوت</label>
                  <Controller
                    name="bot_notes"
                    control={control}
                    render={({ field }) => <Textarea id="bot_notes" {...field} placeholder="معلومات إضافية لمساعدة الشات بوت..." rows={3} />}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="image_url" className="font-medium">رابط صورة المنتج (اختياري)</label>
                  <Controller
                    name="image_url"
                    control={control}
                    render={({ field }) => <Input id="image_url" {...field} placeholder="https://example.com/image.png" />}
                  />
                  {errors.image_url && <p className="text-red-500 text-sm">{errors.image_url.message}</p>}
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isAdding} className="w-full md:w-auto">
                    {isAdding ? 'جاري الإضافة...' : 'إضافة المنتج'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-8">
            {isLoading ? (
              <p>جاري تحميل المنتجات...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>السعر</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>الوصف</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.price} {product.currency}</TableCell>
                      <TableCell>{product.stock_quantity}</TableCell>
                      <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsPage;
