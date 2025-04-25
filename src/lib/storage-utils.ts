
import { supabase } from "@/integrations/supabase/client";

export function getStorageUrl(path: string | null, bucket: string = 'office-assets'): string {
  if (!path) return "/placeholder.svg";
  
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || "/placeholder.svg";
}
