# تعليمات تطبيق جدول الفئات في Supabase

قم باتباع الخطوات التالية لإنشاء جدول الفئات وتكوين Supabase Storage:

## 1. إنشاء جدول الفئات

قم بتنفيذ SQL التالي في واجهة SQL Editor في Supabase:

```sql
-- إنشاء جدول الفئات
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  office_id UUID NOT NULL REFERENCES public.offices(id) ON DELETE CASCADE
);

-- تفعيل أمان مستوى الصفوف (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- السماح للمستخدمين برؤية فئاتهم الخاصة
CREATE POLICY "Users can view their own categories" 
  ON public.categories 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- السماح للمستخدمين بإنشاء فئاتهم الخاصة
CREATE POLICY "Users can insert their own categories" 
  ON public.categories 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- السماح للمستخدمين بتحديث فئاتهم الخاصة
CREATE POLICY "Users can update their own categories" 
  ON public.categories 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- السماح للمستخدمين بحذف فئاتهم الخاصة
CREATE POLICY "Users can delete their own categories" 
  ON public.categories 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- إنشاء فهرس على user_id لتحسين الأداء
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON public.categories(user_id);
-- إنشاء فهرس على office_id لتحسين الأداء
CREATE INDEX IF NOT EXISTS categories_office_id_idx ON public.categories(office_id);
```

## 2. إعداد Supabase Storage

قم بإنشاء مجلد في Supabase Storage اسمه "uploads" وضبط سياسات الوصول إليه:

1. انتقل إلى قسم "Storage" في لوحة التحكم Supabase
2. انقر على زر "Create Bucket"
3. اختر اسم المجلد "uploads"
4. فعل خيار "Public bucket" للسماح بالوصول العام للصور
5. أضف سياسات التخزين:

### سياسات التخزين للصور

- **اسم السياسة**: "Allow authenticated users to upload images"
- **المسموح**: INSERT
- **لمن**: authenticated
- **الشرط**: `true`

- **اسم السياسة**: "Allow public access to images"
- **المسموح**: SELECT
- **لمن**: public
- **الشرط**: `true`

هذه الإعدادات ستسمح للمستخدمين المسجلين برفع الصور وللجميع بعرضها. 