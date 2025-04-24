
import React from "react";
import { Card } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <div></div>
        <div className="space-y-2 text-right">
          <h1 className="text-3xl font-bold bg-gradient-to-l from-purple-800 to-indigo-700 text-transparent bg-clip-text">إعدادات المتجر</h1>
          <p className="text-gray-600 dark:text-gray-400">قم بتخصيص وإدارة إعدادات متجرك من هنا</p>
        </div>
      </header>

      <Card className="border-none bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm shadow-lg overflow-hidden p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <SettingsIcon className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">قيد التطوير</h2>
          <p className="text-gray-500 dark:text-gray-400">
            هذا القسم قيد التطوير حالياً. سيتم إضافة المزيد من الميزات قريباً.
          </p>
        </div>
      </Card>
    </>
  );
};

export default Settings;
