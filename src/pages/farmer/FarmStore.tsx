import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Phone, MapPin } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  category: "seeds" | "fertilizers" | "tools";
  seller: string;
  sellerPhone: string;
  sellerLocation: string;
  image: string;
}

const products: Product[] = [
  {
    id: "1",
    name: "Premier Maize Seeds - Oba Super",
    price: 12000,
    category: "seeds",
    seller: "Ogbomoso Agro Dealers Ltd",
    sellerPhone: "+2348012345678",
    sellerLocation: "8.1340,4.2560", // Ogbomoso coordinates
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "2",
    name: "NPK 15:15:15 Fertilizer - 50kg",
    price: 45000,
    category: "fertilizers",
    seller: "Mama Bose Farm Supplies",
    sellerPhone: "+2348123456789",
    sellerLocation: "8.1340,4.2560",
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "3",
    name: "Knapsack Sprayer - 16L",
    price: 18500,
    category: "tools",
    seller: "Ibrahim Farm Tools & Equipment",
    sellerPhone: "+2348098765432",
    sellerLocation: "8.1340,4.2560",
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "4",
    name: "Hybrid Rice Seeds - FARO 44",
    price: 15500,
    category: "seeds",
    seller: "Kano Agricultural Center",
    sellerPhone: "+2347012345678",
    sellerLocation: "12.0022,8.5919", // Kano coordinates
    image: "https://images.unsplash.com/photo-1536304929831-99796327d485?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "5",
    name: "Glyphosate Herbicide - 5L",
    price: 32000,
    category: "fertilizers",
    seller: "Agro-Allied Solutions Ibadan",
    sellerPhone: "+2348156789012",
    sellerLocation: "7.3775,3.9470", // Ibadan coordinates
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop",
  },
  {
    id: "6",
    name: "Manual Hand Tiller",
    price: 25000,
    category: "tools",
    seller: "Abeokuta Equipment Store",
    sellerPhone: "+2348187654321",
    sellerLocation: "7.1475,3.3619", // Abeokuta coordinates
    image: "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "7",
    name: "Improved Cassava Stems - TME 419",
    price: 8000,
    category: "seeds",
    seller: "Ondo State Agro Ventures",
    sellerPhone: "+2347098765432",
    sellerLocation: "7.2502,5.1950", // Akure coordinates
    image: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "8",
    name: "Organic Poultry Manure - 50kg",
    price: 12500,
    category: "fertilizers",
    seller: "Oyo Farm Inputs Hub",
    sellerPhone: "+2348023456789",
    sellerLocation: "8.1340,4.2560",
    image: "https://images.unsplash.com/photo-1625246287940-1b6dd9c09e66?w=400&h=300&fit=crop",
  },
  {
    id: "9",
    name: "Water Pump - 1HP Petrol",
    price: 85000,
    category: "tools",
    seller: "Kaduna Irrigation Supplies",
    sellerPhone: "+2348134567890",
    sellerLocation: "10.5225,7.4388", // Kaduna coordinates
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=300&fit=crop",
  },
  {
    id: "10",
    name: "Tomato Seeds - UC 82B Hybrid",
    price: 6500,
    category: "seeds",
    seller: "Jos Plateau Seedlings Co.",
    sellerPhone: "+2347087654321",
    sellerLocation: "9.8965,8.8583", // Jos coordinates
    image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=300&fit=crop",
  },
  {
    id: "11",
    name: "Urea Fertilizer - 50kg",
    price: 38000,
    category: "fertilizers",
    seller: "Benue Agro-Chemical Stores",
    sellerPhone: "+2348145678901",
    sellerLocation: "7.7338,8.5380", // Makurdi coordinates
    image: "https://images.unsplash.com/photo-1625246287823-02fc8e18390f?w=400&h=300&fit=crop",
  },
  {
    id: "12",
    name: "Wheelbarrow - Heavy Duty",
    price: 22000,
    category: "tools",
    seller: "Enugu Farm Equipment Ltd",
    sellerPhone: "+2348098761234",
    sellerLocation: "6.4403,7.4960", // Enugu coordinates
    image: "https://images.unsplash.com/photo-1513828947302-d5d5203df0be?w=400&h=300&fit=crop",
  },
  {
    id: "13",
    name: "Sorghum Seeds - ICSV 400",
    price: 9500,
    category: "seeds",
    seller: "Sokoto Grains Cooperative",
    sellerPhone: "+2347076543210",
    sellerLocation: "13.0622,5.2339", // Sokoto coordinates
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop&q=80",
  },
  {
    id: "14",
    name: "Lambda-Cyhalothrin Insecticide",
    price: 28000,
    category: "fertilizers",
    seller: "Delta Crop Protection Center",
    sellerPhone: "+2348156781234",
    sellerLocation: "5.5166,5.7500", // Warri coordinates
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop",
  },
  {
    id: "15",
    name: "Machete with Sheath",
    price: 4500,
    category: "tools",
    seller: "Mama Bose Farm Tools",
    sellerPhone: "+2348123456789",
    sellerLocation: "8.1340,4.2560",
    image: "https://images.unsplash.com/photo-1595521624992-48a59aff8950?w=400&h=300&fit=crop&q=80",
  },
];

const FarmStore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCallSeller = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleGetDirections = (location: string, sellerName: string) => {
    const [lat, lng] = location.split(",");
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Local Farm Supplies Directory</h1>
          <p className="text-muted-foreground">
            Discover essential agricultural inputs available in your local area
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Button>
            <Button
              variant={selectedCategory === "seeds" ? "default" : "outline"}
              onClick={() => setSelectedCategory("seeds")}
            >
              Seeds
            </Button>
            <Button
              variant={selectedCategory === "fertilizers" ? "default" : "outline"}
              onClick={() => setSelectedCategory("fertilizers")}
            >
              Fertilizers/Pesticides
            </Button>
            <Button
              variant={selectedCategory === "tools" ? "default" : "outline"}
              onClick={() => setSelectedCategory("tools")}
            >
              Tools & Equipment
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No products found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <Badge variant="secondary" className="mb-2 capitalize">
                      {product.category}
                    </Badge>
                    <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">
                      ₦{product.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium">Sold by:</p>
                    <p>{product.seller}</p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleCallSeller(product.sellerPhone)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Seller
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleGetDirections(product.sellerLocation, product.seller)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FarmStore;
