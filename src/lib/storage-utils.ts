
import { supabase } from "@/lib/supabase";

/**
 * يحصل على رابط عام للملف المخزن في Supabase Storage
 * مع التحقق من المسارات والمعالجة الآمنة للروابط
 */
export function getStorageUrl(path: string | null, bucket: string = 'office-assets'): string {
  // التعامل مع القيم الفارغة أو غير المحددة
  if (!path || path.trim() === '') return "/placeholder.svg";
  
  // إذا كان المسار عبارة عن URL كامل، نتحقق من أنه آمن ثم نعيده
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      // التحقق من صحة URL وتنظيفه
      const url = new URL(path);
      // يمكنك إضافة تحقق إضافي هنا للتأكد من أن النطاق موثوق به إذا لزم الأمر
      return url.toString();
    } catch (e) {
      console.error("Invalid URL provided:", path);
      return "/placeholder.svg";
    }
  }
  
  // تحديد اسم الخزان المناسب بناءً على مسار الصورة
  let actualBucket = bucket;
  if (path.startsWith('advertisements/')) {
    actualBucket = 'advertisements';
  }
  
  // تنظيف المسار وإزالة أي محاولات محتملة للتلاعب بالمسارات
  let cleanPath = path;
  if (path.startsWith(`${actualBucket}/`)) {
    cleanPath = path.slice(`${actualBucket}/`.length);
  }
  
  // تنظيف المسار من أي حروف خاصة قد تسبب مشاكل أمنية
  cleanPath = cleanPath.replace(/\.{2,}/g, '.')  // منع هجمات path traversal
                       .replace(/[\/\\]{2,}/g, '/'); // تنظيف المسارات المزدوجة
  
  // الحصول على الرابط العام للصورة
  try {
    const { data } = supabase.storage.from(actualBucket).getPublicUrl(cleanPath);
    
    // سجل الرابط للتصحيح
    console.log(`Generated URL for ${path} in bucket ${actualBucket}:`, data?.publicUrl);
    
    return data?.publicUrl || "/placeholder.svg";
  } catch (error) {
    console.error("Error generating public URL:", error);
    return "/placeholder.svg";
  }
}

/**
 * التحقق من نوع الملف المرفوع للتأكد من أنه صورة آمنة
 */
export function validateImageFile(file: File): boolean {
  // قائمة بأنواع MIME المسموح بها للصور
  const allowedMimeTypes = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp', 
    'image/svg+xml'
  ];
  
  // التحقق من نوع الملف
  if (!allowedMimeTypes.includes(file.type)) {
    console.error("Invalid file type:", file.type);
    return false;
  }
  
  // التحقق من حجم الملف (أقل من 10 ميجابايت)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    console.error("File too large:", file.size);
    return false;
  }
  
  return true;
}
