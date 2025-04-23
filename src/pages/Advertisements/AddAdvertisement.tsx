import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Save, Car, Home, Package } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

// تعريف أيقونات الفئات
const categoryIcons = {
  vehicles: <Car className="h-5 w-5" />,
  "real-estate": <Home className="h-5 w-5" />,
  other: <Package className="h-5 w-5" />
};

// تعريف أسماء الفئات
const categoryNames = {
  vehicles: "مركبات",
  "real-estate": "عقارات",
  other: "أخرى"
};

const AddAdvertisement = () => {
  const navigate = useNavigate();
  const params = useParams<{ category?: string }>();
  const category = params.category || "other";
  
  // تحديد أيقونة واسم الفئة المناسبة
  const categoryIcon = categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.other;
  const categoryName = categoryNames[category as keyof typeof categoryNames] || "أخرى";
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // توجيه المستخدم إلى صفحة الإعلانات بعد الإرسال
    navigate("/dashboard/advertisements");
  };
  
  return (
    <div className="container mx-auto p-8">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/dashboard/advertisements")}
          className="ml-2"
        >
          <ArrowRight className="h-4 w-4 ml-1" />
          العودة
        </Button>
        <h1 className="text-2xl font-bold flex items-center">
          {categoryIcon}
          <span className="mr-2">إضافة إعلان جديد - {categoryName}</span>
        </h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              أدخل تفاصيل الإعلان الخاص بك من فئة {categoryName}
            </p>
            
            <div className="flex justify-end">
              <Button type="submit">
                <Save className="ml-2 h-4 w-4" />
                نشر الإعلان
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default AddAdvertisement; 