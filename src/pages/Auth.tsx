
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus, Key, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database } from "@/integrations/supabase/types";
import { debug } from "@/lib/debug";

type Office = Database['public']['Tables']['offices']['Row'];

const Auth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [networkStatus, setNetworkStatus] = useState<"online" | "offline">("online");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  // Reset Password state
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // مراقبة حالة الاتصال بالإنترنت
  useEffect(() => {
    const handleOnlineStatus = () => setNetworkStatus("online");
    const handleOfflineStatus = () => setNetworkStatus("offline");

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    // تعيين الحالة الأولية
    setNetworkStatus(navigator.onLine ? "online" : "offline");

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);

  // Check auth state on component mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("خطأ في الحصول على الجلسة:", sessionError.message);
          return;
        }
        
        if (session) {
          // هل لدى المستخدم صفحة معرفة؟
          try {
            const { data, error } = await supabase
              .from('offices')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();

            if (error) {
              console.error("خطأ في استعلام المكتب:", error.message);
              return;
            }

            if (data) {
              navigate('/dashboard');
            } else {
              navigate('/create-page');
            }
          } catch (error: any) {
            console.error("خطأ في التحقق من بيانات المكتب:", error.message);
          }
        }
      } catch (error: any) {
        console.error("خطأ عام في التحقق من المصادقة:", error.message);
        debug.logError(error, "Auth.tsx:checkUser");
      }
    };
    checkUser();
  }, [navigate]);

  // Clear errors when changing tabs
  useEffect(() => {
    setLoginError("");
    setSignupError("");
  }, [activeTab]);

  // Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (networkStatus === "offline") {
      toast.error("لا يوجد اتصال بالإنترنت. يرجى التحقق من الاتصال والمحاولة مرة أخرى.");
      return;
    }
    
    setLoginLoading(true);
    setLoginError("");
    
    try {
      console.log("محاولة تسجيل الدخول...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      
      if (error) {
        console.error("خطأ في تسجيل الدخول:", error);
        let errorMessage = "فشل تسجيل الدخول";
        
        if (error.message.includes("credentials")) {
          errorMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
        } else if (error.message.includes("network")) {
          errorMessage = "مشكلة في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت";
        } else if (error.message.includes("fetch")) {
          errorMessage = "تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى لاحقاً";
        }
        
        throw new Error(errorMessage);
      }
      
      // التحقق مما إذا كان المستخدم لديه صفحة مُعرَّفة
      try {
        const { data: office, error: officeError } = await supabase
          .from('offices')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (officeError) {
          console.error("خطأ في استعلام المكتب:", officeError);
        }

        toast.success("تم تسجيل الدخول بنجاح!");
        
        // توجيه المستخدم بناءً على وجود صفحة
        if (office) {
          // لديه صفحة معرفة، توجيه للوحة التحكم
          navigate("/dashboard");
        } else {
          // ليس لديه صفحة، توجيه لإنشاء صفحة
          navigate("/create-page");
        }
      } catch (officeCheckError: any) {
        console.error("خطأ عند التحقق من وجود المكتب:", officeCheckError);
        // على الرغم من الخطأ، نوجه المستخدم للوحة التحكم
        navigate("/dashboard");
      }
    } catch (error: any) {
      setLoginError(error.message || "حدث خطأ أثناء تسجيل الدخول");
      toast.error(error.message || "حدث خطأ أثناء تسجيل الدخول");
      debug.logError(error, "Auth.tsx:handleLogin");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (networkStatus === "offline") {
      toast.error("لا يوجد اتصال بالإنترنت. يرجى التحقق من الاتصال والمحاولة مرة أخرى.");
      return;
    }

    // Validate password match
    if (signupPassword !== signupConfirmPassword) {
      setSignupError("كلمتا المرور غير متطابقتين.");
      toast.error("كلمتا المرور غير متطابقتين.");
      return;
    }

    // Validate username
    if (!signupUsername.trim()) {
      setSignupError("الرجاء إدخال اسم المستخدم.");
      toast.error("الرجاء إدخال اسم المستخدم.");
      return;
    }

    setSignupLoading(true);
    setSignupError("");

    try {
      console.log("محاولة إنشاء حساب جديد...");
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: { username: signupUsername }
        }
      });

      if (error) {
        console.error("خطأ في إنشاء الحساب:", error);
        let errorMessage = "فشل إنشاء الحساب";
        
        if (error.message.includes("email")) {
          errorMessage = "البريد الإلكتروني غير صالح أو مستخدم بالفعل";
        } else if (error.message.includes("password")) {
          errorMessage = "كلمة المرور غير قوية بما يكفي. يجب أن تتكون من 6 أحرف على الأقل";
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage = "مشكلة في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت";
        }
        
        throw new Error(errorMessage);
      }
      
      toast.success("تم إنشاء الحساب. تحقق من بريدك الإلكتروني.");
      setActiveTab("login");
      // Reset form
      setSignupEmail("");
      setSignupUsername("");
      setSignupPassword("");
      setSignupConfirmPassword("");
    } catch (error: any) {
      setSignupError(error.message || "حدث خطأ أثناء إنشاء الحساب");
      toast.error(error.message || "حدث خطأ أثناء إنشاء الحساب");
      debug.logError(error, "Auth.tsx:handleSignup");
    } finally {
      setSignupLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (networkStatus === "offline") {
      toast.error("لا يوجد اتصال بالإنترنت. يرجى التحقق من الاتصال والمحاولة مرة أخرى.");
      return;
    }
    
    setResetLoading(true);
    setResetMessage("");
    setResetError("");
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + "/auth",
      });
      
      if (error) throw error;
      
      setResetMessage("تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني.");
      toast.success("تم الإرسال بنجاح!");
    } catch (error: any) {
      const errorMessage = error.message.includes("fetch") 
        ? "تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى." 
        : error.message || "حدث خطأ أثناء إرسال رابط إعادة التعيين";
      
      setResetError(errorMessage);
      toast.error(errorMessage);
      debug.logError(error, "Auth.tsx:handleResetPassword");
    } finally {
      setResetLoading(false);
    }
  };

  // Input change handlers with error clearing
  const handleLoginEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginEmail(e.target.value);
    setLoginError("");
  };

  const handleLoginPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginPassword(e.target.value);
    setLoginError("");
  };

  const handleSignupEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupEmail(e.target.value);
    setSignupError("");
  };

  const handleSignupUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupUsername(e.target.value);
    setSignupError("");
  };

  const handleSignupPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupPassword(e.target.value);
    setSignupError("");
  };

  const handleSignupConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupConfirmPassword(e.target.value);
    setSignupError("");
  };

  const handleResetEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResetEmail(e.target.value);
    setResetError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-indigo-950 dark:to-slate-900">
      <Card className="w-full max-w-md glass rounded-3xl shadow-xl" dir="rtl">
        <CardHeader>
          <CardTitle className="flex flex-col items-center gap-2 text-center text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
            {showReset ? (
              <>
                <Key className="mx-auto mb-2 text-purple-500" size={30} />
                نسيت كلمة المرور
              </>
            ) : activeTab === "login" ? (
              <>
                <LogIn className="mx-auto mb-2 text-sky-500" size={30} />
                تسجيل الدخول
              </>
            ) : (
              <>
                <UserPlus className="mx-auto mb-2 text-pink-600" size={30} />
                إنشاء حساب جديد
              </>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {/* تنبيه عدم الاتصال بالإنترنت */}
          {networkStatus === "offline" && (
            <Alert className="mb-4 border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription>
                لا يوجد اتصال بالإنترنت. تأكد من اتصالك بالشبكة للاستمرار.
              </AlertDescription>
            </Alert>
          )}

          {!showReset ? (
            <Tabs
              value={activeTab}
              className="w-full"
              onValueChange={(val) => setActiveTab(val as "login" | "signup")}
              dir="rtl"
            >
              <TabsList className="w-full justify-center bg-muted mb-6 rounded-full gap-2 flex-row-reverse" dir="rtl">
                <TabsTrigger
                  value="login"
                  className="flex-1 text-base font-bold rounded-full"
                  id="tab-login"
                  name="auth-tab"
                >
                  دخول
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="flex-1 text-base font-bold rounded-full"
                  id="tab-signup"
                  name="auth-tab"
                >
                  تسجيل جديد
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form className="space-y-4 flex flex-col" onSubmit={handleLogin} dir="rtl" autoComplete="on">
                  <div className="flex flex-col gap-2">
                    <label className="text-right text-sm font-bold" htmlFor="login-email">
                      البريد الإلكتروني
                    </label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="البريد الإلكتروني"
                      className="text-right placeholder:text-right"
                      value={loginEmail}
                      onChange={handleLoginEmailChange}
                      autoComplete="email"
                      required
                      dir="rtl"
                    />
                  </div>
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-right text-sm font-bold" htmlFor="login-password">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="كلمة المرور"
                        className="text-right placeholder:text-right pl-12"
                        value={loginPassword}
                        onChange={handleLoginPasswordChange}
                        autoComplete="current-password"
                        required
                        dir="rtl"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
                        onClick={() => setShowPassword((s) => !s)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </Button>
                    </div>
                  </div>
                  {loginError && (
                    <Alert className="py-2 border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <AlertDescription className="text-right pr-2">
                        {loginError}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-full font-bold"
                    disabled={loginLoading || networkStatus === "offline"}
                  >
                    {loginLoading ? "جاري الدخول..." : "دخول"}
                  </Button>
                  <div className="text-center text-xs md:text-sm mt-4">
                    <button
                      className="text-blue-600 hover:underline font-bold"
                      type="button"
                      onClick={() => setShowReset(true)}
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form className="space-y-4 flex flex-col" onSubmit={handleSignup} autoComplete="off" dir="rtl">
                  <div className="flex flex-col gap-2">
                    <label className="text-right text-sm font-bold" htmlFor="signup-email">
                      البريد الإلكتروني
                    </label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="البريد الإلكتروني"
                      className="text-right placeholder:text-right"
                      value={signupEmail}
                      onChange={handleSignupEmailChange}
                      autoComplete="email"
                      required
                      dir="rtl"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-right text-sm font-bold" htmlFor="signup-username">
                      اسم المستخدم
                    </label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="اسم المستخدم"
                      className="text-right placeholder:text-right"
                      value={signupUsername}
                      onChange={handleSignupUsernameChange}
                      autoComplete="username"
                      required
                      dir="rtl"
                    />
                  </div>
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-right text-sm font-bold" htmlFor="signup-password">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="كلمة المرور"
                        className="text-right placeholder:text-right pl-12"
                        value={signupPassword}
                        onChange={handleSignupPasswordChange}
                        autoComplete="new-password"
                        required
                        dir="rtl"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={showSignupPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
                        onClick={() => setShowSignupPassword((s) => !s)}
                      >
                        {showSignupPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-right text-sm font-bold" htmlFor="signup-confirm-password">
                      تأكيد كلمة المرور
                    </label>
                    <Input
                      id="signup-confirm-password"
                      type="password"
                      placeholder="تأكيد كلمة المرور"
                      className="text-right placeholder:text-right"
                      value={signupConfirmPassword}
                      onChange={handleSignupConfirmPasswordChange}
                      autoComplete="new-password"
                      required
                      dir="rtl"
                    />
                  </div>
                  {signupError && (
                    <Alert className="py-2 border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300">
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <AlertDescription className="text-right pr-2">
                        {signupError}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-full font-bold"
                    disabled={signupLoading || networkStatus === "offline"}
                  >
                    {signupLoading ? "جاري التسجيل..." : "تسجيل جديد"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          ) : (
            <form className="space-y-4 flex flex-col" onSubmit={handleResetPassword} dir="rtl">
              <div className="flex flex-col gap-2">
                <label htmlFor="reset-email" className="text-right text-sm font-bold">
                  البريد الإلكتروني
                </label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  className="text-right placeholder:text-right"
                  value={resetEmail}
                  onChange={handleResetEmailChange}
                  autoComplete="email"
                  required
                  dir="rtl"
                />
              </div>
              {resetError && (
                <Alert className="py-2 border-red-500 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-right pr-2">
                    {resetError}
                  </AlertDescription>
                </Alert>
              )}
              {resetMessage && (
                <div className="text-emerald-600 text-sm font-bold flex items-center gap-2 justify-end">
                  <Mail size={18} /> {resetMessage}
                </div>
              )}
              <Button
                type="submit"
                size="lg"
                className="w-full rounded-full font-bold"
                disabled={resetLoading || networkStatus === "offline"}
              >
                {resetLoading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
              </Button>
              <div className="text-xs text-center">
                <button
                  className="text-blue-700 hover:underline mt-2"
                  type="button"
                  onClick={() => setShowReset(false)}
                >
                  العودة إلى تسجيل الدخول
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
