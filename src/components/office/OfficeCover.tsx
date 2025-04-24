
import { debug } from '@/lib/debug';

interface OfficeCoverProps {
  office: {
    name: string;
    cover_url: string;
  };
}

export const OfficeCover = ({ office }: OfficeCoverProps) => {
  // تحسين بناء URL للتأكد من صحة تنسيق المسار
  const getCoverUrl = (coverPath: string) => {
    if (!coverPath) {
      debug.logError("No cover path provided", "OfficeCover");
      return "/placeholder.svg";
    }
    
    // التحقق مما إذا كان المسار يحتوي بالفعل على URL كامل
    if (coverPath.startsWith('http')) {
      return coverPath;
    }
    
    // بناء URL صحيح إلى خزان التخزين
    const fullUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/office-assets/${coverPath}`;
    console.log("Full cover URL constructed:", fullUrl);
    return fullUrl;
  };

  const coverUrl = getCoverUrl(office.cover_url);
  console.log("Final cover URL being used:", coverUrl);

  return (
    <div className="relative w-full aspect-[21/9] md:aspect-[3/1] overflow-hidden">
      {office.cover_url ? (
        <img 
          src={coverUrl} 
          alt={`غلاف ${office.name}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const err = `Error loading cover image for ${office.name}: ${e}`;
            console.error(err);
            debug.logError(err, "OfficeCover");
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-primary/5 to-primary/10 animate-aurora" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
};
