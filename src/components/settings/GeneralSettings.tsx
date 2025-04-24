import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Save, Store, Globe, Upload, Shield, AlertCircle, Info, ShoppingBag, DollarSign, Clock, MapPin, Phone, Mail } from "lucide-react";
import countries from "@/lib/data/countries";
import currencies from "@/lib/data/currencies";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

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
}

const GeneralSettings = ({ office }: { office: any }) => {
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  
  const [settings, setSettings] = useState({
    store_name: office?.settings?.general?.store_name || office?.name || "",
    store_slug: office?.settings?.general?.store_slug || office?.slug || "",
    store_logo: office?.settings?.general?.store_logo || office?.logo_url || "",
    store_favicon: office?.settings?.general?.store_favicon || "",
    store_url: office?.settings?.general?.store_url || "",
    store_email: office?.settings?.general?.store_email || "",
    store_phone: office?.settings?.general?.store_phone || "",
    store_address: office?.settings?.general?.store_address || "",
    store_description: office?.settings?.general?.store_description || "",
    country: office?.settings?.general?.country || "SA",
    currency: office?.settings?.general?.currency || "SAR",
    timezone: office?.settings?.general?.timezone || "",
    allow_guest_checkout: office?.settings?.general?.allow_guest_checkout !== false,
    require_phone: office?.settings?.general?.require_phone !== false,
    allow_cash_on_delivery: office?.settings?.general?.allow_cash_on_delivery !== false,
    min_order_amount: office?.settings?.general?.min_order_amount || 0,
    show_out_of_stock: office?.settings?.general?.show_out_of_stock !== false,
    store_active: office?.settings?.general?.store_active !== false,
    maintenance_mode: office?.settings?.general?.maintenance_mode || false,
    maintenance_message: office?.settings?.general?.maintenance_message || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    contactEmail: office?.settings?.general?.contactEmail || "",
    business_type: office?.settings?.general?.business_type || "retail"
  });

  const businessTypes = [
    { id: "retail", name: "متجر تجزئة" },
    { id: "wholesale", name: "تجارة جملة" },
    { id: "service", name: "خدمات" },
    { id: "manufacturing", name: "تصنيع" },
    { id: "other", name: "أخرى" }
  ];

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === "country") {
      const selectedCountry = countries.find(c => c.code === value);
      if (selectedCountry) {
        setSettings(prev => ({
          ...prev,
          currency: selectedCountry.currency
        }));
      }
    }
  };

  const handleActiveChange = (checked: boolean) => {
    if (checked) {
      setSettings(prev => ({
        ...prev,
        store_active: true,
        maintenance_mode: false
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        store_active: false
      }));
    }
  };

  const handleMaintenanceChange = (checked: boolean) => {
    if (checked) {
      setSettings(prev => ({
        ...prev,
        maintenance_mode: true,
        store_active: false
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        maintenance_mode: false
      }));
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    if (!fileType.startsWith('image/')) {
      toast.error("يرجى اختيار ملف صورة صالح");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      toast.error("حجم الملف كبير جدًا. الحد الأقصى هو 1 ميجابايت");
      return;
    }

    setLogoUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${office.id}/logo-${Date.now()}.${fileExt}`;
      const filePath = `offices/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('public').getPublicUrl(filePath);
      
      if (data) {
        handleChange('store_logo', data.publicUrl);
        toast.success("تم رفع الشعار بنجاح");
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء رفع الشعار");
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!settings.store_name.trim()) {
        throw new Error("يجب إدخال اسم المتجر");
      }

      if (!settings.store_slug.trim()) {
        throw new Error("يجب إدخال الرابط المخصص للمتجر");
      }

      if (!/^[a-z0-9-]+$/.test(settings.store_slug)) {
        throw new Error("الرابط المخصص يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطات فقط");
      }

      if (settings.store_slug !== office?.slug) {
        const { data: existingOffice, error: slugCheckError } = await supabase
          .from("offices")
          .select("id")
          .eq("slug", settings.store_slug)
          .not("id", "eq", office?.id)
          .single();

        if (existingOffice) {
          throw new Error("الرابط المخصص مستخدم بالفعل. يرجى اختيار رابط آخر");
        }
      }

      const { error } = await supabase
        .from("offices")
        .update({
          name: settings.store_name,
          slug: settings.store_slug,
          settings: {
            ...(office?.settings || {}),
            general: {
              ...settings,
              updated_at: new Date().toISOString()
            }
          } as any
        })
        .eq("id", office.id);

      if (error) throw error;
      
      toast.success("تم تحديث الإعدادات العامة بنجاح");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحديث الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (settings.newPassword !== settings.confirmPassword) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: settings.newPassword
      });
      
      if (error) throw error;
      
      setSettings(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      
      setShowPasswordDialog(false);
      
      toast.success("تم تغيير كلمة المرور بنجاح");
    } catch (error: any) {
      toast.error(error.message || "فشل تغيير كلمة المرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">الإعدادات العامة</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg font-medium">معلومات المتجر الأساسية</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="store_name" className="flex items-center gap-2">
                    <ShoppingBag size={16} /> اسم المتجر
                  </Label>
                  <Input
                    id="store_name"
                    value={settings.store_name}
                    onChange={(e) => handleChange("store_name", e.target.value)}
                    placeholder="متجر عربي"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="store_url" className="flex items-center gap-2">
                    <Globe size={16} /> رابط المتجر
                  </Label>
                  <Input
                    id="store_url"
                    value={settings.store_url}
                    onChange={(e) => handleChange("store_url", e.target.value)}
                    placeholder="my-store"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    سيكون رابط متجرك: arab-data.com/stores/{settings.store_slug || "my-store"}
                  </p>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="store_description">وصف المتجر</Label>
                <Textarea
                  id="store_description"
                  value={settings.store_description}
                  onChange={(e) => handleChange("store_description", e.target.value)}
                  placeholder="وصف قصير للمتجر يظهر في نتائج البحث"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg font-medium">شعار وأيقونة المتجر</h3>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>شعار المتجر</Label>
                  <div className="flex flex-col items-center gap-4">
                    {settings.store_logo ? (
                      <div className="relative">
                        <img 
                          src={settings.store_logo} 
                          alt="شعار المتجر"
                          className="h-24 w-auto object-contain border rounded p-2"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                          onClick={() => handleChange("store_logo", "")}
                        >
                          X
                        </Button>
                      </div>
                    ) : (
                      <div className="h-24 w-full border-2 border-dashed rounded-md flex items-center justify-center bg-muted/20">
                        <ShoppingBag size={40} className="text-muted-foreground" />
                      </div>
                    )}
                    
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                      >
                        <Upload size={16} className="ml-2" />
                        {settings.store_logo ? 'تغيير الشعار' : 'رفع شعار'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        يفضل صورة بحجم 200×200 بيكسل بتنسيق PNG أو JPG
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>أيقونة المتجر (Favicon)</Label>
                  <div className="flex flex-col items-center gap-4">
                    {settings.store_favicon ? (
                      <div className="relative">
                        <img 
                          src={settings.store_favicon} 
                          alt="أيقونة المتجر"
                          className="h-16 w-16 object-contain border rounded p-1"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                          onClick={() => handleChange("store_favicon", "")}
                        >
                          X
                        </Button>
                      </div>
                    ) : (
                      <div className="h-16 w-16 border-2 border-dashed rounded-md flex items-center justify-center bg-muted/20">
                        <ShoppingBag size={24} className="text-muted-foreground" />
                      </div>
                    )}
                    
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/x-icon,image/jpeg"
                        className="hidden"
                        onChange={handleLogoUpload}
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                      >
                        <Upload size={16} className="ml-2" />
                        {settings.store_favicon ? 'تغيير الأيقونة' : 'رفع أيقونة'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        يفضل صورة مربعة 32×32 بيكسل بتنسيق ICO أو PNG
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg font-medium">معلومات الاتصال</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="store_email" className="flex items-center gap-2">
                    <Mail size={16} /> البريد الإلكتروني
                  </Label>
                  <Input
                    id="store_email"
                    type="email"
                    value={settings.store_email}
                    onChange={(e) => handleChange("store_email", e.target.value)}
                    placeholder="info@example.com"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="store_phone" className="flex items-center gap-2">
                    <Phone size={16} /> رقم الهاتف
                  </Label>
                  <Input
                    id="store_phone"
                    value={settings.store_phone}
                    onChange={(e) => handleChange("store_phone", e.target.value)}
                    placeholder="966500000000"
                  />
                </div>
                
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="store_address" className="flex items-center gap-2">
                    <MapPin size={16} /> العنوان
                  </Label>
                  <Textarea
                    id="store_address"
                    value={settings.store_address}
                    onChange={(e) => handleChange("store_address", e.target.value)}
                    placeholder="عنوان المتجر"
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg font-medium">المنطقة والعملة</h3>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="country" className="flex items-center gap-2">
                    <Globe size={16} /> الدولة
                  </Label>
                  <Select
                    value={settings.country}
                    onValueChange={(value) => handleChange("country", value)}
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="اختر الدولة" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      <SelectItem value="">اختر الدولة</SelectItem>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name} ({country.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="currency" className="flex items-center gap-2">
                    <DollarSign size={16} /> العملة
                  </Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => handleChange("currency", value)}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="اختر العملة" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      <SelectItem value="">اختر العملة</SelectItem>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.name} ({currency.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="timezone" className="flex items-center gap-2">
                    <Clock size={16} /> المنطقة الزمنية
                  </Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => handleChange("timezone", value)}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="اختر المنطقة الزمنية" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      <SelectItem value="">اختر المنطقة الزمنية</SelectItem>
                      <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Dubai">دبي (GMT+4)</SelectItem>
                      <SelectItem value="Africa/Cairo">القاهرة (GMT+2)</SelectItem>
                      <SelectItem value="Asia/Baghdad">بغداد (GMT+3)</SelectItem>
                      <SelectItem value="Africa/Casablanca">الدار البيضاء (GMT+1)</SelectItem>
                      <SelectItem value="Asia/Amman">عمان (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Beirut">بيروت (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Qatar">الدوحة (GMT+3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Shield size={18} /> وضع الصيانة
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    عند تفعيل وضع الصيانة، لن يتمكن الزوار من تصفح متجرك
                  </p>
                </div>
                <Switch
                  id="maintenance_mode"
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => handleChange("maintenance_mode", checked)}
                />
              </div>
              
              {settings.maintenance_mode && (
                <div className="pt-2">
                  <Label htmlFor="maintenance_message">رسالة الصيانة</Label>
                  <Textarea
                    id="maintenance_message"
                    value={settings.maintenance_message}
                    onChange={(e) => handleChange("maintenance_message", e.target.value)}
                    placeholder="المتجر قيد الصيانة حاليًا، يرجى العودة لاحقًا"
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات العامة'}
              <Save size={16} className="mr-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeneralSettings;
