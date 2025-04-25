import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Car, Home, Package, Search, Filter, ArrowUpDown, Edit, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/components/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Advertisement {
  id: string;
  title: string;
  category: string;
  status: "active" | "pending" | "expired";
  created_at: string;
  views: number;
}

const Advertisements = () => {
  const navigate = useNavigate();
  const { office } = useDashboard();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [activeTab, setActiveTab] = useState("table");

  // Cargar datos de anuncios
  useEffect(() => {
    // Aquí se cargarían los anuncios desde la API
    // Por ahora dejamos un array vacío como ejemplo
    setAdvertisements([]);
  }, []);

  // Filtrar anuncios basado en búsqueda, categoría y estado
  const filteredAdvertisements = advertisements
    .filter(ad => ad.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(ad => selectedCategory === "all" || ad.category === selectedCategory)
    .filter(ad => selectedStatus === "all" || ad.status === selectedStatus);

  // Ordenar anuncios
  const sortedAdvertisements = [...filteredAdvertisements].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "most-viewed":
        return b.views - a.views;
      case "newest":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // توجيه المستخدم إلى صفحة إضافة إعلان
  const handleAddAdvertisement = (category: string) => {
    navigate(`/dashboard/advertisements/add/${category}`);
    setShowCategoryModal(false);
  };

  // Función para obtener el icono de la categoría
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "vehicles":
        return <Car className="h-4 w-4" />;
      case "real-estate":
        return <Home className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  // Función para obtener el color del badge según el estado
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  // Función para obtener el texto del estado en árabe
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "نشط";
      case "pending":
        return "معلق";
      case "expired":
        return "منتهي";
      default:
        return status;
    }
  };

  const EmptyState = () => (
    <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-slate-800/30">
      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-500 dark:text-gray-400 mb-5">لا توجد إعلانات حالياً</p>
      <Button 
        variant="default"
        onClick={() => setShowCategoryModal(true)}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
      >
        <Plus className="ml-2 h-4 w-4" />
        <span>إضافة إعلان جديد</span>
      </Button>
    </div>
  );

  // مكون نافذة اختيار الفئة
  const CategorySelectionModal = () => (
    <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl mb-2">اختر فئة الإعلان</DialogTitle>
          <DialogDescription className="text-center">
            حدد نوع الإعلان الذي ترغب في إضافته
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
          <div 
            className="flex flex-col items-center gap-2 p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:shadow-md transition-all cursor-pointer border border-blue-200 dark:border-blue-800"
            onClick={() => handleAddAdvertisement("vehicles")}
          >
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mb-2">
              <Car className="h-8 w-8 text-white" />
            </div>
            <span className="text-sm font-medium">مركبات</span>
          </div>
          
          <div 
            className="flex flex-col items-center gap-2 p-6 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:shadow-md transition-all cursor-pointer border border-green-200 dark:border-green-800"
            onClick={() => handleAddAdvertisement("real-estate")}
          >
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-2">
              <Home className="h-8 w-8 text-white" />
            </div>
            <span className="text-sm font-medium">عقارات</span>
          </div>
          
          <div 
            className="flex flex-col items-center gap-2 p-6 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:shadow-md transition-all cursor-pointer border border-purple-200 dark:border-purple-800"
            onClick={() => handleAddAdvertisement("other")}
          >
            <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center mb-2">
              <Package className="h-8 w-8 text-white" />
            </div>
            <span className="text-sm font-medium">أخرى</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {/* ترويسة الصفحة - متجاوبة */}
      <header className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="w-full md:w-auto">
          <Button 
            onClick={() => setShowCategoryModal(true)}
            className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <Plus className="ml-2 h-4 w-4" />
            إضافة إعلان
          </Button>
        </div>
        <div className="space-y-2 text-right w-full md:w-auto">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-l from-purple-800 to-indigo-700 text-transparent bg-clip-text">إعلاناتي</h1>
          <p className="text-gray-600 dark:text-gray-400">إدارة جميع الإعلانات الخاصة بك</p>
        </div>
      </header>

      {/* فلاتر البحث - متجاوبة */}
      <Card className="border-none bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm shadow-lg overflow-hidden mb-6">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col gap-4">
            <div className="relative w-full">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="بحث في الإعلانات..."
                className="pr-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="search-ads"
                name="search-ads"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full" id="category-filter" name="category-filter">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  <SelectItem value="vehicles">مركبات</SelectItem>
                  <SelectItem value="real-estate">عقارات</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full" id="status-filter" name="status-filter">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="expired">منتهي</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full" id="sort-by" name="sort-by">
                  <ArrowUpDown className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="الأحدث" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="oldest">الأقدم</SelectItem>
                  <SelectItem value="title-asc">العنوان (أ-ي)</SelectItem>
                  <SelectItem value="title-desc">العنوان (ي-أ)</SelectItem>
                  <SelectItem value="most-viewed">الأكثر مشاهدة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* عرض الإعلانات - عرض القائمة أو الجدول حسب الشاشة */}
      <div className="bg-white/80 dark:bg-slate-800/60 rounded-lg overflow-hidden shadow-lg backdrop-blur-sm">
        <Tabs defaultValue="table" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 pt-4 border-b border-gray-100 dark:border-gray-800">
            <TabsList className="bg-gray-100 dark:bg-gray-800/50 p-1 rounded-lg">
              <TabsTrigger value="table" className="flex-1 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                جدول
              </TabsTrigger>
              <TabsTrigger value="grid" className="flex-1 py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                بطاقات
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* عرض جدول */}
          <TabsContent value="table" className="p-4 overflow-x-auto">
            {advertisements.length > 0 ? (
              <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">العنوان</TableHead>
                      <TableHead className="text-right">الفئة</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">المشاهدات</TableHead>
                      <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAdvertisements.map((ad) => (
                      <TableRow key={ad.id}>
                        <TableCell className="font-medium">{ad.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(ad.category)}
                            <span>{ad.category === "vehicles" ? "مركبات" : ad.category === "real-estate" ? "عقارات" : "أخرى"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(ad.status)}>{getStatusText(ad.status)}</Badge>
                        </TableCell>
                        <TableCell>{ad.views}</TableCell>
                        <TableCell dir="ltr" className="text-right">
                          {new Date(ad.created_at).toLocaleDateString("ar-SA")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-600">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState />
            )}
          </TabsContent>
          
          {/* عرض بطاقات - أفضل للجوال */}
          <TabsContent value="grid" className="p-4">
            {advertisements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedAdvertisements.map((ad) => (
                  <Card key={ad.id} className="border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold truncate">{ad.title}</h3>
                        <Badge className={getStatusBadgeColor(ad.status)}>{getStatusText(ad.status)}</Badge>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-col gap-1 mb-4">
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(ad.category)}
                          <span>{ad.category === "vehicles" ? "مركبات" : ad.category === "real-estate" ? "عقارات" : "أخرى"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>المشاهدات: {ad.views}</span>
                          <span>•</span>
                          <span dir="ltr">{new Date(ad.created_at).toLocaleDateString("ar-SA")}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <Button variant="outline" size="sm" className="text-purple-600">
                          <Eye className="h-4 w-4 ml-1" />
                          عرض
                        </Button>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* نافذة اختيار الفئة */}
      <CategorySelectionModal />
    </>
  );
};

export default Advertisements; 