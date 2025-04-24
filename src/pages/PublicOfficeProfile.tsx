
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { OfficeHeader } from '@/components/office/OfficeHeader';
import { OfficeCover } from '@/components/office/OfficeCover';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { debug } from '@/lib/debug';

interface Office {
  id: string;
  name: string;
  slug: string;
  country: string;
  phone: string;
  logo_url: string;
  cover_url: string;
}

export default function PublicOfficeProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [office, setOffice] = useState<Office | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOfficeData() {
      try {
        setLoading(true);
        console.log("Fetching office with slug:", slug);
        
        const { data, error } = await supabase
          .rpc('get_office_by_slug', { slug_param: slug });
        
        if (error) {
          console.error("Error fetching office:", error);
          debug.logError(`Error fetching office: ${error.message}`, "PublicOfficeProfile");
          throw error;
        }
        
        console.log("Office data received:", data);
        
        if (data && data.length > 0) {
          // معالجة البيانات للتأكد من تنسيق المسارات بشكل صحيح
          const officeData = {
            ...data[0],
            // التأكد من تعيين logo_url و cover_url بشكل صحيح
            logo_url: data[0].logo_url || '',
            cover_url: data[0].cover_url || '',
          };
          
          setOffice(officeData);
          
          // تسجيل عناوين URL للشعار والغلاف لأغراض التصحيح
          console.log("Logo URL from database:", officeData.logo_url);
          console.log("Cover URL from database:", officeData.cover_url);
          
          // التحقق من صحة البيانات
          if (!officeData.logo_url) {
            debug.logError("Logo URL is empty", "PublicOfficeProfile");
          }
          if (!officeData.cover_url) {
            debug.logError("Cover URL is empty", "PublicOfficeProfile");
          }
          
          console.log("Complete Supabase URL for logo:", `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/office-assets/${officeData.logo_url}`);
          console.log("Complete Supabase URL for cover:", `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/office-assets/${officeData.cover_url}`);
        } else {
          const errMsg = 'لم يتم العثور على المكتب';
          setError(errMsg);
          debug.logError(errMsg, "PublicOfficeProfile");
          toast.error(errMsg);
        }
      } catch (error: any) {
        const errMsg = error.message || 'حدث خطأ أثناء جلب بيانات المكتب';
        console.error('خطأ في جلب بيانات المكتب:', error);
        setError(errMsg);
        debug.logError(errMsg, "PublicOfficeProfile");
        toast.error(errMsg);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchOfficeData();
    }
  }, [slug]);

  if (loading) {
    return <PublicOfficeProfileSkeleton />;
  }

  if (error || !office) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ</h2>
        <p className="text-gray-600">{error || 'لم يتم العثور على المكتب'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <OfficeHeader office={office} />
      <OfficeCover office={office} />
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
          </div>
        </div>
      </header>

      {/* غلاف المكتب - تحميل */}
      <Skeleton className="w-full aspect-[21/9] md:aspect-[3/1]" />
    </div>
  );
}
