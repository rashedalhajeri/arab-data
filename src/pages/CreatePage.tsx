import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useImageUpload } from "@/components/hooks/use-image-upload";
import { toast } from "@/components/ui/sonner";
import { Database } from "@/integrations/supabase/types";
import ImageCropper from "@/components/ui/ImageCropper";
import { useCropper } from "@/components/hooks/use-cropper";

const phoneLengths: Record<string, number> = {
  SA: 9,
  KW: 8,
  AE: 9,
  QA: 8,
  OM: 8,
  BH: 8,
};

const countries = [
  { code: "SA", name: "السعودية", currency: "SAR", dial: "+966" },
  { code: "KW", name: "الكويت", currency: "KWD", dial: "+965" },
  { code: "AE", name: "الإمارات", currency: "AED", dial: "+971" },
  { code: "QA", name: "قطر", currency: "QAR", dial: "+974" },
  { code: "OM", name: "عمان", currency: "OMR", dial: "+968" },
  { code: "BH", name: "البحرين", currency: "BHD", dial: "+973" },
];

function isValidSlug(slug: string) {
  return /^[a-z0-9\-]+$/.test(slug);
}

const CreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // تحسين دالة التحقق من المكتب
    async function checkUserOffice() {
      try {
        // التحقق من وجود جلسة مسبقاً للمستخدم
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("خطأ في الحصول على الجلسة:", error.message);
          return;
        }
        
        const session = data?.session;
        if (!session?.user?.id || !isMounted) return;

        // استعلام عن مكتب المستخدم فقط إذا كانت الجلسة نشطة
        const { data: office, error: officeError } = await supabase
          .from("offices")
          .select("id")
          .eq("user_id", session.user.id)
          .limit(1)
          .single();
        
        if (officeError && officeError.code !== 'PGRST116') {
          // PGRST116 هو خطأ "لم يتم العثور على نتائج" وهو متوقع عندما لا يكون للمستخدم مكتب
          console.error("خطأ في استعلام المكتب:", officeError.message);
          return;
        }

        // توجيه المستخدم للوحة التحكم إذا كان لديه مكتب بالفعل
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

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<null | boolean>(null);
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const {
    fileInputRef: logoInput,
    handleThumbnailClick: openLogo,
    handleFileChange: logoFileChange,
    previewUrl: logoPreview,
    handleRemove: removeLogo,
  } = useImageUpload();

  const {
    fileInputRef: coverInput,
    handleThumbnailClick: openCover,
    handleFileChange: coverFileChange,
    previewUrl: coverPreview,
    handleRemove: removeCover,
  } = useImageUpload();

  const slugBase = "ad51.me/";

  const slugCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9\-]/g, "").toLowerCase();
    setSlug(value);
    setErrors((er) => ({ ...er, slug: "" }));

    if (slugCheckTimeout.current) {
      clearTimeout(slugCheckTimeout.current);
      slugCheckTimeout.current = null;
    }

    // تحقق فقط إذا كان الاسم بالطول المناسب ومتوافق مع النمط
    if (value.length >= 3 && isValidSlug(value)) {
      setSlugAvailable(null); // حالة تحميل
      
      slugCheckTimeout.current = setTimeout(async () => {
        try {
          const { data, error } = await supabase
            .from("offices")
            .select("id")
            .eq("slug", value)
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
      }, 600); // تأخير للحد من عدد الطلبات
    } else {
      setSlugAvailable(null);
    }
  };

  function validateForm() {
    const e: any = {};
    if (!name.trim()) e.name = "الاسم التجاري مطلوب";
    if (!slug.trim()) e.slug = "اسم الرابط مطلوب";
    else if (!isValidSlug(slug)) e.slug = "اسم الرابط يجب أن يكون بالإنجليزية وحروف صغيرة وأرقام وشرطات فقط";
    else if (slugAvailable === false) e.slug = "اسم الرابط غير متاح، الرجاء اختيار اسم آخر";
    if (!country) e.country = "الدولة مطلوبة";
    if (!phone.trim()) e.phone = "رقم الهاتف مطلوب";
    else if (country && phoneLengths[country] && phone.length !== phoneLengths[country])
      e.phone = `رقم الهاتف يجب أن يتكون من ${phoneLengths[country]} أرقام`;
    else if (!/^\d+$/.test(phone)) e.phone = "رقم الهاتف يجب أن يكون أرقام فقط";
    if (!logoPreview) e.logo = "شعار المكتب مطلوب";
    if (!coverPreview) e.cover = "الغلاف مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      // التحقق من الجلسة مرة واحدة
      const { data, error: sessionErr } = await supabase.auth.getSession();
      
      if (sessionErr) {
        throw new Error("خطأ في جلسة المستخدم: " + sessionErr.message);
      }
      
      const session = data?.session;
      if (!session?.user) {
        throw new Error("الرجاء تسجيل الدخول لإنشاء صفحة المكتب");
      }

      // إنشاء معرف فريد للمكتب
      const officeId = crypto.randomUUID();
      const logoPath = `logos/${officeId}.png`;
      const coverPath = `covers/${officeId}.png`;

      // التحقق من وجود الملفات
      const logoFile = logoInput.current?.files?.[0];
      const coverFile = coverInput.current?.files?.[0];

      if (!logoFile) throw new Error("يرجى رفع الشعار");
      if (!coverFile) throw new Error("يرجى رفع الغلاف");

      // رفع الملفات بالتوازي
      const uploadLogo = supabase.storage.from("office-assets").upload(logoPath, logoFile, { upsert: true });
      const uploadCover = supabase.storage.from("office-assets").upload(coverPath, coverFile, { upsert: true });
      
      const [logoResult, coverResult] = await Promise.all([uploadLogo, uploadCover]);
      
      if (logoResult.error) {
        throw new Error("فشل رفع الشعار: " + logoResult.error.message);
      }
      
      if (coverResult.error) {
        throw new Error("فشل رفع الغلاف: " + coverResult.error.message);
      }

      // إدخال بيانات المكتب
      const { error: insertError } = await supabase
        .from('offices')
        .insert({
          id: officeId,
          user_id: session.user.id,
          name,
          slug,
          country,
          phone,
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
  }

  const selectedCountry = countries.find((c) => c.code === country);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-indigo-950 dark:to-slate-900">
      <Card className="w-full max-w-xl p-2 rounded-3xl shadow-2xl" dir="rtl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-extrabold">
            إنشاء صفحة المكتب
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2" autoComplete="off" dir="rtl">
            <div>
              <label className="font-bold">الاسم التجاري</label>
              <Input
                value={name}
                onChange={e => { setName(e.target.value); setErrors((er) => ({ ...er, name: "" }))}}
                placeholder="مثال: معرض التميز الحديث"
                id="office-name"
                name="office-name"
              />
              {errors.name && <div className="text-destructive text-xs font-bold mt-1">{errors.name}</div>}
            </div>
            <div>
              <label className="font-bold">أسم الرابط</label>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-500 rounded bg-gray-100 px-2 py-1"> {slugBase} </span>
                <Input
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="carshow123"
                  pattern="^[a-z0-9\-]+$"
                  className="ltr text-left"
                  dir="ltr"
                  maxLength={30}
                  id="office-slug"
                  name="office-slug"
                />
                {slug.length >= 3 && (
                  <span className={`text-xs font-bold ${slugAvailable == null ? "text-gray-400" : slugAvailable ? "text-green-600" : "text-red-600"}`}>
                    {slugAvailable == null
                      ? ""
                      : slugAvailable
                        ? "متاح"
                        : "غير متاح"}
                  </span>
                )}
              </div>
              {errors.slug && <div className="text-destructive text-xs font-bold mt-1">{errors.slug}</div>}
            </div>
            <div>
              <label className="font-bold">الدولة</label>
              <Select value={country} onValueChange={(value) => {setCountry(value); setErrors((er)=>({...er, country:""}))}}>
                <SelectTrigger id="country-select" name="country-select">
                  <SelectValue placeholder="اختر الدولة" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(c =>
                    <SelectItem value={c.code} key={c.code}>{c.name} ({c.currency})</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.country && <div className="text-destructive text-xs font-bold mt-1">{errors.country}</div>}
            </div>
            <div>
              <label className="font-bold">رقم الهاتف</label>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{selectedCountry?.dial ?? ""}</span>
                <Input
                  value={phone}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, "");
                    setPhone(digits);
                    setErrors((er) => ({ ...er, phone: "" }))
                  }}
                  placeholder={`${
                    selectedCountry?.code === "KW"
                      ? "5xxxxxxx"
                      : selectedCountry?.code === "SA"
                        ? "5xxxxxxxx"
                        : selectedCountry?.code === "AE"
                          ? "5xxxxxxxx"
                          : "xxxxxxxx"
                  }`}
                  type="tel"
                  maxLength={country && phoneLengths[country] ? phoneLengths[country] : 9}
                  id="office-phone"
                  name="office-phone"
                />
              </div>
              {errors.phone && <div className="text-destructive text-xs font-bold mt-1">{errors.phone}</div>}
            </div>
            <div>
              <label className="font-bold">شعار المكتب</label>
              <div className="flex flex-col items-end gap-2">
                <input
                  ref={logoInput}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={logoFileChange}
                  id="office-logo"
                  name="office-logo"
                />
                <Button type="button" onClick={openLogo} variant="outline" size="sm">
                  رفع الشعار
                </Button>
                {logoPreview && (
                  <div className="w-20 h-20 rounded overflow-hidden border flex flex-col items-center relative mt-1">
                    <img
                      src={logoPreview}
                      alt="الشعار"
                      className="object-cover w-full h-full"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeLogo}
                      className="absolute top-0 left-0"
                      type="button"
                    >
                      حذف
                    </Button>
                  </div>
                )}
              </div>
              {errors.logo && <div className="text-destructive text-xs font-bold mt-1">{errors.logo}</div>}
            </div>
            <div>
              <label className="font-bold">الغلاف</label>
              <div className="flex flex-col items-end gap-2">
                <input
                  ref={coverInput}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={coverFileChange}
                  id="office-cover"
                  name="office-cover"
                />
                <Button type="button" onClick={openCover} variant="outline" size="sm">
                  رفع الغلاف
                </Button>
                {coverPreview && (
                  <div className="w-full max-h-32 rounded overflow-hidden border flex flex-col items-center relative mt-1">
                    <img
                      src={coverPreview}
                      alt="الغلاف"
                      className="object-cover w-full h-full"
                      style={{ aspectRatio: "4/1", width: "100%" }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeCover}
                      className="absolute top-0 left-0"
                      type="button"
                    >
                      حذف
                    </Button>
                  </div>
                )}
              </div>
              {errors.cover && <div className="text-destructive text-xs font-bold mt-1">{errors.cover}</div>}
            </div>
            <Button type="submit" className="w-full rounded-full font-bold mt-4" disabled={loading}>
              {loading ? "جاري الإنشاء..." : "إنشاء الصفحة"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePage;
