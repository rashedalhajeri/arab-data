import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Car, Home, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Advertisements = () => {
  const navigate = useNavigate();
  const [showCategoryOptions, setShowCategoryOptions] = useState(false);

  // توجيه المستخدم إلى صفحة إضافة إعلان
  const handleAddAdvertisement = (category: string) => {
    navigate(`/dashboard/advertisements/add/${category}`);
    setShowCategoryOptions(false);
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">إعلاناتي</h1>
        <div className="relative">
          <Button 
            onClick={() => setShowCategoryOptions(!showCategoryOptions)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            <Plus className="ml-2 h-4 w-4" />
            إضافة إعلان
          </Button>
          
          {showCategoryOptions && (
            <div className="absolute left-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
              <div className="p-2">
                <button
                  onClick={() => handleAddAdvertisement("vehicles")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <Car className="ml-2 h-4 w-4" />
                  مركبات
                </button>
                <button
                  onClick={() => handleAddAdvertisement("real-estate")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <Home className="ml-2 h-4 w-4" />
                  عقارات
                </button>
                <button
                  onClick={() => handleAddAdvertisement("other")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <Package className="ml-2 h-4 w-4" />
                  أخرى
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-4">لا توجد إعلانات حالياً</p>
        <Button 
          variant="outline"
          onClick={() => setShowCategoryOptions(true)}
        >
          <Plus className="ml-2 h-4 w-4" />
          إضافة إعلان جديد
        </Button>
      </div>
    </div>
  );
};

export default Advertisements; 