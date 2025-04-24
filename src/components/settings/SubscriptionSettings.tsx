import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, Star, Clock, Calendar, CheckCircle, Shield, Activity, Award } from "lucide-react";

// تعريف نوع المكتب المعزز بإعدادات الاشتراك
interface Office {
  id?: string;
  name?: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  country?: string;
  logo_url?: string;
  cover_url?: string;
  phone?: string;
  settings?: { [key: string]: any };
}

// تعريف نوع بيانات الاشتراك
interface SubscriptionData {
  plan: string;
  status: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  trial_end?: string;
  payment_method?: string;
}

const SubscriptionSettings = ({ office }: { office: Office }) => {
  const [loading, setLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  
  useEffect(() => {
    // استجلاب بيانات الاشتراك من إعدادات المكتب
    if (office?.settings?.subscription) {
      setSubscriptionData(office.settings.subscription);
    }
  }, [office]);

  // تنسيق التاريخ
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "غير محدد";
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // الحصول على حالة الاشتراك
  const getSubscriptionStatus = () => {
    if (!subscriptionData) return "غير نشط";
    if (subscriptionData.status === "active") {
      return subscriptionData.cancel_at_period_end ? "سينتهي قريباً" : "نشط";
    } else if (subscriptionData.status === "canceled") {
      return "ملغى";
    } else {
      return "غير نشط";
    }
  };

  // تغيير خطة الاشتراك
  const handleChangePlan = async (plan: string) => {
    setLoading(true);
    
    try {
      // استخدام type assertion لإخبار TypeScript أن office يحتوي على إعدادات
      const updatedOffice = {
        ...office,
        settings: {
          ...(office?.settings || {}),
          subscription: {
            ...(office?.settings?.subscription || {}),
            plan: plan,
            updated_at: new Date().toISOString()
          }
        }
      };
      
      const { error } = await supabase.from("offices").update({
        // تحويل صريح لمنع أخطاء TypeScript
        settings: updatedOffice.settings
      } as any).eq("id", office?.id);
      
      if (error) throw error;
      
      toast.success(`تم تغيير خطة الاشتراك إلى ${plan} بنجاح`);
      
      // تحديث بيانات الاشتراك المحلية
      setSubscriptionData(prev => ({
        ...prev!,
        plan: plan
      }));
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء تغيير خطة الاشتراك");
    } finally {
      setLoading(false);
    }
  };
  
  // إلغاء الاشتراك
  const handleCancelSubscription = async () => {
    setLoading(true);
    
    try {
      // استخدام type assertion لإخبار TypeScript أن office يحتوي على إعدادات
      const updatedOffice = {
        ...office,
        settings: {
          ...(office?.settings || {}),
          subscription: {
            ...(office?.settings?.subscription || {}),
            status: "canceled",
            cancel_at_period_end: true,
            updated_at: new Date().toISOString()
          }
        }
      };
      
      const { error } = await supabase.from("offices").update({
        // تحويل صريح لمنع أخطاء TypeScript
        settings: updatedOffice.settings
      } as any).eq("id", office?.id);
      
      if (error) throw error;
      
      toast.success("تم إلغاء الاشتراك بنجاح. ستظل خطتك الحالية نشطة حتى نهاية فترة الفوترة الحالية.");
      
      // تحديث بيانات الاشتراك المحلية
      setSubscriptionData(prev => ({
        ...prev!,
        status: "canceled",
        cancel_at_period_end: true
      }));
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إلغاء الاشتراك");
    } finally {
      setLoading(false);
    }
  };
  
  // استئناف الاشتراك
  const handleResumeSubscription = async () => {
    setLoading(true);
    
    try {
      // استخدام type assertion لإخبار TypeScript أن office يحتوي على إعدادات
      const updatedOffice = {
        ...office,
        settings: {
          ...(office?.settings || {}),
          subscription: {
            ...(office?.settings?.subscription || {}),
            status: "active",
            cancel_at_period_end: false,
            updated_at: new Date().toISOString()
          }
        }
      };
      
      const { error } = await supabase.from("offices").update({
        // تحويل صريح لمنع أخطاء TypeScript
        settings: updatedOffice.settings
      } as any).eq("id", office?.id);
      
      if (error) throw error;
      
      toast.success("تم استئناف الاشتراك بنجاح.");
      
      // تحديث بيانات الاشتراك المحلية
      setSubscriptionData(prev => ({
        ...prev!,
        status: "active",
        cancel_at_period_end: false
      }));
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء استئناف الاشتراك");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              <CreditCard className="mr-2 inline-block h-5 w-5" />
              بيانات الاشتراك
            </h3>
            <Badge variant="outline">{getSubscriptionStatus()}</Badge>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-bold">الخطة الحالية:</span>
              <span>{subscriptionData?.plan || "مجانية"}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="font-bold">تاريخ نهاية الفترة الحالية:</span>
              <span>{formatDate(subscriptionData?.current_period_end)}</span>
            </div>
            
            {subscriptionData?.trial_end && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <span className="font-bold">تاريخ نهاية الفترة التجريبية:</span>
                <span>{formatDate(subscriptionData.trial_end)}</span>
              </div>
            )}
            
            {subscriptionData?.payment_method && (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span className="font-bold">طريقة الدفع:</span>
                <span>{subscriptionData.payment_method}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">إدارة الاشتراك</h3>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            {subscriptionData?.status === "canceled" && subscriptionData?.cancel_at_period_end ? (
              <div>
                <p className="text-sm text-gray-500">
                  تم إلغاء اشتراكك وسيتم إنهاؤه في {formatDate(subscriptionData.current_period_end)}.
                </p>
                <Button 
                  variant="secondary"
                  onClick={handleResumeSubscription}
                  disabled={loading}
                >
                  {loading ? 'جاري الاستئناف...' : 'استئناف الاشتراك'}
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500">
                  يمكنك تغيير خطتك أو إلغاء اشتراكك في أي وقت.
                </p>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => handleChangePlan("premium")}
                    disabled={loading}
                  >
                    {loading ? 'جاري التغيير...' : 'تغيير الخطة إلى مميزة'}
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={loading}
                  >
                    {loading ? 'جاري الإلغاء...' : 'إلغاء الاشتراك'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">مميزات الخطة المميزة</h4>
                <p className="text-sm text-gray-500">استمتع بميزات إضافية وخدمات حصرية.</p>
              </div>
            </div>
            <Separator className="my-4" />
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>وصول غير محدود للإعلانات</li>
              <li>دعم فني على مدار الساعة</li>
              <li>تحليلات متقدمة</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-blue-100 p-3">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">الأمان والحماية</h4>
                <p className="text-sm text-gray-500">نحن نحرص على حماية بياناتك ومعلوماتك.</p>
              </div>
            </div>
            <Separator className="my-4" />
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>تشفير البيانات بالكامل</li>
              <li>حماية من الهجمات الإلكترونية</li>
              <li>تحديثات أمنية دورية</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-orange-100 p-3">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">تتبع النشاط</h4>
                <p className="text-sm text-gray-500">راقب أداء متجرك وإعلاناتك.</p>
              </div>
            </div>
            <Separator className="my-4" />
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>تقارير مفصلة للإعلانات</li>
              <li>تتبع الزيارات والمبيعات</li>
              <li>تحليل سلوك العملاء</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-yellow-100 p-3">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold">الجوائز والمكافآت</h4>
                <p className="text-sm text-gray-500">احصل على مكافآت عند تحقيق أهدافك.</p>
              </div>
            </div>
            <Separator className="my-4" />
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>مكافآت للإعلانات الناجحة</li>
              <li>جوائز لأفضل المتاجر</li>
              <li>عروض حصرية</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionSettings;
