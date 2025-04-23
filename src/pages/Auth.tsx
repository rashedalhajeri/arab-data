
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, UserPlus, Key, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

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

  // Check auth state on component mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          navigate('/');
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
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
    setLoginLoading(true);
    setLoginError("");
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      
      if (error) throw error;
      
      toast.success("تم تسجيل الدخول بنجاح!");
      navigate("/");
    } catch (error: any) {
      setLoginError(error.message || "حدث خطأ أثناء تسجيل الدخول");
      toast.error(error.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: { username: signupUsername }
        }
      });

      if (error) throw error;
      
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
    } finally {
      setSignupLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setResetError(error.message || "حدث خطأ أثناء إرسال رابط إعادة التعيين");
      toast.error(error.message || "حدث خطأ أثناء إرسال رابط إعادة التعيين");
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
                >
                  دخول
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="flex-1 text-base font-bold rounded-full"
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
                    <div className="text-destructive text-sm font-medium text-right">{loginError}</div>
                  )}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-full font-bold"
                    disabled={loginLoading}
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
                    <div className="text-destructive text-sm font-medium text-right">
                      {signupError}
                    </div>
                  )}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-full font-bold"
                    disabled={signupLoading}
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
                <div className="text-destructive text-sm font-medium text-right">
                  {resetError}
                </div>
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
                disabled={resetLoading}
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
