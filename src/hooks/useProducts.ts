import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuthContext } from "@/contexts/AuthContext";
import { useEffect } from "react";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  stock_quantity: number | null;
  bot_notes: string | null;
  image_url: string | null;
  created_at: string;
  client_id: string | null;
}

// نفس الشكل اللي تستعمله صفحة Products في formData
export type ProductInput = Omit<Product, "id" | "created_at" | "client_id">;

// دالة مساعدة: نضمن الحصول على client_id مهما صار
async function resolveClientId(contextClientId: string | null): Promise<string> {
  if (contextClientId) return contextClientId;

  const { data, error } = await supabase.rpc("get_my_client_id");

  if (error) {
    console.error("Error getting client_id via RPC:", error);
    throw error;
  }

  if (!data) {
    throw new Error("get_my_client_id() returned null/undefined");
  }

  return data as string;
}

export function useProducts() {
  const queryClient = useQueryClient();
  const { clientId } = useAuthContext();

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("products-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const addProduct = useMutation({
    mutationFn: async (product: ProductInput) => {
      // ✅ نضمن client_id صحيح حتى لو الـ context ما كان جاهز
      const effectiveClientId = await resolveClientId(clientId);

      const { error } = await supabase.from("products").insert({
        ...product,
        client_id: effectiveClientId,
      });

      if (error) {
        console.error("Error adding product:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-count"] });
      toast({
        title: "تمت الإضافة",
        description: "تم إضافة المنتج بنجاح",
      });
    },
    onError: (error) => {
      console.error("Add product failed:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المنتج",
        variant: "destructive",
      });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ProductInput>;
    }) => {
      const { error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id);

      if (error) {
        console.error("Error updating product:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث المنتج بنجاح",
      });
    },
    onError: (error) => {
      console.error("Update product failed:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث المنتج",
        variant: "destructive",
      });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting product:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-count"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف المنتج بنجاح",
      });
    },
    onError: (error) => {
      console.error("Delete product failed:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المنتج",
        variant: "destructive",
      });
    },
  });

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    addProduct: addProduct.mutate,
    updateProduct: updateProduct.mutate,
    deleteProduct: deleteProduct.mutate,
    isAdding: addProduct.isPending,
    isUpdating: updateProduct.isPending,
    isDeleting: deleteProduct.isPending,
    refetch: productsQuery.refetch,
  };
}
