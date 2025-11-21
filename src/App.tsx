import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/farmer/Dashboard";
import Sensors from "./pages/farmer/Sensors";
import Weather from "./pages/farmer/Weather";
import MarketTrends from "./pages/farmer/MarketTrends";
import ExpertDirectory from "./pages/farmer/ExpertDirectory";
import Upload from "./pages/farmer/Upload";
import Analysis from "./pages/farmer/Analysis";
import Alerts from "./pages/farmer/Alerts";
import Profile from "./pages/farmer/Profile";
import ReportDetails from "./pages/farmer/ReportDetails";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FarmManagement from "./pages/admin/FarmManagement";
import UserManagement from "./pages/admin/UserManagement";
import AnalysisReview from "./pages/admin/AnalysisReview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["farmer"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/sensors" element={<ProtectedRoute allowedRoles={["farmer"]}><Sensors /></ProtectedRoute>} />
            <Route path="/weather" element={<ProtectedRoute allowedRoles={["farmer"]}><Weather /></ProtectedRoute>} />
            <Route path="/market-trends" element={<ProtectedRoute allowedRoles={["farmer"]}><MarketTrends /></ProtectedRoute>} />
            <Route path="/expert-directory" element={<ProtectedRoute allowedRoles={["farmer"]}><ExpertDirectory /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute allowedRoles={["farmer"]}><Upload /></ProtectedRoute>} />
            <Route path="/analysis" element={<ProtectedRoute allowedRoles={["farmer"]}><Analysis /></ProtectedRoute>} />
            <Route path="/farmer/report/:reportId" element={<ProtectedRoute allowedRoles={["farmer"]}><ReportDetails /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute allowedRoles={["farmer"]}><Alerts /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={["farmer"]}><Profile /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["agronomist"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/farms" element={<ProtectedRoute allowedRoles={["agronomist"]}><FarmManagement /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["agronomist"]}><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/analysis" element={<ProtectedRoute allowedRoles={["agronomist"]}><AnalysisReview /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
