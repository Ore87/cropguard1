import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Demo data for demonstration purposes
const demoAlerts: Alert[] = [
  {
    id: "1",
    alert_type: "Pest Detection Alert",
    severity: "critical",
    message: "High Fall Armyworm (FAW) infestation detected in Field A via drone scan. Immediate intervention recommended.",
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: "2",
    alert_type: "Soil Moisture Warning",
    severity: "high",
    message: "Low soil moisture levels detected in Sector C. Irrigation required within 24 hours.",
    is_read: false,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: "3",
    alert_type: "Weather Forecast",
    severity: "medium",
    message: "Heavy rainfall forecast for tomorrow. Secure loose equipment and ensure proper drainage.",
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
  },
  {
    id: "4",
    alert_type: "Pest Detection Alert",
    severity: "high",
    message: "Moderate aphid population detected in Field B. Consider early treatment to prevent spread.",
    is_read: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: "5",
    alert_type: "Temperature Alert",
    severity: "medium",
    message: "High temperature warning: 38°C expected today. Monitor crop stress levels closely.",
    is_read: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: "6",
    alert_type: "System Notification",
    severity: "low",
    message: "Weekly sensor maintenance scheduled for next Monday at 9:00 AM.",
    is_read: true,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
  },
  {
    id: "7",
    alert_type: "Humidity Alert",
    severity: "medium",
    message: "High humidity levels in greenhouse (85%). Increase ventilation to prevent fungal growth.",
    is_read: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
];

const Alerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>(demoAlerts);
  const [loading, setLoading] = useState(false);

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("alerts")
        .update({ is_read: true })
        .eq("id", alertId);

      if (error) throw error;

      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, is_read: true } : alert
        )
      );

      toast.success("Alert marked as read");
    } catch (error) {
      console.error("Error updating alert:", error);
      toast.error("Failed to update alert");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diffMs = now - then;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return `${diffDays} days ago`;
    }
  };

  const getAlertIcon = (alertType: string) => {
    if (alertType.toLowerCase().includes('pest')) {
      return <AlertCircle className="h-5 w-5 text-destructive" />;
    } else if (alertType.toLowerCase().includes('moisture') || alertType.toLowerCase().includes('irrigation')) {
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    } else if (alertType.toLowerCase().includes('weather') || alertType.toLowerCase().includes('system')) {
      return <Bell className="h-5 w-5 text-blue-500" />;
    }
    return <AlertCircle className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading alerts...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6 flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Alerts & Notifications</h1>
        </div>

        {alerts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Alerts</h3>
              <p className="text-muted-foreground text-center max-w-md">
                You'll see notifications here when sensor readings require attention or pests are detected.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className={alert.is_read ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      {getAlertIcon(alert.alert_type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">{alert.alert_type}</CardTitle>
                          <Badge variant={getSeverityColor(alert.severity) as any}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          {!alert.is_read && (
                            <Badge variant="default" className="bg-primary">NEW</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getRelativeTime(alert.created_at)}
                        </p>
                      </div>
                    </div>
                    {!alert.is_read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(alert.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{alert.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Alerts;