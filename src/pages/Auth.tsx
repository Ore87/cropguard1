import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Leaf, Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");
  const [signupRole, setSignupRole] = useState<"farmer" | "agronomist">("farmer");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [signupMethod, setSignupMethod] = useState<"email" | "phone">("email");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupOtp, setSignupOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [signupOtpSent, setSignupOtpSent] = useState(false);

  useEffect(() => {
    if (user && userRole) {
      if (userRole === "agronomist") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, userRole, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (loginMethod === "email") {
        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        });
        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        if (!otpSent) {
          const { error } = await supabase.auth.signInWithOtp({
            phone: loginPhone,
          });
          if (error) throw error;
          setOtpSent(true);
          toast.success("OTP sent to your phone!");
        } else {
          const { error } = await supabase.auth.verifyOtp({
            phone: loginPhone,
            token: loginOtp,
            type: 'sms',
          });
          if (error) throw error;
          toast.success("Welcome back!");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupMethod === "email") {
      if (signupPassword !== signupConfirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      if (signupPassword.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
    }

    setLoading(true);

    try {
      if (signupMethod === "email") {
        const { error } = await supabase.auth.signUp({
          email: signupEmail,
          password: signupPassword,
          options: {
            data: {
              full_name: signupFullName,
              role: signupRole,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        toast.success("Account created successfully! Please check your email to verify your account.");
      } else {
        if (!signupOtpSent) {
          const { error } = await supabase.auth.signInWithOtp({
            phone: signupPhone,
            options: {
              data: {
                full_name: signupFullName,
                role: signupRole,
              },
            },
          });
          if (error) throw error;
          setSignupOtpSent(true);
          toast.success("OTP sent to your phone!");
        } else {
          const { error } = await supabase.auth.verifyOtp({
            phone: signupPhone,
            token: signupOtp,
            type: 'sms',
          });
          if (error) throw error;
          toast.success("Account created successfully!");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Leaf className="h-12 w-12" style={{ color: '#00B050' }} />
          </div>
          <CardTitle className="text-3xl">CropGuard</CardTitle>
          <CardDescription>Sign in or create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-3">
                  <Label>Login Method</Label>
                  <RadioGroup value={loginMethod} onValueChange={(value: "email" | "phone") => {
                    setLoginMethod(value);
                    setOtpSent(false);
                  }}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="login-email-method" />
                      <Label htmlFor="login-email-method" className="font-normal cursor-pointer">Email & Password</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="phone" id="login-phone-method" />
                      <Label htmlFor="login-phone-method" className="font-normal cursor-pointer">Phone Number</Label>
                    </div>
                  </RadioGroup>
                </div>

                {loginMethod === "email" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="farmer@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                        >
                          {showLoginPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="login-phone">Phone Number</Label>
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        required
                        disabled={otpSent}
                      />
                      <p className="text-xs text-muted-foreground">Include country code (e.g., +234)</p>
                    </div>
                    {otpSent && (
                      <div className="space-y-2">
                        <Label htmlFor="login-otp">Verification Code</Label>
                        <Input
                          id="login-otp"
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={loginOtp}
                          onChange={(e) => setLoginOtp(e.target.value)}
                          required
                          maxLength={6}
                        />
                      </div>
                    )}
                  </>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Processing..." : otpSent ? "Verify Code" : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-3">
                  <Label>Signup Method</Label>
                  <RadioGroup value={signupMethod} onValueChange={(value: "email" | "phone") => {
                    setSignupMethod(value);
                    setSignupOtpSent(false);
                  }}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="signup-email-method" />
                      <Label htmlFor="signup-email-method" className="font-normal cursor-pointer">Email & Password</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="phone" id="signup-phone-method" />
                      <Label htmlFor="signup-phone-method" className="font-normal cursor-pointer">Phone Number</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    required
                  />
                </div>

                {signupMethod === "email" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="farmer@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showSignupPassword ? "text" : "password"}
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                          minLength={6}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                        >
                          {showSignupPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-confirm-password"
                          type={showSignupConfirmPassword ? "text" : "password"}
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          required
                          minLength={6}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                        >
                          {showSignupConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone Number</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        required
                        disabled={signupOtpSent}
                      />
                      <p className="text-xs text-muted-foreground">Include country code (e.g., +234)</p>
                    </div>
                    {signupOtpSent && (
                      <div className="space-y-2">
                        <Label htmlFor="signup-otp">Verification Code</Label>
                        <Input
                          id="signup-otp"
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={signupOtp}
                          onChange={(e) => setSignupOtp(e.target.value)}
                          required
                          maxLength={6}
                        />
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signup-role">Role</Label>
                  <Select value={signupRole} onValueChange={(value: "farmer" | "agronomist") => setSignupRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farmer">Farmer</SelectItem>
                      <SelectItem value="agronomist">Agronomist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Processing..." : signupOtpSent ? "Verify Code" : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;