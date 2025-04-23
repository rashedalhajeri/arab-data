
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter
} from "@/components/ui/sidebar";
import { LayoutDashboard, Megaphone, QrCode, Folder, Settings } from "lucide-react";

interface GallerySidebarProps {
  galleryName: string;
  galleryUrl: string;
  galleryLogo: string;
}

const menuItems = [
  { title: "نظرة عامة", icon: LayoutDashboard, url: "#" },
  { title: "إعلاناتي", icon: Megaphone, url: "#" },
  { title: "رموز QR", icon: QrCode, url: "#" },
  { title: "الفئات", icon: Folder, url: "#" },
  { title: "الإعدادات", icon: Settings, url: "#" },
];

const GallerySidebar: React.FC<GallerySidebarProps> = ({
  galleryName,
  galleryUrl,
  galleryLogo,
}) => {
  return (
    <Sidebar className="min-h-screen bg-white dark:bg-slate-950 border-r p-0 flex flex-col w-64" dir="rtl">
      <SidebarContent className="flex flex-col h-full justify-between p-0">
        <div>
          {/* الشعار + الاسم + الرابط */}
          <div className="flex flex-col items-center gap-3 pt-8 pb-6" dir="rtl">
            <div className="w-20 h-20 rounded-full overflow-hidden shadow border bg-gray-100 flex items-center justify-center">
              <img
                src={galleryLogo || "/placeholder.svg"}
                alt="شعار المعرض"
                className="object-cover w-full h-full"
                onError={(e) => {
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.onerror = null;
                  imgElement.src = "/placeholder.svg";
                }}
              />
            </div>
            <h2 className="font-bold text-lg">{galleryName}</h2>
            <a
              href={galleryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 text-sm break-all hover:underline"
              dir="ltr"
              style={{direction:"ltr",textAlign:"right",wordBreak:"break-word",width:"100%"}}
            >
              {galleryUrl}
            </a>
          </div>
          {/* القائمة */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-400 text-right pr-3">
              القائمة
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className="flex flex-row-reverse items-center gap-2 text-right justify-end px-4"
                      >
                        {React.createElement(item.icon, { size: 20 })}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
        <SidebarFooter>
          {/* تذييل مستقبلي */}
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
};

export default GallerySidebar;

