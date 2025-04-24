
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import SimpleImageUpload from '@/components/SimpleImageUpload';
import { useForm } from 'react-hook-form';

const countries = [
  { code: "SA", name: "السعودية", currency: "SAR", dial: "+966" },
  { code: "KW", name: "الكويت", currency: "KWD", dial: "+965" },
  { code: "AE", name: "الإمارات", currency: "AED", dial: "+971" },
  { code: "QA", name: "قطر", currency: "QAR", dial: "+974" },
  { code: "OM", name: "عمان", currency: "OMR", dial: "+968" },
  { code: "BH", name: "البحرين", currency: "BHD", dial: "+973" },
];

const phoneLengths: Record<string, number> = {
  SA: 9,
  KW: 8,
  AE: 9,
  QA: 8,
  OM: 8,
  BH: 8,
};

interface CreateOfficeFormProps {
  loading: boolean;
  onSubmit: (data: any) => Promise<void>;
  slugAvailable: boolean | null;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
}

export function CreateOfficeForm({ loading, onSubmit, slugAvailable, errors, setErrors }: CreateOfficeFormProps) {
  const form = useForm();
  
  const validateForm = (data: any) => {
    const e: Record<string, string> = {};
    if (!data.name?.trim()) e.name = "الاسم التجاري مطلوب";
    if (!data.slug?.trim()) e.slug = "اسم الرابط مطلوب";
    else if (!/^[a-z0-9\-]+$/.test(data.slug)) e.slug = "اسم الرابط يجب أن يكون بالإنجليزية وحروف صغيرة وأرقام وشرطات فقط";
    else if (slugAvailable === false) e.slug = "اسم الرابط غير متاح، الرجاء اختيار اسم آخر";
    if (!data.country) e.country = "الدولة مطلوبة";
    if (!data.phone?.trim()) e.phone = "رقم الهاتف مطلوب";
    else if (data.country && phoneLengths[data.country] && data.phone.length !== phoneLengths[data.country])
      e.phone = `رقم الهاتف يجب أن يتكون من ${phoneLengths[data.country]} أرقام`;
    else if (!/^\d+$/.test(data.phone)) e.phone = "رقم الهاتف يجب أن يكون أرقام فقط";
    if (!data.logo) e.logo = "شعار المكتب مطلوب";
    if (!data.cover) e.cover = "الغلاف مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFormSubmit = async (data: any) => {
    if (validateForm(data)) {
      await onSubmit(data);
    }
  };

  const slugBase = "ad51.me/";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex flex-col gap-4 mt-2" autoComplete="off" dir="rtl">
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">الاسم التجاري</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="مثال: معرض التميز الحديث"
                  onChange={e => {
                    field.onChange(e);
                    setErrors(prev => ({ ...prev, name: "" }));
                  }}
                />
              </FormControl>
              {errors.name && <div className="text-destructive text-xs font-bold mt-1">{errors.name}</div>}
            </FormItem>
          )}
        />

        <FormField
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">اسم الرابط</FormLabel>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-500 rounded bg-gray-100 px-2 py-1">{slugBase}</span>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="carshow123"
                    pattern="^[a-z0-9\-]+$"
                    className="ltr text-left"
                    dir="ltr"
                    maxLength={30}
                    onChange={e => {
                      const value = e.target.value.replace(/[^a-zA-Z0-9\-]/g, "").toLowerCase();
                      field.onChange(value);
                      setErrors(prev => ({ ...prev, slug: "" }));
                    }}
                  />
                </FormControl>
                {field.value?.length >= 3 && (
                  <span className={`text-xs font-bold ${slugAvailable == null ? "text-gray-400" : slugAvailable ? "text-green-600" : "text-red-600"}`}>
                    {slugAvailable == null ? "" : slugAvailable ? "متاح" : "غير متاح"}
                  </span>
                )}
              </div>
              {errors.slug && <div className="text-destructive text-xs font-bold mt-1">{errors.slug}</div>}
            </FormItem>
          )}
        />

        <FormField
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">الدولة</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={(value) => {
                  field.onChange(value);
                  setErrors(prev => ({...prev, country:""}));
                }}
              >
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
            </FormItem>
          )}
        />

        <FormField
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">رقم الهاتف</FormLabel>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {countries.find(c => c.code === form.getValues("country"))?.dial ?? ""}
                </span>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    placeholder={form.getValues("country") === "KW" ? "5xxxxxxx" : 
                               form.getValues("country") === "SA" ? "5xxxxxxxx" :
                               form.getValues("country") === "AE" ? "5xxxxxxxx" : "xxxxxxxx"}
                    maxLength={form.getValues("country") && phoneLengths[form.getValues("country")] 
                      ? phoneLengths[form.getValues("country")] 
                      : 9}
                    onChange={e => {
                      const digits = e.target.value.replace(/\D/g, "");
                      field.onChange(digits);
                      setErrors(prev => ({ ...prev, phone: "" }));
                    }}
                  />
                </FormControl>
              </div>
              {errors.phone && <div className="text-destructive text-xs font-bold mt-1">{errors.phone}</div>}
            </FormItem>
          )}
        />

        <FormField
          name="logo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">شعار المكتب</FormLabel>
              <SimpleImageUpload
                title="رفع شعار المكتب"
                subtitle="يفضل أن يكون الشعار مربع الشكل"
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  setErrors(prev => ({ ...prev, logo: "" }));
                }}
                imageType="logo"
              />
              {errors.logo && <div className="text-destructive text-xs font-bold mt-1">{errors.logo}</div>}
            </FormItem>
          )}
        />

        <FormField
          name="cover"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">صورة الغلاف</FormLabel>
              <SimpleImageUpload
                title="رفع صورة الغلاف"
                subtitle="يفضل أن تكون الصورة بنسبة 16:9"
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  setErrors(prev => ({ ...prev, cover: "" }));
                }}
                imageType="cover"
                aspectRatio={16/9}
              />
              {errors.cover && <div className="text-destructive text-xs font-bold mt-1">{errors.cover}</div>}
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full rounded-full font-bold mt-4" disabled={loading}>
          {loading ? "جاري الإنشاء..." : "إنشاء الصفحة"}
        </Button>
      </form>
    </Form>
  );
}
