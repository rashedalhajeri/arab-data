
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Save, Instagram, Facebook, Twitter, Youtube, Music, Linkedin, Phone, Mail, Link } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

// تعريف نوع المكتب مع إعدادات التواصل الاجتماعي
interface Office {
  id?: string;
  name: string;
  slug: string;
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

interface SocialSettingsProps {
  office: Office;
  onSettingsUpdate?: (updatedSocialSettings: any) => void;
}

interface SocialData {
  instagram: string;
  facebook: string;
  twitter: string;
  youtube: string;
  tiktok: string;
  snapchat: string;
  linkedin: string;
  phone: string;
  email: string;
  website: string;
  showInStore: boolean;
  showFollowers: boolean;
}

// Custom Snapchat icon component
const SnapchatIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M12 2c4.5 0 6.5 3 6.5 6.5 0 1.5 0 2.5-0.5 3.5l0.5 0.5c0.5 0.5 1.5 0.5 2.5 0.5v1c-1 1-2 1-3 1l-1 2c-1 3-3 3-4.5 3s-3.5 0-4.5-3l-1-2c-1 0-2 0-3-1v-1c1 0 2 0 2.5-0.5l0.5-0.5c-0.5-1-0.5-2-0.5-3.5 0-3.5 2-6.5 6.5-6.5z"/>
  </svg>
);

const SocialSettings = ({ office, onSettingsUpdate }: SocialSettingsProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // تهيئة إعدادات التواصل الاجتماعي
  const [socialSettings, setSocialSettings] = useState<SocialData>({
    instagram: "",
    facebook: "",
    twitter: "",
    youtube: "",
    tiktok: "",
    snapchat: "",
    linkedin: "",
    phone: "",
    email: "",
    website: "",
    showInStore: true,
    showFollowers: true,
  });

  useEffect(() => {
    if (office) {
      let socialData: any = {};
      
      // Intentar cargar desde el nuevo formato social_settings (si existe)
      if (office.social_settings) {
        try {
          socialData = JSON.parse(office.social_settings);
        } catch (error) {
          console.error("Error parsing social_settings:", error);
        }
      } 
      // Si no hay datos del nuevo formato o hubo error al parsear, usar el formato antiguo
      if (Object.keys(socialData).length === 0 && office.settings?.social) {
        socialData = office.settings.social;
      }
      
      setSocialSettings({
        instagram: socialData.instagram || "",
        facebook: socialData.facebook || "",
        twitter: socialData.twitter || "",
        youtube: socialData.youtube || "",
        tiktok: socialData.tiktok || "",
        snapchat: socialData.snapchat || "",
        linkedin: socialData.linkedin || "",
        phone: socialData.phone || "",
        email: socialData.email || "",
        website: socialData.website || "",
        showInStore: socialData.showInStore !== false,
        showFollowers: socialData.showFollowers !== false,
      });
    }
  }, [office]);

  // تغيير الإعدادات
  const handleChange = (field: string, value: string | boolean) => {
    setSocialSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // حفظ الإعدادات
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("offices")
        .update({
          social_settings: JSON.stringify(socialSettings),
        } as any)
        .eq("id", office.id);

      if (error) throw error;
      
      // Notify parent component of the update if callback exists
      if (onSettingsUpdate) {
        onSettingsUpdate(socialSettings);
      }

      toast({
        title: "Social settings updated",
        description: "Your social settings have been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error saving social settings:", error);
      toast({
        title: "Error updating social settings",
        description: error.message || "There was an error updating your social settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // تنسيق رابط وسائل التواصل الاجتماعي
  const formatSocialUrl = (platform: string, value: string) => {
    if (!value) return "";
    
    // إذا كان الرابط يحتوي على http أو https، أرجعه كما هو
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value;
    }
    
    // إذا كان التنسيق هو معرف المستخدم فقط (بدون @)، أضف الرابط الكامل
    switch (platform) {
      case "instagram":
        return `https://instagram.com/${value.replace(/@/g, '')}`;
      case "facebook":
        return `https://facebook.com/${value.replace(/@/g, '')}`;
      case "twitter":
        return `https://twitter.com/${value.replace(/@/g, '')}`;
      case "youtube":
        return `https://youtube.com/${value.replace(/@/g, '')}`;
      case "tiktok":
        return `https://tiktok.com/@${value.replace(/@/g, '')}`;
      case "snapchat":
        return `https://snapchat.com/add/${value.replace(/@/g, '')}`;
      case "linkedin":
        return `https://linkedin.com/in/${value.replace(/@/g, '')}`;
      default:
        return value;
    }
  };

  // معلومات وسائل التواصل الاجتماعي
  const socialPlatforms = [
    { 
      id: "instagram", 
      name: "انستجرام", 
      icon: <Instagram className="h-5 w-5" />,
      placeholder: "معرف انستجرام مثل: @arabdata" 
    },
    { 
      id: "facebook", 
      name: "فيسبوك", 
      icon: <Facebook className="h-5 w-5" />,
      placeholder: "رابط صفحة الفيسبوك"
    },
    { 
      id: "twitter", 
      name: "تويتر", 
      icon: <Twitter className="h-5 w-5" />,
      placeholder: "معرف تويتر مثل: @arabdata"
    },
    { 
      id: "youtube", 
      name: "يوتيوب", 
      icon: <Youtube className="h-5 w-5" />,
      placeholder: "رابط قناة اليوتيوب"
    },
    { 
      id: "tiktok", 
      name: "تيك توك", 
      icon: <Music className="h-5 w-5" />,
      placeholder: "معرف تيك توك مثل: @arabdata"
    },
    { 
      id: "snapchat", 
      name: "سناب شات", 
      icon: <SnapchatIcon />,
      placeholder: "معرف سناب شات"
    },
    { 
      id: "linkedin", 
      name: "لينكد إن", 
      icon: <Linkedin className="h-5 w-5" />,
      placeholder: "معرف لينكد إن"
    }
  ];

  // معلومات الاتصال
  const contactInfo = [
    { 
      id: "phone", 
      name: "رقم الهاتف", 
      icon: <Phone className="h-5 w-5" />,
      placeholder: "مثال: +966512345678",
      type: "tel"
    },
    { 
      id: "email", 
      name: "البريد الإلكتروني", 
      icon: <Mail className="h-5 w-5" />,
      placeholder: "مثال: email@example.com",
      type: "email"
    },
    { 
      id: "website", 
      name: "الموقع الإلكتروني", 
      icon: <Link className="h-5 w-5" />,
      placeholder: "مثال: https://arabdata.sa",
      type: "url"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">وسائل التواصل الاجتماعي</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* معلومات وسائل التواصل الاجتماعي */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg font-medium">وسائل التواصل الاجتماعي</h3>
              
              <div className="grid grid-cols-1 gap-4">
                {socialPlatforms.map((platform) => (
                  <div key={platform.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      {platform.icon}
                    </div>
                    <div className="flex-grow">
                      <Label htmlFor={platform.id} className="sr-only">
                        {platform.name}
                      </Label>
                      <Input
                        id={platform.id}
                        value={socialSettings[platform.id as keyof typeof socialSettings] as string}
                        onChange={(e) => handleChange(platform.id, e.target.value)}
                        placeholder={platform.placeholder}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* معلومات الاتصال */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg font-medium">معلومات الاتصال</h3>
              
              <div className="grid grid-cols-1 gap-4">
                {contactInfo.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      {contact.icon}
                    </div>
                    <div className="flex-grow">
                      <Label htmlFor={contact.id} className="sr-only">
                        {contact.name}
                      </Label>
                      <Input
                        id={contact.id}
                        type={contact.type}
                        value={socialSettings[contact.id as keyof typeof socialSettings] as string}
                        onChange={(e) => handleChange(contact.id, e.target.value)}
                        placeholder={contact.placeholder}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* خيارات العرض */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg font-medium">خيارات العرض</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showInStore" className="text-sm font-medium">
                    عرض وسائل التواصل الاجتماعي في المتجر
                  </Label>
                  <Switch
                    id="showInStore"
                    checked={socialSettings.showInStore}
                    onCheckedChange={(checked) => handleChange("showInStore", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showFollowers" className="text-sm font-medium">
                    عرض عدد المتابعين (إذا كان متاحاً)
                  </Label>
                  <Switch
                    id="showFollowers"
                    checked={socialSettings.showFollowers}
                    onCheckedChange={(checked) => handleChange("showFollowers", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              disabled={loading}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              <Save size={16} className="mr-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SocialSettings; 
