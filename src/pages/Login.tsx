import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const loginMutation = useMutation(api.auth.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = (email ?? "").trim().toLowerCase();
    const normalizedPassword = (password ?? "");

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!normalizedPassword) {
      setError("Enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginMutation({ email: normalizedEmail, password: normalizedPassword });
      signIn(result.userId, result.role);
      navigate("/dashboard");
    } catch (err: any) {
      const message = err?.message ?? "Unable to sign in.";

      if (message === "User not found") {
        setError("No account found with that email.");
      } else if (message === "Incorrect password") {
        setError("Wrong password. Please try again.");
      } else if (message === "Email not verified") {
        setError("This account has not been verified yet.");
      } else if (message === "Email is required") {
        setError("Enter your email address.");
      } else if (message.startsWith("Incorrect master password")) {
        setError("Wrong master password. Please try again.");
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="nyr nyr-hero flex min-h-screen flex-col">
      <div className="nyr-grid" />
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
        <div className="mb-10 text-center">
          <p className="nyr-eyebrow justify-center">
            <span className="nyr-status-dot" />
            Streamscale
          </p>
          <h1 className="nyr-display mt-8">
            Sign in to <em>your workspace.</em>
          </h1>
          <p className="nyr-signal mt-4">
            Accounts are created and managed by an administrator.
          </p>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Welcome back</CardTitle>
            <CardDescription className="text-white/60">
              Use the email and password assigned to you by Streamscale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/70">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--nyr-blue)]" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-11 border-white/15 bg-white/5 pl-10 text-white placeholder:text-white/35"
                    placeholder="you@company.com"
                    autoComplete="off"
                    name="streamscale-login-email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/70">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--nyr-blue)]" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11 border-white/15 bg-white/5 px-10 text-white placeholder:text-white/35"
                    placeholder="Your password"
                    autoComplete="new-password"
                    name="streamscale-login-password"
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#93b4f5] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="nyr-btn nyr-btn-primary !min-h-12 w-full text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="nyr-link mt-8 self-center !text-white/80 hover:!text-white"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </button>
      </div>
    </div>
  );
}
