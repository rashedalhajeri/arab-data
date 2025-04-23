import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Loader2, Settings as SettingsIcon, Palette, Share2, CreditCard } from "lucide-react";
import GallerySidebar from "@/components/GallerySidebar";
import GeneralSettings from "@/components/settings/GeneralSettings";
import ThemeSettings from "@/components/settings/ThemeSettings";
import SocialSettings from "@/components/settings/SocialSettings";
import SubscriptionSettings from "@/components/settings/SubscriptionSettings";

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [office, setOffice] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("general");

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
        const galleryUrl = data.slug ? `https://ad51.me/${data.slug}` : "#";
        const logoUrl = data.logo_url 
          ? supabase.storage.from("office-assets").getPublicUrl(data.logo_url).data.publicUrl
          : "/placeholder.svg";

        setOffice({
          ...data,
          displayUrl: galleryUrl,
          logoUrl: logoUrl,
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
        galleryUrl={office?.displayUrl || "#"}
        galleryLogo={office?.logoUrl || "/placeholder.svg"}
      />

      {/* محتوى لوحة التحكم */}
      <main className="mr-64 py-8 px-8 min-h-screen">
        <div className="max-w-5xl space-y-8">
          {/* ترويسة الصفحة */}
          <header className="flex justify-between items-center mb-8">
            <div></div>
            <div className="space-y-2 text-right">
              <h1 className="text-3xl font-bold bg-gradient-to-l from-purple-800 to-indigo-700 text-transparent bg-clip-text">إعدادات المتجر</h1>
              <p className="text-gray-600 dark:text-gray-400">قم بتخصيص وإدارة إعدادات متجرك من هنا</p>
            </div>
          </header>

          {/* قسم التبويبات */}
          <Card className="border-none bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm shadow-lg overflow-hidden p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 gap-4 bg-transparent mb-8">
                <TabsTrigger 
                  value="general" 
                  className={`flex items-center gap-2 p-3 rounded-lg border ${activeTab === 'general' ? 'bg-indigo-100 border-indigo-300 dark:bg-indigo-900/40 dark:border-indigo-700' : 'bg-white/50 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700'}`}
                >
                  <SettingsIcon size={18} />
                  <span>الإعدادات العامة</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="theme" 
                  className={`flex items-center gap-2 p-3 rounded-lg border ${activeTab === 'theme' ? 'bg-indigo-100 border-indigo-300 dark:bg-indigo-900/40 dark:border-indigo-700' : 'bg-white/50 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700'}`}
                >
                  <Palette size={18} />
                  <span>ثيم الصفحة</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="social" 
                  className={`flex items-center gap-2 p-3 rounded-lg border ${activeTab === 'social' ? 'bg-indigo-100 border-indigo-300 dark:bg-indigo-900/40 dark:border-indigo-700' : 'bg-white/50 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700'}`}
                >
                  <Share2 size={18} />
                  <span>حسابات التواصل</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="subscription" 
                  className={`flex items-center gap-2 p-3 rounded-lg border ${activeTab === 'subscription' ? 'bg-indigo-100 border-indigo-300 dark:bg-indigo-900/40 dark:border-indigo-700' : 'bg-white/50 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700'}`}
                >
                  <CreditCard size={18} />
                  <span>إشتراكي</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-2">
                <GeneralSettings office={office} />
              </TabsContent>

              <TabsContent value="theme" className="mt-2">
                <ThemeSettings office={office} />
              </TabsContent>

              <TabsContent value="social" className="mt-2">
                <SocialSettings office={office} />
              </TabsContent>

              <TabsContent value="subscription" className="mt-2">
                <SubscriptionSettings office={office} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings; 