import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tractor, Users, FileSearch, AlertTriangle } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalFarms: 0,
    totalUsers: 0,
    totalScans: 0,
    criticalAlerts: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [farmsRes, usersRes, scansRes, alertsRes] = await Promise.all([
        supabase.from("farms").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("analysis_reports").select("*", { count: "exact", head: true }),
        supabase.from("alerts").select("*", { count: "exact", head: true }).eq("severity", "critical").eq("is_read", false),
      ]);

      setStats({
        totalFarms: farmsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalScans: scansRes.count || 0,
        criticalAlerts: alertsRes.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <h1 className="mb-6 text-3xl font-bold text-foreground">Admin Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Farms"
            value={stats.totalFarms.toString()}
            icon={<Tractor className="h-8 w-8 text-primary" />}
            description="Registered farms"
          />
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toString()}
            icon={<Users className="h-8 w-8 text-primary" />}
            description="Active users"
          />
          <StatCard
            title="Total Scans"
            value={stats.totalScans.toString()}
            icon={<FileSearch className="h-8 w-8 text-primary" />}
            description="AI analyses performed"
          />
          <StatCard
            title="Critical Alerts"
            value={stats.criticalAlerts.toString()}
            icon={<AlertTriangle className="h-8 w-8 text-alert" />}
            description="Unread critical alerts"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="/admin/farms" className="block rounded-lg border border-border p-4 hover:bg-accent transition-colors">
                <h3 className="font-semibold text-card-foreground">Manage Farms</h3>
                <p className="text-sm text-muted-foreground">View and manage all registered farms</p>
              </a>
              <a href="/admin/users" className="block rounded-lg border border-border p-4 hover:bg-accent transition-colors">
                <h3 className="font-semibold text-card-foreground">Manage Users</h3>
                <p className="text-sm text-muted-foreground">View all users and their roles</p>
              </a>
              <a href="/admin/analysis" className="block rounded-lg border border-border p-4 hover:bg-accent transition-colors">
                <h3 className="font-semibold text-card-foreground">Review AI Analysis</h3>
                <p className="text-sm text-muted-foreground">View all pest detection reports</p>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>System health and statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database Status</span>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">AI Service</span>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">IoT Monitoring</span>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Running</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ title, value, icon, description }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-card-foreground">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default AdminDashboard;