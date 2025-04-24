
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Linkedin, 
  Globe, 
  MessageCircle,
  Save 
} from "lucide-react";

// Define augmented Office type that includes settings
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
  social_settings?: string;
}

const SocialMediaSettings = ({ office }: { office: Office }) => {
  const [loading, setLoading] = useState(false);
  
  // Initialize social media settings
  const [socialSettings, setSocialSettings] = useState({
    facebook: office?.settings?.social?.facebook || "",
    instagram: office?.settings?.social?.instagram || "",
    twitter: office?.settings?.social?.twitter || "",
    youtube: office?.settings?.social?.youtube || "",
    linkedin: office?.settings?.social?.linkedin || "",
    website: office?.settings?.social?.website || "",
    whatsapp: office?.settings?.social?.whatsapp || "",
    telegram: office?.settings?.social?.telegram || "",
    enableSocialLinks: office?.settings?.social?.enableSocialLinks !== false,
    enableShareButtons: office?.settings?.social?.enableShareButtons !== false
  });

  // Handle input changes
  const handleChange = (field: string, value: any) => {
    setSocialSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save social media settings
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use type assertion to inform TypeScript that office has settings
      const updatedOffice = {
        ...office,
        settings: {
          ...(office?.settings || {}),
          social: {
            ...socialSettings,
            updated_at: new Date().toISOString()
          }
        }
      };
      
      const { error } = await supabase.from("offices")
        .update({
          // Cast explicitly to prevent TypeScript errors
          settings: updatedOffice.settings
        } as any)
        .eq("id", office?.id);

      if (error) throw error;
      
      toast.success("تم تحديث إعدادات وسائل التواصل الاجتماعي بنجاح");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحديث الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        {/* Social Media Accounts */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">حسابات التواصل الاجتماعي</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableSocialLinks" className="font-medium">
                  عرض روابط التواصل الاجتماعي في المتجر
                </Label>
                <Switch
                  id="enableSocialLinks"
                  checked={socialSettings.enableSocialLinks}
                  onCheckedChange={(checked) => handleChange("enableSocialLinks", checked)}
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <Facebook size={18} className="text-blue-600" /> فيسبوك
                  </Label>
                  <Input
                    id="facebook"
                    placeholder="رابط صفحة الفيسبوك"
                    value={socialSettings.facebook}
                    onChange={(e) => handleChange("facebook", e.target.value)}
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram size={18} className="text-pink-600" /> انستغرام
                  </Label>
                  <Input
                    id="instagram"
                    placeholder="رابط حساب الانستغرام"
                    value={socialSettings.instagram}
                    onChange={(e) => handleChange("instagram", e.target.value)}
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <Twitter size={18} className="text-blue-400" /> تويتر
                  </Label>
                  <Input
                    id="twitter"
                    placeholder="رابط حساب تويتر"
                    value={socialSettings.twitter}
                    onChange={(e) => handleChange("twitter", e.target.value)}
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="youtube" className="flex items-center gap-2">
                    <Youtube size={18} className="text-red-600" /> يوتيوب
                  </Label>
                  <Input
                    id="youtube"
                    placeholder="رابط قناة اليوتيوب"
                    value={socialSettings.youtube}
                    onChange={(e) => handleChange("youtube", e.target.value)}
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin size={18} className="text-blue-800" /> لينكد إن
                  </Label>
                  <Input
                    id="linkedin"
                    placeholder="رابط حساب لينكد إن"
                    value={socialSettings.linkedin}
                    onChange={(e) => handleChange("linkedin", e.target.value)}
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe size={18} className="text-gray-600" /> الموقع الإلكتروني
                  </Label>
                  <Input
                    id="website"
                    placeholder="رابط الموقع الإلكتروني"
                    value={socialSettings.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-2">
                    <MessageCircle size={18} className="text-green-600" /> واتساب
                  </Label>
                  <Input
                    id="whatsapp"
                    placeholder="رقم الواتساب مع كود الدولة مثل: 966500000000"
                    value={socialSettings.whatsapp}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telegram" className="flex items-center gap-2">
                    <MessageCircle size={18} className="text-blue-500" /> تلجرام
                  </Label>
                  <Input
                    id="telegram"
                    placeholder="معرف تلجرام مثل: store_name"
                    value={socialSettings.telegram}
                    onChange={(e) => handleChange("telegram", e.target.value)}
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Sharing Options */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">خيارات المشاركة</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableShareButtons" className="font-medium">
                  عرض أزرار مشاركة المنتجات على وسائل التواصل الاجتماعي
                </Label>
                <Switch
                  id="enableShareButtons"
                  checked={socialSettings.enableShareButtons}
                  onCheckedChange={(checked) => handleChange("enableShareButtons", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          type="submit" 
          className="mt-6"
          disabled={loading}
        >
          {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          <Save size={16} className="mr-2" />
        </Button>
      </form>
    </div>
  );
};

export default SocialMediaSettings;
