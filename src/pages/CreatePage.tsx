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
    async function checkUserOffice() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data: office } = await supabase
        .from("offices")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (office && isMounted) {
        navigate("/dashboard", { replace: true });
      }
    }
    checkUserOffice();
    return () => { isMounted = false; };
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

    if (slugCheckTimeout.current) clearTimeout(slugCheckTimeout.current);

    if (value.length >= 3 && isValidSlug(value)) {
      slugCheckTimeout.current = setTimeout(async () => {
        let { data, error } = await supabase
          .from("offices")
          .select("id")
          .eq("slug", value)
          .maybeSingle();
        setSlugAvailable(!data);
      }, 600);
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
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !session?.user) throw new Error("لم يتم العثور على حساب المستخدم.");

      const officeId = crypto.randomUUID();
      const logoPath = `logos/${officeId}.png`;
      const coverPath = `covers/${officeId}.png`;

      const logoFile = logoInput.current?.files?.[0];
      const coverFile = coverInput.current?.files?.[0];

      if (!logoFile) throw new Error("يرجى رفع الشعار");
      if (!coverFile) throw new Error("يرجى رفع الغلاف");

      const uploadLogo = supabase.storage.from("office-assets").upload(logoPath, logoFile, { upsert: true });
      const uploadCover = supabase.storage.from("office-assets").upload(coverPath, coverFile, { upsert: true });
      const [{ error: logoErr }, { error: coverErr }] = await Promise.all([uploadLogo, uploadCover]);
      if (logoErr) throw new Error("فشل رفع الشعار");
      if (coverErr) throw new Error("فشل رفع الغلاف");

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
      if (insertError) throw insertError;

      toast.success("تم إنشاء الصفحة بنجاح!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ");
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
                <SelectTrigger>
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
