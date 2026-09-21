import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shield, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");

  // OTP verification
  const [otpMode, setOtpMode] = useState<"verify" | null>(null);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Current password for OTP login flow
  const [pendingPassword, setPendingPassword] = useState("");

  // Mutations
  const registerMutation = useMutation(api.auth.register);
  const verifyOtpMutation = useMutation(api.auth.verifyOtp);
  const requestOtpMutation = useMutation(api.auth.requestOtp);
  const loginMutation = useMutation(api.auth.login);
  const initAdminMutation = useMutation(api.auth.initAdmin);

  // Initialize admin on mount
  useState(() => {
    initAdminMutation({});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      // First try direct login (for admin who is already verified)
      try {
        const result = await loginMutation({
          email: loginEmail.toLowerCase(),
          password: loginPassword,
        });
        await signIn();
        navigate("/dashboard");
        return;
      } catch (loginErr: any) {
        // If not verified, request OTP
        if (loginErr.message === "Email not verified") {
          setOtpMode("verify");
          setOtpEmail(loginEmail);
          setPendingPassword(loginPassword);
          // Request OTP
          try {
            const otpResult = await requestOtpMutation({
              email: loginEmail.toLowerCase(),
            });
            setOtpSent(true);
            // In production, this would be sent via email
            // For demo, we show it in an alert
            alert(`A verification code has been sent to ${loginEmail}.\n\nFor demo purposes, check the browser console (F12) for the code.`);
            console.log(`OTP for ${loginEmail}: ${otpResult.otp}`);
          } catch (reqErr: any) {
            setOtpError(reqErr.message);
          }
        } else {
          setLoginError(loginErr.message);
        }
      }
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");

    try {
      const result = await verifyOtpMutation({
        email: otpEmail.toLowerCase(),
        otp: otpCode,
      });

      if (result.success) {
        // Now try to login with pending password
        try {
          const loginResult = await loginMutation({
            email: otpEmail.toLowerCase(),
            password: pendingPassword,
          });
          await signIn();
          navigate("/dashboard");
        } catch (loginErr: any) {
          setOtpError(loginErr.message);
        }
      }
    } catch (err: any) {
      setOtpError(err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    try {
      const result = await registerMutation({
        email: regEmail.toLowerCase(),
        password: regPassword,
        name: regName,
      });

      // Show OTP for verification
      setOtpMode("verify");
      setOtpEmail(regEmail);
      setPendingPassword(regPassword);
      setOtpSent(true);
      alert(`Registration successful! A verification code has been sent to ${regEmail}.\n\nFor demo purposes, check the browser console (F12) for the code.`);
      console.log(`OTP for ${regEmail}: ${result.otp}`);
    } catch (err: any) {
      setRegError(err.message);
    }
  };

  const handleResendOtp = async () => {
    try {
      const result = await requestOtpMutation({
        email: otpEmail.toLowerCase(),
      });
      setOtpSent(true);
      alert(`New verification code sent to ${otpEmail}.\n\nFor demo purposes, check the browser console (F12) for the code.`);
      console.log(`OTP for ${otpEmail}: ${result.otp}`);
    } catch (err: any) {
      setOtpError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gray-100 text-gray-900 mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Streamscale</h1>
          <p className="text-gray-500 mt-1">
            {mode === "login" ? "Sign in to access your dashboard" : "Create your account"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200 mb-6">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
              mode === "login"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
              mode === "register"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Login Form */}
        {mode === "login" && (
          <Card className="border-gray-200 bg-white">
            <CardHeader className="pt-6">
              <CardTitle className="text-lg text-gray-900">Welcome back</CardTitle>
              <CardDescription className="text-gray-500">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {loginError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-gray-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 pr-10 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2 bg-gray-900 hover:bg-gray-800 text-white">
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              {otpMode === "verify" && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 text-center mb-4">
                    {otpSent 
                      ? "Enter the verification code sent to your email"
                      : "Verification required"
                    }
                  </p>
                  {otpError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm mb-4">
                      {otpError}
                    </div>
                  )}
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Verification Code</Label>
                      <Input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="text-center text-lg tracking-widest border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                        maxLength={6}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">
                        Verify
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendOtp}
                        className="border-gray-300 hover:bg-gray-50 text-gray-700"
                      >
                        Resend
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Register Form */}
        {mode === "register" && (
          <Card className="border-gray-200 bg-white">
            <CardHeader className="pt-6">
              <CardTitle className="text-lg text-gray-900">Create an account</CardTitle>
              <CardDescription className="text-gray-500">
                Enter your details to create a new account
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                {regError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {regError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reg-name" className="text-gray-700">Full Name</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="John Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-gray-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="you@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="pl-10 pr-10 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-gray-400 text-center mb-4">
                    By creating an account, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>

                <Button type="submit" className="w-full gap-2 bg-gray-900 hover:bg-gray-800 text-white">
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => setMode("register")}
                className="text-gray-900 font-medium hover:underline bg-transparent border-none cursor-pointer"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-gray-900 font-medium hover:underline bg-transparent border-none cursor-pointer"
              >
                Sign in
              </button>
            </>
          )}
        </p>
        <p className="text-center text-sm text-gray-400 mt-2">
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
          >
            Back to home
          </button>
        </p>
      </div>
    </div>
  );
}
