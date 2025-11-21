import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Thermometer, 
  Upload, 
  FileSearch, 
  Bell, 
  User, 
  LogOut,
  Users,
  Tractor,
  BarChart3,
  CloudSun,
  TrendingUp
} from "lucide-react";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { userRole, signOut } = useAuth();
  const location = useLocation();

  const farmerLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/sensors", icon: Thermometer, label: "Sensor Data" },
    { to: "/weather", icon: CloudSun, label: "Weather Forecast" },
    { to: "/market-trends", icon: TrendingUp, label: "Market Trends" },
    { to: "/upload", icon: Upload, label: "Data Collection" },
    { to: "/analysis", icon: FileSearch, label: "AI Analysis" },
    { to: "/alerts", icon: Bell, label: "Alerts" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/farms", icon: Tractor, label: "Farm Management" },
    { to: "/admin/users", icon: Users, label: "User Management" },
    { to: "/admin/analysis", icon: BarChart3, label: "AI Analysis Review" },
  ];

  const links = userRole === "agronomist" ? adminLinks : farmerLinks;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card">
        <div className="flex h-16 items-center border-b border-border px-6">
          <h1 className="text-xl font-bold text-primary">CropGuard</h1>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 text-base"
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-base mt-auto"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};