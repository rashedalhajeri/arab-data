import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Settings as SettingsIcon, Palette, Share2, CreditCard } from "lucide-react";
import GeneralSettings from "@/components/settings/GeneralSettings";
import ThemeSettings from "@/components/settings/ThemeSettings";
import SocialSettings from "@/components/settings/SocialSettings";
import SubscriptionSettings from "@/components/settings/SubscriptionSettings";
import { useDashboard } from "@/components/DashboardLayout";

const Settings = () => {
  const { office } = useDashboard();
  const [activeTab, setActiveTab] = useState("general");

  return (
    <>
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
              id="tab-general"
              name="settings-tab"
            >
              <SettingsIcon size={18} />
              <span>الإعدادات العامة</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="theme" 
              className={`flex items-center gap-2 p-3 rounded-lg border ${activeTab === 'theme' ? 'bg-indigo-100 border-indigo-300 dark:bg-indigo-900/40 dark:border-indigo-700' : 'bg-white/50 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700'}`}
              id="tab-theme"
              name="settings-tab"
            >
              <Palette size={18} />
              <span>ثيم الصفحة</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="social" 
              className={`flex items-center gap-2 p-3 rounded-lg border ${activeTab === 'social' ? 'bg-indigo-100 border-indigo-300 dark:bg-indigo-900/40 dark:border-indigo-700' : 'bg-white/50 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700'}`}
              id="tab-social"
              name="settings-tab"
            >
              <Share2 size={18} />
              <span>حسابات التواصل</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="subscription" 
              className={`flex items-center gap-2 p-3 rounded-lg border ${activeTab === 'subscription' ? 'bg-indigo-100 border-indigo-300 dark:bg-indigo-900/40 dark:border-indigo-700' : 'bg-white/50 border-gray-200 dark:bg-slate-800/50 dark:border-slate-700'}`}
              id="tab-subscription"
              name="settings-tab"
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
    </>
  );
};

export default Settings; 