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

  const getStorageUrl = (path: string | null): string => {
    if (!path) return "/placeholder.svg";
    
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    const { data } = supabase.storage
      .from('office-assets')
      .getPublicUrl(path);
    
    return data?.publicUrl || "/placeholder.svg";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto py-3 px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-primary/10">
                <AvatarImage 
                  src={getStorageUrl(office.logo_url)}
                  alt={office.name}
                />
                <AvatarFallback className="text-md font-bold bg-primary text-white">
                  {office.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{office.name}</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full aspect-[21/9] md:aspect-[3/1] relative overflow-hidden">
        {office.cover_url ? (
          <img 
            src={getStorageUrl(office.cover_url)}
            alt={`غلاف ${office.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/20 flex items-center justify-center">
            <div className="text-center text-gray-600 p-6 max-w-md">
              <h3 className="text-2xl font-bold mb-2">{office.name}</h3>
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-xl p-6 -mt-16 relative z-10 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <Avatar className="w-28 h-28 border-4 border-white shadow-lg">
                <AvatarImage 
                  src={getStorageUrl(office.logo_url)}
                  alt={office.name}
                />
                <AvatarFallback className="text-3xl font-bold bg-primary text-white">
                  {office.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{office.name}</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-900">إعلانات المكتب</h2>
            </div>
          </div>

          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد إعلانات حالياً</h3>
              <p className="text-gray-500">لم يقم المكتب بإضافة أي إعلانات بعد. يمكنك العودة لاحقاً للاطلاع على الإعلانات الجديدة.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfficeProfileSkeleton() {
  return (
    <div className="container mx-auto py-6 px-4">
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
    </div>
  );
}
