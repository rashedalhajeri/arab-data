
interface OfficeCoverProps {
  office: {
    name: string;
    cover_url: string;
  };
}

export const OfficeCover = ({ office }: OfficeCoverProps) => {
  // Updated URL construction to ensure correct path formatting
  const getCoverUrl = (coverPath: string) => {
    if (!coverPath) return null;
    
    // Check if path already contains the full URL
    if (coverPath.startsWith('http')) {
      return coverPath;
    }
    
    // Construct proper URL to the storage bucket
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/office-assets/${coverPath}`;
  };

  return (
    <div className="relative w-full aspect-[21/9] md:aspect-[3/1] overflow-hidden">
      {office.cover_url ? (
        <img 
          src={getCoverUrl(office.cover_url)} 
          alt={`غلاف ${office.name}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error("Error loading cover image:", e);
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
