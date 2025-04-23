import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Save, CreditCard, Calendar, CheckCircle, Clock, AlertCircle, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const SubscriptionSettings = ({ office }: { office: any }) => {
  const [loading, setLoading] = useState(false);
  
  // تهيئة بيانات الاشتراك من المتجر
  const [subscription, setSubscription] = useState({
    plan: office?.settings?.subscription?.plan || "free",
    status: office?.settings?.subscription?.status || "active",
    current_period_end: office?.settings?.subscription?.current_period_end || null,
    cancel_at_period_end: office?.settings?.subscription?.cancel_at_period_end || false,
    payment_method: office?.settings?.subscription?.payment_method || null,
    features: office?.settings?.subscription?.features || {
      max_products: 20,
      max_storage: 500,
      custom_domain: false,
      analytics: false,
      priority_support: false,
    }
  });

  // حساب بيانات الاستخدام
  const [usage, setUsage] = useState({
    products: {
      used: 0,
      max: subscription.features.max_products
    },
    storage: {
      used: 0,
      max: subscription.features.max_storage
    }
  });

  // خطط الاشتراك
  const subscriptionPlans = [
    {
      id: "free",
      name: "مجاني",
      price: "0",
      description: "خطة أساسية مناسبة للبدء",
      features: [
        "حتى 20 منتج",
        "500 ميجابايت مساحة تخزين",
        "بدون مجال مخصص",
        "دعم عبر البريد الإلكتروني"
      ],
      current: subscription.plan === "free"
    },
    {
      id: "basic",
      name: "أساسي",
      price: "99",
      description: "الأنسب للمتاجر الصغيرة",
      features: [
        "حتى 100 منتج",
        "2 جيجابايت مساحة تخزين",
        "مجال مخصص",
        "تحليلات أساسية",
        "دعم عبر الدردشة"
      ],
      current: subscription.plan === "basic"
    },
    {
      id: "pro",
      name: "احترافي",
      price: "199",
      description: "مثالي للمتاجر المتوسطة",
      features: [
        "حتى 500 منتج",
        "10 جيجابايت مساحة تخزين",
        "مجال مخصص",
        "تحليلات متقدمة",
        "أولوية الدعم"
      ],
      current: subscription.plan === "pro"
    }
  ];

  // تحديث الاشتراك
  const updateSubscription = async (planId: string) => {
    setLoading(true);
    
    try {
      // في التطبيق الفعلي: هنا ستقوم بتوجيه المستخدم إلى بوابة الدفع
      // لهذا المثال، سنقوم فقط بتحديث السجل في Supabase
      
      const { error } = await supabase.from("offices").update({
        settings: {
          ...(office?.settings || {}),
          subscription: {
            ...subscription,
            plan: planId,
            updated_at: new Date().toISOString()
          }
        }
      }).eq("id", office.id);

      if (error) throw error;
      
      // تحديث حالة الاشتراك المحلية
      setSubscription(prev => ({
        ...prev,
        plan: planId
      }));
      
      toast.success("تم تحديث الاشتراك بنجاح");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تحديث الاشتراك");
    } finally {
      setLoading(false);
    }
  };

  // إلغاء الاشتراك
  const cancelSubscription = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.from("offices").update({
        settings: {
          ...(office?.settings || {}),
          subscription: {
            ...subscription,
            cancel_at_period_end: true,
            updated_at: new Date().toISOString()
          }
        }
      }).eq("id", office.id);

      if (error) throw error;
      
      // تحديث حالة الاشتراك المحلية
      setSubscription(prev => ({
        ...prev,
        cancel_at_period_end: true
      }));
      
      toast.success("تم جدولة إلغاء الاشتراك عند نهاية الفترة الحالية");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إلغاء الاشتراك");
    } finally {
      setLoading(false);
    }
  };

  // تجديد الاشتراك
  const renewSubscription = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.from("offices").update({
        settings: {
          ...(office?.settings || {}),
          subscription: {
            ...subscription,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString()
          }
        }
      }).eq("id", office.id);

      if (error) throw error;
      
      // تحديث حالة الاشتراك المحلية
      setSubscription(prev => ({
        ...prev,
        cancel_at_period_end: false
      }));
      
      toast.success("تم تجديد الاشتراك بنجاح");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تجديد الاشتراك");
    } finally {
      setLoading(false);
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "غير متوفر";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">إعدادات الاشتراك</h2>
        
        {/* ملخص الاشتراك الحالي */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="text-lg font-medium">الاشتراك الحالي</h3>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الخطة:</span>
                  <Badge variant={subscription.plan === 'free' ? 'secondary' : 'default'}>
                    {subscriptionPlans.find(p => p.id === subscription.plan)?.name || "مجاني"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الحالة:</span>
                  <div className="flex items-center gap-1">
                    {subscription.status === 'active' ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-500">نشط</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-red-500">غير نشط</span>
                      </>
                    )}
                  </div>
                </div>
                
                {subscription.current_period_end && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">تاريخ التجديد:</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{formatDate(subscription.current_period_end)}</span>
                    </div>
                  </div>
                )}
                
                {subscription.payment_method && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">طريقة الدفع:</span>
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">**** {subscription.payment_method}</span>
                    </div>
                  </div>
                )}
                
                {subscription.cancel_at_period_end && (
                  <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">سينتهي اشتراكك في: {formatDate(subscription.current_period_end)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">المنتجات: {usage.products.used}/{usage.products.max}</span>
                    <span className="text-sm text-muted-foreground">{Math.round((usage.products.used / usage.products.max) * 100)}%</span>
                  </div>
                  <Progress value={(usage.products.used / usage.products.max) * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">المساحة التخزينية: {usage.storage.used} MB/{usage.storage.max} MB</span>
                    <span className="text-sm text-muted-foreground">{Math.round((usage.storage.used / usage.storage.max) * 100)}%</span>
                  </div>
                  <Progress value={(usage.storage.used / usage.storage.max) * 100} />
                </div>
                
                <div className="flex justify-end pt-2">
                  {subscription.cancel_at_period_end ? (
                    <Button
                      onClick={renewSubscription}
                      size="sm"
                      variant="outline"
                      disabled={loading}
                    >
                      إلغاء إنهاء الاشتراك
                    </Button>
                  ) : (
                    <Button
                      onClick={cancelSubscription}
                      size="sm"
                      variant="outline"
                      disabled={loading || subscription.plan === 'free'}
                    >
                      إلغاء الاشتراك
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* خطط الاشتراك */}
        <div className="pt-8">
          <h3 className="text-lg font-medium mb-6">ترقية الاشتراك</h3>
          
          <div className="grid gap-6 md:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.id} className={`overflow-hidden ${plan.current ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                <div className={`p-1 ${plan.current ? 'bg-primary' : 'bg-muted'}`}></div>
                <CardContent className="p-6">
                  <h4 className="text-xl font-bold">{plan.name}</h4>
                  <div className="mt-1 mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground"> ريال/شهريًا</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => updateSubscription(plan.id)}
                    className="w-full"
                    variant={plan.current ? 'outline' : 'default'}
                    disabled={loading || plan.current}
                  >
                    {plan.current ? 'خطتك الحالية' : 'ترقية'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* تفاصيل الفواتير */}
        <div className="pt-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">سجل الفواتير</h3>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <span>عرض جميع الفواتير</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-center py-8 text-muted-foreground">
                لا توجد فواتير سابقة
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSettings; 