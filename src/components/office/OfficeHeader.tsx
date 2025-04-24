
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
  // Updated URL construction to ensure correct path formatting
  const getLogoUrl = (logoPath: string) => {
    if (!logoPath) return null;
    
    // Check if path already contains the full URL
    if (logoPath.startsWith('http')) {
      return logoPath;
    }
    
    // Construct proper URL to the storage bucket
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/office-assets/${logoPath}`;
  };

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
              // Set a fallback placeholder for the logo
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
