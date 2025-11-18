import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Shield, BarChart3, Camera } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">CropGuard</h1>
          </div>
          <Link to="/auth">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="mb-6 text-5xl font-bold text-foreground">
          Smart Crop Monitoring & Pest Detection
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
          Protect your crops with real-time IoT monitoring and AI-powered pest detection. 
          CropGuard helps farmers make data-driven decisions to maximize yield and minimize loss.
        </p>
        <Link to="/auth">
          <Button size="lg" className="h-14 px-8 text-lg">
            Start Monitoring Now
          </Button>
        </Link>
      </section>

      <section className="bg-secondary py-20">
        <div className="container mx-auto px-6">
          <h3 className="mb-12 text-center text-3xl font-bold text-foreground">
            Key Features
          </h3>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Leaf className="h-12 w-12 text-primary" />}
              title="IoT Sensor Monitoring"
              description="Track soil moisture, temperature, humidity, and light intensity in real-time"
            />
            <FeatureCard
              icon={<Camera className="h-12 w-12 text-primary" />}
              title="AI Pest Detection"
              description="Upload images for instant pest identification and infestation level analysis"
            />
            <FeatureCard
              icon={<BarChart3 className="h-12 w-12 text-primary" />}
              title="Data Visualization"
              description="Interactive charts and analytics to understand your farm's health trends"
            />
            <FeatureCard
              icon={<Shield className="h-12 w-12 text-primary" />}
              title="Smart Alerts"
              description="Receive notifications when conditions require immediate attention"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; 2025 CropGuard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <div className="rounded-lg border border-border bg-card p-6 text-center">
    <div className="mb-4 flex justify-center">{icon}</div>
    <h4 className="mb-2 text-xl font-semibold text-card-foreground">{title}</h4>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Landing;