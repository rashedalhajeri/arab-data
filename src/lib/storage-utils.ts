
import { supabase } from "@/lib/supabase";

export function getStorageUrl(path: string | null, bucket: string = 'office-assets'): string {
  if (!path) return "/placeholder.svg";
  
  // إذا كان المسار عبارة عن URL كامل، نعيده كما هو
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // تحديد اسم الخزان المناسب بناءً على مسار الصورة
  let actualBucket = bucket;
  if (path.startsWith('advertisements/')) {
    actualBucket = 'advertisements';
  }
  
  // تنظيف المسار إذا كان يحتوي على اسم bucket
  let cleanPath = path;
  if (path.startsWith(`${actualBucket}/`)) {
    cleanPath = path.slice(`${actualBucket}/`.length);
  }
  
  // الحصول على الرابط العام للصورة
  const { data } = supabase.storage.from(actualBucket).getPublicUrl(cleanPath);
  
  // تسجيل المعلومات للتصحيح
  console.log(`Generated URL for ${path} in bucket ${actualBucket}:`, data?.publicUrl);
  
  return data?.publicUrl || "/placeholder.svg";
}
