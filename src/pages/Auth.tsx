
import React, { useState } from "react";
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
  const [signupPassword, setSignupPassword] = useState("");
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

  // Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoginLoading(false);

    if (error) {
      setLoginError(error.message);
      toast.error(error.message);
    } else {
      toast.success("تم تسجيل الدخول بنجاح!");
      navigate("/");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError("");
    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
    });
    setSignupLoading(false);

    if (error) {
      setSignupError(error.message);
      toast.error(error.message);
    } else {
      toast.success("تم إنشاء الحساب. تحقق من بريدك الإلكتروني.");
      setActiveTab("login");
      setSignupEmail("");
      setSignupPassword("");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage("");
    setResetError("");
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: window.location.origin + "/auth",
    });
    setResetLoading(false);

    if (error) {
      setResetError(error.message);
      toast.error(error.message);
    } else {
      setResetMessage("تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني.");
      toast.success("تم الإرسال بنجاح!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-indigo-950 dark:to-slate-900">
      <Card className="w-full max-w-md glass rounded-3xl shadow-xl">
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
            >
              <TabsList className="w-full justify-center bg-muted mb-6 rounded-full gap-2">
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
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div>
                    <label className="sr-only" htmlFor="login-email">
                      البريد الإلكتروني
                    </label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="البريد الإلكتروني"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="relative">
                    <label className="sr-only" htmlFor="login-password">
                      كلمة المرور
                    </label>
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="كلمة المرور"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword((s) => !s)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </Button>
                  </div>
                  {loginError && (
                    <div className="text-destructive text-sm font-medium">
                      {loginError}
                    </div>
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
                <form className="space-y-4" onSubmit={handleSignup}>
                  <div>
                    <label className="sr-only" htmlFor="signup-email">
                      البريد الإلكتروني
                    </label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="البريد الإلكتروني"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <div className="relative">
                    <label className="sr-only" htmlFor="signup-password">
                      كلمة المرور
                    </label>
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="كلمة المرور"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowSignupPassword((s) => !s)}
                      tabIndex={-1}
                    >
                      {showSignupPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </Button>
                  </div>
                  {signupError && (
                    <div className="text-destructive text-sm font-medium">
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
            <form className="space-y-4" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="reset-email" className="sr-only">
                  البريد الإلكتروني
                </label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              {resetError && (
                <div className="text-destructive text-sm font-medium">
                  {resetError}
                </div>
              )}
              {resetMessage && (
                <div className="text-emerald-600 text-sm font-bold flex items-center gap-2">
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
