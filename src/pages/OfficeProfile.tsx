import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ExternalLink, Phone, MapPin, Share2, MessageCircle, Clock, Info, Star, Calendar, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

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
  const {
    slug
  } = useParams<{
    slug: string;
  }>();
  const [office, setOffice] = useState<Office | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOfficeData() {
      try {
        setLoading(true);
        const {
          data,
          error
        } = await supabase.rpc('get_office_by_slug', {
          slug_param: slug
        });
        if (error) throw error;
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

  const handleShare = async () => {
    const shareData = {
      title: office?.name,
      text: `تفضل بزيارة صفحة ${office?.name}`,
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
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const {
      data
    } = supabase.storage.from('office-assets').getPublicUrl(path);
    return data?.publicUrl || "/placeholder.svg";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-sm">
          <div className="h-72 sm:h-96 relative overflow-hidden">
            {office.cover_url ? (
              <img 
                src={getStorageUrl(office.cover_url)} 
                alt={`غلاف ${office.name}`} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200" />
            )}
          </div>

          <div className="px-4 sm:px-6 -mt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg">
                <AvatarImage 
                  src={getStorageUrl(office.logo_url)} 
                  alt={office.name} 
                  className="object-cover" 
                />
                <AvatarFallback className="text-2xl font-bold bg-primary text-white">
                  {office.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 mb-2">
                {office.name}
              </h1>
              
              <div className="flex items-center gap-2 text-gray-600 mb-6">
                <MapPin className="w-5 h-5" />
                <span>{office.country}</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 ml-2" />
                  مشاركة
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 px-4 sm:px-6">
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">إعلانات المكتب</h2>
            </div>

            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">لا توجد إعلانات حالياً</h3>
                <p className="text-sm text-gray-500">لم يقم المكتب بإضافة أي إعلانات بعد. يمكنك العودة لاحقاً للاطلاع على الإعلانات الجديدة.</p>
              </div>
            </div>
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
