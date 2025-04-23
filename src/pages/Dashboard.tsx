import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, UserIcon, Eye, BarChart3, TrendingUp, Plus } from "lucide-react";
import GallerySidebar from "@/components/GallerySidebar";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [office, setOffice] = useState<null | {
    name: string;
    url: string;
    logo_url?: string;
  }>(null);

  useEffect(() => {
    let isMounted = true;
    const checkOffice = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("offices")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!data) {
        navigate("/create-page");
        return;
      }
      if (isMounted) {
        // Generate the URL based on the slug from the office data
        const galleryUrl = data.slug ? `https://ad51.me/${data.slug}` : "#";

        // Get the public URL for the logo from Supabase storage
        const logoUrl = data.logo_url 
          ? supabase.storage.from("office-assets").getPublicUrl(data.logo_url).data.publicUrl
          : "/placeholder.svg";

        setOffice({
          name: data.name || "اسم المعرض",
          url: galleryUrl,
          logo_url: logoUrl,
        });
        setLoading(false);
      }
    };

    checkOffice();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-slate-900" dir="rtl">
        <Loader2 className="animate-spin text-purple-700" size={40} />
      </div>
    );
  }

  return (
    <div dir="rtl" className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-slate-900 min-h-screen">
      {/* القائمة الجانبية */}
      <GallerySidebar
        galleryName={office?.name || "اسم المعرض"}
        galleryUrl={office?.url || "#"}
        galleryLogo={office?.logo_url || "/placeholder.svg"}
      />

      {/* محتوى لوحة التحكم */}
      <main className="mr-64 py-8 px-8 min-h-screen">
        <div className="max-w-5xl space-y-8">
          {/* ترويسة الصفحة */}
          <header className="flex justify-between items-center mb-10">
            <div>
              <Button 
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
                asChild
              >
                <a href={office?.url || "#"} target="_blank" rel="noopener noreferrer">
                  <Eye size={16} />
                  <span>عرض الصفحة</span>
                </a>
              </Button>
            </div>
            <div className="space-y-2 text-right">
              <h1 className="text-3xl font-bold bg-gradient-to-l from-purple-800 to-indigo-700 text-transparent bg-clip-text">مرحباً بك في لوحة التحكم</h1>
              <p className="text-gray-600 dark:text-gray-400">هذه هي نظرة عامة عن أداء صفحتك</p>
            </div>
          </header>

          {/* بطاقات الإحصائيات */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 rtl">
            <Card className="border-none overflow-hidden bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-l from-blue-400 to-blue-600"></div>
              <CardHeader className="pb-2">
                <CardDescription className="text-right text-sm font-medium text-gray-500 dark:text-gray-400">إجمالي الزيارات</CardDescription>
                <CardTitle className="text-right text-2xl">
                  <div className="flex items-center gap-2">
                    <span>358</span>
                    <Eye className="text-blue-500" size={20} />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-green-500 font-medium flex items-center gap-1">
                  <span>ارتفاع 12%</span>
                  <TrendingUp size={14} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none overflow-hidden bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-l from-purple-400 to-purple-600"></div>
              <CardHeader className="pb-2">
                <CardDescription className="text-right text-sm font-medium text-gray-500 dark:text-gray-400">الزوار الجدد</CardDescription>
                <CardTitle className="text-right text-2xl">
                  <div className="flex items-center gap-2">
                    <span>124</span>
                    <UserIcon className="text-purple-500" size={20} />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-green-500 font-medium flex items-center gap-1">
                  <span>ارتفاع 8%</span>
                  <TrendingUp size={14} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none overflow-hidden bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-l from-pink-400 to-pink-600"></div>
              <CardHeader className="pb-2">
                <CardDescription className="text-right text-sm font-medium text-gray-500 dark:text-gray-400">معدل التفاعل</CardDescription>
                <CardTitle className="text-right text-2xl">
                  <div className="flex items-center gap-2">
                    <span>75%</span>
                    <BarChart3 className="text-pink-500" size={20} />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-sm text-green-500 font-medium flex items-center gap-1">
                  <span>ارتفاع 5%</span>
                  <TrendingUp size={14} />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* قسم الإعلانات الأخيرة */}
          <section>
            <Card className="border-none bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm shadow-lg overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div></div> {/* عنصر فارغ للحفاظ على مساحة */}
                  <div>
                    <CardTitle className="text-right font-bold text-gray-800 dark:text-white">آخر الإعلانات</CardTitle>
                    <CardDescription className="text-right">يمكنك عرض وإدارة إعلاناتك من هنا</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-slate-800/30">
                  <p className="text-gray-500 dark:text-gray-400 mb-5">لم تقم بإضافة أي إعلانات حتى الآن</p>
                  <Button className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white">
                    <Plus size={16} />
                    <span>إضافة إعلان جديد</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

