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
          CropGuard: Complete Farm Intelligence
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
          Real-time soil monitoring and instant AI pest detection—all in one dashboard.
        </p>
        <Link to="/auth">
          <Button size="lg" className="h-14 px-8 text-lg">
            Get Started
          </Button>
        </Link>
      </section>

      <section className="bg-muted py-20">
        <div className="container mx-auto px-6 text-center">
          <h3 className="mb-6 text-3xl font-bold text-foreground">
            Why Farmers Lose Yield
          </h3>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Farmers face two invisible enemies: <strong>Environmental Stress</strong> (drought, poor soil) and <strong>Pest Infestations</strong> (like Fall Armyworm). Without real-time data, you are farming blind until it is too late.
          </p>
        </div>
      </section>

      <section className="bg-secondary py-20">
        <div className="container mx-auto px-6">
          <h3 className="mb-12 text-center text-3xl font-bold text-foreground">
            3 Steps to Total Protection
          </h3>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<BarChart3 className="h-12 w-12 text-primary" />}
              title="Monitor"
              description="Connect IoT sensors to track Soil Moisture, Temperature, and Humidity 24/7."
            />
            <FeatureCard
              icon={<Camera className="h-12 w-12 text-primary" />}
              title="Detect"
              description="Snap a photo for instant AI detection of Fall Armyworm."
            />
            <FeatureCard
              icon={<Shield className="h-12 w-12 text-primary" />}
              title="Act"
              description="Get immediate alerts for both drought risks and pest outbreaks."
            />
          </div>
        </div>
      </section>

      <section className="bg-muted py-20">
        <div className="container mx-auto px-6 text-center">
          <h3 className="mb-6 text-3xl font-bold text-foreground">
            Powered by Advanced Tech
          </h3>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Combining <strong>IoT Sensor Networks</strong> for environmental precision with a <strong>95% Accurate AI Model</strong> for pest identification. This is the future of smart farming.
          </p>
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