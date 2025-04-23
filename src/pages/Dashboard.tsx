
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import GallerySidebar from "@/components/GallerySidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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

      if (isMounted) setLoading(false);
    };

    checkOffice();
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-indigo-950 dark:to-slate-900" dir="rtl">
        <Loader2 className="animate-spin text-purple-700" size={40} />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-sky-50 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-indigo-950 dark:to-slate-900" dir="rtl">
        {/* الشريط الجانبي */}
        <GallerySidebar />

        {/* محتوى لوحة التحكم الرئيسي */}
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full mx-auto">
            <CardHeader>
              <CardTitle>لوحة التحكم</CardTitle>
            </CardHeader>
            <CardContent>
              <p>مرحباً بك في لوحة التحكم الخاصة بك!</p>
              {/* يمكنك لاحقاً عرض معلومات إضافية هنا حسب القسم المحدد من القائمة الجانبية */}
            </CardContent>
          </Card>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
