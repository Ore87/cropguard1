import { Layout } from "@/components/Layout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Briefcase } from "lucide-react";
import { toast } from "sonner";

const experts = [
  {
    id: 1,
    name: "Dr. Zainab Al-Fayed",
    title: "Plant Pathologist (Cassava Expert)",
    location: "Ibadan, Oyo State",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    initials: "ZA"
  },
  {
    id: 2,
    name: "Mr. Tunde Bakare",
    title: "Soil Health Agronomist",
    location: "Abeokuta, Ogun State",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    initials: "TB"
  },
  {
    id: 3,
    name: "Dr. Amina Hassan",
    title: "Integrated Pest Management Specialist",
    location: "Kaduna, Kaduna State",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    initials: "AH"
  },
  {
    id: 4,
    name: "Prof. Chukwuma Okonkwo",
    title: "Crop Yield Optimization Expert",
    location: "Enugu, Enugu State",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    initials: "CO"
  },
  {
    id: 5,
    name: "Mrs. Folake Adeyemi",
    title: "Sustainable Farming Consultant",
    location: "Lagos, Lagos State",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    initials: "FA"
  },
  {
    id: 6,
    name: "Dr. Ibrahim Musa",
    title: "Rice Production Specialist",
    location: "Kano, Kano State",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    initials: "IM"
  }
];

const ExpertDirectory = () => {
  const handleContact = (expertName: string) => {
    toast.success(`Contact request sent to ${expertName}. They will reply shortly.`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Connect with Agricultural Experts</h1>
          <p className="text-muted-foreground">Browse verified experts and get professional agricultural advice</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map((expert) => (
            <Card key={expert.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={expert.avatar} alt={expert.name} />
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {expert.initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{expert.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 space-y-3">
                <div className="flex items-start gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{expert.title}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">{expert.location}</span>
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => handleContact(expert.name)}
                >
                  Contact Expert
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ExpertDirectory;
