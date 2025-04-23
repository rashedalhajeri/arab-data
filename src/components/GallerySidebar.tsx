
import React from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";
import { layoutDashboard, megaphone, qrCode, list, folder, settings } from "lucide-react";

// أضف هنا بيانات افتراضية، يمكنك تعديلها لاحقًا بحسب بيانات المعرض الفعلية
const GALLERY_NAME = "معرض المستقبل";
const GALLERY_URL = "https://gallery.com/amal";
const GALLERY_LOGO = "/placeholder.svg"; // يمكنك استبدالها بصورة الشعار الفعلية إذا رفعتها

const menuItems = [
  { title: "نظرة عامة", icon: layoutDashboard, url: "#" },
  { title: "إعلاناتي", icon: megaphone, url: "#" },
  { title: "رموز QR", icon: qrCode, url: "#" },
  { title: "الفئات", icon: folder, url: "#" },
  { title: "الإعدادات", icon: settings, url: "#" },
];

const GallerySidebar = () => {
  return (
    <Sidebar className="min-h-screen bg-white dark:bg-slate-950 border-r p-0 flex flex-col w-64">
      <SidebarContent className="flex flex-col h-full justify-between p-0">
        <div>
          {/* الشعار + الاسم + الرابط */}
          <div className="flex flex-col items-center gap-3 pt-8 pb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden shadow border bg-gray-100 flex items-center justify-center">
              <img src={GALLERY_LOGO} alt="شعار المعرض" className="object-cover w-full h-full" />
            </div>
            <h2 className="font-bold text-lg">{GALLERY_NAME}</h2>
            <a href={GALLERY_URL} target="_blank" className="text-blue-500 text-sm break-all hover:underline">{GALLERY_URL}</a>
          </div>
          {/* القائمة */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-400">القائمة</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-2">
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
        {/* يمكن إضافة محتوى في التذييل مستقبلاً */}
        <SidebarFooter>
          {/* مساحة فارغة أو تذييل مستقبلي */}
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
};

export default GallerySidebar;
