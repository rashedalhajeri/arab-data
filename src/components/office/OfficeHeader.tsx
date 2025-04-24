
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OfficeHeaderProps {
  office: {
    name: string;
    logo_url: string;
    phone: string;
    country: string;
  };
}

export const OfficeHeader = ({ office }: OfficeHeaderProps) => {
  // تحسين بناء URL للتأكد من صحة تنسيق المسار
  const getLogoUrl = (logoPath: string) => {
    if (!logoPath) return "/placeholder.svg";
    
    // التحقق مما إذا كان المسار يحتوي بالفعل على URL كامل
    if (logoPath.startsWith('http')) {
      return logoPath;
    }
    
    // بناء URL صحيح إلى خزان التخزين
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/office-assets/${logoPath}`;
  };

  console.log("Logo URL being used:", getLogoUrl(office.logo_url));

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-100 dark:bg-slate-900/95 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12 border-2 border-primary/10">
          <AvatarImage 
            src={getLogoUrl(office.logo_url)}
            alt={office.name}
            onError={(e) => {
              console.error("Error loading logo image:", e);
              e.currentTarget.onerror = null;
              // وضع صورة بديلة احتياطية للشعار
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          <AvatarFallback>{office.name?.substring(0, 2) || "?"}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{office.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{office.country}</p>
        </div>
      </div>
    </div>
  );
};
