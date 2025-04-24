import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  MapPin, 
  Clock, 
  Share2, 
  ExternalLink, 
  MessageCircle, 
  Info, 
  Star,
  Calendar,
  Tag
} from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Office {
  id: string;
  name: string;
  slug: string;
  country: string;
  phone: string;
  logo_url: string;
  cover_url: string;
  description?: string;
}

// هذه واجهة مؤقتة للإعلانات - ستحتاج إلى تحديثها لاحقا مع المعلومات الفعلية
interface Ad {
  id: string;
  title: string;
  price: number;
  image_url: string;
  created_at: string;
}

export default function PublicOfficeProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [office, setOffice] = useState<Office | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [useFallbackLogo, setUseFallbackLogo] = useState(false);
  
  // Placeholder image as a final fallback
  const getPlaceholderLogo = (name: string) => {
    const initials = name.substring(0, 2);
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23007BFF'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='35' text-anchor='middle' fill='white' dominant-baseline='middle'%3E${initials}%3C/text%3E%3C/svg%3E`;
  };

  useEffect(() => {
    async function fetchOfficeData() {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .rpc('get_office_by_slug', { slug_param: slug });
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          setOffice(data[0]);
          
          // بعد نجاح جلب بيانات المكتب، يمكن جلب إعلاناته
          // فيما يلي مجرد بيانات وهمية للعرض
          // وسيتم استبدالها لاحقًا باستعلام حقيقي عندما يكون جدول الإعلانات جاهزًا
          
          setAds([
            {
              id: '1',
              title: 'سيارة مرسيدس 2023',
              price: 35000,
              image_url: 'https://placehold.co/600x400?text=صورة+سيارة',
              created_at: '2025-04-20'
            },
            {
              id: '2',
              title: 'بي ام دبليو X5',
              price: 42000,
              image_url: 'https://placehold.co/600x400?text=صورة+سيارة+BMW',
              created_at: '2025-04-18'
            },
            {
              id: '3',
              title: 'تويوتا لاند كروزر',
              price: 38000,
              image_url: 'https://placehold.co/600x400?text=صورة+تويوتا',
              created_at: '2025-04-15'
            }
          ]);
        } else {
          setError('لم يتم العثور على المكتب');
        }
      } catch (error: any) {
        console.error('خطأ في جلب بيانات المكتب:', error);
        setError(error.message || 'حدث خطأ أثناء جلب بيانات المكتب');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchOfficeData();
    }
  }, [slug]);

  // Helper function to get logo URL
  const getLogoUrl = (logoPath: string) => {
    if (useFallbackLogo) return getPlaceholderLogo(office.name);
    if (!logoPath) return getPlaceholderLogo(office.name);
    
    // For debugging
    console.log('Original logo path:', logoPath);
    
    // Check if it's already a full URL
    if (logoPath.startsWith('http')) {
      console.log('Using direct URL:', logoPath);
      return logoPath;
    }
    
    // If path starts with 'logos/', it's a relative path
    if (logoPath.startsWith('logos/')) {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${logoPath}`;
      console.log('Using path with logos/ prefix:', url);
      return url;
    }
    
    // Otherwise build the URL with the full path structure
    const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/${logoPath}`;
    console.log('Using constructed URL:', url);
    return url;
  };

  const shareProfile = () => {
    // إنشاء عنوان للمشاركة يتضمن اسم المكتب
    const shareTitle = office?.name ? `${office.name} | ملف المكتب` : 'ملف المكتب';
    // استخدام الرابط الحالي (يتضمن الدومين الحالي تلقائياً)
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        url: shareUrl
      })
      .catch(err => {
        console.error('حدث خطأ أثناء المشاركة:', err);
      });
    } else {
      // نسخ الرابط إلى الحافظة إذا لم تكن ميزة المشاركة متاحة
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          alert('تم نسخ الرابط إلى الحافظة');
        })
        .catch(err => {
          console.error('حدث خطأ أثناء نسخ الرابط:', err);
        });
    }
  };

  if (loading) {
    return <PublicOfficeProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!office) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">لم يتم العثور على المكتب</h2>
        <p className="text-gray-600">تأكد من المعرف المخصص (slug) ثم حاول مرة أخرى</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* شريط التنقل المحسن */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto py-3 px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-primary/10">
                <AvatarImage 
                  src={getLogoUrl(office.logo_url)}
                  alt={office.name}
                  onLoad={() => setLogoLoaded(true)}
                  onError={() => {
                    console.error('Logo failed to load');
                    setLogoLoaded(false);
                    setUseFallbackLogo(true);
                  }}
                  className="object-cover"
                />
                <AvatarFallback className="text-md font-bold bg-primary text-white">
                  {office.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{office.name}</h1>
                <div className="flex items-center gap-2">
                  {office.country && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={14} />
                      {office.country}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={shareProfile}
                className="flex items-center gap-1 text-gray-700"
              >
                <Share2 size={16} />
                <span className="hidden sm:inline">مشاركة</span>
              </Button>
              <a href={`tel:${office.phone}`}>
                <Button 
                  variant="default" 
                  size="sm"
                  className="flex items-center gap-1 bg-primary text-white"
                >
                  <Phone size={16} />
                  <span className="hidden sm:inline">اتصال</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* غلاف المكتب المحسن */}
      <div className="w-full aspect-[21/9] md:aspect-[3/1] relative overflow-hidden">
        {office.cover_url ? (
          <img 
            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/covers/${office.cover_url}`} 
            alt={`غلاف ${office.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/20 flex items-center justify-center">
            <div className="text-center text-gray-600 p-6 max-w-md">
              <h3 className="text-2xl font-bold mb-2">{office.name}</h3>
              <p className="text-gray-500">المكتب لم يقم بإضافة صورة غلاف حتى الآن</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-30"></div>
      </div>

      {/* معلومات المكتب المحسنة */}
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-xl p-6 -mt-16 relative z-10 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <Avatar className="w-28 h-28 border-4 border-white shadow-lg">
                <AvatarImage 
                  src={getLogoUrl(office.logo_url)}
                  alt={office.name}
                  onLoad={() => setLogoLoaded(true)}
                  onError={() => {
                    console.error('Logo failed to load');
                    setLogoLoaded(false);
                    setUseFallbackLogo(true);
                  }}
                  className="object-cover"
                />
                <AvatarFallback className="text-3xl font-bold bg-primary text-white">
                  {office.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{office.name}</h1>
                <div className="flex flex-wrap gap-4 text-gray-600">
                  <Badge variant="outline" className="gap-1 px-3 py-1 text-sm font-normal text-gray-700 border-gray-300">
                    <Star size={14} className="text-amber-500" />
                    <span>مكتب مميز</span>
                  </Badge>
                  <Badge variant="outline" className="gap-1 px-3 py-1 text-sm font-normal text-gray-700 border-gray-300">
                    <Calendar size={14} className="text-blue-500" />
                    <span>عضو منذ 2025</span>
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <Button variant="outline" className="gap-2">
                <MessageCircle size={16} />
                <span>مراسلة</span>
              </Button>
              <a href={`tel:${office.phone}`} className="w-full sm:w-auto">
                <Button className="w-full gap-2">
                  <Phone size={16} />
                  <span>{office.phone}</span>
                </Button>
              </a>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">المكان</span>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-gray-400" />
                <span className="font-medium">{office.country || 'غير محدد'}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">للتواصل</span>
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-gray-400" />
                <a href={`tel:${office.phone}`} className="font-medium hover:text-primary transition-colors">
                  {office.phone || 'غير محدد'}
                </a>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">تاريخ الإنضمام</span>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-gray-400" />
                <span className="font-medium">مارس 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* نبذة عن المكتب */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <Info size={18} className="text-primary mr-2" />
            <h2 className="text-xl font-bold">عن المكتب</h2>
          </div>
          
          <p className="text-gray-600 leading-relaxed">
            {office.description || 'مكتب متخصص في عرض وتسويق مختلف المنتجات والخدمات بطرق احترافية. يوفر المكتب تجربة متميزة للعملاء من خلال الاهتمام بالجودة والدقة في التفاصيل.'}
          </p>
        </div>
      </div>

      {/* الإعلانات المميزة */}
      <div className="container mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Tag size={20} className="text-primary mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">إعلانات المكتب</h2>
          </div>
          <Button variant="ghost" size="sm" className="text-primary">
            عرض الكل
            <ExternalLink size={16} className="mr-1" />
          </Button>
        </div>
        
        {ads.length > 0 ? (
          <>
            {/* عرض إعلانات بارز للإعلان الأول */}
            {ads.length > 0 && (
              <Card className="mb-8 overflow-hidden hover:shadow-lg transition-shadow bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="relative aspect-video md:aspect-auto overflow-hidden">
                    <img 
                      src={ads[0].image_url} 
                      alt={ads[0].title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                    <Badge className="absolute top-3 right-3 bg-primary">إعلان مميز</Badge>
                  </div>
                  <div className="flex flex-col p-6">
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-3 text-xs">
                        {new Date(ads[0].created_at).toLocaleDateString('ar-KW')}
                      </Badge>
                      <h3 className="font-bold text-2xl mb-3 text-gray-900">{ads[0].title}</h3>
                      <p className="text-gray-600 mb-4">
                        تفاصيل إضافية عن هذا الإعلان المميز. يمكن إضافة وصف كامل للإعلان هنا مع جميع المعلومات اللازمة عن المنتج.
                      </p>
                    </div>
                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl font-bold text-primary">{ads[0].price.toLocaleString()} د.ك</span>
                      </div>
                      <Button className="w-full gap-2">
                        <ExternalLink size={16} />
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* إعلانات أخرى */}
            <h3 className="text-lg font-semibold text-gray-700 mb-4">إعلانات أخرى</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ads.slice(1).map(ad => (
                <Card key={ad.id} className="overflow-hidden hover:shadow-lg transition-all hover:translate-y-[-5px] bg-white">
                  <div className="aspect-video bg-gray-100 overflow-hidden relative">
                    <img 
                      src={ad.image_url} 
                      alt={ad.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="outline" className="text-xs font-normal">
                        {new Date(ad.created_at).toLocaleDateString('ar-KW')}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-xl mb-2 line-clamp-1">{ad.title}</h3>
                    <div className="flex justify-between items-center mt-4">
                      <div className="font-bold text-primary text-xl">{ad.price.toLocaleString()} د.ك</div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full gap-2">
                      <ExternalLink size={16} />
                      عرض التفاصيل
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="max-w-md mx-auto">
              <Tag size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد إعلانات حالياً</h3>
              <p className="text-gray-500">لم يقم المكتب بإضافة أي إعلانات بعد. يمكنك العودة لاحقاً للاطلاع على الإعلانات الجديدة.</p>
            </div>
          </div>
        )}
      </div>

      {/* قسم التواصل السريع */}
      <div className="bg-primary text-white mt-16 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">هل تريد التواصل مع المكتب؟</h2>
              <p className="text-white/80">يمكنك الاتصال مباشرة أو مراسلة المكتب للاستفسار</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={`tel:${office.phone}`}>
                <Button variant="secondary" size="lg" className="gap-2 w-full sm:w-auto">
                  <Phone size={18} />
                  <span>اتصل الآن</span>
                </Button>
              </a>
              <Button variant="outline" size="lg" className="gap-2 bg-transparent text-white border-white hover:bg-white/10 w-full sm:w-auto">
                <MessageCircle size={18} />
                <span>مراسلة</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PublicOfficeProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* شريط التنقل - تحميل */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto py-3 px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div>
                <Skeleton className="h-6 w-36 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      </header>

      {/* غلاف المكتب - تحميل */}
      <Skeleton className="w-full aspect-[21/9] md:aspect-[3/1]" />

      {/* معلومات المكتب - تحميل */}
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-xl p-6 -mt-16 relative z-10 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <Skeleton className="w-28 h-28 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-10 w-64 mb-4" />
                <div className="flex flex-wrap gap-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          
          <Skeleton className="h-px w-full my-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex flex-col">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex flex-col">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </div>

        {/* نبذة عن المكتب - تحميل */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
      
      {/* الإعلانات - تحميل */}
      <div className="container mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        
        <Skeleton className="w-full h-[300px] mb-8 rounded-xl" />
        
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-8 w-24 mt-4" />
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      {/* قسم التواصل السريع - تحميل */}
      <div className="bg-gray-200 mt-16 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-6 w-96" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton className="h-12 w-36" />
              <Skeleton className="h-12 w-36" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 