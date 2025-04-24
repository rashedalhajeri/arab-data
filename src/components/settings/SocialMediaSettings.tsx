import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Save, Facebook, Instagram, Twitter, Youtube, Music, Linkedin, Link2 } from "lucide-react";

// تعريف نوع المكتب
interface Office {
  id?: string;
  name?: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  country?: string;
  logo_url?: string;
  cover_url?: string;
  phone?: string;
  settings?: { [key: string]: any };
}

const SocialMediaSettings = ({ office }: { office: any }) => {
  const [loading, setLoading] = useState(false);
  
  // تهيئة إعدادات وسائل التواصل الاجتماعي
  const [socialMedia, setSocialMedia] = useState({
    facebook: office?.settings?.social_media?.facebook || "",
    instagram: office?.settings?.social_media?.instagram || "",
    twitter: office?.settings?.social_media?.twitter || "",
    youtube: office?.settings?.social_media?.youtube || "",
    tiktok: office?.settings?.social_media?.tiktok || "",
    linkedin: office?.settings?.social_media?.linkedin || "",
    snapchat: office?.settings?.social_media?.snapchat || "",
    whatsapp: office?.settings?.social_media?.whatsapp || "",
    custom_links: office?.settings?.social_media?.custom_links || [
      { title: "", url: "", active: true }
    ],
    show_social_icons: office?.settings?.social_media?.show_social_icons !== false,
    show_share_buttons: office?.settings?.social_media?.show_share_buttons !== false,
  });

  // تغيير قيمة الحقل
  const handleChange = (field: string, value: any) => {
    setSocialMedia(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // تحديث الرابط المخصص
  const handleCustomLinkChange = (index: number, field: string, value: any) => {
    const updatedLinks = [...socialMedia.custom_links];
    updatedLinks[index] = {
      ...updatedLinks[index],
      [field]: value
    };
    
    setSocialMedia(prev => ({
      ...prev,
      custom_links: updatedLinks
    }));
  };

  // إضافة رابط مخصص جديد
  const addCustomLink = () => {
    setSocialMedia(prev => ({
      ...prev,
      custom_links: [
        ...prev.custom_links,
        { title: "", url: "", active: true }
      ]
    }));
  };

  // حذف رابط مخصص
  const removeCustomLink = (index: number) => {
    const updatedLinks = [...socialMedia.custom_links];
    updatedLinks.splice(index, 1);
    
    setSocialMedia(prev => ({
      ...prev,
      custom_links: updatedLinks
    }));
  };

  // التحقق من صحة الروابط
  const validateUrls = () => {
    // تحقق من صحة روابط وسائل التواصل الاجتماعي
    const socialUrls = [
      { name: 'Facebook', url: socialMedia.facebook },
      { name: 'Instagram', url: socialMedia.instagram },
      { name: 'Twitter', url: socialMedia.twitter },
      { name: 'YouTube', url: socialMedia.youtube },
      { name: 'TikTok', url: socialMedia.tiktok },
      { name: 'LinkedIn', url: socialMedia.linkedin },
      { name: 'Snapchat', url: socialMedia.snapchat },
      { name: 'WhatsApp', url: socialMedia.whatsapp },
    ];

    // التحقق من صحة الروابط المدخلة
    for (const social of socialUrls) {
      if (social.url && !isValidUrl(social.url)) {
        throw new Error(`رابط ${social.name} غير صالح. يرجى إدخال رابط صحيح.`);
      }
    }

    // التحقق من صحة الروابط المخصصة
    for (const link of socialMedia.custom_links) {
      if (link.url && !isValidUrl(link.url)) {
        throw new Error(`الرابط المخصص "${link.title}" غير صالح. يرجى إدخال رابط صحيح.`);
      }
    }

    return true;
  };

  // التحقق من صحة الرابط
  const isValidUrl = (url: string) => {
    try {
      // إذا بدأ بـ "https://wa.me/" فهو رقم واتساب وليس رابط
      if (url.startsWith("https://wa.me/")) return true;
      
      // للتحقق من باقي الروابط
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // تنسيق رقم الواتساب
  const formatWhatsAppNumber = (input: string) => {
    // إزالة أي حرف غير رقمي
    const numbersOnly = input.replace(/[^\d]/g, "");
    
    // إذا كان المدخل فارغًا، أعد قيمة فارغة
    if (!numbersOnly) return "";
    
    // إذا بدأ برمز الدولة، أعد الرقم كما هو
    if (numbersOnly.startsWith("0")) {
      return numbersOnly;
    }
    
    return numbersOnly;
  };

  // تحويل رقم الواتساب إلى رابط
  const handleWhatsAppChange = (value: string) => {
    const formattedNumber = formatWhatsAppNumber(value);
    handleChange("whatsapp", formattedNumber);
  };

  // رصف رقم الواتساب كرابط
  const getWhatsAppLink = (number: string) => {
    if (!number) return "";
    return `https://wa.me/${number.startsWith("0") ? number.substring(1) : number}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">إعدادات وسائل التواصل الاجتماعي</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* الإعدادات العامة */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg font-medium">الإعدادات العامة</h3>
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="show_social_icons">عرض أيقونات وسائل التواصل الاجتماعي</Label>
                  <p className="text-sm text-muted-foreground">
                    عرض أيقونات وسائل التواصل الاجتماعي في تذييل المتجر
                  </p>
                </div>
                <Switch
                  id="show_social_icons"
                  checked={socialMedia.show_social_icons}
                  onCheckedChange={(checked) => handleChange("show_social_icons", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label htmlFor="show_share_buttons">عرض أزرار المشاركة</Label>
                  <p className="text-sm text-muted-foreground">
                    عرض أزرار مشاركة المنتج على وسائل التواصل الاجتماعي
                  </p>
                </div>
                <Switch
                  id="show_share_buttons"
                  checked={socialMedia.show_share_buttons}
                  onCheckedChange={(checked) => handleChange("show_share_buttons", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* حسابات وسائل التواصل الاجتماعي */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg font-medium">حسابات وسائل التواصل الاجتماعي</h3>
              <p className="text-sm text-muted-foreground">
                أدخل روابط حسابات وسائل التواصل الاجتماعي الخاصة بمتجرك. اترك الحقل فارغًا إذا كنت لا ترغب في عرضه.
              </p>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {/* فيسبوك */}
                <div className="grid gap-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <Facebook size={16} /> فيسبوك
                  </Label>
                  <Input
                    id="facebook"
                    value={socialMedia.facebook}
                    onChange={(e) => handleChange("facebook", e.target.value)}
                    placeholder="https://facebook.com/mystore"
                  />
                </div>
                
                {/* انستغرام */}
                <div className="grid gap-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram size={16} /> انستغرام
                  </Label>
                  <Input
                    id="instagram"
                    value={socialMedia.instagram}
                    onChange={(e) => handleChange("instagram", e.target.value)}
                    placeholder="https://instagram.com/mystore"
                  />
                </div>
                
                {/* تويتر */}
                <div className="grid gap-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <Twitter size={16} /> تويتر
                  </Label>
                  <Input
                    id="twitter"
                    value={socialMedia.twitter}
                    onChange={(e) => handleChange("twitter", e.target.value)}
                    placeholder="https://twitter.com/mystore"
                  />
                </div>
                
                {/* يوتيوب */}
                <div className="grid gap-2">
                  <Label htmlFor="youtube" className="flex items-center gap-2">
                    <Youtube size={16} /> يوتيوب
                  </Label>
                  <Input
                    id="youtube"
                    value={socialMedia.youtube}
                    onChange={(e) => handleChange("youtube", e.target.value)}
                    placeholder="https://youtube.com/c/mystore"
                  />
                </div>
                
                {/* تيك توك */}
                <div className="grid gap-2">
                  <Label htmlFor="tiktok" className="flex items-center gap-2">
                    <Music size={16} /> تيك توك
                  </Label>
                  <Input
                    id="tiktok"
                    value={socialMedia.tiktok}
                    onChange={(e) => handleChange("tiktok", e.target.value)}
                    placeholder="https://tiktok.com/@mystore"
                  />
                </div>
                
                {/* لينكد إن */}
                <div className="grid gap-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin size={16} /> لينكد إن
                  </Label>
                  <Input
                    id="linkedin"
                    value={socialMedia.linkedin}
                    onChange={(e) => handleChange("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/company/mystore"
                  />
                </div>
                
                {/* سناب شات */}
                <div className="grid gap-2">
                  <Label htmlFor="snapchat" className="flex items-center gap-2">
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="currentColor"/>
                      <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="currentColor"/>
                    </svg> سناب شات
                  </Label>
                  <Input
                    id="snapchat"
                    value={socialMedia.snapchat}
                    onChange={(e) => handleChange("snapchat", e.target.value)}
                    placeholder="https://snapchat.com/add/mystore"
                  />
                </div>
                
                {/* واتساب */}
                <div className="grid gap-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-2">
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current"
                    >
                      <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.2.301-.767.966-.94 1.164-.173.199-.347.223-.646.075-.3-.15-1.267-.465-2.412-1.485-.893-.795-1.494-1.781-1.674-2.079-.18-.302-.02-.451.127-.602.138-.133.301-.347.451-.521.15-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.672-1.62-.922-2.218-.242-.579-.487-.5-.672-.51-.172-.01-.371-.012-.571-.012-.2 0-.522.074-.796.372-.273.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004c-1.52 0-2.992-.41-4.287-1.184l-.31-.18-3.195.836.85-3.102-.196-.312c-.847-1.338-1.29-2.886-1.29-4.472.002-4.632 3.764-8.396 8.4-8.396 2.242.002 4.35.879 5.933 2.466 1.584 1.585 2.457 3.694 2.455 5.93-.002 4.632-3.762 8.396-8.398 8.396m7.088-15.708A10.073 10.073 0 0 0 12.077 4c-5.575 0-10.114 4.537-10.115 10.112 0 1.784.465 3.527 1.347 5.067l-1.431 5.222 5.34-1.4a10.098 10.098 0 0 0 4.859 1.233h.004c5.574 0 10.113-4.538 10.114-10.112.002-2.7-1.048-5.242-2.953-7.15" fill="currentColor"/>
                    </svg> واتساب
                  </Label>
                  <Input
                    id="whatsapp"
                    value={socialMedia.whatsapp}
                    onChange={(e) => handleWhatsAppChange(e.target.value)}
                    placeholder="966500000000"
                  />
                  <p className="text-xs text-muted-foreground">
                    أدخل رقم الواتساب بصيغة دولية، مثال: 966500000000
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* روابط مخصصة */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">روابط مخصصة</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addCustomLink}
                >
                  إضافة رابط
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                أضف روابط مخصصة تريد عرضها في متجرك (مثل روابط خارجية، مدونة، إلخ).
              </p>
              
              {socialMedia.custom_links.map((link, index) => (
                <div key={index} className="border p-3 rounded-md space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">رابط #{index + 1}</h4>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeCustomLink(index)}
                      disabled={socialMedia.custom_links.length === 1}
                    >
                      حذف
                    </Button>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor={`link-title-${index}`}>عنوان الرابط</Label>
                      <Input
                        id={`link-title-${index}`}
                        value={link.title}
                        onChange={(e) => handleCustomLinkChange(index, "title", e.target.value)}
                        placeholder="مدونتنا"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor={`link-url-${index}`} className="flex items-center gap-2">
                        <Link2 size={16} /> رابط URL
                      </Label>
                      <Input
                        id={`link-url-${index}`}
                        value={link.url}
                        onChange={(e) => handleCustomLinkChange(index, "url", e.target.value)}
                        placeholder="https://blog.example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      id={`link-active-${index}`}
                      checked={link.active}
                      onChange={(e) => handleCustomLinkChange(index, "active", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                    />
                    <Label htmlFor={`link-active-${index}`}>نشط</Label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ إعدادات التواصل الاجتماعي'}
              <Save size={16} className="mr-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SocialMediaSettings;
