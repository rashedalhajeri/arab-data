
// عرض واجهة صفحة الهيرو الرئيسية
import { ModernHero } from "@/components/ui/modern-hero";
import { AuroraBackgroundDemo } from "@/components/ui/demo";
import { ProfileDialog } from "@/components/ui/profile-dialog";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* عرض هيرو سكشن الرئيسي */}
      <ModernHero />
      
      {/* عرض زر تعديل الملف الشخصي */}
      <div className="container mx-auto p-8 text-center">
        <ProfileDialog />
      </div>
      
      {/* عرض الخلفية المتحركة في القسم الثاني */}
      <AuroraBackgroundDemo />
    </div>
  );
};

export default Index;
