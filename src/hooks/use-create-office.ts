
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export function useCreateOffice() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<null | boolean>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const slugCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function checkUserOffice() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("خطأ في الحصول على الجلسة:", error.message);
          return;
        }
        
        const session = data?.session;
        if (!session?.user?.id || !isMounted) return;

        const { data: office, error: officeError } = await supabase
          .from("offices")
          .select("id")
          .eq("user_id", session.user.id)
          .limit(1)
          .single();
        
        if (officeError && officeError.code !== 'PGRST116') {
          console.error("خطأ في استعلام المكتب:", officeError.message);
          return;
        }

        if (office && isMounted) {
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("خطأ عام:", err);
      }
    }
    
    checkUserOffice();
    
    return () => { 
      isMounted = false; 
    };
  }, [navigate]);

  const handleSubmit = async (data: any) => {
    setLoading(true);

    try {
      // تحقق مفصل من البيانات قبل الإرسال
      const validationErrors: Record<string, string> = {};

      if (!data.name?.trim()) validationErrors.name = "الاسم التجاري مطلوب";
      if (!data.slug?.trim()) validationErrors.slug = "اسم الرابط مطلوب";
      if (!data.country) validationErrors.country = "الدولة مطلوبة";
      if (!data.phone?.trim()) validationErrors.phone = "رقم الهاتف مطلوب";
      if (!data.logo) validationErrors.logo = "شعار المكتب مطلوب";
      if (!data.cover) validationErrors.cover = "الغلاف مطلوب";

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setLoading(false);
        return;
      }

      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      
      if (sessionErr) {
        throw new Error("خطأ في جلسة المستخدم: " + sessionErr.message);
      }
      
      const session = sessionData?.session;
      if (!session?.user) {
        throw new Error("الرجاء تسجيل الدخول لإنشاء صفحة المكتب");
      }

      const officeId = crypto.randomUUID();
      const logoPath = `logos/${officeId}.png`;
      const coverPath = `covers/${officeId}.png`;

      // التحقق من وجود الملفات
      const logoFile = data.logo ? await fetch(data.logo).then(r => r.blob()) : null;
      const coverFile = data.cover ? await fetch(data.cover).then(r => r.blob()) : null;

      if (!logoFile || !coverFile) {
        throw new Error("يرجى رفع الشعار والغلاف بشكل صحيح");
      }

      const [logoResult, coverResult] = await Promise.all([
        supabase.storage.from("office-assets").upload(logoPath, logoFile, { upsert: true }),
        supabase.storage.from("office-assets").upload(coverPath, coverFile, { upsert: true })
      ]);
      
      if (logoResult.error) {
        throw new Error("فشل رفع الشعار: " + logoResult.error.message);
      }
      
      if (coverResult.error) {
        throw new Error("فشل رفع الغلاف: " + coverResult.error.message);
      }

      const { error: insertError } = await supabase
        .from('offices')
        .insert({
          id: officeId,
          user_id: session.user.id,
          name: data.name,
          slug: data.slug,
          country: data.country,
          phone: data.phone,
          logo_url: logoPath,
          cover_url: coverPath,
        });
        
      if (insertError) {
        throw new Error("فشل إنشاء المكتب: " + insertError.message);
      }

      toast.success("تم إنشاء صفحة المكتب بنجاح!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء إنشاء الصفحة");
      console.error("خطأ في إنشاء الصفحة:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkSlugAvailability = async (slug: string) => {
    if (slugCheckTimeout.current) {
      clearTimeout(slugCheckTimeout.current);
      slugCheckTimeout.current = null;
    }

    if (slug.length >= 3 && /^[a-z0-9\-]+$/.test(slug)) {
      setSlugAvailable(null); // حالة تحميل
      
      slugCheckTimeout.current = setTimeout(async () => {
        try {
          const { data, error } = await supabase
            .from("offices")
            .select("id")
            .eq("slug", slug)
            .limit(1)
            .maybeSingle();
            
          if (error) {
            console.error("خطأ في التحقق من توفر الاسم:", error.message);
            return;
          }
          
          setSlugAvailable(!data);
        } catch (err) {
          console.error("خطأ عام في التحقق من توفر الاسم:", err);
          setSlugAvailable(null);
        }
      }, 600);
    } else {
      setSlugAvailable(null);
    }
  };

  return {
    loading,
    slugAvailable,
    errors,
    setErrors,
    handleSubmit,
    checkSlugAvailability
  };
}
