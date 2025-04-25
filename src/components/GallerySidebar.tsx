import React, { useState, useEffect } from "react";
import { LogOut, LayoutDashboard, Megaphone, QrCode, Folder, Settings, Menu, X } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // تحديث عناصر القائمة باستخدام المسارات بدلاً من #
  const menuItems = [
    { title: "نظرة عامة", icon: LayoutDashboard, url: "/dashboard", path: "/dashboard" },
    { title: "إعلاناتي", icon: Megaphone, url: "/dashboard/advertisements", path: "/dashboard/advertisements" },
    { title: "رموز QR", icon: QrCode, url: "/dashboard/qr-codes", path: "/dashboard/qr-codes" },
    { title: "الفئات", icon: Folder, url: "/dashboard/categories", path: "/dashboard/categories" },
    { title: "الإعدادات", icon: Settings, url: "/dashboard/settings", path: "/dashboard/settings" },
  ];

  // استمع لتغيير حجم النافذة لتعيين isMobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    // التحقق عند التحميل
    checkIfMobile();
    
    // التحقق عند تغيير حجم النافذة
    window.addEventListener("resize", checkIfMobile);
    
    // تنظيف عند إزالة المكون
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // إغلاق القائمة الجانبية عند النقر على رابط في وضع الجوال
  const handleLinkClick = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    // إظهار شريط التحميل أولاً
    const toastId = toast.loading("جاري تسجيل الخروج...");

    try {
      // التحقق من وجود جلسة حالية
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        // إذا لم تكن هناك جلسة، قم بإظهار إشعار وتوجيه المستخدم إلى صفحة تسجيل الدخول
        toast.dismiss(toastId);
        toast.info("لم يتم العثور على جلسة نشطة، سيتم توجيهك إلى صفحة تسجيل الدخول");
        setTimeout(() => navigate("/auth", { replace: true }), 500);
        return;
      }
      
      // تسجيل الخروج إذا كان هناك جلسة
      await supabase.auth.signOut();

      // حذف أي بيانات تخزين محلية متعلقة بالمصادقة
      localStorage.removeItem("supabase.auth.token");
      
      // إظهار رسالة نجاح
      toast.dismiss(toastId);
      toast.success("تم تسجيل الخروج بنجاح");
      
      // التوجيه إلى صفحة تسجيل الدخول
      setTimeout(() => navigate("/auth", { replace: true }), 500);
      
    } catch (error) {
      console.error("خطأ في تسجيل الخروج:", error);
      
      // إظهار رسالة خطأ وإعادة توجيه المستخدم
      toast.dismiss(toastId);
      toast.error("حدث خطأ أثناء تسجيل الخروج");
      
      // رغم الخطأ، قم بإعادة توجيه المستخدم إلى صفحة تسجيل الدخول
      setTimeout(() => {
        // محاولة مسح بيانات الجلسة قبل التوجيه
        try {
          localStorage.removeItem("supabase.auth.token");
          sessionStorage.clear();
        } catch (e) {
          console.error("خطأ في مسح بيانات الجلسة:", e);
        }
        
        navigate("/auth", { replace: true });
      }, 1000);
    }
  };

  // زر تبديل القائمة للشاشات الصغيرة
  const MobileMenuToggle = () => (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-purple-900 text-white lg:hidden"
      aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
    >
      {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );

  return (
    <>
      {/* زر تبديل القائمة للجوال */}
      <MobileMenuToggle />
      
      {/* القائمة الجانبية - ثابتة للديسكتوب، قابلة للطي للجوال */}
      <aside 
        className={`fixed top-0 right-0 h-screen overflow-hidden z-40 transition-all duration-300 ease-in-out
                    ${isMobile 
                        ? (isMobileMenuOpen ? 'w-64 translate-x-0' : 'w-0 translate-x-full') 
                        : 'w-64 translate-x-0'}`}
        dir="rtl"
      >
        {/* خلفية متدرجة للقائمة الجانبية */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 opacity-95"></div>
        
        <div className="relative h-full overflow-y-auto custom-scrollbar">
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
                      onClick={handleLinkClick}
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
    </>
  );
};

export default GallerySidebar;
