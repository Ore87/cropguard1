import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import heroBackground from "@/assets/hero-farm-background.jpg";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { 
  Leaf, 
  Shield, 
  BarChart3, 
  Camera, 
  CloudSun, 
  TrendingUp, 
  Lightbulb,
  Bell,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Activity,
  Users,
  Target,
  Zap,
  Eye,
  Brain
} from "lucide-react";

const Landing = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">CropGuard</h1>
          </div>
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              <Zap className="h-4 w-4" />
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative overflow-hidden py-24" 
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Semi-transparent white overlay for readability */}
        <div className="absolute inset-0 bg-white/80 z-0"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-6">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Farm Intelligence</span>
          </div>
          <h2 className="mb-6 text-5xl md:text-6xl font-bold text-foreground">
            Complete Farm Intelligence<br />
            <span className="text-primary">In Real-Time</span>
          </h2>
          <p className="mx-auto mb-10 max-w-3xl text-xl text-muted-foreground">
            Secure your harvest by monitoring real-time environmental conditions, detecting pests instantly with AI, tracking market trends, and receiving intelligent recommendations, all unified in a single powerful dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button size="lg" className="h-14 px-8 text-lg gap-2">
                <Target className="h-5 w-5" />
                Start Protecting Your Crops
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-8 text-lg gap-2"
              onClick={() => setIsVideoOpen(true)}
            >
              <Eye className="h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The Hidden Threats to Your Harvest
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Modern farming faces unprecedented challenges. Without real-time intelligence, 
              you're making critical decisions blind.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <Droplets className="h-10 w-10 text-destructive mb-2" />
                <CardTitle>Environmental Stress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Drought, poor soil conditions, and temperature extremes can devastate crops before visible symptoms appear.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-destructive mb-2" />
                <CardTitle>Pest Infestations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fall Armyworm and other pests spread rapidly. Early detection is the difference between minor damage and total crop loss.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-destructive mb-2" />
                <CardTitle>Market Uncertainty</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Price volatility and lack of market visibility make it impossible to plan harvests and maximize profits.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Modules */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Complete Protection System
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Every tool you need to monitor, analyze, and optimize your farm operations in one integrated platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-primary" />}
              title="Unified Dashboard"
              description="See everything at a glance: sensor data, pest alerts, weather forecasts, and market trends all in one intelligent hub."
            />
            <FeatureCard
              icon={<Camera className="h-8 w-8 text-primary" />}
              title="AI Pest Detection"
              description="Instant visual analysis of crop images. Our AI identifies Fall Armyworm and other pests with 95%+ accuracy, providing confidence scores and annotated results."
            />
            <FeatureCard
              icon={<Thermometer className="h-8 w-8 text-primary" />}
              title="IoT Sensor Monitoring"
              description="Real-time tracking of soil moisture, temperature, humidity, and light intensity. Know your farm's exact environmental conditions 24/7."
            />
            <FeatureCard
              icon={<CloudSun className="h-8 w-8 text-primary" />}
              title="Weather Intelligence"
              description="7-day weather forecasts integrated directly into your dashboard. Plan irrigation, spraying, and harvesting with confidence using live API data."
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8 text-primary" />}
              title="Market Trends"
              description="Track crop prices in real-time with simulated market data and community-sourced pricing. Make informed decisions about when to sell."
            />
            <FeatureCard
              icon={<Lightbulb className="h-8 w-8 text-primary" />}
              title="Farm Advisor Engine"
              description="Intelligent recommendations synthesized from pest detections, weather patterns, and sensor data. Get actionable advice automatically."
            />
            <FeatureCard
              icon={<Bell className="h-8 w-8 text-primary" />}
              title="Proactive Alerts"
              description="Automatic notifications for critical events: pest outbreaks, adverse weather conditions, and sensor threshold breaches."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-primary" />}
              title="Expert Network"
              description="Connect with agricultural specialists and agronomists. Share reports and get professional guidance when you need it."
            />
            <FeatureCard
              icon={<Activity className="h-8 w-8 text-primary" />}
              title="Analysis History"
              description="Complete record of all scans, detections, and reports. Track pest patterns and environmental trends over time."
            />
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How CropGuard Works
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Three simple steps to total farm intelligence
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                1
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Monitor Continuously
              </h4>
              <p className="text-muted-foreground">
                Connect IoT sensors and access live weather data. CropGuard tracks your farm's conditions in real-time, 24/7.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                2
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Detect Threats Instantly
              </h4>
              <p className="text-muted-foreground">
                Capture images or videos for instant AI analysis. Get pest identification with visual annotations and confidence scores within seconds.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                3
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Act With Confidence
              </h4>
              <p className="text-muted-foreground">
                Receive intelligent recommendations and urgent alerts. Make data-driven decisions to protect your crops and maximize yield.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Powered by Advanced Technology
              </h3>
              <p className="text-lg text-muted-foreground">
                Enterprise-grade infrastructure delivering farm intelligence at scale
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <Brain className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Deep Learning AI</CardTitle>
                  <CardDescription>
                    95%+ accurate pest detection powered by state-of-the-art computer vision models trained on thousands of agricultural images.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Activity className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>IoT Integration</CardTitle>
                  <CardDescription>
                    Seamless connectivity with modern sensor networks. Real-time environmental data synchronized to your dashboard.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Wind className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Live Weather APIs</CardTitle>
                  <CardDescription>
                    Professional-grade weather forecasting integrated from trusted meteorological sources for accurate planning.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Secure Cloud Platform</CardTitle>
                  <CardDescription>
                    Enterprise-level security and reliability. Your farm data is protected with bank-grade encryption and authentication.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Start Protecting Your Crops Today
          </h3>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join the future of precision agriculture. Real-time monitoring, AI detection, 
            and intelligent recommendations—all in one platform.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg gap-2">
              <Target className="h-5 w-5" />
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-card">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">CropGuard</span>
              <span className="text-sm text-muted-foreground">Smart Agricultural Intelligence</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2025 CropGuard. Protecting harvests with intelligent technology.
            </p>
          </div>
        </div>
      </footer>

      {/* Video Demo Modal */}
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogContent className="max-w-4xl p-0">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src="https://www.youtube.com/embed/KAD1Di2HJHk?autoplay=1"
              title="CropGuard Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: {
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <Card className="border-border hover:border-primary/50 transition-colors">
    <CardHeader>
      <div className="mb-3">{icon}</div>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default Landing;
