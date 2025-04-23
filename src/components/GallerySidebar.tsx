import React from "react";
import { LogOut, LayoutDashboard, Megaphone, QrCode, Folder, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

interface GallerySidebarProps {
  galleryName: string;
  galleryUrl: string;
  galleryLogo: string;
}

const GallerySidebar: React.FC<GallerySidebarProps> = ({
  galleryName,
  galleryUrl,
  galleryLogo,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // تحديث عناصر القائمة باستخدام المسارات بدلاً من #
  const menuItems = [
    { title: "نظرة عامة", icon: LayoutDashboard, url: "/dashboard", path: "/dashboard" },
    { title: "إعلاناتي", icon: Megaphone, url: "/dashboard/advertisements", path: "/dashboard/advertisements" },
    { title: "رموز QR", icon: QrCode, url: "/dashboard/qr-codes", path: "/dashboard/qr-codes" },
    { title: "الفئات", icon: Folder, url: "/dashboard/categories", path: "/dashboard/categories" },
    { title: "الإعدادات", icon: Settings, url: "/dashboard/settings", path: "/dashboard/settings" },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("تم تسجيل الخروج بنجاح");
      navigate("/auth");
    } catch (error) {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  return (
    <aside 
      className="fixed top-0 right-0 h-screen w-64 overflow-hidden z-40"
      dir="rtl"
    >
      {/* خلفية متدرجة للقائمة الجانبية */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 opacity-95"></div>
      
      <div className="relative h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        {/* رأس القائمة - الشعار والاسم */}
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/10">
          <div className="w-14 h-14 rounded-xl overflow-hidden shadow-xl border-2 border-white/20 bg-white/10 flex-shrink-0 backdrop-blur-sm">
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
          <h2 className="font-bold text-lg text-white truncate">{galleryName}</h2>
        </div>

        {/* قائمة العناصر */}
        <div className="py-6 px-3">
          <p className="text-purple-300 text-xs font-semibold pr-3 mb-4 uppercase tracking-wider">القائمة الرئيسية</p>
          <nav>
            <ul className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                
                return (
                <li key={item.title}>
                  <Link
                    to={item.url}
                    className={`flex items-center gap-3 py-2.5 px-4 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-white/15 text-white font-medium shadow-sm' 
                        : 'text-purple-200 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    {React.createElement(item.icon, { 
                      size: 18, 
                      className: isActive ? "text-white" : "text-purple-300" 
                    })}
                    <span>{item.title}</span>
                  </Link>
                </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* تذييل - زر تسجيل الخروج */}
        <div className="absolute bottom-0 right-0 left-0 p-5 backdrop-blur-sm bg-purple-950/40 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-white hover:bg-red-500/20 rounded-lg transition-colors"
          >
            <LogOut size={18} className="text-red-300" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default GallerySidebar;

