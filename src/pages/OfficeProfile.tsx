import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ExternalLink, Phone, MapPin } from 'lucide-react';

interface Office {
  id: string;
  name: string;
  slug: string;
  country: string;
  phone: string;
  logo_url: string;
  cover_url: string;
}

export default function OfficeProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [office, setOffice] = useState<Office | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleViewPublicPage = () => {
    // استخدام الدومين الحالي بشكل تلقائي
    const currentOrigin = window.location.origin;
    console.log('الدومين الحالي:', currentOrigin);
    
    // استخدام المسار المباشر بدلاً من /p/:slug
    const publicUrl = `${currentOrigin}/${slug}`;
    console.log('رابط الصفحة العامة:', publicUrl);
    
    window.open(publicUrl, '_blank');
  };

  if (loading) {
    return <OfficeProfileSkeleton />;
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
    <div className="container mx-auto py-6 px-4">
      {/* غلاف المكتب */}
      <div className="relative w-full h-[300px] rounded-lg overflow-hidden mb-6">
        {office.cover_url ? (
          <img 
            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/office-assets/${office.cover_url}`} 
            alt={`غلاف ${office.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">لا يوجد صورة غلاف</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 relative">
        {/* شعار المكتب */}
        <div className="absolute -top-20 right-8 w-32 h-32">
          <Avatar className="w-32 h-32 border-4 border-white shadow-md">
            <AvatarImage 
              src={office.logo_url ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/office-assets/${office.logo_url}` : ''} 
              alt={office.name} 
            />
            <AvatarFallback className="text-3xl bg-primary text-white">
              {office.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* معلومات المكتب */}
        <div className="mt-12 text-right">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{office.name}</h1>
              <div className="flex flex-col md:flex-row md:items-center gap-4 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  <span className="text-gray-700">الدولة:</span>
                  <span>{office.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={18} />
                  <span className="text-gray-700">رقم الهاتف:</span>
                  <a href={`tel:${office.phone}`} className="text-primary hover:underline">
                    {office.phone}
                  </a>
                </div>
              </div>
            </div>
            
            {/* زر عرض الصفحة */}
            <div className="mb-4 md:mb-0">
              <Button 
                onClick={handleViewPublicPage}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                <ExternalLink size={18} />
                عرض الصفحة العامة
              </Button>
            </div>
          </div>
        </div>

        {/* القسم الرئيسي للمحتوى */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">إعلانات المكتب</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* هنا يمكن إضافة قائمة الإعلانات الخاصة بالمكتب لاحقاً */}
            <Card className="h-64 flex items-center justify-center">
              <CardContent className="p-6 text-center text-gray-400">
                سيتم عرض إعلانات المكتب هنا قريباً
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfficeProfileSkeleton() {
  return (
    <div className="container mx-auto py-6 px-4">
      {/* غلاف المكتب */}
      <Skeleton className="w-full h-[300px] rounded-lg mb-6" />

      <div className="bg-white rounded-lg shadow-lg p-6 relative">
        {/* شعار المكتب */}
        <Skeleton className="absolute -top-20 right-8 w-32 h-32 rounded-full" />

        {/* معلومات المكتب */}
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

        {/* القسم الرئيسي للمحتوى */}
        <div className="mt-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64 hidden md:block" />
            <Skeleton className="h-64 hidden lg:block" />
          </div>
        </div>
      </div>
    </div>
  );
} 