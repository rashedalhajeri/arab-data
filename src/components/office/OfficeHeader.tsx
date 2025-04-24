
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Share2, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OfficeHeaderProps {
  office: {
    name: string;
    logo_url: string;
    phone: string;
    country: string;
  };
  onShare: () => void;
}

export const OfficeHeader = ({ office, onShare }: OfficeHeaderProps) => {
  const getLogoUrl = (logoPath: string) => {
    if (!logoPath) return null;
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/${logoPath}`;
  };

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 dark:bg-slate-900/95 dark:border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-primary/10">
            <AvatarImage 
              src={getLogoUrl(office.logo_url)}
              alt={office.name}
            />
            <AvatarFallback>{office.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{office.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{office.country}</p>
          </div>
          <div className="flex items-center gap-2 mr-auto">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onShare}
              className="hidden sm:flex items-center gap-2"
            >
              <Share2 size={16} />
              مشاركة
            </Button>
            <a href={`tel:${office.phone}`} className="hidden sm:block">
              <Button 
                size="sm"
                className="flex items-center gap-2"
              >
                <Phone size={16} />
                اتصال
              </Button>
            </a>
            <Button 
              variant="outline" 
              size="sm"
              className="sm:hidden"
              onClick={onShare}
            >
              <Share2 size={16} />
            </Button>
            <a href={`tel:${office.phone}`} className="sm:hidden">
              <Button size="sm">
                <Phone size={16} />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
