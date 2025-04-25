
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, Search, Loader2 } from "lucide-react";
import { useCategories, Category } from "@/hooks/useCategories";
import { useDashboard } from "@/components/DashboardLayout";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { CategoryCard } from "@/components/categories/CategoryCard";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export default function Categories() {
  const { office } = useDashboard();
  const { toast } = useToast();
  const { categories, loading, fetchCategories, addCategory, updateCategory } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (office?.id) {
      fetchCategories();
    }
  }, [office?.id]);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handler function to adapt the updateCategory function to match expected interface
  const handleToggleActive = (category: Category) => {
    updateCategory(category.id, { is_active: !category.is_active });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="h-4 w-4 absolute right-3 top-3 text-gray-500" />
          <Input
            type="search"
            placeholder="البحث في الفئات..."
            className="pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
          <PlusCircle className="h-4 w-4 ml-2" />
          إضافة فئة
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-primary h-8 w-8" />
          <p className="mr-2 text-sm">جاري تحميل الفئات...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-center text-gray-500 text-sm">
            لا توجد فئات لعرضها
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={() => {
                setIsDialogOpen(true);
              }}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة فئة جديدة</DialogTitle>
            <DialogDescription>
              أضف فئة جديدة لتنظيم الإعلانات على صفحتك
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            onSubmit={async (formData) => {
              try {
                if (!office?.id) {
                  throw new Error("معرف المكتب غير متوفر");
                }
                await addCategory({
                  name: formData.name,  // Ensure name is provided 
                  image_url: formData.image_url || "/placeholder.svg", // Ensure image_url is never undefined
                  office_id: office.id,
                  user_id: (await supabase.auth.getUser()).data.user?.id || '',
                  is_active: true
                });
                setIsDialogOpen(false);
                toast({
                  title: "تم إضافة الفئة",
                  description: "تمت إضافة الفئة بنجاح"
                });
              } catch (error: any) {
                toast({
                  title: "خطأ في حفظ الفئة",
                  description: error.message,
                  variant: "destructive"
                });
              }
            }}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
