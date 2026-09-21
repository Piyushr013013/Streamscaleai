import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, LogOut, Activity, BarChart3, Users, Settings } from "lucide-react";
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
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Streamscale Dashboard
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Welcome{user?.name ? `, ${user.name}` : "User"}
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your streaming infrastructure and monitor your data flows.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Activity className="size-5" />}
              title="Active Streams"
              value="24"
              change="+12%"
              trend="up"
            />
            <StatCard
              icon={<BarChart3 className="size-5" />}
              title="Events Today"
              value="1.2M"
              change="+8%"
              trend="up"
            />
            <StatCard
              icon={<Users className="size-5" />}
              title="Connected Clients"
              value="847"
              change="-3%"
              trend="down"
            />
            <StatCard
              icon={<Settings className="size-5" />}
              title="Uptime"
              value="99.99%"
              change="0%"
              trend="stable"
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <Card className="lg:col-span-2 border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border/30 hover:bg-card/50 transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto py-3 text-left"
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      {action.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {action.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "stable";
}

function StatCard({ icon, title, value, change, trend }: StatCardProps) {
  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  const trendColor =
    trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted-foreground";

  return (
    <Card className="border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
          </div>
          <span className={`text-sm font-medium ${trendColor}`}>
            {trendIcon} {change}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

const recentActivity = [
  {
    icon: <Activity className="size-5" />,
    title: "Stream deployed: user-events",
    description: "Production environment in us-east-1",
    time: "2 min ago",
  },
  {
    icon: <BarChart3 className="size-5" />,
    title: "Analytics query completed",
    description: "Real-time dashboard updated",
    time: "5 min ago",
  },
  {
    icon: <Users className="size-5" />,
    title: "New client connected",
    description: "Webhook endpoint active",
    time: "12 min ago",
  },
  {
    icon: <Settings className="size-5" />,
    title: "Configuration updated",
    description: "Retry policy modified",
    time: "34 min ago",
  },
];

const quickActions = [
  {
    icon: <Activity className="size-5" />,
    title: "Create New Stream",
    description: "Set up a real-time data stream",
  },
  {
    icon: <BarChart3 className="size-5" />,
    title: "View Analytics",
    description: "Monitor your stream metrics",
  },
  {
    icon: <Users className="size-5" />,
    title: "Manage Clients",
    description: "View and manage connected clients",
  },
  {
    icon: <Settings className="size-5" />,
    title: "Settings",
    description: "Configure your account preferences",
  },
];
