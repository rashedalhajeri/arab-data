import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Save, Car, Home, Package, CheckCircle, DollarSign, CalendarRange, Fuel, Truck, Gauge, CircleOff, ShieldCheck, UploadCloud, Trash, Tag, Plus, MinusCircle, PlusCircle, Image, X, Settings, BarChart, FileText, Upload, ImageIcon, Star, Badge, CheckSquare, Upload as UploadIcon, Check, MapPin } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { useToast } from "@/components/ui/use-toast";
import { useDropzone } from "react-dropzone";
import { useCountry } from "@/lib/hooks/useCountry";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useWatch } from "react-hook-form";

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

// تعريف أنواع إعلانات المركبات
type VehicleAdType = "sale" | "rent" | null;

// تعريف خيارات المركبات
const vehicleBodyTypes = [
  { value: "sedan", label: "سيدان" },
  { value: "suv", label: "دفع رباعي" },
  { value: "hatchback", label: "هاتشباك" },
  { value: "coupe", label: "كوبيه" },
  { value: "convertible", label: "مكشوفة" },
  { value: "pickup", label: "بيك أب" },
  { value: "van", label: "فان" },
  { value: "minivan", label: "ميني فان" },
  { value: "truck", label: "شاحنة" },
  { value: "other", label: "أخرى" }
];

const transmissionTypes = [
  { value: "automatic", label: "أوتوماتيك" },
  { value: "manual", label: "يدوي" },
  { value: "cvt", label: "CVT" },
  { value: "semi-automatic", label: "نصف أوتوماتيك" }
];

const fuelTypes = [
  { value: "petrol", label: "بنزين" },
  { value: "diesel", label: "ديزل" },
  { value: "hybrid", label: "هجين" },
  { value: "electric", label: "كهربائي" },
  { value: "gas", label: "غاز" }
];

const cylinderOptions = [
  { value: "3", label: "3 اسطوانات" },
  { value: "4", label: "4 اسطوانات" },
  { value: "6", label: "6 اسطوانات" },
  { value: "8", label: "8 اسطوانات" },
  { value: "12", label: "12 اسطوانة" }
];

const importOptions = [
  { value: "gulf", label: "خليجي" },
  { value: "kuwait", label: "كويتي" },
  { value: "american", label: "أمريكي" },
  { value: "european", label: "أوروبي" },
  { value: "japanese", label: "ياباني" },
  { value: "korean", label: "كوري" },
  { value: "other", label: "أخرى" }
];

const conditionOptions = [
  { value: "excellent", label: "ممتاز" },
  { value: "very-good", label: "جيد جداً" },
  { value: "good", label: "جيد" },
  { value: "fair", label: "مقبول" },
  { value: "needs-work", label: "يحتاج إصلاح" }
];

const vehicleFeatures = [
  { value: "bluetooth", label: "بلوتوث" },
  { value: "navigation", label: "نظام ملاحة" },
  { value: "leather-seats", label: "مقاعد جلد" },
  { value: "sunroof", label: "فتحة سقف" },
  { value: "parking-sensors", label: "حساسات ركن" },
  { value: "backup-camera", label: "كاميرا خلفية" },
  { value: "cruise-control", label: "مثبت سرعة" },
  { value: "keyless-entry", label: "دخول بدون مفتاح" },
  { value: "heated-seats", label: "مقاعد مدفأة" },
  { value: "air-conditioning", label: "تكييف" },
  { value: "automatic-parking", label: "ركن تلقائي" },
  { value: "lane-departure", label: "التنبيه عند الخروج من المسار" },
  { value: "blind-spot", label: "مراقبة النقاط العمياء" },
  { value: "premium-sound", label: "نظام صوت فاخر" },
  { value: "android-auto", label: "Android Auto" },
  { value: "apple-carplay", label: "Apple CarPlay" }
];

interface VehicleSaleFormData {
  title: string;
  price: string;
  negotiable: boolean;
  description: string;
  make: string;
  model: string;
  year: string;
  transmission: string;
  bodyType: string;
  mileage: string;
  cylinders: string;
  import: string;
  fuelType: string;
  seats: string;
  condition: string;
  features: string[];
  images: File[];
  mainImageIndex: number;
  additionalDetails?: string;
}

// Esquema de validación para formulario de venta de vehículos
const vehicleSaleSchema = z.object({
  title: z.string().min(10, { message: "العنوان يجب أن يكون على الأقل 10 أحرف" }),
  description: z.string().min(20, { message: "الوصف يجب أن يكون على الأقل 20 حرف" }),
  price: z.string().min(1, { message: "يرجى إدخال السعر" }),
  negotiable: z.boolean().default(false),
  hasMonthlyPayment: z.boolean().optional(),
  monthlyPayment: z.string().optional(),
  manufacturer: z.string().min(1, { message: "يرجى اختيار الشركة المصنعة" }),
  model: z.string().min(1, { message: "يرجى إدخال موديل المركبة" }),
  year: z.string().min(1, { message: "يرجى اختيار سنة الصنع" }),
  color: z.string().optional(),
  fuelType: z.string().min(1, { message: "يرجى اختيار نوع الوقود" }),
  transmission: z.string().optional(),
  mileage: z.string().optional(),
  seats: z.string().optional(),
  features: z.array(z.string()).default([]),
  additionalDetails: z.string().optional(),
  images: z.array(z.any()).min(1, { message: "يرجى إضافة صورة واحدة على الأقل" }),
});

type VehicleSaleFormSchema = z.infer<typeof vehicleSaleSchema>;

// Añadir un componente para previsualizar el anuncio
const AdvertisementPreview = ({ data }: { data: VehicleSaleFormSchema }) => {
  const { country, currencySymbol } = useCountry();
  
  return (
    <Card className="bg-white/95 dark:bg-slate-900/95 shadow-lg border-primary/10">
      <CardHeader className="pb-3 border-b bg-gray-50 dark:bg-gray-800/50">
        <CardTitle className="text-xl flex items-center text-primary">
          <FileText className="ml-2 h-5 w-5" />
          معاينة الإعلان
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          راجع تفاصيل إعلانك قبل النشر
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
          {/* صور الإعلان */}
          {data.images && data.images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">صور الإعلان</h3>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img 
                  src={URL.createObjectURL(data.images[0])} 
                  alt="الصورة الرئيسية" 
                  className="w-full h-full object-contain"
                />
              </div>
              {data.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {data.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img 
                        src={URL.createObjectURL(image)} 
                        alt={`صورة ${index + 2}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* معلومات أساسية */}
          <div>
            <h2 className="text-2xl font-bold mb-2">{data.title}</h2>
            <div className="flex items-center gap-2 text-lg text-primary font-semibold">
              <span>{currencySymbol}</span>
              <span>{data.price}</span>
              {data.negotiable && (
                <span className="text-sm font-normal bg-primary/10 text-primary rounded-full px-2 py-0.5">
                  قابل للتفاوض
                </span>
              )}
            </div>
            
            {/* المواصفات الرئيسية */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">سنة الصنع: {data.year}</span>
              </div>
              
              {data.mileage && (
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">المسافة المقطوعة: {data.mileage} كم</span>
                </div>
              )}
              
              {data.transmission && (
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">ناقل الحركة: {data.transmission === 'automatic' ? 'أوتوماتيك' : 'يدوي'}</span>
                </div>
              )}
              
              {data.fuelType && (
                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">نوع الوقود: {data.fuelType}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* الوصف */}
          <div>
            <h3 className="text-lg font-medium mb-2">الوصف</h3>
            <p className="text-muted-foreground whitespace-pre-line">{data.description}</p>
          </div>
          
          {/* الميزات */}
          {data.features && data.features.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">الميزات</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                {data.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">{
                      vehicleFeatures.find(f => f.value === feature)?.label || feature
                    }</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de pasos para el formulario
type Step = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  fields?: string[];
};

// Definir los pasos del formulario
const steps: Step[] = [
  {
    id: "info",
    title: "المعلومات الأساسية",
    description: "أدخل المعلومات الأساسية للإعلان",
    icon: <FileText className="h-5 w-5" />,
    fields: ["title", "description", "price"]
  },
  {
    id: "photos",
    title: "الصور",
    description: "أضف صور للمركبة",
    icon: <Image className="h-5 w-5" />,
    fields: ["images"]
  },
  {
    id: "details",
    title: "تفاصيل المركبة",
    description: "أدخل مواصفات المركبة",
    icon: <Car className="h-5 w-5" />,
    fields: ["manufacturer", "model", "year", "color", "fuelType", "transmission"]
  },
  {
    id: "features",
    title: "الميزات",
    description: "حدد ميزات المركبة",
    icon: <CheckSquare className="h-5 w-5" />,
    fields: ["features"]
  },
];

// Componente para mostrar los pasos
const FormSteps = ({ 
  currentStep, 
  setCurrentStep,
  steps,
  formState
}: { 
  currentStep: string; 
  setCurrentStep: (step: string) => void;
  steps: Step[];
  formState: {
    errors: Record<string, any>;
    touchedFields: Record<string, boolean>;
  }
}) => {
  return (
    <div className="mb-8">
      <div className="flex overflow-x-auto pb-3 gap-2">
        {steps.map((step, index) => {
          // Comprobar si el paso tiene errores
          const hasErrors = step.fields?.some(field => formState.errors[field]);
          // Comprobar si el paso está completo (sin errores y al menos un campo tocado)
          const isComplete = step.fields?.some(field => formState.touchedFields[field]) && !hasErrors;
          
          return (
            <div 
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={cn(
                "flex flex-col items-center min-w-24 p-3 rounded-lg cursor-pointer border transition-all",
                currentStep === step.id 
                  ? "border-primary bg-primary/5" 
                  : hasErrors 
                    ? "border-destructive/50 bg-destructive/5"
                    : isComplete
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-gray-200 dark:border-gray-700"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center mb-2",
                currentStep === step.id
                  ? "bg-primary/10 text-primary"
                  : hasErrors
                    ? "bg-destructive/10 text-destructive"
                    : isComplete
                      ? "bg-green-500/10 text-green-500"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500"
              )}>
                {isComplete ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.icon
                )}
              </div>
              <div className="text-center">
                <p className={cn(
                  "font-medium text-sm",
                  currentStep === step.id
                    ? "text-primary"
                    : hasErrors
                      ? "text-destructive"
                      : isComplete
                        ? "text-green-500"
                        : ""
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 hidden md:block">
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

// Create a new CategorySelector component
const CategorySelector = ({ 
  selectedCategory,
  onSelectCategory,
  isLoading
}: { 
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
  isLoading: boolean;
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl">اختر فئة الإعلان</CardTitle>
        <CardDescription>حدد نوع الإعلان الذي ترغب في إضافته</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
          {Object.entries(categoryNames).map(([key, name]) => (
            <button
              key={key}
              type="button"
              className={cn(
                "relative flex flex-col items-center gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md w-full text-center",
                selectedCategory === key
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 dark:border-gray-700",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
              onClick={() => !isLoading && onSelectCategory(key)}
              disabled={isLoading}
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                {categoryIcons[key as keyof typeof categoryIcons]}
              </div>
              <div className="text-center">
                <h3 className="font-medium text-lg">{name}</h3>
              </div>
              {selectedCategory === key && (
                <CheckCircle className="absolute top-3 left-3 h-5 w-5 text-primary" />
              )}
            </button>
          ))}
        </div>
        
        <Button
          onClick={() => {
            if (!selectedCategory) {
              toast({
                title: "الرجاء اختيار فئة الإعلان",
                variant: "destructive"
              });
              return;
            }
            setIsLoading(true);
            // Navigate to the category page
            navigate(`/dashboard/advertisements/add/${selectedCategory}`);
          }}
          size="lg"
          className="mt-6"
          disabled={!selectedCategory || isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جارٍ التحميل...
            </span>
          ) : "متابعة"}
        </Button>
      </CardContent>
    </Card>
  );
};

const AddAdvertisement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { office } = useDashboard();
  const { country, currencySymbol, currencyCode } = useCountry();
  const params = useParams<{ category?: string }>();
  const category = params.category || null;
  
  // Add loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // State for category selection
  const [selectedCategory, setSelectedCategory] = useState<string | null>(category);
  
  // تحديد أيقونة واسم الفئة المناسبة
  const categoryIcon = category ? (categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.other) : null;
  const categoryName = category ? (categoryNames[category as keyof typeof categoryNames] || "أخرى") : null;
  
  // حالة نوع إعلان المركبة (بيع/إيجار)
  const [vehicleAdType, setVehicleAdType] = useState<VehicleAdType>(null);
  
  // حالة بيانات نموذج بيع المركبة
  const [vehicleSaleForm, setVehicleSaleForm] = useState<VehicleSaleFormData>({
    title: "",
    price: "",
    negotiable: false,
    description: "",
    make: "",
    model: "",
    year: "",
    transmission: "",
    bodyType: "",
    mileage: "",
    cylinders: "",
    import: "",
    fuelType: "",
    seats: "",
    condition: "",
    features: [],
    images: [],
    mainImageIndex: 0
  });
  
  // Estado para los errores del formulario
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Added preview state for vehicle sale form
  const [vehicleSaleFormPreview, setVehicleSaleFormPreview] = useState({
    title: "",
    bodyType: "",
    manufacturer: "",
    model: "",
    year: 0,
    price: 0,
    mileage: 0,
    fuelType: "",
    gearType: "",
    engineSize: 0,
    images: [] as File[]
  });

  // React Hook Form con Zod
  const form = useForm<VehicleSaleFormSchema>({
    resolver: zodResolver(vehicleSaleSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      negotiable: false,
      manufacturer: "",
      model: "",
      year: "",
      fuelType: "",
      features: [],
      images: [],
    }
  });

  // Obtener funciones de React Hook Form
  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;
  
  // مراقبة التغييرات في النموذج واستخدام callback بدلاً من useEffect
  // هذا يمنع التحديثات اللانهائية
  useEffect(() => {
    // تسجيل دالة مراقبة للتغييرات
    const subscription = watch((values, { name, type }) => {
      // تحديث نموذج بيع السيارة فقط عندما تتغير القيم
      setVehicleSaleForm({
        title: values.title || "",
        price: values.price || "",
        negotiable: values.negotiable || false,
        description: values.description || "",
        make: values.manufacturer || "",
        model: values.model || "",
        year: values.year || "",
        transmission: values.transmission || "",
        bodyType: values.bodyType || "",
        mileage: values.mileage || "",
        cylinders: values.engineSize || "",
        import: values.import || "",
        fuelType: values.fuelType || "",
        seats: values.seats || "",
        condition: values.condition || "",
        features: values.features || [],
        images: values.images || [],
        mainImageIndex: 0
      });
      
      // تحديث معاينة نموذج بيع السيارة
      setVehicleSaleFormPreview({
        title: values.title || "",
        bodyType: values.bodyType || "",
        manufacturer: values.manufacturer || "",
        model: values.model || "",
        year: parseInt(values.year || "0"),
        price: parseInt(values.price || "0"),
        mileage: parseInt(values.mileage || "0"),
        fuelType: values.fuelType || "",
        gearType: values.gearType || "",
        engineSize: parseInt(values.engineSize || "0"),
        images: values.images || []
      });
    });
    
    // تنظيف عند إزالة المكون
    return () => subscription.unsubscribe();
  }, [watch]);
  
  // إزالة الدوال السابقة التي كانت تسبب التحديثات اللانهائية

  // Función para manejar cambios en el formulario
  const handleSaleFormChange = (field: keyof VehicleSaleFormData, value: any) => {
    setValue(field as any, value);
  };

  // Update the onSubmit function to show loading state
  const onSubmit = (data: VehicleSaleFormSchema) => {
    setIsLoading(true);
    console.log("Datos del formulario:", data);
    
    // Simulating API call with a short delay
    setTimeout(() => {
      // Aquí irá la lógica para enviar los datos al servidor
      toast({
        title: "تم إرسال الإعلان بنجاح",
        description: "سيتم مراجعة إعلانك ونشره قريباً"
      });
      
      // Redireccionar al usuario a la página de anuncios
      navigate("/dashboard/advertisements");
      setIsLoading(false);
    }, 1000);
  };

  // Modificamos la función handleSubmit del componente
  const handleFormSubmit = handleSubmit(onSubmit);
  
  // التعامل مع تغييرات نموذج البيع
  const handleFeatureToggle = (feature: string) => {
    setVehicleSaleForm(prev => {
      const features = [...prev.features];
      
      if (features.includes(feature)) {
        return {
          ...prev,
          features: features.filter(f => f !== feature)
        };
      } else {
        return {
          ...prev,
          features: [...features, feature]
        };
      }
    });
  };
  
  // التعامل مع تحميل الصور
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      addNewImages(newFiles);
    }
  };
  
  // إضافة صور جديدة
  const addNewImages = (newFiles: File[]) => {
    // التحقق من عدد الصور (الحد الأقصى 15)
    if (vehicleSaleForm.images.length + newFiles.length > 15) {
      toast({
        title: "تم تجاوز الحد الأقصى للصور",
        description: "يمكنك تحميل 15 صورة كحد أقصى",
        variant: "destructive"
      });
      return;
    }
    
    setVehicleSaleForm(prev => ({
      ...prev,
      images: [...prev.images, ...newFiles]
    }));
  };
  
  // حذف صورة
  const handleRemoveImage = (index: number) => {
    const currentImages = [...(form.getValues("images") || [])];
    currentImages.splice(index, 1);
    form.setValue("images", currentImages, { shouldValidate: true });
    
    toast({
      title: "تم حذف الصورة",
      description: "تم حذف الصورة بنجاح"
    });
  };
  
  // تعيين صورة كصورة رئيسية
  const handleSetMainImage = (index: number) => {
    const currentImages = [...(form.getValues("images") || [])];
    // Store the image to be set as main
    const mainImage = currentImages[index];
    
    // Remove it from its current position
    currentImages.splice(index, 1);
    
    // Add it to the front of the array
    currentImages.unshift(mainImage);
    
    // Update the form
    form.setValue("images", currentImages, { shouldValidate: true });
    
    toast({
      title: "تم تعيين الصورة الرئيسية",
      description: "تم تعيين الصورة الرئيسية بنجاح"
    });
  };

  // Update the onDrop callback to use form methods consistently
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Use form methods directly
    const currentImages = form.getValues('images') || [];
    if (currentImages.length + acceptedFiles.length > 10) {
      toast({
        title: "تم تجاوز الحد الأقصى للصور",
        description: "يمكنك تحميل 10 صور كحد أقصى",
        variant: "destructive"
      });
      return;
    }
    
    // Set images directly on the form
    form.setValue('images', [...currentImages, ...acceptedFiles], { shouldValidate: true });
  }, [form, toast]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });
  
  // مكون اختيار نوع إعلان المركبة (بيع/إيجار)
  const VehicleTypeSelector = () => (
    <Card className="shadow-lg">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl">اختر نوع الإعلان</CardTitle>
        <CardDescription>حدد ما إذا كنت تريد بيع أو تأجير المركبة</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          <button 
            type="button"
            className={cn(
              "relative flex flex-col items-center gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md w-full text-center",
              vehicleAdType === "sale" 
                ? "border-primary bg-primary/5" 
                : "border-gray-200 dark:border-gray-700",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
            onClick={() => !isLoading && setVehicleAdType("sale")}
            disabled={isLoading}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-lg">بيع</h3>
              <p className="text-sm text-gray-500">بيع مركبتك بالكامل</p>
            </div>
            {vehicleAdType === "sale" && (
              <CheckCircle className="absolute top-3 left-3 h-5 w-5 text-primary" />
            )}
          </button>
          
          <button 
            type="button"
            className={cn(
              "relative flex flex-col items-center gap-4 p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md w-full text-center",
              vehicleAdType === "rent" 
                ? "border-primary bg-primary/5" 
                : "border-gray-200 dark:border-gray-700",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
            onClick={() => !isLoading && setVehicleAdType("rent")}
            disabled={isLoading}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CalendarRange className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-lg">تأجير</h3>
              <p className="text-sm text-gray-500">تأجير مركبتك للآخرين</p>
            </div>
            {vehicleAdType === "rent" && (
              <CheckCircle className="absolute top-3 left-3 h-5 w-5 text-primary" />
            )}
          </button>
        </div>
        
        <Button 
          onClick={() => {
            if (!vehicleAdType) {
              toast({
                title: "الرجاء اختيار نوع الإعلان",
                variant: "destructive"
              });
              return;
            }
            
            setIsLoading(true);
            // Mostrar el formulario correspondiente según النوع المحدد
            if (vehicleAdType === "sale") {
              setTimeout(() => {
                setCurrentStep("info");
                setIsLoading(false);
              }, 300);
            } else if (vehicleAdType === "rent") {
              setTimeout(() => {
                toast({
                  title: "قريباً",
                  description: "خيار التأجير سيكون متاحًا قريباً"
                });
                setIsLoading(false);
              }, 300);
            }
          }} 
          size="lg" 
          className="mt-6"
          disabled={!vehicleAdType || isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              جارٍ التحميل...
            </span>
          ) : "متابعة"}
        </Button>
      </CardContent>
    </Card>
  );
  
  // Estado para mostrar/ocultar la vista previa
  const [showPreview, setShowPreview] = useState(false);
  
  // Update the handlePreview function
  const handlePreview = async () => {
    setIsLoading(true);
    const isValid = await form.trigger();
    
    if (!isValid) {
      toast({
        title: "يرجى تصحيح الأخطاء",
        description: "هناك بعض الحقول غير صحيحة أو مفقودة",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    // Short delay to improve user experience
    setTimeout(() => {
      setShowPreview(true);
      setIsLoading(false);
    }, 300);
  };
  
  // Estado para el paso actual
  const [currentStep, setCurrentStep] = useState("info");
  
  // Función para pasar al siguiente paso
  const nextStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    const nextIndex = Math.min(currentIndex + 1, steps.length - 1);
    
    if (currentIndex < steps.length - 1) {
      // Validar solo los campos del paso actual
      const currentStepFields = steps[currentIndex].fields || [];
      
      const isStepValid = form.trigger(currentStepFields as any);
      
      if (isStepValid) {
        setCurrentStep(steps[nextIndex].id);
      } else {
        toast({
          title: "يرجى تصحيح الأخطاء",
          description: "هناك بعض الحقول غير صحيحة أو مفقودة في هذا القسم",
          variant: "destructive"
        });
      }
    }
  };
  
  // Función para volver al paso anterior
  const prevStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };
  
  // Estados para el manejo de imágenes
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Funciones para el manejo de imágenes con arrastrar و soltar
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileUpload = (fileList: FileList) => {
    const currentImages = form.getValues("images") || [];
    const remainingSlots = 10 - currentImages.length;
    
    if (remainingSlots <= 0) {
      toast({
        title: "تم تجاوز الحد الأقصى للصور",
        description: "يمكنك تحميل 10 صور كحد أقصى",
        variant: "destructive"
      });
      return;
    }
    
    const newFiles = Array.from(fileList)
      .filter(file => file.type.startsWith('image/'))
      .slice(0, remainingSlots);
    
    if (newFiles.length === 0) {
      toast({
        title: "نوع ملف غير صالح",
        description: "يرجى تحميل ملفات صور صالحة فقط (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    // Validar tamaño (5MB máximo por imagen)
    const invalidSizeFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidSizeFiles.length > 0) {
      toast({
        title: "حجم ملف كبير جدًا",
        description: "بعض الصور تتجاوز الحد الأقصى للحجم (5 ميجابايت)",
        variant: "destructive"
      });
      return;
    }
    
    // Añadir nuevas imágenes al formulario directamente
    form.setValue("images", [...currentImages, ...newFiles], { shouldValidate: true });
    
    // Resetear el input de archivos
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Array of features for vehicle
  const features = [
    { value: "airConditioning", label: "تكييف هواء" },
    { value: "powerSteering", label: "دركسون هيدروليك" },
    { value: "powerWindows", label: "نوافذ كهربائية" },
    { value: "centralLocking", label: "قفل مركزي" },
    { value: "cruiseControl", label: "مثبت سرعة" },
    { value: "navigation", label: "نظام ملاحة GPS" },
    { value: "bluetooth", label: "بلوتوث" },
    { value: "camera", label: "كاميرا خلفية" },
    { value: "sensors", label: "حساسات" },
    { value: "leatherSeats", label: "مقاعد جلد" },
    { value: "sunroof", label: "فتحة سقف" },
    { value: "alloyWheels", label: "جنوط ألومنيوم" },
    { value: "fogLights", label: "أضواء ضباب" },
    { value: "absBrakes", label: "ABS نظام فرامل" },
    { value: "airbags", label: "وسائد هوائية" },
    { value: "parkAssist", label: "نظام المساعدة على الركن" },
    { value: "blindSpot", label: "مراقبة النقطة العمياء" },
    { value: "laneAssist", label: "نظام المساعدة على البقاء في المسار" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center">
          {categoryIcon && (
            <>
              {categoryIcon}
              <span className="mx-2">إضافة إعلان جديد</span>
              <span className="text-primary">({categoryName})</span>
            </>
          )}
          {!categoryIcon && (
            <span>إضافة إعلان جديد</span>
          )}
        </h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة
        </Button>
      </div>
      
      {/* Show category selector if no category is selected */}
      {!category && (
        <CategorySelector 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          isLoading={isLoading}
        />
      )}
      
      {/* Show vehicle type selector if category is vehicles and no type is selected */}
      {category === "vehicles" && !vehicleAdType && (
        <VehicleTypeSelector />
      )}
      
      {category === "vehicles" && vehicleAdType === "sale" && !showPreview && (
        <form onSubmit={handleFormSubmit} className="space-y-8">
          <FormSteps 
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            steps={steps}
            formState={{
              errors: form.formState.errors,
              touchedFields: form.formState.touchedFields
            }}
          />
          
          {currentStep === "info" && (
            <Card className="bg-white/95 dark:bg-slate-900/95 shadow-md border-primary/10">
              <CardHeader className="pb-3 border-b bg-gray-50 dark:bg-gray-800/50">
                <CardTitle className="text-xl flex items-center text-primary">
                  <FileText className="ml-2 h-5 w-5" />
                  معلومات اساسية
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  المعلومات الأساسية للإعلان التي ستظهر للمستخدمين
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* عنوان الإعلان */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base flex items-center">
                      عنوان الإعلان
                      <span className="text-red-500 mr-1">*</span>
                    </Label>
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="اكتب عنوان جذاب للإعلان"
                      className={cn(errors.title && "border-red-500")}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm">{errors.title.message as string}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      يفضل أن يتضمن العنوان ماركة وموديل السيارة وسنة الصنع
                    </p>
                  </div>

                  {/* وصف الإعلان */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base flex items-center">
                      وصف الإعلان
                      <span className="text-red-500 mr-1">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="اكتب وصفاً تفصيلياً للمركبة يتضمن مميزاتها وحالتها"
                      className={cn("min-h-32", errors.description && "border-red-500")}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm">{errors.description.message as string}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>حد أدنى 20 حرف</span>
                      <span>{(watch("description")?.length || 0)} / 2000</span>
                    </div>
                  </div>

                  {/* السعر */}
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-base flex items-center">
                      السعر
                      <span className="text-red-500 mr-1">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="price"
                        type="number"
                        {...register("price")}
                        placeholder="أدخل سعر المركبة"
                        className={cn("pl-24", errors.price && "border-red-500")}
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none text-gray-500 border-r">
                        {currencySymbol}
                      </div>
                    </div>
                    {errors.price && (
                      <p className="text-red-500 text-sm">{errors.price.message as string}</p>
                    )}
                  </div>

                  {/* قابل للتفاوض */}
                  <div className="flex items-center space-x-2 space-x-reverse py-2">
                    <Switch
                      id="negotiable"
                      checked={watch("negotiable")}
                      onCheckedChange={(checked) => setValue("negotiable", checked)}
                    />
                    <Label htmlFor="negotiable" className="cursor-pointer">
                      السعر قابل للتفاوض
                    </Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                <Button type="button" onClick={nextStep}>
                  الخطوة التالية
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {currentStep === "photos" && (
            <Card className="bg-white/95 dark:bg-slate-900/95 shadow-md border-primary/10">
              <CardHeader className="pb-3 border-b bg-gray-50 dark:bg-gray-800/50">
                <CardTitle className="text-xl flex items-center text-primary">
                  <Image className="ml-2 h-5 w-5" />
                  صور المركبة
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  أضف صوراً واضحة وجذابة للمركبة من زوايا مختلفة لزيادة فرص البيع
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Área de arrastrar y soltar */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                    }`}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileChange}
                      id="ad-images-upload"
                      name="ad-images-upload"
                    />
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">
                      اسحب وأفلت الصور هنا أو انقر للتحميل
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      صيغ الملفات المدعومة: JPG, PNG, WEBP (الحد الأقصى: 5MB لكل صورة)
                    </p>
                    <Button type="button" variant="secondary" className="mt-4" onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}>
                      <UploadIcon className="mr-2 h-4 w-4" />
                      اختر الصور
                    </Button>
                  </div>

                  {/* Mostrar mensajes de error */}
                  {errors.images && (
                    <p className="text-sm text-destructive">{errors.images.message as string}</p>
                  )}

                  {/* Mostrar número de imágenes seleccionadas */}
                  {(watch("images")?.length || 0) > 0 && (
                    <p className="text-sm">
                      تم اختيار {watch("images")?.length} من أصل 10 صور
                    </p>
                  )}

                  {/* Área de visualización de imágenes */}
                  {(watch("images")?.length || 0) > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                      {watch("images").map((image, index) => (
                        <div 
                          key={index} 
                          className="relative group border rounded-lg overflow-hidden"
                        >
                          <div className="aspect-video bg-muted-foreground/10 relative">
                            <img 
                              src={URL.createObjectURL(image)} 
                              alt={`صورة ${index + 1}`} 
                              className="object-cover w-full h-full"
                            />
                            {index === 0 && (
                              <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                الصورة الرئيسية
                              </span>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {index !== 0 && (
                              <Button 
                                variant="secondary" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleSetMainImage(index)}
                                title="تعيين كصورة رئيسية"
                                type="button"
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleRemoveImage(index)}
                              title="حذف الصورة"
                              type="button"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  الخطوة السابقة
                </Button>
                <Button type="button" onClick={nextStep}>
                  الخطوة التالية
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {currentStep === "details" && (
            <Card className="bg-white/95 dark:bg-slate-900/95 shadow-md border-primary/10">
              <CardHeader className="pb-3 border-b bg-gray-50 dark:bg-gray-800/50">
                <CardTitle className="text-xl flex items-center text-primary">
                  <Car className="ml-2 h-5 w-5" />
                  تفاصيل المركبة
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  معلومات تفصيلية عن المركبة تساعد المشتري في اتخاذ قرار الشراء
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {/* الشركة المصنعة */}
                    <div className="space-y-2">
                      <Label htmlFor="manufacturer" className="text-base flex items-center">
                        الشركة المصنعة
                        <span className="text-red-500 mr-1">*</span>
                      </Label>
                      <Select
                        value={watch("manufacturer") || ""}
                        onValueChange={(value) => setValue("manufacturer", value)}
                      >
                        <SelectTrigger id="manufacturer" className={cn(errors.manufacturer && "border-red-500")}>
                          <SelectValue placeholder="اختر الشركة المصنعة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="toyota">تويوتا</SelectItem>
                          <SelectItem value="honda">هوندا</SelectItem>
                          <SelectItem value="nissan">نيسان</SelectItem>
                          <SelectItem value="mazda">مازدا</SelectItem>
                          <SelectItem value="hyundai">هيونداي</SelectItem>
                          <SelectItem value="kia">كيا</SelectItem>
                          <SelectItem value="ford">فورد</SelectItem>
                          <SelectItem value="chevrolet">شيفروليه</SelectItem>
                          <SelectItem value="bmw">بي إم دبليو</SelectItem>
                          <SelectItem value="mercedes">مرسيدس</SelectItem>
                          <SelectItem value="lexus">لكزس</SelectItem>
                          <SelectItem value="audi">أودي</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.manufacturer && (
                        <p className="text-red-500 text-sm">{errors.manufacturer.message as string}</p>
                      )}
                    </div>
                    
                    {/* موديل المركبة */}
                    <div className="space-y-2">
                      <Label htmlFor="model" className="text-base flex items-center">
                        الموديل
                        <span className="text-red-500 mr-1">*</span>
                      </Label>
                      <Input
                        id="model"
                        {...register("model")}
                        placeholder="مثال: كامري، اكورد، تاهو"
                        className={cn(errors.model && "border-red-500")}
                      />
                      {errors.model && (
                        <p className="text-red-500 text-sm">{errors.model.message as string}</p>
                      )}
                    </div>
                    
                    {/* سنة الصنع */}
                    <div className="space-y-2">
                      <Label htmlFor="year" className="text-base flex items-center">
                        سنة الصنع
                        <span className="text-red-500 mr-1">*</span>
                      </Label>
                      <Select
                        value={watch("year") || ""}
                        onValueChange={(value) => setValue("year", value)}
                      >
                        <SelectTrigger id="year" className={cn(errors.year && "border-red-500")}>
                          <SelectValue placeholder="اختر سنة الصنع" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.year && (
                        <p className="text-red-500 text-sm">{errors.year.message as string}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* نوع الوقود */}
                    <div className="space-y-2">
                      <Label htmlFor="fuelType" className="text-base flex items-center">
                        نوع الوقود
                        <span className="text-red-500 mr-1">*</span>
                      </Label>
                      <Select
                        value={watch("fuelType") || ""}
                        onValueChange={(value) => setValue("fuelType", value)}
                      >
                        <SelectTrigger id="fuelType" className={cn(errors.fuelType && "border-red-500")}>
                          <SelectValue placeholder="اختر نوع الوقود" />
                        </SelectTrigger>
                        <SelectContent>
                          {fuelTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.fuelType && (
                        <p className="text-red-500 text-sm">{errors.fuelType.message as string}</p>
                      )}
                    </div>
                    
                    {/* ناقل الحركة */}
                    <div className="space-y-2">
                      <Label htmlFor="transmission">ناقل الحركة</Label>
                      <Select
                        value={watch("transmission") || ""}
                        onValueChange={(value) => setValue("transmission", value)}
                      >
                        <SelectTrigger id="transmission">
                          <SelectValue placeholder="اختر نوع ناقل الحركة" />
                        </SelectTrigger>
                        <SelectContent>
                          {transmissionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* عدد الكيلومترات */}
                    <div className="space-y-2">
                      <Label htmlFor="mileage">عدد الكيلومترات</Label>
                      <div className="flex">
                        <Input
                          id="mileage"
                          type="number"
                          placeholder="أدخل عدد الكيلومترات"
                          {...register("mileage")}
                        />
                        <span className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 px-3 rounded-e-md border border-r-0 border-input">
                          كم
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  الخطوة السابقة
                </Button>
                <Button type="button" onClick={nextStep}>
                  الخطوة التالية
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {currentStep === "features" && (
            <Card className="bg-white/95 dark:bg-slate-900/95 shadow-md border-primary/10">
              <CardHeader className="pb-3 border-b bg-gray-50 dark:bg-gray-800/50">
                <CardTitle className="text-xl flex items-center text-primary">
                  <CheckSquare className="ml-2 h-5 w-5" />
                  ميزات المركبة
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  حدد ميزات المركبة التي تتوفر فيها
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="bg-muted/20 rounded-lg p-4 mb-6">
                    <p className="text-sm text-muted-foreground">
                      حدد الميزات المتوفرة في مركبتك. كلما قمت بإضافة ميزات أكثر، زادت جاذبية إعلانك للمشترين المحتملين.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {features.map((feature) => (
                      <div key={feature.value} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`feature-${feature.value}`}
                          checked={(watch("features") || []).includes(feature.value)}
                          onCheckedChange={(checked) => {
                            const currentFeatures = watch("features") || [];
                            if (checked) {
                              setValue("features", [...currentFeatures, feature.value]);
                            } else {
                              setValue(
                                "features",
                                currentFeatures.filter((f) => f !== feature.value)
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`feature-${feature.value}`}
                          className="text-sm font-normal cursor-pointer mr-2"
                        >
                          {feature.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6">
                    <Label htmlFor="additionalDetails">
                      تفاصيل إضافية
                    </Label>
                    <Textarea
                      id="additionalDetails"
                      placeholder="أضف أي معلومات أخرى قد تهم المشتري مثل حالة المركبة، الإصلاحات السابقة، أو أي ميزات خاصة"
                      rows={4}
                      {...register("additionalDetails")}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      كلما قدمت تفاصيل أكثر، زادت فرص البيع بشكل أسرع
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 bg-gray-50 dark:bg-gray-800/50 flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  الخطوة السابقة
                </Button>
                <Button type="button" onClick={handlePreview}>
                  معاينة الإعلان
                  <FileText className="mr-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      )}
      
      {showPreview && (
        <div className="space-y-6">
          <AdvertisementPreview data={form.getValues()} />
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              العودة للتعديل
            </Button>
            <Button 
              onClick={handleFormSubmit} 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جارٍ النشر...
                </span>
              ) : (
                <>
                  <Save className="ml-2 h-5 w-5" />
                  نشر الإعلان
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      
      {category === "vehicles" && vehicleAdType === "sale" && !showPreview && (
        <div className="flex justify-between fixed bottom-6 right-6 z-10">
          <Button 
            onClick={handlePreview} 
            size="lg"
            className="rounded-full shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            معاينة الإعلان
          </Button>
        </div>
      )}
    </div>
  );
};

export default AddAdvertisement; 