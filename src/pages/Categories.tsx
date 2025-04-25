import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, Edit, Trash2, MoreVertical, Loader2, Tag, Search, Upload, Info } from "lucide-react";
import { useDashboard } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import SimpleImageUpload from "@/components/SimpleImageUpload";

interface Category {
  id: string;
  created_at: string;
  updated_at?: string;
  name: string;
  image_url: string;
  user_id: string;
  office_id: string;
  category_type?: string;
  status?: string;
  is_active: boolean;
  ad_count?: number;
}

const Categories = () => {
  const { office } = useDashboard();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    image_url: "",
    is_active: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching categories for office", office?.id);
      
      if (!office?.id) {
        throw new Error("معرف المكتب غير متوفر");
      }
      
      const { data: categoriesData, error } = await supabase
        .from('categories')
        .select('*')
        .eq('office_id', office.id);
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      console.log("Categories data received:", categoriesData);
      
      const categoriesWithCounts = (categoriesData || []).map(category => ({
        ...category,
        is_active: category.status === "active",
        ad_count: 0,
        office_id: office.id
      })) as Category[];
      
      setCategories(categoriesWithCounts);
      
      if (categoriesWithCounts.length === 0) {
        console.log("No categories found for the office");
      }
    } catch (error: any) {
      console.error("Error loading categories:", error);
      setError(error.message || "حدث خطأ أثناء تحميل الفئات");
      toast({
        title: "خطأ في تحميل الفئات",
        description: "حدث خطأ أثناء تحميل الفئات، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (office?.id) {
      fetchCategories();
    }
  }, [office?.id]);

  const filteredCategories = categories
    .filter(category => {
      if (activeTab === "all") return true;
      if (activeTab === "active") return category.is_active;
      if (activeTab === "inactive") return !category.is_active;
      return true;
    })
    .filter(category => 
      searchQuery === "" || 
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setImageFile(null);
      setImagePreview("");
      return;
    }

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "نوع ملف غير صالح",
        description: "يرجى اختيار صورة صالحة",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "حجم الصورة كبير جدًا",
        description: "يجب أن يكون حجم الصورة أقل من 2 ميجابايت",
        variant: "destructive"
      });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadCategoryImage = async (file: File): Promise<string> => {
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `public/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleCreateCategory = () => {
    setFormData({
      name: "",
      image_url: "",
      is_active: true
    });
    setImageFile(null);
    setImagePreview("");
    setIsCreating(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      image_url: category.image_url,
      is_active: category.is_active
    });
    setImageFile(null);
    setImagePreview(category.image_url);
    setIsEditing(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const categoryToDelete = categories.find(c => c.id === categoryId);
    
    if (categoryToDelete?.ad_count && categoryToDelete.ad_count > 0) {
      toast({
        title: "لا يمكن حذف الفئة",
        description: `لا يمكن حذف هذه الفئة لأنها تحتوي على ${categoryToDelete.ad_count} إعلانات. قم بنقل الإعلانات أو تعطيل الفئة بدلاً من ذلك.`,
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
        
      if (error) throw error;
      
      setCategories(categories.filter(category => category.id !== categoryId));
      
      toast({
        title: "تم حذف الفئة",
        description: "تم حذف الفئة بنجاح"
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "خطأ في حذف الفئة",
        description: "حدث خطأ أثناء حذف الفئة، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const newStatus = !category.is_active;
    
    try {
      const { error } = await supabase
        .from('categories')
        .update({ 
          status: newStatus ? "active" : "inactive" 
        })
        .eq('id', categoryId);
        
      if (error) throw error;
      
      setCategories(
        categories.map(cat => 
          cat.id === categoryId 
            ? { 
                ...cat, 
                is_active: newStatus,
                status: newStatus ? "active" : "inactive" 
              } 
            : cat
        )
      );
      
      toast({
        title: newStatus ? "تم تفعيل الفئة" : "تم تعطيل الفئة",
        description: newStatus 
          ? "الفئة الآن نشطة وستظهر للمستخدمين" 
          : "الفئة الآن غير نشطة ولن تظهر للمستخدمين"
      });
    } catch (error) {
      console.error("Error toggling category status:", error);
      toast({
        title: "خطأ في تغيير حالة الفئة",
        description: "حدث خطأ أثناء تغيير حالة الفئة، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
  };

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
        title: "خطأ في المعرض",
        description: "لا يمكن العثور على معلومات المكتب",
        variant: "destructive"
      });
      return;
    }
    
    try {
      let imageUrl = formData.image_url;
      
      if (imageFile) {
        imageUrl = await uploadCategoryImage(imageFile);
      } else if (isCreating && !imageUrl) {
        toast({
          title: "الصورة مطلوبة",
          description: "يرجى اختيار صورة للفئة",
          variant: "destructive"
        });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        toast({
          title: "خطأ في المصادقة",
          description: "يرجى تسجيل الدخول مرة أخرى",
          variant: "destructive"
        });
        return;
      }
      
      const categoryData = {
        name: formData.name,
        image_url: imageUrl,
        office_id: office.id,
        user_id: session.user.id,
        status: formData.is_active ? "active" : "inactive",
        category_type: "general"
      };
      
      if (isCreating) {
        const { data, error } = await supabase
          .from('categories')
          .insert(categoryData)
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          const newCategory: Category = {
            ...data[0],
            is_active: data[0].status === "active",
            ad_count: 0,
            office_id: office.id,
            user_id: session.user.id
          };
          
          setCategories([...categories, newCategory]);
          
          toast({
            title: "تمت إضافة الفئة",
            description: "تمت إضافة الفئة الجديدة بنجاح"
          });
        }
      } else if (isEditing && selectedCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            image_url: imageUrl,
            status: formData.is_active ? "active" : "inactive"
          })
          .eq('id', selectedCategory.id);
          
        if (error) throw error;
        
        setCategories(
          categories.map(category => 
            category.id === selectedCategory.id 
              ? { 
                  ...category, 
                  name: formData.name,
                  image_url: imageUrl,
                  is_active: formData.is_active,
                  status: formData.is_active ? "active" : "inactive"
                } 
              : category
          )
        );
        
        toast({
          title: "تم تحديث الفئة",
          description: "تم تحديث الفئة بنجاح"
        });
      }
      
      setIsCreating(false);
      setIsEditing(false);
      setSelectedCategory(null);
      setImageFile(null);
      setImagePreview("");
    } catch (error) {
      console.error("Error saving category:", error);
      toast({
        title: "خطأ في حفظ الفئة",
        description: "حدث خطأ أثناء حفظ الفئة، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    }
  };

  const EmptyState = () => (
    <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-slate-800/30">
      <Tag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-500 dark:text-gray-400 mb-3">لا توجد فئات لعرضها</p>
      <p className="text-gray-500 dark:text-gray-400 mb-5">أضف فئات جديدة لتنظيم إعلاناتك</p>
      <Button 
        variant="default"
        onClick={handleCreateCategory}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
      >
        <PlusCircle className="h-4 w-4 ml-2" />
        إضافة فئة جديدة
      </Button>
    </div>
  );

  const ErrorState = () => (
    <div className="text-center py-12 border border-dashed border-red-300 dark:border-red-700 rounded-lg bg-red-50/50 dark:bg-red-900/10">
      <div className="mx-auto h-12 w-12 text-red-500 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-red-500 dark:text-red-400 mb-3">خطأ في تحميل الفئات</p>
      <p className="text-gray-500 dark:text-gray-400 mb-5">{error || "حدث خطأ غير متوقع"}</p>
      <Button 
        variant="outline"
        onClick={fetchCategories}
        className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <svg className="h-4 w-4 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        إعادة المحاولة
      </Button>
    </div>
  );

  const CategoryCard = ({ category }: { category: Category }) => {
    const formattedDate = new Date(category.created_at).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="w-full h-32 overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
          <img 
            src={category.image_url || "/placeholder.svg"} 
            alt={category.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const imgElement = e.target as HTMLImageElement;
              imgElement.onerror = null;
              imgElement.src = "/placeholder.svg";
            }}
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge 
              variant={category.is_active ? "default" : "secondary"}
              className={category.is_active ? "bg-green-500" : ""}
            >
              {category.is_active ? "نشط" : "غير نشط"}
            </Badge>
          </div>
        </div>
        <CardHeader className="p-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                  <Edit className="h-4 w-4 ml-2" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleActive(category.id)}>
                  {category.is_active ? (
                    <>
                      <Trash2 className="h-4 w-4 ml-2 text-amber-500" />
                      تعطيل
                    </>
                  ) : (
                    <>
                      <Tag className="h-4 w-4 ml-2 text-green-500" />
                      تفعيل
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-red-600"
                  disabled={(category.ad_count || 0) > 0}
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardFooter className="p-3 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-500">
          {formattedDate}
        </CardFooter>
      </Card>
    );
  };

  return (
    <>
      <header className="flex justify-between items-center mb-8">
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
        <div className="space-y-2 text-right">
          <h1 className="text-3xl font-bold bg-gradient-to-l from-purple-800 to-indigo-700 text-transparent bg-clip-text">الفئات</h1>
          <p className="text-gray-600 dark:text-gray-400">قم بإدارة فئات الإعلانات في صفحتك</p>
        </div>
      </header>

      <Card className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm border-none shadow-lg mb-6">
        <CardContent className="p-4 flex justify-between items-center">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border border-gray-200 dark:border-gray-700 p-1">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                id="tab-categories-all"
                name="categories-tab"
              >
                الكل
              </TabsTrigger>
              <TabsTrigger 
                value="active" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                id="tab-categories-active"
                name="categories-tab"
              >
                نشط
              </TabsTrigger>
              <TabsTrigger 
                value="inactive" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                id="tab-categories-inactive"
                name="categories-tab"
              >
                غير نشط
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button onClick={handleCreateCategory}>
            <PlusCircle className="h-4 w-4 ml-2" />
            إضافة فئة
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary h-8 w-8 mb-4" />
          <p className="text-gray-500">جاري تحميل الفئات...</p>
        </div>
      ) : error ? (
        <ErrorState />
      ) : filteredCategories.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCategories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}

      <Dialog open={isCreating || isEditing} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false);
          setIsEditing(false);
          setSelectedCategory(null);
          setImageFile(null);
          setImagePreview("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? "إضافة فئة جديدة" : "تعديل الفئة"}
            </DialogTitle>
            <DialogDescription>
              {isCreating 
                ? "أضف فئة جديدة لتنظيم الإعلانات على صفحتك" 
                : "قم بتعديل معلومات الفئة"}
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
                aspectRatio={1.5}
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
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                }}
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={!formData.name.trim() || (!imageFile && !formData.image_url) || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : isCreating ? (
                  "إضافة الفئة"
                ) : (
                  "حفظ التغييرات"
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
