
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.number().min(0, 'Price must be a positive number'),
  currency: z.string().min(1, 'Currency is required'),
  stock_quantity: z.number().int().min(0, 'Quantity must be a non-negative integer'),
  description: z.string().optional(),
  bot_notes: z.string().optional(),
  image_url: z.string().url().optional(),
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
  });

  const handleAddProduct = async (data: ProductFormValues) => {
    addProduct(data as ProductInput, {
      onSuccess: () => {
        reset();
        setShowAddForm(false);
        refetch();
      },
    });
  };

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>إدارة المنتجات</CardTitle>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? 'Cancel' : 'Add Product'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <form onSubmit={handleSubmit(handleAddProduct)} className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name">Product Name</label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => <Input id="name" {...field} />}
                  />
                  {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="price">Price</label>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => <Input id="price" type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))}/>}
                  />
                  {errors.price && <p className="text-red-500">{errors.price.message}</p>}
                </div>
                <div>
                  <label htmlFor="currency">Currency</label>
                  <Controller
                    name="currency"
                    control={control}
                    render={({ field }) => <Input id="currency" {...field} />}
                  />
                  {errors.currency && <p className="text-red-500">{errors.currency.message}</p>}
                </div>
                <div>
                  <label htmlFor="stock_quantity">Quantity</label>
                  <Controller
                    name="stock_quantity"
                    control={control}
                    render={({ field }) => <Input id="stock_quantity" type="number" {...field}  onChange={e => field.onChange(parseInt(e.target.value))}/>}
                  />
                  {errors.stock_quantity && <p className="text-red-500">{errors.stock_quantity.message}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="description">Product Description</label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => <Textarea id="description" {...field} />}
                />
              </div>
              <div>
                <label htmlFor="bot_notes">Notes for Chatbot</label>
                <Controller
                  name="bot_notes"
                  control={control}
                  render={({ field }) => <Textarea id="bot_notes" {...field} />}
                />
              </div>
              <div>
                <label htmlFor="image_url">Product Image URL</label>
                <Controller
                  name="image_url"
                  control={control}
                  render={({ field }) => <Input id="image_url" {...field} />}
                />
                {errors.image_url && <p className="text-red-500">{errors.image_url.message}</p>}
              </div>
              <Button type="submit" disabled={isAdding}>
                {isAdding ? 'Adding...' : 'Add Product'}
              </Button>
            </form>
          )}
          {isLoading ? (
            <p>Loading products...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.price} {product.currency}</TableCell>
                    <TableCell>{product.stock_quantity}</TableCell>
                    <TableCell>{product.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsPage;
