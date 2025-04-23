
// عرض واجهة صفحة الهيرو الرئيسية فقط بعد الحذف
import { ModernHero } from "@/components/ui/modern-hero";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* عرض هيرو سكشن الرئيسي */}
      <ModernHero />
    </div>
  );
};

export default Index;
