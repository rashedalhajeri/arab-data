
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Save, 
  Palette, 
  Layout, 
  Grid3X3, 
  Columns, 
  AlignLeft,
  Moon,
  Sun
} from "lucide-react";

// تعريف نوع المكتب المعزز بإعدادات التصميم
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

interface ColorOption {
  id: string;
  name: string;
  value: string;
  contrastText: string;
}

const DesignSettings = ({ office }: { office: Office }) => {
  const [loading, setLoading] = useState(false);
  
  // تهيئة إعدادات التصميم
  const [designSettings, setDesignSettings] = useState({
    theme: office?.settings?.design?.theme || "light",
    primaryColor: office?.settings?.design?.primaryColor || "blue",
    layout: office?.settings?.design?.layout || "default",
    cardStyle: office?.settings?.design?.cardStyle || "elevated",
    gridColumns: office?.settings?.design?.gridColumns || "3",
    rtl: office?.settings?.design?.rtl !== false, // افتراضي true
    showFilters: office?.settings?.design?.showFilters !== false, // افتراضي true
    roundedCorners: office?.settings?.design?.roundedCorners !== false, // افتراضي true
    menuPosition: office?.settings?.design?.menuPosition || "right",
  });

  // قائمة الألوان الرئيسية
  const primaryColors: ColorOption[] = [
    { id: "blue", name: "أزرق", value: "#3b82f6", contrastText: "#ffffff" },
    { id: "purple", name: "أرجواني", value: "#8b5cf6", contrastText: "#ffffff" },
    { id: "indigo", name: "نيلي", value: "#6366f1", contrastText: "#ffffff" },
    { id: "teal", name: "فيروزي", value: "#14b8a6", contrastText: "#ffffff" },
    { id: "green", name: "أخضر", value: "#22c55e", contrastText: "#ffffff" },
    { id: "red", name: "أحمر", value: "#ef4444", contrastText: "#ffffff" },
    { id: "orange", name: "برتقالي", value: "#f97316", contrastText: "#ffffff" },
    { id: "amber", name: "كهرماني", value: "#f59e0b", contrastText: "#000000" },
    { id: "pink", name: "وردي", value: "#ec4899", contrastText: "#ffffff" },
    { id: "gray", name: "رمادي", value: "#71717a", contrastText: "#ffffff" },
  ];

  // خيارات تخطيط الصفحة
  const layoutOptions = [
    { id: "default", name: "عادي", icon: <Layout className="h-5 w-5" /> },
    { id: "wide", name: "عريض", icon: <Columns className="h-5 w-5" /> },
    { id: "compact", name: "مضغوط", icon: <AlignLeft className="h-5 w-5" /> },
  ];

  // خيارات نمط البطاقات
  const cardStyleOptions = [
    { id: "elevated", name: "بارز" },
    { id: "flat", name: "مسطح" },
    { id: "outline", name: "حدود" },
  ];

  // خيارات أعمدة العرض
  const gridColumnsOptions = [
    { id: "2", name: "عمودين" },
    { id: "3", name: "3 أعمدة" },
    { id: "4", name: "4 أعمدة" },
  ];

  // موقع القائمة
  const menuPositionOptions = [
    { id: "right", name: "يمين" },
    { id: "left", name: "يسار" },
  ];

  // تغيير الإعدادات
  const handleChange = (field: string, value: any) => {
    setDesignSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // حفظ إعدادات التصميم
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // استخدام type assertion لإخبار TypeScript أن office يحتوي على إعدادات
      const updatedOffice = {
        ...office,
        settings: {
          ...(office?.settings || {}),
          design: {
            ...designSettings,
            updated_at: new Date().toISOString()
          }
        }
      };

      const { error } = await supabase.from("offices").update({
        // تحويل صريح لمنع أخطاء TypeScript
        settings: updatedOffice.settings
      } as any).eq("id", office?.id);

      if (error) throw error;
      
      toast.success("تم تحديث إعدادات التصميم بنجاح");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحديث الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">إعدادات التصميم</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* وضع السمة */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg font-medium">وضع السمة</h3>
              
              <RadioGroup 
                value={designSettings.theme} 
                onValueChange={(value) => handleChange("theme", value)}
                className="flex space-x-4 space-x-reverse"
              >
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="light" id="theme-light" />
                  <Label htmlFor="theme-light" className="flex items-center cursor-pointer">
                    <Sun className="h-5 w-5 mr-2" />
                    فاتح
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="dark" id="theme-dark" />
                  <Label htmlFor="theme-dark" className="flex items-center cursor-pointer">
                    <Moon className="h-5 w-5 mr-2" />
                    داكن
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="system" id="theme-system" />
                  <Label htmlFor="theme-system" className="cursor-pointer">
                    تلقائي (حسب النظام)
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* اللون الرئيسي */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg font-medium">اللون الرئيسي</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {primaryColors.map((color) => (
                  <div
                    key={color.id}
                    onClick={() => handleChange("primaryColor", color.id)}
                    className={`
                      cursor-pointer rounded-lg p-3 h-16
                      ${designSettings.primaryColor === color.id ? 'ring-2 ring-offset-2 ring-black dark:ring-white' : ''}
                    `}
                    style={{ 
                      backgroundColor: color.value,
                      color: color.contrastText
                    }}
                  >
                    <div className="flex flex-col h-full justify-between">
                      <Palette className="h-4 w-4 self-end" />
                      <span className="font-medium">{color.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* تخطيط الصفحة وأنماط العرض */}
          <Card>
            <CardContent className="p-4 space-y-6">
              <Tabs defaultValue="layout" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="layout">تخطيط الصفحة</TabsTrigger>
                  <TabsTrigger value="cards">نمط البطاقات</TabsTrigger>
                  <TabsTrigger value="grid">شبكة المنتجات</TabsTrigger>
                </TabsList>
                
                <TabsContent value="layout" className="space-y-4">
                  <h3 className="text-lg font-medium">تخطيط الصفحة</h3>
                  
                  <RadioGroup 
                    value={designSettings.layout} 
                    onValueChange={(value) => handleChange("layout", value)}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  >
                    {layoutOptions.map((option) => (
                      <div key={option.id} className="relative">
                        <RadioGroupItem 
                          value={option.id} 
                          id={`layout-${option.id}`}
                          className="sr-only"
                        />
                        <Label
                          htmlFor={`layout-${option.id}`}
                          className={`
                            flex flex-col items-center justify-center h-28 p-4 rounded-lg border-2
                            ${designSettings.layout === option.id 
                              ? 'border-primary bg-primary/10' 
                              : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'}
                            cursor-pointer transition-all
                          `}
                        >
                          {option.icon}
                          <span className="mt-2">{option.name}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="menu-position" className="text-base">
                        موقع القائمة
                      </Label>
                      <RadioGroup 
                        value={designSettings.menuPosition} 
                        onValueChange={(value) => handleChange("menuPosition", value)}
                        className="flex space-x-4 space-x-reverse"
                      >
                        {menuPositionOptions.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2 space-x-reverse">
                            <RadioGroupItem value={option.id} id={`menu-${option.id}`} />
                            <Label htmlFor={`menu-${option.id}`} className="cursor-pointer">
                              {option.name}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="rtl-switch" className="text-base">
                        اتجاه يمين لليسار (RTL)
                      </Label>
                      <Switch
                        id="rtl-switch"
                        checked={designSettings.rtl}
                        onCheckedChange={(checked) => handleChange("rtl", checked)}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="cards" className="space-y-4">
                  <h3 className="text-lg font-medium">نمط البطاقات</h3>
                  
                  <RadioGroup 
                    value={designSettings.cardStyle} 
                    onValueChange={(value) => handleChange("cardStyle", value)}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  >
                    {cardStyleOptions.map((option) => (
                      <div key={option.id} className="relative">
                        <RadioGroupItem 
                          value={option.id} 
                          id={`card-${option.id}`}
                          className="sr-only"
                        />
                        <Label
                          htmlFor={`card-${option.id}`}
                          className={`
                            flex flex-col items-center justify-center p-4 h-28 rounded-lg
                            ${option.id === 'elevated' ? 'shadow-md' : ''} 
                            ${option.id === 'outline' ? 'border-2 border-gray-300 dark:border-gray-700' : ''}
                            ${option.id === 'flat' ? 'bg-gray-100 dark:bg-gray-800' : ''}
                            ${designSettings.cardStyle === option.id 
                              ? 'ring-2 ring-primary' 
                              : ''}
                            cursor-pointer transition-all
                          `}
                        >
                          <div className="w-10 h-10 rounded-md border border-gray-300 dark:border-gray-700 mb-2 flex items-center justify-center">
                            <Palette className="h-5 w-5 text-primary" />
                          </div>
                          <span>{option.name}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="rounded-corners" className="text-base">
                        زوايا مدورة
                      </Label>
                      <Switch
                        id="rounded-corners"
                        checked={designSettings.roundedCorners}
                        onCheckedChange={(checked) => handleChange("roundedCorners", checked)}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="grid" className="space-y-4">
                  <h3 className="text-lg font-medium">شبكة المنتجات</h3>
                  
                  <RadioGroup 
                    value={designSettings.gridColumns} 
                    onValueChange={(value) => handleChange("gridColumns", value)}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  >
                    {gridColumnsOptions.map((option) => (
                      <div key={option.id} className="relative">
                        <RadioGroupItem 
                          value={option.id} 
                          id={`grid-${option.id}`}
                          className="sr-only"
                        />
                        <Label
                          htmlFor={`grid-${option.id}`}
                          className={`
                            flex flex-col items-center justify-center p-4 h-28 rounded-lg border-2
                            ${designSettings.gridColumns === option.id 
                              ? 'border-primary bg-primary/10' 
                              : 'border-gray-200 dark:border-gray-800'}
                            cursor-pointer transition-all
                          `}
                        >
                          <Grid3X3 className="h-6 w-6 mb-2" />
                          <span>{option.name}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="show-filters" className="text-base">
                        إظهار خيارات التصفية
                      </Label>
                      <Switch
                        id="show-filters"
                        checked={designSettings.showFilters}
                        onCheckedChange={(checked) => handleChange("showFilters", checked)}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
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

export default DesignSettings;
