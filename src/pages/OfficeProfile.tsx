import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ExternalLink, Phone, MapPin, Share2, MessageCircle, Clock, Info, Star, Calendar, Tag, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { Category as FullCategory } from '@/hooks/useCategories';
import { Advertisement } from "@/types/advertisement";

interface Office {
  id: string;
  name: string;
  slug: string;
  country: string;
  phone: string;
  logo_url: string;
  cover_url: string;
}

interface Category extends FullCategory {}

interface Advertisement {
  id: string;
  title: string;
  created_at: string;
  category_type: string;
  ad_type: string;
  price?: string;
  description?: string;
  is_active: boolean;
  images?: {
    id: string;
    image_url: string;
    is_main: boolean;
  }[];
}

export default function OfficeProfile() {
  const { slug } = useParams<{ slug: string; }>();
  const [office, setOffice] = useState<Office | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOfficeData() {
      try {
        if (!slug) {
          setError('معرف المكتب غير صالح');
          setLoading(false);
          return;
        }

        setLoading(true);
        const { data: officeData, error: officeError } = await supabase.rpc('get_office_by_slug', {
          slug_param: slug
        });
        
        if (officeError) throw officeError;
        if (officeData && officeData.length > 0) {
          setOffice(officeData[0]);
          
          const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories')
            .select('*')
            .eq('office_id', officeData[0].id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

          if (categoriesError) throw categoriesError;
          setCategories(categoriesData || []);
          
          const { data: adsData, error: adsError } = await supabase
            .from("advertisements")
            .select(`
              *,
              advertisement_images (*)
            `)
            .eq('office_id', officeData[0].id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
            
          if (adsError) throw adsError;
          
          console.log("Fetched advertisements for public profile:", adsData);
          setAdvertisements(adsData || []);
        } else {
          setError('لم يتم العثور على المكتب');
        }
      } catch (error: any) {
        console.error('خطأ في جلب بيانات المكتب:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (slug) {
      fetchOfficeData();
    }
  }, [slug]);

  const handleShare = async () => {
    if (!office) return;
    
    const safeTitle = DOMPurify.sanitize(office.name);
    
    const shareData = {
      title: safeTitle,
      text: `تفضل بزيارة صفحة ${safeTitle}`,
      url: window.location.href
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('تم نسخ الرابط بنجاح');
      }
    } catch (error) {
      console.error('خطأ في المشاركة:', error);
    }
  };

  const getStorageUrl = (path: string | null): string => {
    if (!path) return "/placeholder.svg";
    
    if (typeof path !== 'string') return "/placeholder.svg";
    
    if (path.includes('..') || path.startsWith('/')) {
      console.error('محاولة غير آمنة للوصول للملف:', path);
      return "/placeholder.svg";
    }
    
    if (path.startsWith('http://') || path.startsWith('https://')) {
      const url = new URL(path);
      const trustedDomains = ['rkiukoeankeojpntfhvv.supabase.co', 'supabase.co'];
      if (!trustedDomains.some(domain => url.hostname.includes(domain))) {
        console.warn('محاولة وصول لمصدر غير موثوق:', path);
        return "/placeholder.svg";
      }
      return path;
    }
    
    const { data } = supabase.storage.from('office-assets').getPublicUrl(path);
    return data?.publicUrl || "/placeholder.svg";
  };

  const getImageUrl = (ad: Advertisement): string => {
    const mainImage = ad.images?.find(img => img.is_main);
    
    const imageUrl = mainImage?.image_url || ad.images?.[0]?.image_url;
    
    if (!imageUrl) return "/placeholder.svg";
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    const { data } = supabase.storage.from('advertisements').getPublicUrl(imageUrl);
    return data?.publicUrl || "/placeholder.svg";
  };

  const getAdTypeLabel = (adType: string): string => {
    switch (adType) {
      case 'sale': return 'للبيع';
      case 'rent': return 'للإيجار';
      default: return adType;
    }
  };

  if (loading) {
    return <OfficeProfileSkeleton />;
  }

  if (error) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ</h2>
      <p className="text-gray-600">{error}</p>
    </div>;
  }

  if (!office) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">لم يتم العثور على المكتب</h2>
      <p className="text-gray-600">تأكد من المعرف المخصص (slug) ثم حاول مرة أخرى</p>
    </div>;
  }

  const safeName = DOMPurify.sanitize(office.name);
  const safeCountry = DOMPurify.sanitize(office.country);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-sm">
          <div className="h-48 sm:h-64 relative overflow-hidden">
            {office.cover_url ? (
              <img 
                src={getStorageUrl(office.cover_url)} 
                alt={`غلاف ${safeName}`} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200" />
            )}
          </div>

          <div className="px-4 sm:px-6 -mt-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg">
                <AvatarImage 
                  src={getStorageUrl(office.logo_url)} 
                  alt={safeName} 
                  className="object-cover" 
                />
                <AvatarFallback className="text-xl sm:text-2xl font-bold bg-primary text-white">
                  {safeName.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col mt-4">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
                  {safeName}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 mt-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{safeCountry}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 px-4 sm:px-6">
          {categories.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">الفئات</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <CategoryCard 
                    key={category.id} 
                    category={category}
                    readOnly={true}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">إعلانات المكتب</h2>
            </div>

            {advertisements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {advertisements.map((ad) => (
                  <Card key={ad.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative h-44 bg-gray-100">
                      <img 
                        src={getImageUrl(ad)} 
                        alt={ad.title} 
                        className="w-full h-full object-cover" 
                      />
                      <Badge 
                        className={`absolute top-2 right-2 ${
                          ad.ad_type === 'sale' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {getAdTypeLabel(ad.ad_type)}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1">{ad.title}</h3>
                      {ad.price && (
                        <div className="text-primary font-bold mb-2">{ad.price} د.ك</div>
                      )}
                      {ad.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{ad.description}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                          {ad.category_type === 'vehicles' ? 'مركبات' : 
                           ad.category_type === 'real-estate' ? 'عقارات' : 'أخرى'}
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-gray-500">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">لا توجد إعلانات حالياً</h3>
                  <p className="text-sm text-gray-500">لم يقم المكتب بإضافة أي إعلانات بعد. يمكنك العودة لاحقاً للاطلاع على الإعلانات الجديدة.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OfficeProfileSkeleton() {
  return <div className="container mx-auto py-6 px-4">
      <Skeleton className="w-full h-[300px] rounded-lg mb-6" />

      <div className="bg-white rounded-lg shadow-lg p-6 relative">
        <Skeleton className="absolute -top-20 right-8 w-32 h-32 rounded-full" />

        <div className="mt-12 text-right">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        <div className="mt-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64 hidden md:block" />
            <Skeleton className="h-64 hidden lg:block" />
          </div>
        </div>
      </div>
    </div>;
}
