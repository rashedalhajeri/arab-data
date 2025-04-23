import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Save, Palette, Check } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// الألوان المتاحة للمتجر
const themeColors = [
  { name: "أزرق", primary: "#1E40AF", secondary: "#3B82F6" },
  { name: "أخضر", primary: "#047857", secondary: "#10B981" },
  { name: "أحمر", primary: "#B91C1C", secondary: "#EF4444" },
  { name: "أرجواني", primary: "#6D28D9", secondary: "#8B5CF6" },
  { name: "وردي", primary: "#BE185D", secondary: "#EC4899" },
  { name: "برتقالي", primary: "#C2410C", secondary: "#F97316" },
  { name: "بني", primary: "#78350F", secondary: "#B45309" },
  { name: "رمادي", primary: "#374151", secondary: "#6B7280" },
];

// مخططات الألوان للمتجر
const colorSchemes = [
  { id: "light", name: "فاتح" },
  { id: "dark", name: "داكن" },
  { id: "system", name: "حسب النظام" },
];

// تخطيطات الصفحة الرئيسية
const homeLayouts = [
  { id: "grid", name: "شبكة" },
  { id: "list", name: "قائمة" },
  { id: "gallery", name: "معرض" },
];

const ThemeSettings = ({ office }: { office: any }) => {
  const [loading, setLoading] = useState(false);
  
  // تهيئة إعدادات الثيم
  const [themeSettings, setThemeSettings] = useState({
    primary_color: office?.settings?.theme?.primary_color || "#1E40AF",
    secondary_color: office?.settings?.theme?.secondary_color || "#3B82F6",
    accent_color: office?.settings?.theme?.accent_color || "#F9A8D4",
    color_scheme: office?.settings?.theme?.color_scheme || "light",
    font_family: office?.settings?.theme?.font_family || "cairo",
    background_color: office?.settings?.theme?.background_color || "#FFFFFF",
    text_color: office?.settings?.theme?.text_color || "#1F2937",
    home_layout: office?.settings?.theme?.home_layout || "grid",
    product_layout: office?.settings?.theme?.product_layout || "grid",
    border_radius: office?.settings?.theme?.border_radius || "md",
    hide_out_of_stock: office?.settings?.theme?.hide_out_of_stock !== false,
    show_related_products: office?.settings?.theme?.show_related_products !== false,
    rtl: office?.settings?.theme?.rtl !== false,
    custom_css: office?.settings?.theme?.custom_css || "",
  });

  // تغيير قيمة الحقل
  const handleChange = (field: string, value: any) => {
    setThemeSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // اختيار لون مسبق
  const handlePredefinedColorSelect = (primary: string, secondary: string) => {
    setThemeSettings(prev => ({
      ...prev,
      primary_color: primary,
      secondary_color: secondary
    }));
  };

  // حفظ الإعدادات
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // التحقق من صحة CSS المخصص إذا تم إدخاله
      if (themeSettings.custom_css) {
        try {
          new CSSStyleSheet().replaceSync(themeSettings.custom_css);
        } catch (cssError) {
          throw new Error("CSS المخصص غير صالح. يرجى التحقق من الصيغة");
        }
      }

      // تحديث الإعدادات في قاعدة البيانات
      const { error } = await supabase.from("offices").update({
        settings: {
          ...(office?.settings || {}),
          theme: {
            ...themeSettings,
            updated_at: new Date().toISOString()
          }
        }
      }).eq("id", office.id);

      if (error) throw error;
      
      toast.success("تم تحديث إعدادات الثيم بنجاح");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحديث الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  // تحديث متغيرات CSS للمعاينة الفورية
  useEffect(() => {
    // تحديث متغيرات CSS للألوان
    document.documentElement.style.setProperty('--preview-primary-color', themeSettings.primary_color);
    document.documentElement.style.setProperty('--preview-secondary-color', themeSettings.secondary_color);
    document.documentElement.style.setProperty('--preview-accent-color', themeSettings.accent_color);
    document.documentElement.style.setProperty('--preview-bg-color', themeSettings.background_color);
    document.documentElement.style.setProperty('--preview-text-color', themeSettings.text_color);
    
    return () => {
      // إزالة المتغيرات عند مغادرة المكون
      document.documentElement.style.removeProperty('--preview-primary-color');
      document.documentElement.style.removeProperty('--preview-secondary-color');
      document.documentElement.style.removeProperty('--preview-accent-color');
      document.documentElement.style.removeProperty('--preview-bg-color');
      document.documentElement.style.removeProperty('--preview-text-color');
    };
  }, [themeSettings]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">إعدادات الثيم</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* الألوان الرئيسية */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg font-medium">الألوان الرئيسية</h3>
              
              {/* ألوان مسبقة */}
              <div className="space-y-2">
                <Label>اختيار لون مسبق</Label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {themeColors.map((color) => (
                    <div 
                      key={color.name}
                      className="relative cursor-pointer"
                      onClick={() => handlePredefinedColorSelect(color.primary, color.secondary)}
                    >
                      <div 
                        className="h-10 w-10 rounded-full border-2"
                        style={{ 
                          background: `linear-gradient(135deg, ${color.primary} 0%, ${color.secondary} 100%)`,
                          borderColor: themeSettings.primary_color === color.primary ? color.primary : 'transparent'
                        }}
                      />
                      {themeSettings.primary_color === color.primary && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <span className="text-xs text-center block mt-1">{color.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-3">
                {/* اللون الرئيسي */}
                <div className="grid gap-2">
                  <Label htmlFor="primary-color">اللون الرئيسي</Label>
                  <div className="flex gap-2">
                    <div 
                      className="h-9 w-9 rounded border"
                      style={{ backgroundColor: themeSettings.primary_color }}
                    />
                    <Input
                      id="primary-color"
                      type="text"
                      value={themeSettings.primary_color}
                      onChange={(e) => handleChange("primary_color", e.target.value)}
                      placeholder="#1E40AF"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                {/* اللون الثانوي */}
                <div className="grid gap-2">
                  <Label htmlFor="secondary-color">اللون الثانوي</Label>
                  <div className="flex gap-2">
                    <div 
                      className="h-9 w-9 rounded border"
                      style={{ backgroundColor: themeSettings.secondary_color }}
                    />
                    <Input
                      id="secondary-color"
                      type="text"
                      value={themeSettings.secondary_color}
                      onChange={(e) => handleChange("secondary_color", e.target.value)}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                {/* لون التمييز */}
                <div className="grid gap-2">
                  <Label htmlFor="accent-color">لون التمييز</Label>
                  <div className="flex gap-2">
                    <div 
                      className="h-9 w-9 rounded border"
                      style={{ backgroundColor: themeSettings.accent_color }}
                    />
                    <Input
                      id="accent-color"
                      type="text"
                      value={themeSettings.accent_color}
                      onChange={(e) => handleChange("accent_color", e.target.value)}
                      placeholder="#F9A8D4"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {/* لون الخلفية */}
                <div className="grid gap-2">
                  <Label htmlFor="background-color">لون الخلفية</Label>
                  <div className="flex gap-2">
                    <div 
                      className="h-9 w-9 rounded border"
                      style={{ backgroundColor: themeSettings.background_color }}
                    />
                    <Input
                      id="background-color"
                      type="text"
                      value={themeSettings.background_color}
                      onChange={(e) => handleChange("background_color", e.target.value)}
                      placeholder="#FFFFFF"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                {/* لون النص */}
                <div className="grid gap-2">
                  <Label htmlFor="text-color">لون النص</Label>
                  <div className="flex gap-2">
                    <div 
                      className="h-9 w-9 rounded border"
                      style={{ backgroundColor: themeSettings.text_color }}
                    />
                    <Input
                      id="text-color"
                      type="text"
                      value={themeSettings.text_color}
                      onChange={(e) => handleChange("text_color", e.target.value)}
                      placeholder="#1F2937"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              {/* مخطط الألوان */}
              <div className="grid gap-2">
                <Label htmlFor="color-scheme">مخطط الألوان</Label>
                <RadioGroup 
                  value={themeSettings.color_scheme}
                  onValueChange={(value) => handleChange("color_scheme", value)}
                  className="flex flex-wrap gap-4"
                >
                  {colorSchemes.map((scheme) => (
                    <div key={scheme.id} className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value={scheme.id} id={`color-scheme-${scheme.id}`} />
                      <Label htmlFor={`color-scheme-${scheme.id}`}>{scheme.name}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* الخط والتصميم */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg font-medium">الخط والتصميم</h3>
              
              <div className="space-y-4">
                {/* العائلة الخطية */}
                <div className="grid gap-2">
                  <Label htmlFor="font-family">الخط</Label>
                  <select
                    id="font-family"
                    value={themeSettings.font_family}
                    onChange={(e) => handleChange("font_family", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="cairo">Cairo</option>
                    <option value="tajawal">Tajawal</option>
                    <option value="almarai">Almarai</option>
                    <option value="readex">Readex Pro</option>
                    <option value="ibm">IBM Plex Arabic</option>
                  </select>
                </div>
                
                {/* تخطيط الصفحة الرئيسية */}
                <div className="grid gap-2">
                  <Label htmlFor="home-layout">تخطيط الصفحة الرئيسية</Label>
                  <RadioGroup 
                    value={themeSettings.home_layout}
                    onValueChange={(value) => handleChange("home_layout", value)}
                    className="flex flex-wrap gap-4"
                  >
                    {homeLayouts.map((layout) => (
                      <div key={layout.id} className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value={layout.id} id={`home-layout-${layout.id}`} />
                        <Label htmlFor={`home-layout-${layout.id}`}>{layout.name}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                {/* تخطيط صفحة المنتج */}
                <div className="grid gap-2">
                  <Label htmlFor="product-layout">تخطيط صفحة المنتج</Label>
                  <RadioGroup 
                    value={themeSettings.product_layout}
                    onValueChange={(value) => handleChange("product_layout", value)}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="grid" id="product-layout-grid" />
                      <Label htmlFor="product-layout-grid">شبكة</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="carousel" id="product-layout-carousel" />
                      <Label htmlFor="product-layout-carousel">شريط متحرك</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* حواف مستديرة */}
                <div className="grid gap-2">
                  <Label htmlFor="border-radius">حواف مستديرة</Label>
                  <RadioGroup 
                    value={themeSettings.border_radius}
                    onValueChange={(value) => handleChange("border_radius", value)}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="none" id="border-radius-none" />
                      <Label htmlFor="border-radius-none">بدون</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="sm" id="border-radius-sm" />
                      <Label htmlFor="border-radius-sm">صغير</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="md" id="border-radius-md" />
                      <Label htmlFor="border-radius-md">متوسط</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="lg" id="border-radius-lg" />
                      <Label htmlFor="border-radius-lg">كبير</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="full" id="border-radius-full" />
                      <Label htmlFor="border-radius-full">دائري</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* اتجاه من اليمين إلى اليسار (RTL) */}
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id="rtl"
                    checked={themeSettings.rtl}
                    onChange={(e) => handleChange("rtl", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <Label htmlFor="rtl">اتجاه من اليمين إلى اليسار (RTL)</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* إعدادات إضافية */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg font-medium">إعدادات إضافية</h3>
              
              <div className="space-y-4">
                {/* إخفاء المنتجات غير المتوفرة */}
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id="hide-out-of-stock"
                    checked={themeSettings.hide_out_of_stock}
                    onChange={(e) => handleChange("hide_out_of_stock", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <Label htmlFor="hide-out-of-stock">إخفاء المنتجات غير المتوفرة</Label>
                </div>
                
                {/* عرض المنتجات ذات الصلة */}
                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id="show-related-products"
                    checked={themeSettings.show_related_products}
                    onChange={(e) => handleChange("show_related_products", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                  />
                  <Label htmlFor="show-related-products">عرض المنتجات ذات الصلة</Label>
                </div>
                
                {/* CSS مخصص */}
                <div className="grid gap-2">
                  <Label htmlFor="custom-css">CSS مخصص</Label>
                  <textarea
                    id="custom-css"
                    value={themeSettings.custom_css}
                    onChange={(e) => handleChange("custom_css", e.target.value)}
                    rows={6}
                    placeholder=".my-class { color: red; }"
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                  />
                  <p className="text-xs text-muted-foreground">أضف CSS مخصصًا لتخصيص متجرك بشكل إضافي. سيتم تطبيق هذا على جميع صفحات المتجر.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* معاينة */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">معاينة</h3>
              
              <div className="rounded-lg overflow-hidden border shadow-sm p-4">
                <div className="flex justify-between items-center mb-4" style={{ 
                  backgroundColor: 'var(--preview-bg-color, #fff)', 
                  color: 'var(--preview-text-color, #1F2937)' 
                }}>
                  <div className="font-bold">متجري</div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                    <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                  </div>
                </div>
                
                <div className="space-y-4" style={{ 
                  backgroundColor: 'var(--preview-bg-color, #fff)', 
                  color: 'var(--preview-text-color, #1F2937)' 
                }}>
                  <div 
                    className="rounded-md p-3 text-white flex justify-center items-center"
                    style={{ backgroundColor: 'var(--preview-primary-color, #1E40AF)' }}
                  >
                    زر رئيسي
                  </div>
                  
                  <div 
                    className="rounded-md p-3 text-white flex justify-center items-center"
                    style={{ backgroundColor: 'var(--preview-secondary-color, #3B82F6)' }}
                  >
                    زر ثانوي
                  </div>
                  
                  <div 
                    className="rounded-md p-3 flex justify-center items-center"
                    style={{ 
                      backgroundColor: 'var(--preview-accent-color, #F9A8D4)',
                      color: 'var(--preview-text-color, #1F2937)'
                    }}
                  >
                    عنصر مميز
                  </div>
                  
                  <div className="flex justify-around">
                    <div className="w-16 h-16 rounded-md bg-gray-200"></div>
                    <div className="w-16 h-16 rounded-md bg-gray-200"></div>
                    <div className="w-16 h-16 rounded-md bg-gray-200"></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">هذه معاينة مبسطة. قد يختلف الشكل النهائي للمتجر.</p>
            </CardContent>
          </Card>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full sm:w-auto"
              disabled={loading}
              style={{ 
                background: `linear-gradient(135deg, ${themeSettings.primary_color} 0%, ${themeSettings.secondary_color} 100%)`,
                color: 'white',
                border: 'none'
              }}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ إعدادات الثيم'}
              <Palette size={16} className="mr-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThemeSettings; 