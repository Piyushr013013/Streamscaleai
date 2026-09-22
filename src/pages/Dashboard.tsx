import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Navigation />
      <main className="pt-8 pb-16">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Dashboard</p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mt-1">
                Welcome{user && "name" in user ? `, ${user.name}` : "User"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {user && "isMasterAdmin" in user && user.isMasterAdmin === true && (
                <Button variant="outline" className="gap-2" onClick={() => navigate("/admin")}>
                  <Shield className="size-4" />
                  Admin
                </Button>
              )}
              <Button variant="outline" className="gap-2" onClick={() => navigate("/profile")}>
                <Settings className="size-4" />
                Profile
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleSignOut}>
                <LogOut className="size-4" />
                Sign out
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Active Streams</p>
                    <p className="text-xl font-semibold text-slate-900 mt-1">24</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Events Today</p>
                    <p className="text-xl font-semibold text-slate-900 mt-1">1.2M</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Connected Clients</p>
                    <p className="text-xl font-semibold text-slate-900 mt-1">847</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Uptime</p>
                    <p className="text-xl font-semibold text-slate-900 mt-1">99.99%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 p-4">
            <CardContent className="pt-4">
              <p className="text-lg font-semibold text-slate-900 mb-3">Recent Activity</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Stream deployed: user-events</p>
                    <p className="text-xs text-slate-500">Production environment in us-east-1</p>
                  </div>
                  <p className="text-xs text-slate-500 ml-auto">2 min ago</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3v18h18" />
                      <path d="M7 14h4v4H7z" />
                      <path d="M13 10h4v8h-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Analytics query completed</p>
                    <p className="text-xs text-slate-500">Real-time dashboard updated</p>
                  </div>
                  <p className="text-xs text-slate-500 ml-auto">5 min ago</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">New client connected</p>
                    <p className="text-xs text-slate-500">Webhook endpoint active</p>
                  </div>
                  <p className="text-xs text-slate-500 ml-auto">12 min ago</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.04a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.04a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.04a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.04a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H4a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.04a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.04a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V4a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.04a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.04a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H20a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Configuration updated</p>
                    <p className="text-xs text-slate-500">Retry policy modified</p>
                  </div>
                  <p className="text-xs text-slate-500 ml-auto">34 min ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
