
"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ModernHero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check auth state
  useEffect(() => {
    let mounted = true;

    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        setIsLoggedIn(!!session);
      }
    };

    fetchSession();

    // Listen to auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const openOfficeLink = "https://dashboard.lovable.dev";

  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-900">
      {/* خلفية بنمط Grid غير واضح */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="flex flex-col items-center text-center space-y-12">
          {/* العنوان الرئيسي */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 max-w-4xl"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              افتح مكتبك برابط واحد
            </h1>
            <div className="flex flex-col items-center">
              <span className="text-lg md:text-2xl font-semibold text-sky-600 mb-2">
                سواء كنت{" "}
                <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300">
                  مكتب سيارات
                </span>
              </span>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light max-w-3xl mx-auto">
              منصة متكاملة تساعدك على بناء واجهات برمجية عصرية بأقل جهد وأعلى كفاءة، مع توفير تجربة مستخدم فريدة.
            </p>
          </motion.div>

          {/* أزرار أو أيقونة حسب حالة المستخدم */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mt-8 min-h-[64px] items-center justify-center"
          >
            {!isLoggedIn ? (
              <>
                <Button
                  size="lg"
                  className={cn(
                    "relative group font-medium overflow-hidden rounded-full px-8 py-6 shadow-lg",
                    "bg-gradient-to-r from-sky-500 to-cyan-500 text-white",
                    "hover:shadow-xl transition-all duration-300"
                  )}
                  onClick={() => window.open(openOfficeLink, '_blank')}
                >
                  سجل مجانا
                  <ArrowRight className="mr-2 h-5 w-5 rtl:rotate-180" />
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-white to-transparent duration-300 transition-opacity" />
                </Button>
                
                <Button
                  variant="outline" 
                  size="lg"
                  className="rounded-full border-2 px-8 py-6 font-medium shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={() => navigate("/auth")}
                >
                  <LogIn className="ml-2 h-5 w-5 rtl:rotate-180" />
                  تسجيل الدخول
                </Button>
              </>
            ) : (
              <Button
                size="icon"
                className="h-20 w-20 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 shadow-xl flex items-center justify-center outline-none transition-colors hover:bg-gradient-to-l focus:ring-2 focus:ring-purple-300"
                onClick={() => {
                  // Go to dashboard route (modify if you have real dashboard)
                  navigate("/dashboard");
                }}
                aria-label="اذهب إلى لوحة التحكم"
                title="لوحة التحكم"
              >
                <LayoutDashboard size={44} className="text-white" />
              </Button>
            )}
          </motion.div>

          {/* مؤشر عدد العملاء */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-8 grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4 text-center"
          >
            {[
              { metric: "+2,500", label: "عميل راضٍ" },
              { metric: "+150", label: "دولة حول العالم" },
              { metric: "99.9%", label: "نسبة الاستقرار" },
              { metric: "24/7", label: "دعم فني متاح" },
            ].map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  {item.metric}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {item.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
