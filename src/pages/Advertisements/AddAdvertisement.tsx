import React, { useState, useRef, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { useDashboard } from "@/components/DashboardLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Estilo para números en inglés y responsividad móvil
const mobileStyles = `
  input[type=number], input[type=text]:placeholder-shown, textarea:placeholder-shown {
    direction: ltr;
    text-align: right;
  }
  
  .number-input {
    direction: ltr;
    text-align: right;
  }
  
  .price-display {
    direction: ltr;
    display: inline-block;
  }
  
  @media (max-width: 640px) {
    .mobile-container {
      padding-left: 8px !important;
      padding-right: 8px !important;
      max-width: 100% !important;
      width: 100% !important;
    }
    
    .mobile-card {
      width: 100% !important;
      margin-left: 0 !important;
      margin-right: 0 !important;
      border-radius: 8px !important;
    }
    
    .mobile-card-content {
      padding: 16px !important;
    }
  }
`;

// Define TypeScript interfaces for the advertisement data
interface AdvertisementData {
  title?: string;
  color?: string;
  description?: string;
  features?: string[];
  price?: string;
  negotiable?: boolean; // للبيع فقط
  hasMonthlyPayment?: boolean; // للبيع فقط
  monthlyPayment?: string; // للبيع فقط
  manufacturer?: string; // للبيع فقط
  model?: string; // للبيع فقط
  year?: string;
  kilometers?: string; // للبيع فقط
  fuelType?: string;
  images?: any[];
  bodyType?: string;
  engineSize?: string;
  import?: string; // للبيع فقط
  condition?: string; // للبيع فقط
  gearType?: string; // للبيع فقط
  propertyType?: string;
  area?: string;
  adType?: string; // للبيع أو للإيجار
  categoryType?: string; // مركبات، عقارات، أخرى
  interiorColor?: string; // لون الداخلية للسيارة - للبيع فقط
  isActive?: boolean; // الحالة نشطة أو غير نشطة
  selectedCategory?: string; // الفئة المختارة من الفئات المتاحة للمستخدم
  
  // حقول الإعلان للإيجار فقط
  rentPeriod?: string; // فترة الإيجار (يومي، أسبوعي، شهري)
  deposit?: string; // مبلغ التأمين
  kmLimit?: string; // حد الكيلومترات
  
  // حقول أسعار الإيجار
  pricingOptions?: PricingOption[];
  showFeatures?: boolean; // للتحكم في إظهار مميزات المركبة
  displayPeriod?: string; // القيمة الافتراضية للفترة التي ستظهر في الإعلان
}

// واجهة خيارات التسعير
interface PricingOption {
  id: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  price: string;
}

// Interface for form errors
interface FormErrors {
  [key: string]: boolean;
}

const AddAdvertisement = () => {
  const { category, adType } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { office } = useDashboard(); // إضافة استدعاء الهوك هنا
  
  // Agregar estilos para números en inglés y responsividad móvil
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = mobileStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
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
    interiorColor: "",
    features: [],
    images: [],
    bodyType: "",
    engineSize: "",
    import: "",
    condition: "",
    gearType: "",
    propertyType: "",
    area: "",
    adType: adType || "",
    categoryType: category || "",
    isActive: true,
    selectedCategory: "",
    
    // حقول الإعلان للإيجار
    rentPeriod: "",
    deposit: "",
    kmLimit: "",
    pricingOptions: [],
    showFeatures: false,
    displayPeriod: "daily" // القيمة الافتراضية للفترة التي ستظهر في الإعلان
  });
  
  // State for form validation and submission
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Feature handling
  const [newFeature, setNewFeature] = useState("");
  const featureInputRef = useRef<HTMLInputElement>(null);

  // Add states for UI flow control
  const [showCategorySelection, setShowCategorySelection] = useState(!category);
  const [showAdTypeSelection, setShowAdTypeSelection] = useState(category === "vehicles" && !adType);
  const [showMainForm, setShowMainForm] = useState(category && (category !== "vehicles" || adType));
  
  // User categories for dropdown
  const [userCategories, setUserCategories] = useState<{id: string, name: string}[]>([]);
  
  // State for pricing option inputs (نعدل هنا ونجعل القيمة الافتراضية فارغة لإجبار المستخدم على اختيار فترة)
  const [pricingInput, setPricingInput] = useState({
    period: "" as "" | "daily" | "weekly" | "monthly" | "yearly",
    price: ""
  });
  
  // إضافة متغير حالة للتحكم في ظهور نافذة التأكيد
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => () => {});
  const [confirmMessage, setConfirmMessage] = useState("هل أنت متأكد من إلغاء إنشاء الإعلان؟ ستفقد جميع البيانات التي أدخلتها.");
  
  // Load user categories
  useEffect(() => {
    const loadCategories = async () => {
      const categories = await fetchUserCategories();
      setUserCategories(categories);
    };
    
    loadCategories();
  }, []);
  
  // Initialize category and form from URL parameter if available
  useEffect(() => {
    if (category) {
      handleChange("categoryType", category);
      
      if (adType) {
        handleChange("adType", adType);
      }
      
      // If category is vehicles or real-estate without adType, show the ad type selection
      if ((category === "vehicles" || category === "real-estate") && !adType) {
        setShowCategorySelection(false);
        setShowAdTypeSelection(true);
        setShowMainForm(false);
      }
      // If we have both category and adType
      else if ((category === "vehicles" || category === "real-estate") && adType) {
        setShowCategorySelection(false);
        setShowAdTypeSelection(false);
        setShowMainForm(true);
      }
      // If category is something else like 'others'
      else if (category !== "vehicles" && category !== "real-estate") {
        setShowCategorySelection(false);
        setShowAdTypeSelection(false);
        setShowMainForm(true);
        // تعيين نوع الإعلان لتجنب المشاكل في النموذج
        handleChange("adType", "others");
      }
    }
  }, [category, adType]);
  
  // Select main category
  const selectMainCategory = (category: string) => {
    handleChange("categoryType", category);
    setShowCategorySelection(false);
    
    if (category === "vehicles") {
      setShowAdTypeSelection(true);
      // Update URL without reloading the page
      navigate(`/dashboard/advertisements/add/${category}`, { replace: true });
    } else if (category === "real-estate") {
      setShowAdTypeSelection(true);
      // Update URL without reloading the page
      navigate(`/dashboard/advertisements/add/${category}`, { replace: true });
    } else {
      // للفئات الأخرى، نعرض النموذج المبسط مباشرة
      setShowMainForm(true);
      // تعيين نوع الإعلان لتجنب المشاكل في النموذج
      handleChange("adType", "others");
      // Update URL without reloading the page
      navigate(`/dashboard/advertisements/add/${category}`, { replace: true });
    }
  };
  
  // Select ad type (sale/rent)
  const selectAdType = (type: string) => {
    handleChange("adType", type);
    setShowAdTypeSelection(false);
    setShowMainForm(true);
    
    // Update URL without reloading the page
    navigate(`/dashboard/advertisements/add/${adData.categoryType}/${type}`, { replace: true });
  };
  
  // إضافة دالة للتعامل مع مغادرة الصفحة
  const handleLeavePage = (destination: string) => {
    // التحقق إذا كان المستخدم قد أدخل بيانات
    const hasEnteredData = adData.title || adData.description || adData.price || 
                          (adData.images && adData.images.length > 0) || 
                          (adData.features && adData.features.length > 0);
    
    if (hasEnteredData) {
      setConfirmMessage("هل أنت متأكد من مغادرة الصفحة؟ ستفقد جميع البيانات التي أدخلتها.");
      setConfirmAction(() => () => navigate(destination));
      setShowConfirmDialog(true);
    } else {
      navigate(destination);
    }
  };
  
  // تعديل دالة goBack لتستخدم نافذة التأكيد
  const goBack = () => {
    // التحقق إذا كان المستخدم قد أدخل بيانات
    const hasEnteredData = adData.title || adData.description || adData.price || 
                          (adData.images && adData.images.length > 0) || 
                          (adData.features && adData.features.length > 0);
    
    if (hasEnteredData) {
      let destination = "";
      
      if (showMainForm) {
        if (adData.categoryType === "vehicles") {
          destination = `/dashboard/advertisements/add/${adData.categoryType}`;
        } else {
          destination = `/dashboard/advertisements/add`;
        }
      } else if (showAdTypeSelection) {
        destination = `/dashboard/advertisements/add`;
      }
      
      setConfirmMessage("هل أنت متأكد من العودة للخلف؟ ستفقد التغييرات التي قمت بها.");
      setConfirmAction(() => () => {
        if (showMainForm) {
          if (adData.categoryType === "vehicles") {
            setShowMainForm(false);
            setShowAdTypeSelection(true);
            navigate(`/dashboard/advertisements/add/${adData.categoryType}`, { replace: true });
          } else {
            setShowMainForm(false);
            setShowCategorySelection(true);
            navigate(`/dashboard/advertisements/add`, { replace: true });
          }
        } else if (showAdTypeSelection) {
          setShowAdTypeSelection(false);
          setShowCategorySelection(true);
          navigate(`/dashboard/advertisements/add`, { replace: true });
        }
      });
      setShowConfirmDialog(true);
    } else {
      if (showMainForm) {
        if (adData.categoryType === "vehicles") {
          setShowMainForm(false);
          setShowAdTypeSelection(true);
          navigate(`/dashboard/advertisements/add/${adData.categoryType}`, { replace: true });
        } else {
          setShowMainForm(false);
          setShowCategorySelection(true);
          navigate(`/dashboard/advertisements/add`, { replace: true });
        }
      } else if (showAdTypeSelection) {
        setShowAdTypeSelection(false);
        setShowCategorySelection(true);
        navigate(`/dashboard/advertisements/add`, { replace: true });
      }
    }
  };

  // Función para asegurar que los números estén en formato inglés
  const ensureEnglishNumbers = (value: string): string => {
    // Convertir números árabes a inglés
    return value.replace(/[٠-٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1632 + 48));
  };

  // Handle input changes with English number formatting
  const handleChange = (field: keyof AdvertisementData, value: string | boolean) => {
    // Convertir números a formato inglés si es una cadena
    if (typeof value === 'string' && /\d/.test(value)) {
      value = ensureEnglishNumbers(value);
    }
    
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

  // Add new empty image slot
  const addImageSlot = () => {
    // تحقق من أن عدد الصور لا يتجاوز 10
    if (adData.images && adData.images.length >= 10) {
      toast({
        title: "تم الوصول للحد الأقصى",
        description: "يمكنك إضافة 10 صور كحد أقصى",
        variant: "destructive",
      });
      return;
    }

    // تظهر نافذة اختيار الملف أو التقاط صورة
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.capture = 'environment'; // للسماح بالتقاط صورة مباشرة
    fileInput.multiple = true; // للسماح بتحديد عدة صور
    
    fileInput.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        // تحديد عدد الملفات المسموح بإضافتها
        const remainingSlots = 10 - (adData.images?.length || 0);
        const filesToProcess = Math.min(files.length, remainingSlots);
        
        // هنا يمكن إضافة معالجة للصور المختارة
        for (let i = 0; i < filesToProcess; i++) {
          const file = files[i];
          const reader = new FileReader();
          reader.onload = () => {
            const imageUrl = reader.result as string;
            const updatedImages = [...(adData.images || [])];
            updatedImages.push(imageUrl);
            setAdData({
              ...adData,
              images: updatedImages
            });
          };
          reader.readAsDataURL(file);
        }
        
        // إظهار رسالة إذا تم تجاوز الحد الأقصى
        if (files.length > remainingSlots) {
          toast({
            title: "تم تجاوز الحد الأقصى للصور",
            description: `تم إضافة ${remainingSlots} صور فقط من أصل ${files.length}`,
            variant: "warning",
          });
        }
      }
    };
    
    fileInput.click();
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;
    
    // Required fields for all advertisements
    const requiredFields: (keyof AdvertisementData)[] = ['title', 'categoryType'];
    
    // Check vehicle required fields
    if (adData.categoryType === 'vehicles') {
      // Common vehicle fields
      requiredFields.push('adType', 'year', 'fuelType');
      
      // Additional fields for sale only
      if (adData.adType === 'sale') {
        requiredFields.push('condition', 'kilometers', 'price');
        
        // Check monthly payment if option is selected
        if (adData.hasMonthlyPayment && (!adData.monthlyPayment || adData.monthlyPayment.trim() === "")) {
          newErrors.monthlyPayment = true;
          isValid = false;
        }
      }
      
      // Additional fields required for rental ads
      if (adData.adType === 'rent') {
        // Check if at least one pricing option is set
        const hasValidPricingOption = adData.pricingOptions?.some(
          option => option.period && option.price && option.price.trim() !== ""
        );
        
        if (!hasValidPricingOption) {
          newErrors.pricingOptions = true;
          isValid = false;
        }
      }
    } else if (adData.categoryType === 'others') {
      // حقول إضافية مطلوبة للفئات الأخرى
      requiredFields.push('price');
    } else if (adData.categoryType === 'real-estate' && adData.adType === 'sale') {
      // Real estate sale ads also require price
      requiredFields.push('price');
    }
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!adData[field] || (typeof adData[field] === 'string' && adData[field]?.trim() === "")) {
        newErrors[field] = true;
        isValid = false;
      }
    });
    
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
      // التحقق من وجود جلسة مستخدم نشطة
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("يرجى تسجيل الدخول أولاً");
      }
      
      // التحقق من بيانات المكتب
      if (!office?.id) {
        throw new Error("لم يتم العثور على بيانات المكتب");
      }
      
      // تحضير بيانات الإعلان بالتنسيق المناسب لقاعدة البيانات
      const advertisementData = {
        title: adData.title,
        description: adData.description,
        price: adData.adType === 'sale' ? adData.price : null, // سعر البيع فقط إذا كان الإعلان للبيع
        negotiable: adData.adType === 'sale' ? adData.negotiable : false,
        has_monthly_payment: adData.adType === 'sale' ? adData.hasMonthlyPayment : false,
        monthly_payment: adData.adType === 'sale' ? adData.monthlyPayment : null,
        manufacturer: adData.adType === 'sale' ? adData.manufacturer : null,
        model: adData.adType === 'sale' ? adData.model : null,
        year: adData.year,
        kilometers: adData.adType === 'sale' ? adData.kilometers : null,
        fuel_type: adData.fuelType,
        color: adData.color,
        interior_color: adData.adType === 'sale' ? adData.interiorColor : null,
        body_type: adData.bodyType,
        engine_size: adData.engineSize,
        import: adData.adType === 'sale' ? adData.import : null,
        condition: adData.adType === 'sale' ? adData.condition : null,
        gear_type: adData.adType === 'sale' ? adData.gearType : null,
        property_type: adData.propertyType,
        area: adData.area,
        ad_type: adData.adType,
        category_type: adData.categoryType,
        is_active: adData.isActive,
        rent_period: adData.adType === 'rent' ? adData.rentPeriod : null,
        deposit: adData.adType === 'rent' ? adData.deposit : null,
        km_limit: adData.adType === 'rent' ? adData.kmLimit : null,
        display_period: adData.adType === 'rent' ? adData.displayPeriod : null,
        show_features: adData.showFeatures,
        category_id: adData.selectedCategory || null,
        user_id: session.user.id,
        office_id: office.id
      };
      
      // إدراج الإعلان في قاعدة البيانات
      const { data: adRecord, error: adError } = await supabase
        .from('advertisements')
        .insert(advertisementData)
        .select()
        .single();
      
      if (adError) throw adError;
      
      // رفع الصور وإدراج سجلات الصور
      if (adData.images && adData.images.length > 0) {
        const imagePromises = adData.images.map(async (imageData, index) => {
          try {
            // التعامل مع البيانات سواء كانت url مباشر أو ملف
            let filePath = '';
            if (typeof imageData === 'string') {
              // إذا كانت الصورة بصيغة Base64 URL (من fileReader)
              const file = await fetch(imageData).then(r => r.blob());
              const fileExt = 'jpg'; // اختراض jpg للصور من base64
              const fileName = `${session.user.id}/${adRecord.id}/${index}.${fileExt}`;
              filePath = `advertisements/${fileName}`;
              
              // رفع الصورة إلى التخزين
              const { error: uploadError } = await supabase
                .storage
                .from('advertisements')
                .upload(filePath, file);
                
              if (uploadError) throw uploadError;
            }
            
            // إدراج سجل الصورة
            const { error: imageError } = await supabase
              .from('advertisement_images')
              .insert({
                advertisement_id: adRecord.id,
                image_url: filePath,
                is_main: index === 0 // الصورة الأولى هي الرئيسية
              });
            
            if (imageError) throw imageError;
            
            return filePath;
          } catch (err) {
            console.error(`خطأ في رفع الصورة ${index}:`, err);
            return null;
          }
        });
        
        await Promise.all(imagePromises);
      }
      
      // إدراج ميزات الإعلان
      if (adData.features && adData.features.length > 0) {
        const featureRecords = adData.features.map(feature => ({
          advertisement_id: adRecord.id,
          feature: feature
        }));
        
        const { error: featuresError } = await supabase
          .from('advertisement_features')
          .insert(featureRecords);
        
        if (featuresError) throw featuresError;
      }
      
      // إدراج خيارات الأسعار لإعلانات الإيجار
      if (adData.adType === "rent" && adData.pricingOptions && adData.pricingOptions.length > 0) {
        const pricingRecords = adData.pricingOptions.map(option => ({
          advertisement_id: adRecord.id,
          period: option.period,
          price: option.price
        }));
        
        const { error: pricingError } = await supabase
          .from('advertisement_pricing_options')
          .insert(pricingRecords);
        
        if (pricingError) throw pricingError;
      }
      
      // نجاح العملية
      toast({
        title: "تم الإضافة بنجاح",
        description: "تم إضافة الإعلان بنجاح وستتم مراجعته قريبًا",
      });
      
      navigate("/dashboard/advertisements");
    } catch (error: any) {
      console.error("Error submitting advertisement:", error);
      toast({
        title: "خطأ في الإرسال",
        description: error.message || "حدث خطأ أثناء إضافة الإعلان",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  // تعديل دالة handleCancel لتعرض نافذة التأكيد المنبثقة بدلاً من window.confirm
  const handleCancel = () => {
    setConfirmMessage("هل أنت متأكد من إلغاء إنشاء الإعلان؟ ستفقد جميع البيانات التي أدخلتها.");
    setConfirmAction(() => () => navigate("/dashboard/advertisements"));
    setShowConfirmDialog(true);
  };

  // Function to fetch user categories
  const fetchUserCategories = async () => {
    // هنا يمكنك إضافة كود لجلب الفئات من قاعدة البيانات
    // لأغراض العرض التجريبي، سأستخدم بيانات وهمية
    return [
      { id: '1', name: 'سيارات فاخرة' },
      { id: '2', name: 'سيارات اقتصادية' },
      { id: '3', name: 'دراجات نارية' },
      { id: '4', name: 'شاحنات' }
    ];
  };

  // Add price option with English number formatting
  const addPriceOption = () => {
    // Validate price input
    if (!pricingInput.price || parseFloat(pricingInput.price) <= 0) {
      setErrors({
        ...errors,
        pricingInputPrice: true
      });
      return;
    }

    // Validate period selection
    if (!pricingInput.period) {
      setErrors({
        ...errors,
        pricingInputPeriod: true
      });
      return;
    }

    // Ensure price is in English format
    const formattedPrice = ensureEnglishNumbers(pricingInput.price);

    // Check if this period already exists
    if (adData.pricingOptions?.some(option => option.period === pricingInput.period)) {
      // Update the existing price for this period
      const updatedOptions = adData.pricingOptions.map(option => {
        if (option.period === pricingInput.period) {
          return { ...option, price: formattedPrice };
        }
        return option;
      });
      
      setAdData({
        ...adData,
        pricingOptions: updatedOptions
      });
    } else {
      // Add a new price option
      const newOption = {
        id: Math.random().toString(36).substr(2, 9),
        period: pricingInput.period,
        price: formattedPrice
      };
      
      const newPricingOptions = [
        ...(adData.pricingOptions || []),
        newOption
      ];
      
      // If this is the first price option, set it as the display period automatically
      const newDisplayPeriod = adData.pricingOptions?.length === 0 ? newOption.period : adData.displayPeriod;
      
      setAdData({
        ...adData,
        pricingOptions: newPricingOptions,
        displayPeriod: newDisplayPeriod
      });
    }

    // Clear errors
    if (errors.pricingOptions || errors.pricingInputPrice || errors.pricingInputPeriod) {
      setErrors({
        ...errors,
        pricingOptions: false,
        pricingInputPrice: false,
        pricingInputPeriod: false
      });
    }

    // Find next available period for selection
    const availablePeriods = ['daily', 'weekly', 'monthly', 'yearly'].filter(
      period => !adData.pricingOptions?.some(option => option.period === period) &&
               // exclude current period as it was just added
               period !== pricingInput.period
    );
    
    // Reset input with next period or empty string if all periods are filled
    setPricingInput({
      period: availablePeriods.length > 0 ? availablePeriods[0] as any : "",
      price: ""
    });
  };

  // Remove price option
  const removePriceOption = (id: string) => {
    const remainingOptions = adData.pricingOptions?.filter(option => option.id !== id) || [];
    
    // If we're removing the currently displayed period, select a new one if available
    let newDisplayPeriod = adData.displayPeriod;
    const removedOption = adData.pricingOptions?.find(option => option.id === id);
    
    if (removedOption && removedOption.period === adData.displayPeriod && remainingOptions.length > 0) {
      // Select the first available option as default display period
      newDisplayPeriod = remainingOptions[0].period;
    }
    
    setAdData({
      ...adData,
      pricingOptions: remainingOptions,
      displayPeriod: newDisplayPeriod
    });
  };

  // Get price option label
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'daily': return 'يومي';
      case 'weekly': return 'أسبوعي';
      case 'monthly': return 'شهري';
      case 'yearly': return 'سنوي';
      default: return period;
    }
  };

  // Render vehicle specific fields
  const renderVehicleFields = () => {
    // Fields common to both sale and rental
    const commonFields = (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">🚗 مواصفات السيارة</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fields for sale only */}
          {adData.adType === 'sale' && (
            <>
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
                <Label htmlFor="condition">حالة السيارة <span className="text-red-500">*</span></Label>
          <Select 
                  value={adData.condition} 
                  onValueChange={(value) => handleChange("condition", value)}
                >
                  <SelectTrigger className={errors.condition ? "border-red-500" : ""}>
                    <SelectValue placeholder="اختر حالة السيارة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">جديدة</SelectItem>
                    <SelectItem value="excellent">ممتازة</SelectItem>
                    <SelectItem value="very-good">جيدة جداً</SelectItem>
                    <SelectItem value="good">جيدة</SelectItem>
                    <SelectItem value="fair">متوسطة</SelectItem>
                    <SelectItem value="needs-work">تحتاج إصلاحات</SelectItem>
                  </SelectContent>
                </Select>
                {errors.condition && <p className="text-red-500 text-xs">يرجى اختيار حالة السيارة</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="import">وارد السيارة</Label>
                <Select 
                  value={adData.import} 
                  onValueChange={(value) => handleChange("import", value)}
          >
            <SelectTrigger>
                    <SelectValue placeholder="اختر وارد السيارة" />
            </SelectTrigger>
            <SelectContent>
                    <SelectItem value="kuwait">الكويت</SelectItem>
                    <SelectItem value="usa">أمريكا</SelectItem>
                    <SelectItem value="japan">اليابان</SelectItem>
                    <SelectItem value="saudi">السعودية</SelectItem>
                    <SelectItem value="europe">أوروبا</SelectItem>
                    <SelectItem value="uae">الإمارات</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
              </div>
            </>
          )}
          
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
            </SelectContent>
          </Select>
          {errors.fuelType && <p className="text-red-500 text-xs">يرجى اختيار نوع الوقود</p>}
        </div>
        
          {adData.adType === 'sale' && (
            <>
        <div className="space-y-2">
                <Label htmlFor="gearType">نوع ناقل الحركة</Label>
          <Select 
            value={adData.gearType} 
            onValueChange={(value) => handleChange("gearType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر نوع ناقل الحركة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="automatic">أوتوماتيك</SelectItem>
                    <SelectItem value="manual">عادي</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
                <Label htmlFor="color">لون السيارة الخارجي</Label>
          <Input 
            id="color" 
            placeholder="مثال: أبيض، أسود، رمادي..." 
            value={adData.color}
            onChange={(e) => handleChange("color", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
                <Label htmlFor="interiorColor">لون الداخلية</Label>
                <Input 
                  id="interiorColor" 
                  placeholder="مثال: بيج، أسود، بني..." 
                  value={adData.interiorColor}
                  onChange={(e) => handleChange("interiorColor", e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
    
    // Fields specific to a sale ad
    const saleFields = adData.adType === 'sale' && (
      <div className="p-4 border border-amber-200 rounded-lg bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 space-y-4 mt-6 hidden">
        <h3 className="text-lg font-medium text-amber-700 dark:text-amber-400">💰 تفاصيل البيع</h3>
      </div>
    );
    
    // Fields specific to a rental ad
    const rentalFields = adData.adType === 'rent' && (
      <div className="p-4 border border-teal-200 rounded-lg bg-teal-50 dark:bg-teal-900/10 dark:border-teal-800 space-y-4 mt-6">
        <h3 className="text-lg font-medium text-teal-700 dark:text-teal-400">🗓️ تفاصيل الإيجار</h3>
        
        {/* أسعار الإيجار */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-teal-100 dark:border-teal-900">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium">
              أسعار الإيجار <span className="text-red-500">*</span>
            </h4>
            {/* عدم إظهار زر الإضافة إذا كانت جميع الفترات مستخدمة */}
            {(adData.pricingOptions?.length < 4) && (
              <Button
                type="button"
                size="sm"
                onClick={addPriceOption}
                className="bg-teal-600 hover:bg-teal-700 text-white"
                disabled={adData.pricingOptions?.length === 4 || !pricingInput.period || !pricingInput.price}
              >
                <Plus className="h-4 w-4 ml-1" /> إضافة سعر
              </Button>
            )}
          </div>
          
          {errors.pricingOptions && (
            <p className="text-red-500 text-xs mb-2">يجب إضافة خيار سعر واحد على الأقل مع تحديد الفترة والمبلغ</p>
          )}

          {/* الأسعار المضافة */}
          {adData.pricingOptions && adData.pricingOptions.length > 0 && (
            <div className="grid gap-2 mb-4 grid-cols-2 sm:grid-cols-4">
              {adData.pricingOptions.map(option => (
                <div key={option.id} className={`bg-teal-50 dark:bg-teal-900/20 rounded-lg px-3 py-2 flex items-center justify-between border ${adData.displayPeriod === option.period ? 'border-teal-400 dark:border-teal-600 ring-1 ring-teal-300' : 'border-teal-200 dark:border-teal-800'}`}>
                  <div className="flex flex-col">
                    <span className="font-medium text-teal-700 dark:text-teal-500">{getPeriodLabel(option.period)}</span>
                    <span className="text-sm"><span className="price-display">{option.price}</span> د.ك</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removePriceOption(option.id)}
                    className="text-red-500 hover:text-red-700 transition-colors rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* إضافة سعر جديد - نخفي القسم إذا كانت جميع الفترات مستخدمة */}
          {(adData.pricingOptions?.length < 4) && (
            <div className="flex flex-wrap gap-2 items-end">
              <div className="w-full sm:w-32">
                <Select 
                  value={pricingInput.period} 
                  onValueChange={(value) => setPricingInput({...pricingInput, period: value as any})}
                >
                  <SelectTrigger id="price-period" className={errors.pricingInputPeriod ? "border-red-500" : ""}>
                    <SelectValue placeholder="فترة الإيجار" />
                  </SelectTrigger>
                  <SelectContent>
                    {!adData.pricingOptions?.some(option => option.period === "daily") && (
                      <SelectItem value="daily">يومي</SelectItem>
                    )}
                    {!adData.pricingOptions?.some(option => option.period === "weekly") && (
                      <SelectItem value="weekly">أسبوعي</SelectItem>
                    )}
                    {!adData.pricingOptions?.some(option => option.period === "monthly") && (
                      <SelectItem value="monthly">شهري</SelectItem>
                    )}
                    {!adData.pricingOptions?.some(option => option.period === "yearly") && (
                      <SelectItem value="yearly">سنوي</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.pricingInputPeriod && <p className="text-red-500 text-xs">اختر الفترة</p>}
              </div>
              
              <div className="flex-1">
                <div className="relative">
                  <Input
                    id="price-amount"
                    type="number"
                    placeholder="0"
                    value={pricingInput.price}
                    onChange={(e) => setPricingInput({...pricingInput, price: ensureEnglishNumbers(e.target.value)})}
                    className={`${errors.pricingInputPrice ? "border-red-500" : ""} pr-12 number-input`}
                    min="0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (pricingInput.price && pricingInput.period) {
                          addPriceOption();
                        }
                      }
                    }}
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center text-gray-500">
                    د.ك
                  </div>
                </div>
                {errors.pricingInputPrice && <p className="text-red-500 text-xs">أدخل سعرًا صحيحًا</p>}
              </div>
            </div>
          )}

          {/* اختيار سعر العرض - قائمة منسدلة بسيطة */}
          {adData.pricingOptions && adData.pricingOptions.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="displayPeriod" className="text-sm font-medium">اختر سعر العرض:</Label>
                <div className="text-xs text-gray-500">(السعر الذي سيظهر في الصفحة الرئيسية)</div>
              </div>
              <Select 
                value={adData.displayPeriod} 
                onValueChange={(value) => handleChange("displayPeriod", value)}
              >
                <SelectTrigger id="displayPeriod" className="w-full">
                  <SelectValue placeholder="اختر سعر العرض" />
                </SelectTrigger>
                <SelectContent>
                  {adData.pricingOptions.map(option => (
                    <SelectItem key={option.id} value={option.period}>
                      {getPeriodLabel(option.period)} - <span className="price-display">{option.price}</span> د.ك
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {/* قسم إضافي لمعلومات إضافية عن الإيجار */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-teal-100 dark:border-teal-900 mt-4">
          <h4 className="text-md font-medium mb-4">معلومات إضافية للإيجار</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deposit">مبلغ التأمين</Label>
              <div className="relative">
                <Input
                  id="deposit"
                  type="number"
                  placeholder="0"
                  value={adData.deposit}
                  onChange={(e) => handleChange("deposit", e.target.value)}
                  className="pr-16 number-input"
                  min="0"
                />
                <div className="absolute inset-y-0 right-2 flex items-center text-gray-500">
                  د.ك
                </div>
              </div>
            </div>
            
            {/* يمكن إضافة حقول أخرى خاصة بإيجار العقارات هنا */}
          </div>
        </div>
      </div>
    );
    
    return (
      <div className="space-y-4">
        {commonFields}
        {rentalFields}
      </div>
    );
  };

  // Render real estate specific fields
  const renderRealEstateFields = () => {
    // Fields common to both sale and rental
    const commonFields = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="propertyType">نوع العقار</Label>
          <Select 
            value={adData.propertyType} 
            onValueChange={(value) => handleChange("propertyType", value)}
          >
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
          <Input 
            id="area" 
            type="number" 
            placeholder="مثال: 150"
            value={adData.area}
            onChange={(e) => handleChange("area", e.target.value)}
          />
        </div>
      </div>
    );
    
    // Fields specific to a rental ad
    const rentalFields = adData.adType === 'rent' && (
      <div className="p-4 border border-teal-200 rounded-lg bg-teal-50 dark:bg-teal-900/10 dark:border-teal-800 space-y-4 mt-6">
        <h3 className="text-lg font-medium text-teal-700 dark:text-teal-400">🏠 تفاصيل الإيجار العقاري</h3>
        
        {/* أسعار الإيجار */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-teal-100 dark:border-teal-900">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium">
              أسعار الإيجار <span className="text-red-500">*</span>
            </h4>
            {/* عدم إظهار زر الإضافة إذا كانت جميع الفترات مستخدمة */}
            {(adData.pricingOptions?.length < 4) && (
              <Button
                type="button"
                size="sm"
                onClick={addPriceOption}
                className="bg-teal-600 hover:bg-teal-700 text-white"
                disabled={adData.pricingOptions?.length === 4 || !pricingInput.period || !pricingInput.price}
              >
                <Plus className="h-4 w-4 ml-1" /> إضافة سعر
              </Button>
            )}
          </div>
          
          {errors.pricingOptions && (
            <p className="text-red-500 text-xs mb-2">يجب إضافة خيار سعر واحد على الأقل مع تحديد الفترة والمبلغ</p>
          )}

          {/* الأسعار المضافة */}
          {adData.pricingOptions && adData.pricingOptions.length > 0 && (
            <div className="grid gap-2 mb-4 grid-cols-2 sm:grid-cols-4">
              {adData.pricingOptions.map(option => (
                <div key={option.id} className={`bg-teal-50 dark:bg-teal-900/20 rounded-lg px-3 py-2 flex items-center justify-between border ${adData.displayPeriod === option.period ? 'border-teal-400 dark:border-teal-600 ring-1 ring-teal-300' : 'border-teal-200 dark:border-teal-800'}`}>
                  <div className="flex flex-col">
                    <span className="font-medium text-teal-700 dark:text-teal-500">{getPeriodLabel(option.period)}</span>
                    <span className="text-sm"><span className="price-display">{option.price}</span> د.ك</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removePriceOption(option.id)}
                    className="text-red-500 hover:text-red-700 transition-colors rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* إضافة سعر جديد - نخفي القسم إذا كانت جميع الفترات مستخدمة */}
          {(adData.pricingOptions?.length < 4) && (
            <div className="flex flex-wrap gap-2 items-end">
              <div className="w-full sm:w-32">
                <Select 
                  value={pricingInput.period} 
                  onValueChange={(value) => setPricingInput({...pricingInput, period: value as any})}
                >
                  <SelectTrigger id="price-period" className={errors.pricingInputPeriod ? "border-red-500" : ""}>
                    <SelectValue placeholder="فترة الإيجار" />
                  </SelectTrigger>
                  <SelectContent>
                    {!adData.pricingOptions?.some(option => option.period === "daily") && (
                      <SelectItem value="daily">يومي</SelectItem>
                    )}
                    {!adData.pricingOptions?.some(option => option.period === "weekly") && (
                      <SelectItem value="weekly">أسبوعي</SelectItem>
                    )}
                    {!adData.pricingOptions?.some(option => option.period === "monthly") && (
                      <SelectItem value="monthly">شهري</SelectItem>
                    )}
                    {!adData.pricingOptions?.some(option => option.period === "yearly") && (
                      <SelectItem value="yearly">سنوي</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.pricingInputPeriod && <p className="text-red-500 text-xs">اختر الفترة</p>}
              </div>
              
              <div className="flex-1">
                <div className="relative">
                  <Input
                    id="price-amount"
                    type="number"
                    placeholder="0"
                    value={pricingInput.price}
                    onChange={(e) => setPricingInput({...pricingInput, price: ensureEnglishNumbers(e.target.value)})}
                    className={`${errors.pricingInputPrice ? "border-red-500" : ""} pr-12 number-input`}
                    min="0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (pricingInput.price && pricingInput.period) {
                          addPriceOption();
                        }
                      }
                    }}
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center text-gray-500">
                    د.ك
                  </div>
                </div>
                {errors.pricingInputPrice && <p className="text-red-500 text-xs">أدخل سعرًا صحيحًا</p>}
              </div>
            </div>
          )}

          {/* اختيار سعر العرض - قائمة منسدلة بسيطة */}
          {adData.pricingOptions && adData.pricingOptions.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="displayPeriod" className="text-sm font-medium">اختر سعر العرض:</Label>
                <div className="text-xs text-gray-500">(السعر الذي سيظهر في الصفحة الرئيسية)</div>
              </div>
              <Select 
                value={adData.displayPeriod} 
                onValueChange={(value) => handleChange("displayPeriod", value)}
              >
                <SelectTrigger id="displayPeriod" className="w-full">
                  <SelectValue placeholder="اختر سعر العرض" />
                </SelectTrigger>
                <SelectContent>
                  {adData.pricingOptions.map(option => (
                    <SelectItem key={option.id} value={option.period}>
                      {getPeriodLabel(option.period)} - <span className="price-display">{option.price}</span> د.ك
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {/* قسم إضافي لمعلومات إضافية عن الإيجار */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-teal-100 dark:border-teal-900 mt-4">
          <h4 className="text-md font-medium mb-4">معلومات إضافية للإيجار</h4>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-2 space-x-reverse mb-2">
              <Switch
                id="hasDeposit"
                checked={adData.deposit !== "" && adData.deposit !== undefined}
                onCheckedChange={(checked) => {
                  if (!checked) {
                    handleChange("deposit", "");
                  } else {
                    handleChange("deposit", "0");
                  }
                }}
              />
              <Label htmlFor="hasDeposit">هل يوجد مبلغ تأمين؟</Label>
            </div>
            
            {adData.deposit !== "" && adData.deposit !== undefined && (
              <div className="pt-2 pr-8">
                <Label htmlFor="deposit">مبلغ التأمين</Label>
                <div className="relative mt-1">
                  <Input
                    id="deposit"
                    type="number"
                    placeholder="مثال: 500"
                    value={adData.deposit}
                    onChange={(e) => handleChange("deposit", e.target.value)}
                    className="pr-16 number-input"
                    min="0"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                    د.ك
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
    
    // مميزات العقار (تظهر لكل من البيع والإيجار)
    const propertyFeatures = (
      <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/10 dark:border-green-800 mt-6">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Switch
            id="showFeatures"
            checked={adData.showFeatures}
            onCheckedChange={(checked) => handleChange("showFeatures", checked)}
          />
          <Label htmlFor="showFeatures" className="font-medium">إظهار مميزات العقار</Label>
        </div>
        
        {/* إظهار المميزات فقط عند تفعيل الزر */}
        {adData.showFeatures && (
          <div className="mt-4 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-green-100 dark:border-green-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <input type="checkbox" id="balcony" className="h-4 w-4 rounded"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAdData({
                        ...adData,
                        features: [...(adData.features || []), "شرفة"]
                      });
                    } else {
                      setAdData({
                        ...adData,
                        features: (adData.features || []).filter(f => f !== "شرفة")
                      });
                    }
                  }}
                  checked={(adData.features || []).includes("شرفة")}
                />
                <Label htmlFor="balcony" className="text-sm">شرفة</Label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <input type="checkbox" id="garden" className="h-4 w-4 rounded"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAdData({
                        ...adData,
                        features: [...(adData.features || []), "حديقة"]
                      });
                    } else {
                      setAdData({
                        ...adData,
                        features: (adData.features || []).filter(f => f !== "حديقة")
                      });
                    }
                  }}
                  checked={(adData.features || []).includes("حديقة")}
                />
                <Label htmlFor="garden" className="text-sm">حديقة</Label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <input type="checkbox" id="parking" className="h-4 w-4 rounded"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAdData({
                        ...adData,
                        features: [...(adData.features || []), "موقف سيارات"]
                      });
                    } else {
                      setAdData({
                        ...adData,
                        features: (adData.features || []).filter(f => f !== "موقف سيارات")
                      });
                    }
                  }}
                  checked={(adData.features || []).includes("موقف سيارات")}
                />
                <Label htmlFor="parking" className="text-sm">موقف سيارات</Label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <input type="checkbox" id="elevator" className="h-4 w-4 rounded"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAdData({
                        ...adData,
                        features: [...(adData.features || []), "مصعد"]
                      });
                    } else {
                      setAdData({
                        ...adData,
                        features: (adData.features || []).filter(f => f !== "مصعد")
                      });
                    }
                  }}
                  checked={(adData.features || []).includes("مصعد")}
                />
                <Label htmlFor="elevator" className="text-sm">مصعد</Label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <input type="checkbox" id="centralAC" className="h-4 w-4 rounded"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAdData({
                        ...adData,
                        features: [...(adData.features || []), "تكييف مركزي"]
                      });
                    } else {
                      setAdData({
                        ...adData,
                        features: (adData.features || []).filter(f => f !== "تكييف مركزي")
                      });
                    }
                  }}
                  checked={(adData.features || []).includes("تكييف مركزي")}
                />
                <Label htmlFor="centralAC" className="text-sm">تكييف مركزي</Label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <input type="checkbox" id="security" className="h-4 w-4 rounded"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAdData({
                        ...adData,
                        features: [...(adData.features || []), "أمن وحراسة"]
                      });
                    } else {
                      setAdData({
                        ...adData,
                        features: (adData.features || []).filter(f => f !== "أمن وحراسة")
                      });
                    }
                  }}
                  checked={(adData.features || []).includes("أمن وحراسة")}
                />
                <Label htmlFor="security" className="text-sm">أمن وحراسة</Label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <input type="checkbox" id="pool" className="h-4 w-4 rounded"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAdData({
                        ...adData,
                        features: [...(adData.features || []), "مسبح"]
                      });
                    } else {
                      setAdData({
                        ...adData,
                        features: (adData.features || []).filter(f => f !== "مسبح")
                      });
                    }
                  }}
                  checked={(adData.features || []).includes("مسبح")}
                />
                <Label htmlFor="pool" className="text-sm">مسبح</Label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <input type="checkbox" id="gym" className="h-4 w-4 rounded"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAdData({
                        ...adData,
                        features: [...(adData.features || []), "صالة رياضية"]
                      });
                    } else {
                      setAdData({
                        ...adData,
                        features: (adData.features || []).filter(f => f !== "صالة رياضية")
                      });
                    }
                  }}
                  checked={(adData.features || []).includes("صالة رياضية")}
                />
                <Label htmlFor="gym" className="text-sm">صالة رياضية</Label>
              </div>
            </div>

            {/* إضافة ميزة مخصصة */}
            <div className="mt-6 border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Input
                  id="newFeature"
                  placeholder="أضف ميزة أخرى..."
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                  ref={featureInputRef}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={addFeature}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 ml-1" /> إضافة
                </Button>
              </div>
            </div>

            {/* عرض الميزات المخصصة المضافة */}
            {adData.features?.filter(f => ![
              "شرفة", "حديقة", "موقف سيارات", "مصعد", "تكييف مركزي", 
              "أمن وحراسة", "مسبح", "صالة رياضية"
            ].includes(f)).length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-2">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">الميزات المخصصة المضافة:</h4>
                {adData.features?.filter(f => ![
                  "شرفة", "حديقة", "موقف سيارات", "مصعد", "تكييف مركزي", 
                  "أمن وحراسة", "مسبح", "صالة رياضية"
                ].includes(f)).map((feature, index) => (
                  <div key={index} className="flex items-center justify-between px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-100 dark:border-green-800">
                    <span className="text-sm">{feature}</span>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => removeFeature(adData.features?.indexOf(feature) || 0)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 h-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
    
    return (
      <div className="space-y-4">
        {commonFields}
        {rentalFields}
        {propertyFeatures}
      </div>
    );
  };

  // Render category specific fields
  const renderCategoryFields = () => {
    if (adData.categoryType === 'vehicles') {
      // بدون تغيير في كود السيارات
      return (
        <>
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="selectedCategory">الفئة</Label>
                <Select 
                  value={adData.selectedCategory} 
                  onValueChange={(value) => handleChange("selectedCategory", value)}
                >
                  <SelectTrigger className={errors.selectedCategory ? "border-red-500" : ""}>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {userCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.selectedCategory && <p className="text-red-500 text-xs">يرجى اختيار الفئة</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="isActive">الحالة</Label>
                <Select 
                  value={adData.isActive ? "active" : "inactive"} 
                  onValueChange={(value) => handleChange("isActive", value === "active")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر حالة الإعلان" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشطة</SelectItem>
                    <SelectItem value="inactive">غير نشطة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {renderVehicleFields()}
        </>
      );
    } else if (adData.categoryType === 'real-estate') {
      // بدون تغيير في كود العقارات
      return (
        <>
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="selectedCategory">الفئة</Label>
                <Select 
                  value={adData.selectedCategory} 
                  onValueChange={(value) => handleChange("selectedCategory", value)}
                >
                  <SelectTrigger className={errors.selectedCategory ? "border-red-500" : ""}>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {userCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.selectedCategory && <p className="text-red-500 text-xs">يرجى اختيار الفئة</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="isActive">الحالة</Label>
                <Select 
                  value={adData.isActive ? "active" : "inactive"} 
                  onValueChange={(value) => handleChange("isActive", value === "active")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر حالة الإعلان" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشطة</SelectItem>
                    <SelectItem value="inactive">غير نشطة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {renderRealEstateFields()}
        </>
      );
    } else {
      // نموذج مبسط للفئات الأخرى بشكل صحيح
      return (
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">السعر <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={adData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className={`${errors.price ? "border-red-500" : ""} pr-16 number-input`}
                  min="0"
                />
                <div className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                  د.ك
                </div>
              </div>
              {errors.price && <p className="text-red-500 text-xs">يرجى إدخال السعر</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="isActive">الحالة</Label>
              <Select 
                value={adData.isActive ? "active" : "inactive"} 
                onValueChange={(value) => handleChange("isActive", value === "active")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر حالة الإعلان" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشطة</SelectItem>
                  <SelectItem value="inactive">غير نشطة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 mobile-container">
      {/* نافذة التأكيد المنبثقة */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">تأكيد العملية</DialogTitle>
            <DialogDescription className="text-center pt-2">
              {confirmMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-center gap-2 sm:justify-center">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setShowConfirmDialog(false);
                confirmAction();
              }}
            >
              نعم، متأكد
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <header className="flex justify-between items-center mb-6">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => {
            if (showCategorySelection) {
              // عند الضغط على زر الرجوع في صفحة اختيار التصنيفات، العودة إلى صفحة الإعلانات
              handleLeavePage("/dashboard/advertisements");
            } else {
              goBack();
            }
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="space-y-1 text-right">
          <h1 className="text-2xl font-bold">إضافة إعلان جديد</h1>
          {!showCategorySelection && (
          <p className="text-gray-500 text-sm">
              {adData.categoryType === 'vehicles' ? 'مركبات' : 
               adData.categoryType === 'real-estate' ? 'عقارات' : 'أخرى'}
              {adData.categoryType === 'vehicles' && adData.adType && ` - ${adData.adType === 'sale' ? 'للبيع' : 'للإيجار'}`}
              {adData.categoryType === 'real-estate' && adData.adType && ` - ${adData.adType === 'sale' ? 'للبيع' : 'للإيجار'}`}
          </p>
          )}
        </div>
      </header>

      {showCategorySelection && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => selectMainCategory('vehicles')}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h8m-4 5v-9" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17h6a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">مركبات</h3>
              <p className="text-gray-500 mt-2">سيارات، دراجات نارية، شاحنات، قوارب</p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => selectMainCategory('real-estate')}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">عقارات</h3>
              <p className="text-gray-500 mt-2">شقق، فلل، أراضي، محلات تجارية</p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => selectMainCategory('others')}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">أخرى</h3>
              <p className="text-gray-500 mt-2">أجهزة إلكترونية، أثاث، ملابس، خدمات</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* عرض اختيارات للمركبات */}
      {showAdTypeSelection && adData.categoryType === 'vehicles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => selectAdType('sale')}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">مركبة للبيع</h3>
              <p className="text-gray-500 mt-2">بيع مركبتك للمشترين المهتمين</p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => selectAdType('rent')}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">مركبة للإيجار</h3>
              <p className="text-gray-500 mt-2">تأجير مركبتك للمستأجرين المهتمين</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* عرض اختيارات للعقارات */}
      {showAdTypeSelection && adData.categoryType === 'real-estate' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => selectAdType('sale')}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">عقار للبيع</h3>
              <p className="text-gray-500 mt-2">بيع عقارك للمشترين المهتمين</p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => selectAdType('rent')}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">عقار للإيجار</h3>
              <p className="text-gray-500 mt-2">تأجير عقارك للمستأجرين المهتمين</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {showMainForm && (
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
        {/* Basic Information */}
            <Card className="mobile-card">
              <CardContent className="p-5 sm:p-6 mobile-card-content">
            <div className="space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <span className="text-blue-600 dark:text-blue-400">📝</span> تفاصيل الإعلان
                    </h2>
                  </div>

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

                  {/* Price field for sale advertisements */}
                  {(adData.adType === 'sale' && adData.categoryType !== 'others') && (
            <div className="space-y-4">
              <div className="space-y-2">
                        <Label htmlFor="price">السعر المطلوب <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                            placeholder="0"
                    value={adData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                            className={`${errors.price ? "border-red-500" : ""} pr-16 number-input`}
                    min="0"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                    د.ك
                  </div>
                </div>
                {errors.price && <p className="text-red-500 text-xs">يرجى إدخال السعر</p>}
              </div>

                      {adData.adType === 'sale' && (
                        <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="negotiable"
                  checked={adData.negotiable}
                  onCheckedChange={(checked) => handleChange("negotiable", checked)}
                />
                            <Label htmlFor="negotiable">إمكانية التفاوض على السعر</Label>
              </div>

                          <div className="flex items-center space-x-2 space-x-reverse mb-2">
                <Switch
                  id="hasMonthlyPayment"
                  checked={adData.hasMonthlyPayment}
                  onCheckedChange={(checked) => handleChange("hasMonthlyPayment", checked)}
                />
                            <Label htmlFor="hasMonthlyPayment">إمكانية التقسيط الشهري</Label>
              </div>

              {adData.hasMonthlyPayment && (
                            <div className="pt-2 pr-8">
                              <Label htmlFor="monthlyPayment">قيمة القسط الشهري <span className="text-red-500">*</span></Label>
                              <div className="relative mt-1">
                    <Input
                      id="monthlyPayment"
                      type="number"
                                  placeholder="مثال: 500"
                      value={adData.monthlyPayment}
                      onChange={(e) => handleChange("monthlyPayment", e.target.value)}
                      className={errors.monthlyPayment ? "border-red-500 pr-16" : "pr-16"}
                      min="0"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                      د.ك
                    </div>
                  </div>
                              {errors.monthlyPayment && <p className="text-red-500 text-xs mt-1">يرجى إدخال قيمة القسط الشهري</p>}
                            </div>
                  )}
                </div>
              )}
            </div>
                  )}

                  {/* Category Specific Fields */}
                  {renderCategoryFields()}

                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف العام</Label>
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
              </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="mobile-card">
              <CardContent className="p-4 sm:p-6 mobile-card-content">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-medium">
                    صور الإعلان <span className="text-red-500">*</span>
                  </h2>
                      <Button
                        type="button"
                    size="sm" 
                    variant="outline"
                    onClick={addImageSlot}
                    className="text-blue-600"
                  >
                    <Plus className="h-4 w-4 ml-1" /> إضافة صور
                      </Button>
                    </div>
                
            {errors.images && (
                  <p className="text-red-500 text-sm mb-2">يرجى إضافة صورة واحدة على الأقل</p>
                )}
                
                {/* عرض الصور */}
                {adData.images && adData.images.length > 0 ? (
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {adData.images.map((image, idx) => (
                      <div key={`image-${idx}`} className="relative group">
                        <div className={`border rounded-lg overflow-hidden ${idx === 0 ? 'border-amber-500 ring-2 ring-amber-300' : 'border-gray-200'}`} style={{ aspectRatio: '1/1' }}>
                          <img 
                            src={image} 
                            alt={`صورة ${idx + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 transition-opacity rounded-lg">
                          <button
                            type="button"
                            className="p-1 bg-red-600 rounded-full text-white mr-1"
                            onClick={() => handleImageChange(idx, null)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          
                          {idx !== 0 && (
                            <button
                              type="button"
                              className="p-1 bg-amber-500 rounded-full text-white"
                              onClick={() => {
                                // تبديل هذه الصورة مع الصورة الرئيسية
                                const updatedImages = [...adData.images];
                                [updatedImages[0], updatedImages[idx]] = [updatedImages[idx], updatedImages[0]];
                                setAdData({ ...adData, images: updatedImages });
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            </button>
                          )}
                        </div>
                        
                        {idx === 0 && (
                          <span className="absolute top-0 right-0 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-bl-lg">
                            رئيسية
                          </span>
                        )}
                      </div>
                    ))}
                    
                    {adData.images.length < 10 && (
                      <div 
                        className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={addImageSlot}
                        style={{ aspectRatio: '1/1' }}
                      >
                        <Upload className="h-6 w-6 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">إضافة صور ({adData.images.length}/10)</span>
            </div>
                    )}
                  </div>
                ) : (
                  <div 
                    className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={addImageSlot}
                  >
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-gray-500 text-center">اضغط لإضافة صور (الحد الأقصى: 10)</p>
                  </div>
                )}
          </CardContent>
        </Card>

        {/* Actions */}
            <div className="flex justify-between items-center px-1 py-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
                className="px-6"
          >
            إلغاء
          </Button>
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-6"
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
      )}
    </div>
  );
};

export default AddAdvertisement;
