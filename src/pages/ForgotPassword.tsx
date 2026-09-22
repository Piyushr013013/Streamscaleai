import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "email" | "code" | "password";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestCode = useMutation(api.auth.requestResetCode);
  const verifyCode = useMutation(api.auth.verifyResetCode);
  const resetPassword = useMutation(api.auth.resetPassword);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    setIsSubmitting(true);

    try {
      await requestCode({ email: email.trim().toLowerCase() });
      setStep("code");
      setCode("");
      setError("");
    } catch (err: any) {
      const message = err?.message ?? "Could not send code. Try again.";

      if (message === "No account found with that email") {
        setError("No account found with that email.");
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCodeSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedCode = code.replace(/\D/g, "").slice(0, 6);
    if (trimmedCode.length !== 6) {
      setError("Enter the 6-digit code we sent.");
      return;
    }

    setIsSubmitting(true);

    try {
      await verifyCode({ email: email.trim().toLowerCase(), code: trimmedCode });
      setStep("password");
      setError("");
      setConfirmPassword("");
    } catch (err: any) {
      const message = err?.message ?? "Invalid or expired code. Request a new one.";

      if (message === "No account found with that email") {
        setError("No account found with that email.");
      } else if (message === "Invalid code") {
        setError("That code is not correct. Please try again.");
      } else if (message === "Code expired") {
        setError("That code has expired. Request a new one.");
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({
        email: email.trim().toLowerCase(),
        code: code.replace(/\D/g, "").slice(0, 6),
        newPassword,
      });

      setSuccess("Password updated. You can now sign in with your new password.");
    } catch (err: any) {
      const message = err?.message ?? "Could not update password. Try again.";

      if (message === "No account found with that email") {
        setError("No account found with that email.");
      } else if (message === "Invalid or expired code") {
        setError("That code is not valid. Request a new one and try again.");
      } else if (message === "Password must be at least 6 characters") {
        setError("Password must be at least 6 characters.");
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-12 text-slate-900 sm:py-20">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <ShieldCheck className="size-6" />
          </div>
          <p className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">Streamscale</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Reset your password</h1>
          <p className="mt-2 text-sm text-slate-500">
            {step === "email" && "Enter your email and we'll send you a 6-digit code."}
            {step === "code" && "Enter the 6-digit code we sent to your email."}
            {step === "password" && "Create a new password for your account."}
          </p>
        </div>

        <Card className="border-slate-200 bg-white shadow-xl shadow-slate-200/40">
          <CardHeader>
            <CardTitle>
              {step === "email" && "Send me a code"}
              {step === "code" && "Verify your code"}
              {step === "password" && "Choose a new password"}
            </CardTitle>
            <CardDescription>
              {step === "email" && "We'll email you a 6-digit verification code."}
              {step === "code" && "Check your inbox for the code."}
              {step === "password" && "Your new password must be at least 6 characters."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="inline mr-2 size-4" />
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 pl-10"
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-full gap-2 bg-slate-900 text-white hover:bg-slate-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send code
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {step === "code" && (
              <form onSubmit={handleCodeSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="inline mr-2 size-4" />
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="code">Verification code</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="h-11 pl-10"
                      placeholder="000000"
                      maxLength={6}
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-full gap-2 bg-slate-900 text-white hover:bg-slate-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify code
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="mt-2 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
                >
                  <ArrowLeft className="size-4" />
                  Use a different email
                </button>
              </form>
            )}

            {step === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="inline mr-2 size-4" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    <CheckCircle className="inline mr-2 size-4" />
                    {success}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-11 pl-10"
                      placeholder="Your new password"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11"
                    placeholder="Repeat your new password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-full gap-2 bg-slate-900 text-white hover:bg-slate-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      Update password
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
                <button
                  type="button"
                  onClick={() => setStep("code")}
                  className="mt-2 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
                >
                  <ArrowLeft className="size-4" />
                  Use a different code
                </button>
              </form>
            )}
          </CardContent>
        </Card>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </button>
      </div>
    </main>
  );
}
