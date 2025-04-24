import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { OfficeHeader } from '@/components/office/OfficeHeader';
import { OfficeCover } from '@/components/office/OfficeCover';
import { OfficeInfo } from '@/components/office/OfficeInfo';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Info, Tag, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function PublicOfficeProfile() {
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

  const shareProfile = () => {
    const shareTitle = office?.name ? `${office.name} | ملف المكتب` : 'ملف المكتب';
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        url: shareUrl
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          alert('تم نسخ الرابط إلى الحافظة');
        })
        .catch(console.error);
    }
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pb-16">
      <OfficeHeader office={office} />
      <OfficeCover office={office} />
      <OfficeInfo office={office} />

      {/* نبذة عن المكتب */}
      <div className="container mx-auto px-4 mt-8">
        <Card className="bg-white dark:bg-slate-900/90 p-6 rounded-xl shadow-md">
          <div className="flex items-center mb-4">
            <Info size={18} className="text-primary mr-2" />
            <h2 className="text-xl font-bold dark:text-white">عن المكتب</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {office.description || 'مكتب متخصص في عرض وتسويق مختلف المنتجات والخدمات بطرق احترافية. يوفر المكتب تجربة متميزة للعملاء من خلال الاهتمام بالجودة والدقة في التفاصيل.'}
          </p>
        </Card>
      </div>

      {/* قسم التواصل السريع */}
      <div className="bg-primary mt-16 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-white">
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
              <Button 
                variant="outline" 
                size="lg" 
                className="gap-2 bg-transparent text-white border-white hover:bg-white/10 w-full sm:w-auto"
              >
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
