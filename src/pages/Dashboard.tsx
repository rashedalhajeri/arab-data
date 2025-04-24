import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, BarChart3, TrendingUp, Plus, UserIcon } from "lucide-react";
import { useDashboard } from "@/components/DashboardLayout";

const Dashboard = () => {
  const { office } = useDashboard();

  return (
    <>
          {/* ترويسة الصفحة */}
          <header className="flex justify-between items-center mb-10">
            <div>
              <Button 
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
                asChild
              >
            <a href={office?.displayUrl || "#"} target="_blank" rel="noopener noreferrer">
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
              <Button 
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                onClick={() => window.location.href = "/dashboard/advertisements"}
              >
                    <Plus size={16} />
                    <span>إضافة إعلان جديد</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
    </>
  );
};

export default Dashboard;

