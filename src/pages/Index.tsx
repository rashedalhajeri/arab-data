
// عرض واجهة صفحة الهيرو الرئيسية
import { ModernHero } from "@/components/ui/modern-hero";
import { AuroraBackgroundDemo } from "@/components/ui/demo";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* عرض هيرو سكشن الرئيسي */}
      <ModernHero />
      
      {/* عرض الخلفية المتحركة في القسم الثاني */}
      <AuroraBackgroundDemo />
    </div>
  );
};

export default Index;
