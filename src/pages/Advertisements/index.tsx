import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Car, Home, Package, Search, Filter, ArrowUpDown, Edit, Trash2, Eye, MoreVertical } from "lucide-react";
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
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getStorageUrl } from "@/lib/storage-utils";

interface Advertisement {
  id: string;
  title: string;
  category: string;
  status: "active" | "pending" | "expired";
  created_at: string;
  views: number;
  ad_type?: string;
  description?: string;
  price?: string;
  images?: { 
    id: string;
    image_url: string;
    is_main: boolean;
    order?: number;
    storage_path?: string;
  }[];
}

const Advertisements = () => {
  const navigate = useNavigate();
  const { office } = useDashboard();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [activeTab, setActiveTab] = useState("table");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchAdvertisements = async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setLoadError("لم يتم العثور على جلسة نشطة. الرجاء تسجيل الدخول");
        console.error("No active session found");
        return;
      }
      
      if (!office?.id) {
        setLoadError("لم يتم العثور على بيانات المكتب. تأكد من اختيار مكتب");
        console.error("No office data found");
        return;
      }
      
      const supabaseUrl = "https://rkiukoeankeojpntfhvv.supabase.co";
      const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJraXVrb2Vhbmtlb2pwbnRmaHZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTI5MDQsImV4cCI6MjA2MDkyODkwNH0.-V81gAim0WSdyXAnhx4Fio6PuWwd2WM7fkttAdrqBV8";
      
      console.log("Fetching advertisements for office:", office.id);
      
      const adsResponse = await fetch(
        `${supabaseUrl}/rest/v1/advertisements?office_id=eq.${office.id}&order=created_at.desc`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!adsResponse.ok) {
        const errorText = await adsResponse.text();
        setLoadError(`فشل في جلب الإعلانات: ${adsResponse.status} ${errorText}`);
        console.error("Error fetching advertisements:", errorText);
        return;
      }
      
      const adsData = await adsResponse.json();
      console.log("Fetched advertisements:", adsData);
      
      if (!adsData || adsData.length === 0) {
        console.log("No advertisements found");
        setAdvertisements([]);
        setIsLoading(false);
        return;
      }
      
      const adsWithImages = await Promise.all(adsData.map(async (ad: any) => {
        try {
          console.log(`Fetching images for ad ${ad.id}`);
          
          const imagesResponse = await fetch(
            `${supabaseUrl}/rest/v1/advertisement_images?advertisement_id=eq.${ad.id}`,
            {
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (!imagesResponse.ok) {
            console.error(`Error fetching images for ad ${ad.id}:`, await imagesResponse.text());
            return { ...ad, images: [] };
          }
          
          const imagesData = await imagesResponse.json();
          console.log(`Images for ad ${ad.id}:`, imagesData);
          
          return { 
            ...ad, 
            images: imagesData.map((img: any) => ({
              id: img.id,
              image_url: img.image_url,
              is_main: img.is_main || false,
              order: img.order || 0
            }))
          };
        } catch (err) {
          console.error(`Error processing images for ad ${ad.id}:`, err);
          return { ...ad, images: [] };
        }
      }));
      
      const formattedAds = adsWithImages.map((ad: any) => ({
        id: ad.id,
        title: ad.title || "بدون عنوان",
        category: ad.category_type || "others",
        status: ad.is_active ? "active" as const : "pending" as const,
        created_at: ad.created_at || new Date().toISOString(),
        views: 0,
        ad_type: ad.ad_type,
        description: ad.description,
        price: ad.price?.toString() || "",
        images: ad.images || []
      }));
      
      console.log("Formatted advertisements:", formattedAds);
      setAdvertisements(formattedAds);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setLoadError(`حدث خطأ غير متوقع: ${errorMessage}`);
      console.error("Failed to fetch advertisements:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (office?.id) {
      fetchAdvertisements();
    }
  }, [office?.id]);

  const filteredAdvertisements = advertisements
    .filter(ad => ad.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(ad => selectedCategory === "all" || ad.category === selectedCategory)
    .filter(ad => selectedStatus === "all" || ad.status === selectedStatus);

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

  const handleAddAdvertisement = () => {
    navigate(`/dashboard/advertisements/add`);
  };

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

  const handleDeleteClick = (adId: string) => {
    setAdToDelete(adId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!adToDelete) return;
    
    try {
      setIsDeleting(true);
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("بيانات الاتصال بـ Supabase غير متوفرة");
      }
      
      const imagesResponse = await fetch(
        `${supabaseUrl}/rest/v1/advertisement_images?advertisement_id=eq.${adToDelete}&select=id,image_url`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          }
        }
      );
      
      if (imagesResponse.ok) {
        const images = await imagesResponse.json();
        
        for (const img of images) {
          if (img.image_url && !img.image_url.startsWith('http')) {
            try {
              await fetch(
                `${supabaseUrl}/storage/v1/object/advertisements/${img.image_url}`,
                {
                  method: 'DELETE',
                  headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                  }
                }
              );
            } catch (err) {
              console.error(`فشل في حذف الصورة ${img.image_url}:`, err);
            }
          }
        }
        
        await fetch(
          `${supabaseUrl}/rest/v1/advertisement_images?advertisement_id=eq.${adToDelete}`,
          {
            method: 'DELETE',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer': 'return=minimal'
            }
          }
        );
      }
      
      const deleteResponse = await fetch(
        `${supabaseUrl}/rest/v1/advertisements?id=eq.${adToDelete}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal'
          }
        }
      );
      
      if (!deleteResponse.ok) {
        throw new Error(`فشل في حذف الإعلان: ${deleteResponse.statusText}`);
      }
      
      setAdvertisements(ads => ads.filter(ad => ad.id !== adToDelete));
      
      toast({
        title: "تم حذف الإعلان",
        description: "تم حذف الإعلان بنجاح",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting advertisement:", error);
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من حذف الإعلان. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setAdToDelete(null);
    }
  };

  const getMainImageUrl = (ad: Advertisement): string => {
    if (!ad.images || ad.images.length === 0) {
      return "/placeholder.svg";
    }
    
    const mainImage = ad.images.find(img => img.is_main);
    const imageToUse = mainImage || ad.images[0];
    
    if (!imageToUse.image_url) {
      return "/placeholder.svg";
    }
    
    return getStorageUrl(imageToUse.image_url, 'advertisements');
  };

  const EmptyState = () => (
    <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-slate-800/30">
      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-500 dark:text-gray-400 mb-5">لا توجد إعلانات حالياً</p>
      <Button 
        variant="default"
        onClick={handleAddAdvertisement}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
      >
        <Plus className="ml-2 h-4 w-4" />
        <span>إضافة إعلان جديد</span>
      </Button>
    </div>
  );

  return (
    <>
      <header className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="w-full md:w-auto">
          <Button 
            onClick={handleAddAdvertisement}
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
          
          <TabsContent value="table" className="p-4 overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : loadError ? (
              <div className="text-center py-12 border border-dashed border-red-300 dark:border-red-700 rounded-lg bg-red-50/50 dark:bg-red-900/10">
                <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                <p className="text-red-500 dark:text-red-400 mb-5">{loadError}</p>
                <Button 
                  variant="outline"
                  onClick={() => fetchAdvertisements()}
                  className="border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  إعادة المحاولة
                </Button>
              </div>
            ) : advertisements.length > 0 ? (
              <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table dir="rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">الصورة</TableHead>
                      <TableHead className="text-right">العنوان</TableHead>
                      <TableHead className="text-right">الفئة</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAdvertisements.map((ad) => (
                      <TableRow key={ad.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                              <img
                                src={getMainImageUrl(ad)}
                                alt={ad.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error(`[${ad.id}] فشل تحميل الصورة:`, (e.target as HTMLImageElement).src);
                                  (e.target as HTMLImageElement).onerror = null;
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col items-start gap-1 text-right">
                            <span className="line-clamp-1">{ad.title}</span>
                            <div className="flex items-center gap-2 mt-1">
                              {ad.price && (
                                <Badge variant="outline" className="font-mono text-xs">
                                  {ad.price} د.ك
                                </Badge>
                              )}
                              {ad.ad_type && (
                                <span className="text-xs text-gray-500">
                                  {ad.ad_type === 'sale' ? 'للبيع' : ad.ad_type === 'rent' ? 'للإيجار' : ad.ad_type}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-start">
                            {getCategoryIcon(ad.category)}
                            <span>
                              {ad.category === "vehicles" ? "مركبات" : 
                               ad.category === "real-estate" ? "عقارات" : 
                               ad.category === "others" ? "أخرى" : "-"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className={getStatusBadgeColor(ad.status)}>{getStatusText(ad.status)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 rounded-full"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">فتح القائمة</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem 
                                  className="flex items-center gap-2 cursor-pointer text-blue-600 focus:text-blue-600 focus:bg-blue-50 dark:focus:bg-blue-900/20"
                                  onClick={() => navigate(`/dashboard/advertisements/edit/${ad.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span>تعديل</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="flex items-center gap-2 cursor-pointer text-purple-600 focus:text-purple-600 focus:bg-purple-50 dark:focus:bg-purple-900/20"
                                  onClick={() => navigate(`/dashboard/advertisements/view/${ad.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>عرض</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                                  onClick={() => handleDeleteClick(ad.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>حذف</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
          
          <TabsContent value="grid" className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : loadError ? (
              <div className="text-center py-12 border border-dashed border-red-300 dark:border-red-700 rounded-lg bg-red-50/50 dark:bg-red-900/10">
                <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                <p className="text-red-500 dark:text-red-400 mb-5">{loadError}</p>
                <Button 
                  variant="outline"
                  onClick={() => fetchAdvertisements()}
                  className="border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  إعادة المحاولة
                </Button>
              </div>
            ) : advertisements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
                {sortedAdvertisements.map((ad) => (
                  <Card key={ad.id} className="border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative aspect-[16/9] bg-gray-100 dark:bg-gray-800">
                      <img 
                        src={getMainImageUrl(ad)} 
                        alt={ad.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error(`[${ad.id}] فشل تحميل الصورة في البطاقة:`, (e.target as HTMLImageElement).src);
                          (e.target as HTMLImageElement).onerror = null;
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                      {ad.ad_type && (
                        <Badge 
                          className={`absolute top-2 right-2 ${
                            ad.ad_type === 'sale' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 
                            'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400'
                          }`}
                        >
                          {ad.ad_type === 'sale' ? 'للبيع' : ad.ad_type === 'rent' ? 'للإيجار' : ad.ad_type}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4 text-right">
                      <div className="flex justify-between items-start mb-3">
                        <Badge className={getStatusBadgeColor(ad.status)}>{getStatusText(ad.status)}</Badge>
                        <h3 className="font-semibold truncate ml-2">{ad.title}</h3>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-2 mb-2 justify-end">
                          <span>
                            {ad.category === "vehicles" ? "مركبات" : 
                             ad.category === "real-estate" ? "عقارات" : 
                             ad.category === "others" ? "أخرى" : "-"}
                          </span>
                          {getCategoryIcon(ad.category)}
                        </div>
                        {ad.price && (
                          <div className="text-primary font-bold mt-2 text-left">
                            {ad.price} د.ك
                          </div>
                        )}
                      </div>
                      <div className="absolute top-2 left-2 z-10">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="h-8 w-8 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">فتح القائمة</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem 
                              className="flex items-center gap-2 cursor-pointer text-blue-600 focus:text-blue-600 focus:bg-blue-50 dark:focus:bg-blue-900/20"
                              onClick={() => navigate(`/dashboard/advertisements/edit/${ad.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                              <span>تعديل</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center gap-2 cursor-pointer text-purple-600 focus:text-purple-600 focus:bg-purple-50 dark:focus:bg-purple-900/20"
                              onClick={() => navigate(`/dashboard/advertisements/view/${ad.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                              <span>عرض</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                              onClick={() => handleDeleteClick(ad.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>حذف</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md mx-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row-reverse sm:justify-start gap-2 mt-4">
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex-1 sm:flex-none"
            >
              {isDeleting ? "جاري الحذف..." : "تأكيد الحذف"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1 sm:flex-none"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Advertisements;
