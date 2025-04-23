
"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRotatingText } from "@/components/hooks/use-rotating-text";
import React from "react";

export function ModernHero() {
  const openOfficeLink = "https://dashboard.lovable.dev";
  const officeTypes = ["مكتب سيارات", "مكتب تأجير", "مكتب عقارات"];
  const rotatingOffice = useRotatingText(officeTypes, 2000);

  // وظيفة لنسخ النص المتغير
  const handleCopy = () => {
    navigator.clipboard.writeText(rotatingOffice);
  };

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

            {/* نص ثانوي ناعم */}
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light max-w-3xl mx-auto">
              منصة متكاملة تساعدك على بناء واجهات برمجية عصرية بأقل جهد وأعلى كفاءة، مع توفير تجربة مستخدم فريدة.
            </p>
          </motion.div>

          {/* النص الديناميكي المتغير */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.60, delay: 0.15 }}
            className="flex flex-col items-center mt-2 space-y-2"
          >
            <div className="flex items-center gap-2 text-lg md:text-xl text-gray-700 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-5 py-3 rounded-full shadow hover-scale transition cursor-pointer select-none">
              <span>
                سواء كنت{" "}
                <span className="font-semibold text-sky-500 transition-colors duration-300">
                  {rotatingOffice}
                </span>
              </span>
              <button
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                title="نسخ"
                onClick={handleCopy}
                aria-label="نسخ"
                type="button"
              >
                {/* لا يوجد أيقونة نسخ متاحة، سنستخدم log-in فقط كما هو متوفر */}
                <LogIn size={18} className="text-gray-500" />
              </button>
            </div>
            {/* تعليمات نسخ وتحرير */}
            <div className="flex gap-3 mt-1 justify-center text-xs text-muted-foreground">
              <span>نسخ</span>
              <span>|</span>
              <span>تحرير</span>
            </div>
          </motion.div>

          {/* أزرار CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <Button
              size="lg"
              className={cn(
                "relative group font-medium overflow-hidden rounded-full px-8 py-6 shadow-lg",
                "bg-gradient-to-r from-sky-500 to-cyan-500 text-white",
                "hover:shadow-xl transition-all duration-300"
              )}
              onClick={() => window.open(openOfficeLink, '_blank')}
            >
              افتح المكتب الآن
              <ArrowRight className="mr-2 h-5 w-5 rtl:rotate-180" />
              <span className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-white to-transparent duration-300 transition-opacity" />
            </Button>
            
            <Button
              variant="outline" 
              size="lg"
              className="rounded-full border-2 px-8 py-6 font-medium shadow-md hover:shadow-lg transition-all duration-300"
            >
              <LogIn className="ml-2 h-5 w-5 rtl:rotate-180" />
              تسجيل الدخول
            </Button>
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
