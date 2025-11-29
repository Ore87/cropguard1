import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { User, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [farmId, setFarmId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    farm_location: "",
    unique_id: "",
  });

  useEffect(() => {
    fetchProfile();
    fetchFarmId();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          farm_location: data.farm_location || "",
          unique_id: data.unique_id || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchFarmId = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from("farms")
        .select("id")
        .eq("farmer_id", user.id)
        .single();

      if (data) {
        setFarmId(data.id);
      }
    } catch (error) {
      console.error("Error fetching farm ID:", error);
    }
  };

  const copyFarmId = () => {
    if (farmId) {
      navigator.clipboard.writeText(farmId);
      setCopied(true);
      toast.success("Farm ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          farm_location: profile.farm_location,
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-6 flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
        </div>

        <div className="space-y-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Your CropGuard ID</CardTitle>
              <CardDescription>Use this ID to login or for ESP32/IoT integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.unique_id && (
                <div>
                  <Label>User ID</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      value={profile.unique_id}
                      readOnly
                      className="bg-muted font-mono text-lg font-bold"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(profile.unique_id);
                        toast.success("User ID copied!");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Login with this ID or your email + password
                  </p>
                </div>
              )}
              
              {farmId && (
                <div>
                  <Label>Farm ID</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      value={farmId}
                      readOnly
                      className="bg-muted font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyFarmId}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    For ESP32 device configuration
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details and farm location</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farm_location">Farm Location</Label>
                <Input
                  id="farm_location"
                  value={profile.farm_location}
                  onChange={(e) => setProfile({ ...profile, farm_location: e.target.value })}
                  placeholder="Springfield, IL"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;