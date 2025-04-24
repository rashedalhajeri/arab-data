import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin } from 'lucide-react';

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
          {/* Cover Image Section - Consistent height across screen sizes */}
          <div className="relative h-48 sm:h-64 md:h-72 lg:h-96 overflow-hidden">
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

          {/* Profile Info Section - Responsive padding and spacing */}
          <div className="px-4 sm:px-6 py-6 -mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg mx-auto sm:mx-0">
                <AvatarImage 
                  src={getStorageUrl(office.logo_url)} 
                  alt={office.name} 
                  className="object-cover" 
                />
                <AvatarFallback className="text-xl sm:text-2xl font-bold bg-primary text-white">
                  {office.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col text-center sm:text-right">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  {office.name}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 mt-2 justify-center sm:justify-start">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">{office.country}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 px-4 sm:px-6">
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">إعلانات المكتب</h2>
            </div>

            <div className="text-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="max-w-md mx-auto px-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">لا توجد إعلانات حالياً</h3>
                <p className="text-xs sm:text-sm text-gray-500">لم يقم المكتب بإضافة أي إعلانات بعد. يمكنك العودة لاحقاً للاطلاع على الإعلانات الجديدة.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfficeProfileSkeleton() {
  return <div className="container mx-auto py-4 sm:py-6">
      <Skeleton className="w-full h-48 sm:h-64 md:h-72 lg:h-96 rounded-lg mb-6" />

      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 relative">
        <Skeleton className="absolute -top-16 sm:-top-20 right-8 w-24 h-24 sm:w-32 sm:h-32 rounded-full" />

        <div className="mt-8 sm:mt-12 text-right">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <Skeleton className="h-8 sm:h-10 w-48 sm:w-64 mb-2" />
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <Skeleton className="h-4 sm:h-6 w-24 sm:w-32" />
                <Skeleton className="h-4 sm:h-6 w-24 sm:w-32" />
              </div>
            </div>
            <Skeleton className="h-8 sm:h-10 w-32 sm:w-40" />
          </div>
        </div>

        <div className="mt-8">
          <Skeleton className="h-6 sm:h-8 w-36 sm:w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Skeleton className="h-48 sm:h-64" />
            <Skeleton className="h-48 sm:h-64 hidden md:block" />
            <Skeleton className="h-48 sm:h-64 hidden lg:block" />
          </div>
        </div>
      </div>
    </div>;
}
