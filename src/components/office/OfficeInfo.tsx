
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, MessageCircle, Star, Calendar } from "lucide-react";

interface OfficeInfoProps {
  office: {
    name: string;
    logo_url: string;
    phone: string;
    country: string;
  };
}

export const OfficeInfo = ({ office }: OfficeInfoProps) => {
  const getLogoUrl = (logoPath: string) => {
    if (!logoPath) return null;
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/logos/${logoPath}`;
  };

  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 -mt-16 relative z-10 border border-gray-100 dark:bg-slate-900/90 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <Avatar className="w-28 h-28 border-4 border-white shadow-lg dark:border-slate-800">
              <AvatarImage 
                src={getLogoUrl(office.logo_url)}
                alt={office.name}
              />
              <AvatarFallback>{office.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3 dark:text-white">{office.name}</h1>
              <div className="flex flex-wrap gap-4">
                <Badge variant="outline" className="gap-1 px-3 py-1 text-sm font-normal">
                  <Star size={14} className="text-amber-500" />
                  <span>مكتب مميز</span>
                </Badge>
                <Badge variant="outline" className="gap-1 px-3 py-1 text-sm font-normal">
                  <Calendar size={14} className="text-blue-500" />
                  <span>عضو منذ 2025</span>
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="gap-2">
              <MessageCircle size={16} />
              <span>مراسلة</span>
            </Button>
            <a href={`tel:${office.phone}`} className="w-full sm:w-auto">
              <Button className="w-full gap-2">
                <Phone size={16} />
                <span>{office.phone}</span>
              </Button>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">المكان</span>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-gray-400" />
              <span className="font-medium">{office.country || 'غير محدد'}</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">للتواصل</span>
            <div className="flex items-center gap-2">
              <Phone size={18} className="text-gray-400" />
              <a href={`tel:${office.phone}`} className="font-medium hover:text-primary transition-colors">
                {office.phone || 'غير محدد'}
              </a>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">تاريخ الإنضمام</span>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-400" />
              <span className="font-medium">مارس 2025</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
