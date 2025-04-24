
import React, { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, X, ChevronLeft, Upload, Trash2, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useImageUpload } from "@/components/hooks/use-image-upload";
import SimpleImageUpload from "@/components/SimpleImageUpload";
import { useToast } from "@/hooks/use-toast";

// Define TypeScript interfaces for the advertisement data
interface AdvertisementData {
  title?: string;
  color?: string;
  description?: string;
  features?: string[];
  price?: string;
  negotiable?: boolean;
  hasMonthlyPayment?: boolean;
  monthlyPayment?: string;
  manufacturer?: string;
  model?: string;
  year?: string;
  kilometers?: string;
  fuelType?: string;
  images?: any[];
  // Adding missing properties based on error messages
  bodyType?: string;
  engineSize?: string;
  import?: string;
  condition?: string;
  gearType?: string;
}

// Interface for form errors
interface FormErrors {
  [key: string]: boolean;
}

const AddAdvertisement = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for the advertisement data
  const [adData, setAdData] = useState<AdvertisementData>({
    title: "",
    description: "",
    price: "",
    negotiable: false,
    hasMonthlyPayment: false,
    monthlyPayment: "",
    manufacturer: "",
    model: "",
    year: "",
    kilometers: "",
    fuelType: "",
    color: "",
    features: [],
    images: [],
    bodyType: "",
    engineSize: "",
    import: "",
    condition: "",
    gearType: ""
  });
  
  // State for form validation and submission
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Feature handling
  const [newFeature, setNewFeature] = useState("");
  const featureInputRef = useRef<HTMLInputElement>(null);

  // Handle input changes
  const handleChange = (field: keyof AdvertisementData, value: string | boolean) => {
    setAdData({
      ...adData,
      [field]: value
    });
    
    // Clear any error for this field
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: false
      });
    }
  };

  // Add a new feature
  const addFeature = () => {
    if (newFeature.trim() === "") return;
    
    if (adData.features) {
      setAdData({
        ...adData,
        features: [...adData.features, newFeature.trim()]
      });
    } else {
      setAdData({
        ...adData,
        features: [newFeature.trim()]
      });
    }
    
    setNewFeature("");
    if (featureInputRef.current) {
      featureInputRef.current.focus();
    }
  };

  // Remove a feature
  const removeFeature = (index: number) => {
    if (!adData.features) return;
    
    const updatedFeatures = [...adData.features];
    updatedFeatures.splice(index, 1);
    
    setAdData({
      ...adData,
      features: updatedFeatures
    });
  };

  // Image handling
  const handleImageChange = (index: number, imageUrl: string | null) => {
    const updatedImages = [...(adData.images || [])];
    
    if (imageUrl) {
      if (index < updatedImages.length) {
        updatedImages[index] = imageUrl;
      } else {
        updatedImages.push(imageUrl);
      }
    } else if (index < updatedImages.length) {
      updatedImages.splice(index, 1);
    }
    
    setAdData({
      ...adData,
      images: updatedImages
    });
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;
    
    // Required fields based on category
    const requiredFields: (keyof AdvertisementData)[] = ['title', 'description', 'price'];
    
    if (category === 'vehicles') {
      requiredFields.push('manufacturer', 'model', 'year', 'kilometers', 'fuelType');
    }
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!adData[field] || (typeof adData[field] === 'string' && adData[field]?.trim() === "")) {
        newErrors[field] = true;
        isValid = false;
      }
    });
    
    // Monthly payment validation
    if (adData.hasMonthlyPayment && (!adData.monthlyPayment || adData.monthlyPayment.trim() === "")) {
      newErrors.monthlyPayment = true;
      isValid = false;
    }
    
    // At least one image required
    if (!adData.images || adData.images.length === 0) {
      newErrors.images = true;
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!validateForm()) {
      toast({
        title: "يرجى تصحيح الأخطاء",
        description: "هناك بعض الحقول المطلوبة أو غير الصحيحة",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    setIsLoading(true);
    
    try {
      // API call would go here
      
      // Mock successful submission
      setTimeout(() => {
        toast({
          title: "تم إضافة الإعلان بنجاح",
          description: "سيتم مراجعة إعلانك ونشره قريبًا",
        });
        
        navigate("/dashboard/advertisements");
      }, 1500);
    } catch (error) {
      console.error("Error submitting advertisement:", error);
      toast({
        title: "حدث خطأ",
        description: "فشل إضافة الإعلان، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  // Cancel advertisement creation
  const handleCancel = () => {
    if (window.confirm("هل أنت متأكد من إلغاء إنشاء الإعلان؟ ستفقد جميع البيانات التي أدخلتها.")) {
      navigate("/dashboard/advertisements");
    }
  };

  // Render vehicle specific fields
  const renderVehicleFields = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="manufacturer">الشركة المصنعة <span className="text-red-500">*</span></Label>
          <Input 
            id="manufacturer" 
            placeholder="مثال: تويوتا، هوندا، مرسيدس..." 
            value={adData.manufacturer}
            onChange={(e) => handleChange("manufacturer", e.target.value)}
            className={errors.manufacturer ? "border-red-500" : ""}
          />
          {errors.manufacturer && <p className="text-red-500 text-xs">يرجى إدخال الشركة المصنعة</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="model">موديل السيارة <span className="text-red-500">*</span></Label>
          <Input 
            id="model" 
            placeholder="مثال: كامري، سيفيك، C200..." 
            value={adData.model}
            onChange={(e) => handleChange("model", e.target.value)}
            className={errors.model ? "border-red-500" : ""}
          />
          {errors.model && <p className="text-red-500 text-xs">يرجى إدخال موديل السيارة</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="year">سنة الصنع <span className="text-red-500">*</span></Label>
          <Input 
            id="year" 
            type="number" 
            placeholder="مثال: 2020" 
            value={adData.year}
            onChange={(e) => handleChange("year", e.target.value)}
            className={errors.year ? "border-red-500" : ""}
            min="1900"
            max={new Date().getFullYear() + 1}
          />
          {errors.year && <p className="text-red-500 text-xs">يرجى إدخال سنة صنع صحيحة</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="kilometers">عدد الكيلومترات <span className="text-red-500">*</span></Label>
          <Input 
            id="kilometers" 
            type="number" 
            placeholder="مثال: 50000" 
            value={adData.kilometers}
            onChange={(e) => handleChange("kilometers", e.target.value)}
            className={errors.kilometers ? "border-red-500" : ""}
            min="0"
          />
          {errors.kilometers && <p className="text-red-500 text-xs">يرجى إدخال عدد الكيلومترات</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bodyType">نوع الهيكل</Label>
          <Select 
            value={adData.bodyType} 
            onValueChange={(value) => handleChange("bodyType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع الهيكل" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedan">سيدان</SelectItem>
              <SelectItem value="suv">دفع رباعي SUV</SelectItem>
              <SelectItem value="hatchback">هاتشباك</SelectItem>
              <SelectItem value="coupe">كوبيه</SelectItem>
              <SelectItem value="pickup">بيك أب</SelectItem>
              <SelectItem value="van">فان</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fuelType">نوع الوقود <span className="text-red-500">*</span></Label>
          <Select 
            value={adData.fuelType} 
            onValueChange={(value) => handleChange("fuelType", value)}
          >
            <SelectTrigger className={errors.fuelType ? "border-red-500" : ""}>
              <SelectValue placeholder="اختر نوع الوقود" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="petrol">بنزين</SelectItem>
              <SelectItem value="diesel">ديزل</SelectItem>
              <SelectItem value="hybrid">هجين</SelectItem>
              <SelectItem value="electric">كهربائي</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
          {errors.fuelType && <p className="text-red-500 text-xs">يرجى اختيار نوع الوقود</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gearType">ناقل الحركة</Label>
          <Select 
            value={adData.gearType} 
            onValueChange={(value) => handleChange("gearType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع ناقل الحركة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="automatic">أوتوماتيك</SelectItem>
              <SelectItem value="manual">يدوي</SelectItem>
              <SelectItem value="cvt">CVT</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="engineSize">حجم المحرك (سي سي)</Label>
          <Input 
            id="engineSize" 
            placeholder="مثال: 2000" 
            value={adData.engineSize}
            onChange={(e) => handleChange("engineSize", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="color">اللون</Label>
          <Input 
            id="color" 
            placeholder="مثال: أبيض، أسود، رمادي..." 
            value={adData.color}
            onChange={(e) => handleChange("color", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="import">الاستيراد</Label>
          <Select 
            value={adData.import} 
            onValueChange={(value) => handleChange("import", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع الاستيراد" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local">محلي</SelectItem>
              <SelectItem value="gulf">خليجي</SelectItem>
              <SelectItem value="american">أمريكي</SelectItem>
              <SelectItem value="european">أوروبي</SelectItem>
              <SelectItem value="asian">آسيوي</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="condition">حالة السيارة</Label>
          <Select 
            value={adData.condition} 
            onValueChange={(value) => handleChange("condition", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر حالة السيارة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">جديدة</SelectItem>
              <SelectItem value="like-new">كالجديدة</SelectItem>
              <SelectItem value="excellent">ممتازة</SelectItem>
              <SelectItem value="good">جيدة</SelectItem>
              <SelectItem value="fair">مقبولة</SelectItem>
              <SelectItem value="needs-work">تحتاج إصلاحات</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  // Render real estate specific fields
  const renderRealEstateFields = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Real estate specific fields would go here */}
        <div className="space-y-2">
          <Label htmlFor="propertyType">نوع العقار</Label>
          <Select onValueChange={(value) => handleChange("propertyType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع العقار" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">شقة</SelectItem>
              <SelectItem value="villa">فيلا</SelectItem>
              <SelectItem value="land">أرض</SelectItem>
              <SelectItem value="commercial">تجاري</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="area">المساحة (متر مربع)</Label>
          <Input id="area" type="number" placeholder="مثال: 150" />
        </div>
      </div>
    );
  };

  // Render category specific fields
  const renderCategoryFields = () => {
    switch (category) {
      case 'vehicles':
        return renderVehicleFields();
      case 'real-estate':
        return renderRealEstateFields();
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <header className="flex justify-between items-center mb-6">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => navigate("/dashboard/advertisements")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="space-y-1 text-right">
          <h1 className="text-2xl font-bold">إضافة إعلان جديد</h1>
          <p className="text-gray-500 text-sm">
            {category === 'vehicles' ? 'مركبات' : category === 'real-estate' ? 'عقارات' : 'أخرى'}
          </p>
        </div>
      </header>

      <div className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">معلومات أساسية</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان الإعلان <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  placeholder="أدخل عنوانًا واضحًا ومختصرًا"
                  value={adData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className={errors.title ? "border-red-500" : ""}
                  maxLength={100}
                />
                {errors.title && <p className="text-red-500 text-xs">يرجى إدخال عنوان الإعلان</p>}
                <p className="text-xs text-gray-500">
                  {adData.title ? adData.title.length : 0}/100
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف الإعلان <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  placeholder="اكتب وصفًا مفصلًا يشمل جميع المعلومات المهمة"
                  value={adData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className={errors.description ? "border-red-500" : ""}
                  rows={5}
                />
                {errors.description && <p className="text-red-500 text-xs">يرجى إدخال وصف للإعلان</p>}
              </div>

              {/* Category Specific Fields */}
              {renderCategoryFields()}
            </div>
          </CardContent>
        </Card>

        {/* Price Information */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">معلومات السعر</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">السعر <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    placeholder="أدخل السعر"
                    value={adData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    className={errors.price ? "border-red-500 pr-16" : "pr-16"}
                    min="0"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                    ر.س
                  </div>
                </div>
                {errors.price && <p className="text-red-500 text-xs">يرجى إدخال السعر</p>}
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="negotiable"
                  checked={adData.negotiable}
                  onCheckedChange={(checked) => handleChange("negotiable", checked)}
                />
                <Label htmlFor="negotiable">السعر قابل للتفاوض</Label>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="hasMonthlyPayment"
                  checked={adData.hasMonthlyPayment}
                  onCheckedChange={(checked) => handleChange("hasMonthlyPayment", checked)}
                />
                <Label htmlFor="hasMonthlyPayment">يتوفر قسط شهري</Label>
              </div>

              {adData.hasMonthlyPayment && (
                <div className="space-y-2">
                  <Label htmlFor="monthlyPayment">القسط الشهري</Label>
                  <div className="relative">
                    <Input
                      id="monthlyPayment"
                      type="number"
                      placeholder="أدخل القسط الشهري"
                      value={adData.monthlyPayment}
                      onChange={(e) => handleChange("monthlyPayment", e.target.value)}
                      className={errors.monthlyPayment ? "border-red-500 pr-16" : "pr-16"}
                      min="0"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                      ر.س
                    </div>
                  </div>
                  {errors.monthlyPayment && (
                    <p className="text-red-500 text-xs">يرجى إدخال القسط الشهري</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">المميزات</h2>
            <div className="space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-grow space-y-2">
                  <Label htmlFor="features">إضافة ميزة</Label>
                  <Input
                    id="features"
                    placeholder="أدخل ميزة مثل: مكيف هواء، نظام ملاحة..."
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                    ref={featureInputRef}
                  />
                </div>
                <Button type="button" onClick={addFeature} className="mb-0.5">
                  <Plus className="h-4 w-4 ml-2" /> إضافة
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {adData.features && adData.features.length > 0 ? (
                  adData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full"
                    >
                      <span className="text-sm">{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 mr-1 p-0"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">لم تتم إضافة أي ميزات بعد</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">الصور <span className="text-red-500">*</span></h2>
            {errors.images && (
              <p className="text-red-500 text-sm mb-4">يرجى إضافة صورة واحدة على الأقل</p>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[0, 1, 2, 3, 4].map((index) => (
                <SimpleImageUpload
                  key={index}
                  value={(adData.images && adData.images[index]) || null}
                  onChange={(value) => handleImageChange(index, value)}
                  title={index === 0 ? "الصورة الرئيسية" : `صورة ${index + 1}`}
                  subtitle={index === 0 ? "ستظهر كصورة رئيسية للإعلان" : ""}
                  className={index === 0 && errors.images ? "border-red-500" : ""}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            إلغاء
          </Button>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {isSubmitting ? (
              <>جاري النشر...</>
            ) : (
              <>
                <Check className="ml-2 h-4 w-4" /> نشر الإعلان
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AddAdvertisement;
