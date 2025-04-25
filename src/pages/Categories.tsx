
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlusCircle, Search, Loader2 } from "lucide-react";
import { useCategories, Category } from "@/hooks/useCategories";
import { useDashboard } from "@/components/DashboardLayout";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase"; // Import supabase client
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Categories = () => {
  const { office } = useDashboard();
  const { toast } = useToast();
  const { categories, loading, fetchCategories, addCategory } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (office?.id) {
      fetchCategories();
    }
  }, [office?.id]);

  const filteredCategories = categories.filter(category =>
    searchQuery === "" ||
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (formData: { name: string; image_url: string; is_active: boolean }) => {
    if (!office?.id) {
      toast({
        title: "خطأ",
        description: "لا يمكن العثور على معلومات المكتب",
        variant: "destructive"
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      throw new Error("يرجى تسجيل الدخول مرة أخرى");
    }

    await addCategory({
      ...formData,
      office_id: office.id,
      user_id: session.user.id,
    });

    setIsCreating(false);
    toast({
      title: "تم إضافة الفئة",
      description: "تمت إضافة الفئة الجديدة بنجاح"
    });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
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
        <Button onClick={() => setIsCreating(true)} className="w-full sm:w-auto">
          <PlusCircle className="h-4 w-4 ml-2" />
          إضافة فئة
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">الصورة</TableHead>
                  <TableHead>اسم الفئة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="hidden sm:table-cell">تاريخ الإنشاء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-primary h-8 w-8 mb-4" />
                        <p className="text-gray-500">جاري تحميل الفئات...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <p className="text-gray-500">لا توجد فئات لعرضها</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          category.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {category.is_active ? "نشط" : "غير نشط"}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {new Date(category.created_at).toLocaleDateString('ar-SA')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة فئة جديدة</DialogTitle>
            <DialogDescription>
              أضف فئة جديدة لتنظيم الإعلانات على صفحتك
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            onSubmit={handleSubmit}
            onCancel={() => setIsCreating(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Categories;
