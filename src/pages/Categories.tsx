
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Search, Loader2 } from "lucide-react";
import { useDashboard } from "@/components/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SimpleImageUpload from "@/components/SimpleImageUpload";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Category {
  id: string;
  name: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  user_id: string;
  office_id: string;
}

const Categories = () => {
  const { office } = useDashboard();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    image_url: "",
    is_active: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      if (!office?.id) {
        throw new Error("معرف المكتب غير متوفر");
      }

      const { data: categoriesData, error } = await supabase
        .from("categories")
        .select("*")
        .eq("office_id", office.id);

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

  useEffect(() => {
    if (office?.id) {
      fetchCategories();
    }
  }, [office?.id]);

  const filteredCategories = categories.filter(category => 
    searchQuery === "" || 
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "خطأ في النموذج",
        description: "اسم الفئة مطلوب",
        variant: "destructive"
      });
      return;
    }
    
    if (!office?.id) {
      toast({
        title: "خطأ",
        description: "لا يمكن العثور على معلومات المكتب",
        variant: "destructive"
      });
      return;
    }

    try {
      let imageUrl = formData.image_url;
      
      if (imageFile) {
        setUploading(true);
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${office.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("categories")
          .upload(filePath, imageFile);
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from("categories")
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("يرجى تسجيل الدخول مرة أخرى");
      }

      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: formData.name,
          image_url: imageUrl,
          office_id: office.id,
          user_id: session.user.id,
          is_active: formData.is_active
        })
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, data as Category]);
      setIsCreating(false);
      setFormData({ name: "", image_url: "", is_active: true });
      setImageFile(null);
      setImagePreview("");

      toast({
        title: "تم إضافة الفئة",
        description: "تمت إضافة الفئة الجديدة بنجاح"
      });
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast({
        title: "خطأ في حفظ الفئة",
        description: error.message || "حدث خطأ أثناء حفظ الفئة",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="h-4 w-4 absolute right-3 top-3 text-gray-500" />
          <Input 
            type="search"
            placeholder="البحث في الفئات..."
            className="pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <PlusCircle className="h-4 w-4 ml-2" />
          إضافة فئة
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الصورة</TableHead>
                <TableHead>اسم الفئة</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
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
                        className="w-12 h-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        category.is_active 
                          ? "bg-green-100 text-green-700" 
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {category.is_active ? "نشط" : "غير نشط"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(category.created_at).toLocaleDateString('ar-SA')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isCreating} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setFormData({ name: "", image_url: "", is_active: true });
          setImageFile(null);
          setImagePreview("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة فئة جديدة</DialogTitle>
            <DialogDescription>
              أضف فئة جديدة لتنظيم الإعلانات على صفحتك
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الفئة</Label>
              <Input 
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="مثال: سيارات"
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>صورة الفئة</Label>
              <SimpleImageUpload
                value={imagePreview || formData.image_url}
                onChange={setImagePreview}
                onBlob={setImageFile}
                title="اختر صورة للفئة"
                subtitle="اسحب وأفلت الصورة هنا أو اضغط للتحميل"
                maxSizeInMB={2}
                minWidth={200}
                minHeight={200}
                aspectRatio={1}
                imageType="cover"
              />
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox 
                id="is_active" 
                checked={formData.is_active}
                onCheckedChange={(checked) => 
                  setFormData({...formData, is_active: checked as boolean})
                }
              />
              <Label htmlFor="is_active">فئة نشطة</Label>
            </div>
            
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreating(false)}
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={!formData.name.trim() || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  "إضافة الفئة"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Categories;
