import React from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Phone, Mail, MapPinned } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jonathanImage from "@/assets/experts/jonathan-katungu.png";
import charityImage from "@/assets/experts/charity-irone.png";
import adeniyiImage from "@/assets/experts/adeniyi-alagbe.png";
import bashirImage from "@/assets/experts/bashir-isah.png";
import olanrewajuImage from "@/assets/experts/olanrewaju-abolade.png";
import ibrahimImage from "@/assets/experts/ibrahim-abubakar.png";

const experts = [
  {
    id: 1,
    name: "Jonathan Katungu",
    region: "Jos, Plateau State",
    address: "No. 2 Anguldi Express, Opp. Mafeng Plaza before the Fire Service.",
    phone: "+234 8032705731",
    email: "Jonathan.katungu@seedcogroup.com",
    mapLink: "http://maps.google.com/?q=9.7761533,8.85675",
    avatar: jonathanImage,
    initials: "JK"
  },
  {
    id: 2,
    name: "Charity Irone",
    region: "Kaduna State",
    address: "NN 16, Constitution Road, Opposite Stadium Second Gate.",
    phone: "+234 8039925236",
    email: "charity.irone@seedcogroup.com",
    mapLink: "http://maps.google.com/?q=10.502651,7.4296591",
    avatar: charityImage,
    initials: "CI"
  },
  {
    id: 3,
    name: "Adeniyi Alagbe",
    region: "Iseyin, Oyo State",
    address: "Alhaji Dare House, beside Ba-Nfati Cool Spot Barracks.",
    phone: "+234 8166864217",
    email: "niyi.alagbe@seedcogroup.com",
    mapLink: "http://maps.google.com/?q=7.9593653,3.6122989",
    avatar: adeniyiImage,
    initials: "AA"
  },
  {
    id: 4,
    name: "Bashir Isah",
    region: "Gombe state",
    address: "ASM Mai Manja Plaza, main market road, opposite Jaiz Bank.",
    phone: "+234 8034317223",
    email: "basir.isa@seedcogroup.com",
    mapLink: "http://maps.google.com/?q=10.2831267,11.18297",
    avatar: bashirImage,
    initials: "BI"
  },
  {
    id: 5,
    name: "Olanrewaju Abolade",
    region: "Oyo, Oyo State",
    address: "Adesakin House, Abiodun Atiba Road, Idi-Ope.",
    phone: "+234 7062295469",
    email: "olanrewaju.abolade@seedcogroup.com",
    mapLink: "http://maps.google.com/?q=7.84726,3.92907",
    avatar: olanrewajuImage,
    initials: "OA"
  },
  {
    id: 6,
    name: "Ibrahim Abubakar",
    region: "Jimeta -Yola, Adamawa State",
    address: "Shop 3 & 4 Yettore Plaza, Target Junction, Gimba Road.",
    phone: "+234 7085860346",
    email: "ibrahim.abubakar@seedcogroup.com",
    mapLink: "http://maps.google.com/?q=9.2718171,12.4532972",
    avatar: ibrahimImage,
    initials: "IA"
  }
];

const ExpertDirectory = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleContactExpert = async (expertName: string) => {
    if (!user) return;

    // Get farm ID
    const { data: farmData } = await supabase
      .from('farms')
      .select('id')
      .eq('farmer_id', user.id)
      .single();

    if (!farmData) return;

    // Record the contact
    const { error } = await supabase
      .from('agronomist_contacts')
      .insert({
        user_id: user.id,
        farm_id: farmData.id
      });

    if (error) {
      console.error('Error recording contact:', error);
    } else {
      toast({
        title: "Contact Recorded",
        description: `Your consultation with ${expertName} has been recorded.`,
      });
    }
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
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{expert.region}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPinned className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground text-xs">{expert.address}</span>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2">
                <div className="flex gap-2 w-full">
                  <Button 
                    className="flex-1"
                    variant="outline"
                    onClick={() => {
                      handleContactExpert(expert.name);
                      window.open(`tel:${expert.phone}`);
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button 
                    className="flex-1"
                    variant="outline"
                    onClick={() => {
                      handleContactExpert(expert.name);
                      window.open(`mailto:${expert.email}`);
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => {
                    handleContactExpert(expert.name);
                    window.open(expert.mapLink, '_blank');
                  }}
                >
                  <MapPinned className="h-4 w-4 mr-2" />
                  View Address
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
