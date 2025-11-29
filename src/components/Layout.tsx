import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AIChatWidget } from "@/components/AIChatWidget";
import { useFarmAdvisorStatus } from "@/hooks/useFarmAdvisorStatus";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  TrendingUp,
  UserCog,
  Lightbulb,
  Menu,
  ShoppingBag,
  Settings
} from "lucide-react";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasUrgentRecommendations, urgentCount } = useFarmAdvisorStatus();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url, full_name")
        .eq("id", user.id)
        .single();
      
      if (data) {
        setAvatarUrl(data.avatar_url || "");
        setUserName(data.full_name || "");
      }
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const farmerLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/sensors", icon: Thermometer, label: "Sensor Data" },
    { to: "/weather", icon: CloudSun, label: "Weather Forecast" },
    { to: "/upload", icon: Upload, label: "Scan for Pests" },
    { to: "/analysis", icon: FileSearch, label: "AI Analysis" },
    { to: "/market-trends", icon: TrendingUp, label: "Market Trends" },
    { to: "/farm-advisor", icon: Lightbulb, label: "Farm Advisor" },
    { to: "/expert-directory", icon: UserCog, label: "Expert Directory" },
    { to: "/farm-store", icon: ShoppingBag, label: "Farm Store" },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/farms", icon: Tractor, label: "Farm Management" },
    { to: "/admin/users", icon: Users, label: "User Management" },
    { to: "/admin/analysis", icon: BarChart3, label: "AI Analysis Review" },
  ];

  const links = userRole === "agronomist" ? adminLinks : farmerLinks;

  const NavigationLinks = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.to;
        const isFarmAdvisor = link.to === "/farm-advisor";
        const showBadge = isFarmAdvisor && hasUrgentRecommendations;
        
        return (
          <Link key={link.to} to={link.to} onClick={onLinkClick}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className="w-full justify-start gap-3 text-base relative"
            >
              <Icon className="h-5 w-5" />
              {link.label}
              {showBadge && (
                <Badge 
                  variant="destructive" 
                  className="ml-auto h-5 min-w-5 px-1.5 flex items-center justify-center text-xs"
                >
                  {urgentCount}
                </Badge>
              )}
            </Button>
          </Link>
        );
      })}
    </>
  );

  const NotificationsMenu = () => (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative"
      onClick={() => navigate("/alerts")}
    >
      <Bell className="h-5 w-5" />
      {hasUrgentRecommendations && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 flex items-center justify-center text-xs"
        >
          {urgentCount}
        </Badge>
      )}
    </Button>
  );

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={userName} />
            <AvatarFallback>
              {userName.split(' ').map(n => n[0]).join('').toUpperCase() || <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setShowSignOutDialog(true)}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-card z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center border-b border-border px-6">
                <h1 className="text-xl font-bold text-primary">CropGuard</h1>
              </div>
              <nav className="flex flex-col gap-1 p-4">
                <NavigationLinks onLinkClick={() => setMobileMenuOpen(false)} />
              </nav>
            </SheetContent>
          </Sheet>
          <NotificationsMenu />
          <UserMenu />
        </div>
        <Link to="/dashboard" className="text-xl font-bold text-primary">
          CropGuard
        </Link>
        <div className="w-[88px]"></div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-border bg-card">
        <div className="flex h-16 items-center border-b border-border px-6 gap-3">
          <Link to="/dashboard" className="text-xl font-bold text-primary hover:text-primary/90 transition-colors">
            CropGuard
          </Link>
          <div className="flex items-center gap-2 ml-auto">
            <NotificationsMenu />
            <UserMenu />
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          <NavigationLinks />
        </nav>
      </aside>
      <main className="flex-1 overflow-auto lg:ml-0 pt-16 lg:pt-0">
        {children}
        <AIChatWidget />
      </main>

      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? You will need to log in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignOut}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};