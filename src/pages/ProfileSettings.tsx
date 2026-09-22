import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2 } from "lucide-react";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user, userId, signOut } = useAuth();
  const updateProfile = useMutation(api.auth.updateProfile);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !("email" in user)) return;
    setEmail(user.email);
  }, [user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    if (!email.trim() && !password.trim()) {
      setMessage("Enter at least one field to update.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateProfile({
        userId: userId as any,
        email: email.trim() || undefined,
        password: password.trim() || undefined,
      });

      if (!result || !result.ok) {
        setMessage("Unable to update your account.");
        return;
      }

      localStorage.removeItem("streamscale_user_id");
      localStorage.removeItem("streamscale_user_role");
      window.location.replace("/login");
    } catch (error: any) {
      const message =
        error?.message ??
        "Unable to update your account. Please try again.";

      if (message === "That email is already in use") {
        setMessage("Another account is already using that email.");
      } else if (message === "Email cannot be empty") {
        setMessage("Email cannot be empty.");
      } else if (message === "Password must be at least 6 characters") {
        setMessage("Password must be at least 6 characters.");
      } else if (message === "No changes to save") {
        setMessage("No changes were made.");
      } else {
        setMessage(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMasterAdmin = Boolean(user && "isMasterAdmin" in user && user.isMasterAdmin === true);

  return (
    <main className="min-h-screen bg-[#f7f8fa] px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
          >
            ← Back
          </button>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Profile settings</h1>
          <p className="mt-2 text-sm text-slate-500">
            Update your own account details. This is the master account that controls everything.
          </p>
        </div>

        {isMasterAdmin && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <Shield className="size-4 text-slate-500" />
            <span className="font-medium text-slate-700">Master administrator</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-500">This account controls all users, permissions, and settings.</span>
          </div>
        )}

        <Card className="border-slate-200 bg-white shadow-xl shadow-slate-200/40">
          <CardHeader>
            <CardTitle>Update your credentials</CardTitle>
            <CardDescription>
              Change your email or password below. Immediately after saving, your old credentials will stop working and you will need to sign in again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {message && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  {message}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-11 w-full pl-3"
                    placeholder="you@streamscale.com"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Leave blank to keep your current email.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11 w-full pl-3"
                    placeholder="At least 6 characters"
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Leave blank to keep your current password.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full gap-2 bg-slate-900 text-white hover:bg-slate-800"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  "Update my account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <p className="font-medium text-slate-800">Current account</p>
          <p className="mt-1 text-slate-500">
            {user && "email" in user ? user.email : "unknown"}
          </p>
        </div>
      </div>
    </main>
  );
}
