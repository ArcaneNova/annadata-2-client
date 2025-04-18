
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { BellRing, MapPin, Star, ShoppingCart, Clock, Check, Bell } from "lucide-react";

// Mock vendors data
const mockVendors = [
  {
    id: "1",
    name: "Rajesh Fresh Produce",
    description: "Fresh vegetables and fruits directly from farms",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop",
    rating: 4.8,
    distance: 1.2,
    location: "Sector 15, Chandigarh",
    products: ["Vegetables", "Fruits", "Dairy"],
  },
  {
    id: "2",
    name: "Singh Organic Store",
    description: "Certified organic products from local farmers",
    image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=2070&auto=format&fit=crop",
    rating: 4.6,
    distance: 2.5,
    location: "Model Town, Panchkula",
    products: ["Rice", "Pulses", "Spices"],
  },
  {
    id: "3",
    name: "Gupta General Store",
    description: "Wide variety of farm products at reasonable prices",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?q=80&w=2069&auto=format&fit=crop",
    rating: 4.3,
    distance: 3.8,
    location: "Phase 3, Mohali",
    products: ["Rice", "Wheat", "Oil", "Spices"],
  },
];

// Mock nudges
const mockNudges = [
  {
    id: "1",
    vendorId: "1",
    message: "Rajesh Fresh Produce has fresh tomatoes at 20% off today!",
    time: "10 minutes ago",
    isNew: true,
  },
  {
    id: "2",
    vendorId: "2",
    message: "Singh Organic Store: New organic rice batch just arrived!",
    time: "2 hours ago",
    isNew: false,
  },
];

const NearbyVendors = () => {
  const [vendors, setVendors] = useState(mockVendors);
  const [nudges, setNudges] = useState(mockNudges);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [searchRadius, setSearchRadius] = useState("5");
  const [unreadNudges, setUnreadNudges] = useState(1);

  useEffect(() => {
    // In a real app, you would:
    // 1. Get user's location
    // 2. Fetch nearby vendors from an API
    // 3. Listen for real-time nudges (using websockets, etc.)
    
    // For demo, we'll simulate a new nudge after 5 seconds
    const timer = setTimeout(() => {
      const newNudge = {
        id: "3",
        vendorId: "3",
        message: "Gupta General Store: Limited stock of premium basmati rice available!",
        time: "Just now",
        isNew: true,
      };
      
      setNudges(prev => [newNudge, ...prev]);
      setUnreadNudges(prev => prev + 1);
      
      toast({
        title: "New Vendor Nudge",
        description: newNudge.message,
      });
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  const markNudgeAsRead = (nudgeId: string) => {
    setNudges(prev => prev.map(nudge => 
      nudge.id === nudgeId ? { ...nudge, isNew: false } : nudge
    ));
    setUnreadNudges(prev => Math.max(0, prev - 1));
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchRadius(e.target.value);
    
    // In a real app, this would trigger a new API call to fetch vendors within the new radius
    toast({
      title: "Search Radius Updated",
      description: `Now showing vendors within ${e.target.value} km.`,
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Nearby Vendors</h1>
        <p className="text-muted-foreground">
          Find local vendors and receive product notifications
        </p>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#138808]" />
              Location Preferences
            </CardTitle>
            <CardDescription>
              Adjust search radius and location settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="radius">Search Radius (km)</Label>
                <span className="text-sm font-medium">{searchRadius} km</span>
              </div>
              <Input
                id="radius"
                type="range"
                min="1"
                max="20"
                step="1"
                value={searchRadius}
                onChange={handleRadiusChange}
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="notifications" className="flex-1">
                Enable vendor nudges and notifications
              </Label>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-[#FF9933]" />
              Vendor Nudges
              {unreadNudges > 0 && (
                <Badge className="ml-2">{unreadNudges} new</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Recent updates from vendors in your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[200px] overflow-auto">
              {nudges.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No recent notifications
                </div>
              ) : (
                nudges.map((nudge) => (
                  <div 
                    key={nudge.id}
                    className={`flex gap-4 p-3 rounded-lg ${
                      nudge.isNew ? "bg-blue-50" : "bg-gray-50"
                    }`}
                    onClick={() => markNudgeAsRead(nudge.id)}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <Bell className={`h-5 w-5 ${
                        nudge.isNew ? "text-blue-500" : "text-gray-400"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${nudge.isNew ? "font-medium" : ""}`}>
                        {nudge.message}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {nudge.time}
                      </p>
                    </div>
                    {nudge.isNew && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          markNudgeAsRead(nudge.id);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Vendors Within {searchRadius} km
        </h2>
        <p className="text-muted-foreground">
          {vendors.length} vendors found in your area
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vendors.map((vendor) => (
          <Card key={vendor.id} className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={vendor.image}
                alt={vendor.name}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{vendor.name}</CardTitle>
                <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs text-yellow-700">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  {vendor.rating}
                </div>
              </div>
              <CardDescription>{vendor.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{vendor.location} • {vendor.distance} km away</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {vendor.products.map((product, index) => (
                  <Badge key={index} variant="outline" className="bg-gray-50">
                    {product}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  toast({
                    title: "Location Shared",
                    description: `Your location has been shared with ${vendor.name}.`,
                  });
                }}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Directions
              </Button>
              <Button
                className="flex-1 bg-[#138808] hover:bg-[#138808]/90"
                onClick={() => {
                  toast({
                    title: "Order Placed",
                    description: `Your order has been placed with ${vendor.name}.`,
                  });
                }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Place Order
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NearbyVendors;
