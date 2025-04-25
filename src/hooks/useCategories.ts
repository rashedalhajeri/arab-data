import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useDashboard } from '@/components/DashboardLayout';
import { useToast } from '@/components/ui/use-toast';

export interface Category {
  id: string;
  name: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  user_id: string;
  office_id: string;
}

export const useCategories = () => {
  const { office } = useDashboard();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      if (!office?.id) {
        throw new Error("معرف المكتب غير متوفر");
      }

      const { data: categoriesData, error } = await supabase
        .from('categories')
        .select('*')
        .eq('office_id', office.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCategories(categoriesData as Category[]);
    } catch (error: any) {
      console.error("Error loading categories:", error);
      toast({
        title: "خطأ في تحميل الفئات",
        description: error.message || "حدث خطأ أثناء تحميل الفئات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();

      if (error) throw error;

      setCategories([data, ...categories]);
      return data;
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast({
        title: "خطأ في حفظ الفئة",
        description: error.message || "حدث خطأ أثناء حفظ الفئة",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCategories(categories.map(cat => 
        cat.id === id ? { ...cat, ...data } : cat
      ));

      return data;
    } catch (error: any) {
      console.error("Error updating category:", error);
      toast({
        title: "خطأ في تحديث الفئة",
        description: error.message || "حدث خطأ أثناء تحديث الفئة",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    categories,
    loading,
    fetchCategories,
    addCategory,
    updateCategory,
  };
};
