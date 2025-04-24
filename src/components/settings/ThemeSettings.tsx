import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Palette, Save, Sun, Moon } from "lucide-react";

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

interface ColorTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
}

const ThemeSettings = ({ office }: { office: Office }) => {
  const [loading, setLoading] = useState(false);
  
  const [themeSettings, setThemeSettings] = useState({
    mode: office?.settings?.theme?.mode || "light",
    colorTheme: office?.settings?.theme?.colorTheme || "blue",
    fontSize: office?.settings?.theme?.fontSize || "medium",
    borderRadius: office?.settings?.theme?.borderRadius || "medium",
    customCss: office?.settings?.theme?.customCss || ""
  });

  const colorThemes: ColorTheme[] = [
    {
      id: "blue",
      name: "أزرق",
      primaryColor: "#3b82f6",
      secondaryColor: "#93c5fd",
      accentColor: "#2563eb",
      bgColor: "#eff6ff",
      textColor: "#1e3a8a"
    },
    {
      id: "purple",
      name: "بنفسجي",
      primaryColor: "#8b5cf6",
      secondaryColor: "#c4b5fd",
      accentColor: "#7c3aed",
      bgColor: "#f5f3ff",
      textColor: "#4c1d95"
    },
    {
      id: "green",
      name: "أخضر",
      primaryColor: "#10b981",
      secondaryColor: "#a7f3d0",
      accentColor: "#059669",
      bgColor: "#ecfdf5",
      textColor: "#064e3b"
    },
    {
      id: "red",
      name: "أحمر",
      primaryColor: "#ef4444",
      secondaryColor: "#fecaca",
      accentColor: "#dc2626",
      bgColor: "#fef2f2",
      textColor: "#991b1b"
    },
    {
      id: "amber",
      name: "ذهبي",
      primaryColor: "#f59e0b",
      secondaryColor: "#fcd34d",
      accentColor: "#d97706",
      bgColor: "#fffbeb",
      textColor: "#92400e"
    }
  ];

  const handleChange = (field: string, value: string) => {
    setThemeSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedOffice = {
        ...office,
        settings: {
          ...(office?.settings || {}),
          theme: {
            ...themeSettings,
            updated_at: new Date().toISOString()
          }
        }
      };

      const { error } = await supabase.from("offices").update({
        settings: updatedOffice.settings
      } as any).eq("id", office?.id);

      if (error) throw error;
      
      toast.success("تم تحديث إعدادات المظهر بنجاح");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحديث الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">وضع المظهر</h3>
          
          <RadioGroup
            value={themeSettings.mode}
            onValueChange={(value) => handleChange("mode", value)}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light" className="flex items-center cursor-pointer">
                <Sun size={18} className="ml-2" />
                وضع النهار (فاتح)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark" className="flex items-center cursor-pointer">
                <Moon size={18} className="ml-2" />
                وضع الليل (داكن)
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="system" id="theme-system" />
              <Label htmlFor="theme-system" className="cursor-pointer">
                تلقائي (حسب إعدادات النظام)
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">لون المظهر</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {colorThemes.map((theme) => (
              <div
                key={theme.id}
                onClick={() => handleChange("colorTheme", theme.id)}
                className={`
                  rounded-lg p-4 cursor-pointer transition-all h-24
                  ${themeSettings.colorTheme === theme.id ? 'ring-2 ring-offset-2 ring-black dark:ring-white' : ''}
                `}
                style={{ backgroundColor: theme.bgColor }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex mb-2">
                    <div
                      className="h-3 w-6 rounded-full mr-1"
                      style={{ backgroundColor: theme.primaryColor }}
                    ></div>
                    <div
                      className="h-3 w-4 rounded-full"
                      style={{ backgroundColor: theme.accentColor }}
                    ></div>
                  </div>
                  <span
                    className="font-medium"
                    style={{ color: theme.textColor }}
                  >
                    {theme.name}
                  </span>
                  <div className="mt-auto">
                    <Palette size={14} style={{ color: theme.textColor }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">حجم الخط</h3>
          
          <RadioGroup
            value={themeSettings.fontSize}
            onValueChange={(value) => handleChange("fontSize", value)}
            className="flex space-x-4 space-x-reverse"
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="small" id="font-small" />
              <Label htmlFor="font-small" className="cursor-pointer text-sm">
                صغير
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="medium" id="font-medium" />
              <Label htmlFor="font-medium" className="cursor-pointer">
                متوسط
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="large" id="font-large" />
              <Label htmlFor="font-large" className="cursor-pointer text-lg">
                كبير
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">استدارة الزوايا</h3>
          
          <RadioGroup
            value={themeSettings.borderRadius}
            onValueChange={(value) => handleChange("borderRadius", value)}
            className="flex space-x-4 space-x-reverse"
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="none" id="radius-none" />
              <Label htmlFor="radius-none" className="cursor-pointer">
                بدون استدارة
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="small" id="radius-small" />
              <Label htmlFor="radius-small" className="cursor-pointer">
                قليلة
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="medium" id="radius-medium" />
              <Label htmlFor="radius-medium" className="cursor-pointer">
                متوسطة
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="large" id="radius-large" />
              <Label htmlFor="radius-large" className="cursor-pointer">
                كبيرة
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading ? 'جاري الحفظ...' : 'حفظ إعدادات المظهر'}
        <Save size={16} className="mr-2" />
      </Button>
    </form>
  );
};

export default ThemeSettings;
