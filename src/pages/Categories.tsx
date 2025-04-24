import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, Edit, Trash2, MoreVertical, Loader2, Tag, Search } from "lucide-react";
import { useDashboard } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  slug: string;
  isActive: boolean;
  adCount: number;
  createdAt: string;
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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    isActive: true
  });

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      
      try {
        // Simulated delay for network request
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Example data
        const exampleCategories: Category[] = [
          {
            id: "1",
            name: "سيارات",
            description: "كل أنواع السيارات والمركبات",
            icon: "car",
            slug: "vehicles",
            isActive: true,
            adCount: 24,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "2",
            name: "عقارات",
            description: "شقق، فلل، أراضي وعقارات تجارية",
            icon: "building",
            slug: "real-estate",
            isActive: true,
            adCount: 18,
            createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "3",
            name: "إلكترونيات",
            description: "هواتف، أجهزة كمبيوتر وإلكترونيات أخرى",
            icon: "smartphone",
            slug: "electronics",
            isActive: true,
            adCount: 12,
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "4",
            name: "وظائف",
            description: "فرص عمل وتوظيف",
            icon: "briefcase",
            slug: "jobs",
            isActive: false,
            adCount: 0,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "5",
            name: "خدمات",
            description: "خدمات متنوعة للأفراد والشركات",
            icon: "tool",
            slug: "services",
            isActive: true,
            adCount: 8,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        setCategories(exampleCategories);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Filter categories based on active tab and search query
  const filteredCategories = categories
    .filter(category => {
      if (activeTab === "all") return true;
      if (activeTab === "active") return category.isActive;
      if (activeTab === "inactive") return !category.isActive;
      return true;
    })
    .filter(category => 
      searchQuery === "" || 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleCreateCategory = () => {
    setFormData({
      name: "",
      description: "",
      icon: "",
      isActive: true
    });
    setIsCreating(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      isActive: category.isActive
    });
    setIsEditing(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    // In a real application, this would make an API call to delete the category
    const categoryToDelete = categories.find(c => c.id === categoryId);
    
    if (categoryToDelete?.adCount && categoryToDelete.adCount > 0) {
      toast({
        title: "لا يمكن حذف الفئة",
        description: `لا يمكن حذف هذه الفئة لأنها تحتوي على ${categoryToDelete.adCount} إعلانات. قم بنقل الإعلانات أو تعطيل الفئة بدلاً من ذلك.`,
        variant: "destructive"
      });
      return;
    }
    
    setCategories(categories.filter(category => category.id !== categoryId));
    
    toast({
      title: "تم حذف الفئة",
      description: "تم حذف الفئة بنجاح"
    });
  };

  const handleToggleActive = (categoryId: string) => {
    setCategories(
      categories.map(category => 
        category.id === categoryId 
          ? { ...category, isActive: !category.isActive } 
          : category
      )
    );
    
    const category = categories.find(c => c.id === categoryId);
    const newStatus = !category?.isActive;
    
    toast({
      title: newStatus ? "تم تفعيل الفئة" : "تم تعطيل الفئة",
      description: newStatus 
        ? "الفئة الآن نشطة وستظهر للمستخدمين" 
        : "الفئة الآن غير نشطة ولن تظهر للمستخدمين"
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "خطأ في النموذج",
        description: "اسم الفئة مطلوب",
        variant: "destructive"
      });
      return;
    }
    
    if (isCreating) {
      // Generate a new category with a unique ID
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        isActive: formData.isActive,
        adCount: 0,
        createdAt: new Date().toISOString()
      };
      
      setCategories([...categories, newCategory]);
      
      toast({
        title: "تمت إضافة الفئة",
        description: "تمت إضافة الفئة الجديدة بنجاح"
      });
    } else if (isEditing && selectedCategory) {
      // Update existing category
      setCategories(
        categories.map(category => 
          category.id === selectedCategory.id 
            ? { 
                ...category, 
                name: formData.name,
                description: formData.description,
                icon: formData.icon,
                isActive: formData.isActive
              } 
            : category
        )
      );
      
      toast({
        title: "تم تحديث الفئة",
        description: "تم تحديث الفئة بنجاح"
      });
    }
    
    // Reset form and close dialogs
    setIsCreating(false);
    setIsEditing(false);
    setSelectedCategory(null);
  };

  // Component for the empty state
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

  // Component for category card
  const CategoryCard = ({ category }: { category: Category }) => {
    const formattedDate = new Date(category.createdAt).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Badge 
                className={`${category.isActive ? "bg-green-500" : "bg-gray-500"}`} 
                variant="default"
              >
                {category.isActive ? "نشط" : "غير نشط"}
              </Badge>
              <Badge variant="outline">{category.adCount} إعلان</Badge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                  <Edit className="h-4 w-4 ml-2" />
                  تعديل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleToggleActive(category.id)}>
                  {category.isActive ? (
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
                  className="text-destructive"
                  disabled={category.adCount > 0}
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle className="text-xl mt-2">{category.name}</CardTitle>
          {category.description && (
            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex justify-between text-sm text-gray-500">
            <span>الرابط: {category.slug}</span>
            <span>تاريخ الإنشاء: {formattedDate}</span>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-800/50 p-3 border-t">
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full" 
            onClick={() => window.location.href = `/dashboard/advertisements?category=${category.slug}`}
            disabled={!category.isActive}
          >
            عرض الإعلانات ({category.adCount})
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <>
      {/* Page header */}
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

      {/* Filter tabs and add category button */}
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

      {/* Categories grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary h-8 w-8" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}

      {/* Create category dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة فئة جديدة</DialogTitle>
            <DialogDescription>
              أضف فئة جديدة لتنظيم الإعلانات على صفحتك
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الفئة *</Label>
              <Input 
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="مثال: سيارات"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">وصف الفئة</Label>
              <Textarea 
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="وصف قصير للفئة"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="icon">أيقونة الفئة</Label>
              <Input 
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                placeholder="مثال: car"
              />
              <p className="text-xs text-gray-500">اسم الأيقونة من مكتبة Lucide، اتركه فارغًا للأيقونة الافتراضية</p>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox 
                id="isActive" 
                checked={formData.isActive}
                onCheckedChange={(checked) => 
                  setFormData({...formData, isActive: checked as boolean})
                }
              />
              <Label htmlFor="isActive">فئة نشطة (ستظهر للمستخدمين)</Label>
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="submit">إضافة الفئة</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit category dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل الفئة</DialogTitle>
            <DialogDescription>
              قم بتعديل معلومات الفئة
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">اسم الفئة *</Label>
              <Input 
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="مثال: سيارات"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">وصف الفئة</Label>
              <Textarea 
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="وصف قصير للفئة"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-icon">أيقونة الفئة</Label>
              <Input 
                id="edit-icon"
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                placeholder="مثال: car"
              />
              <p className="text-xs text-gray-500">اسم الأيقونة من مكتبة Lucide، اتركه فارغًا للأيقونة الافتراضية</p>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox 
                id="edit-isActive" 
                checked={formData.isActive}
                onCheckedChange={(checked) => 
                  setFormData({...formData, isActive: checked as boolean})
                }
              />
              <Label htmlFor="edit-isActive">فئة نشطة (ستظهر للمستخدمين)</Label>
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="submit">حفظ التغييرات</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Categories; 