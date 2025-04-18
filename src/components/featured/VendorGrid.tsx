import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useConsumerCart } from "@/hooks/use-consumer-cart";
import { useAuth } from "@/hooks/use-auth";
import { Store, MapPin, ShoppingBag, Map as MapIcon, List, AlertCircle, Star, X, ShoppingCart, RefreshCw, Package, AlertTriangle, Loader2 } from "lucide-react";
import type { Product } from "@/types/product";
import VendorMap from "../maps/VendorMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { socketService } from '@/services/socket.service';
import { ProductDialog } from "@/components/featured/ProductDialog";
import NearbyVendorsMap from "../vendor/NearbyVendorsMap";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import NearbyVendorNotification from "../vendor/NearbyVendorNotification";

// Define dummy vendors with proper typing
const DUMMY_VENDORS: Vendor[] = [
  {
    _id: "dummy-vendor-1",
    name: "Yashashvi",
    businessName: "Yashashvi Fresh Produce",
    businessType: "Grocery",
    businessLocation: {
      type: "Point",
      coordinates: [76.660000, 30.518000] as [number, number],
      address: "Sector 14, Chandigarh"
    },
    businessImage: "/placeholder.jpg",
    distance: 350, // meters
    averageRating: 4.7,
    totalRatings: 42
  },
  {
    _id: "dummy-vendor-2",
    name: "Badal",
    businessName: "Badal Vegetable Cart",
    businessType: "Vegetable Vendor",
    businessLocation: {
      type: "Point",
      coordinates: [76.657900, 30.515800] as [number, number],
      address: "Sector 15, Chandigarh"
    },
    businessImage: "/placeholder.jpg",
    distance: 480, // meters
    averageRating: 4.5,
    totalRatings: 38
  },
  {
    _id: "dummy-vendor-3",
    name: "Swetank",
    businessName: "Swetank Organic Fruits",
    businessType: "Fruit Vendor",
    businessLocation: {
      type: "Point",
      coordinates: [76.658500, 30.517200] as [number, number],
      address: "Sector 16, Chandigarh"
    },
    businessImage: "/placeholder.jpg",
    distance: 420, // meters
    averageRating: 4.8,
    totalRatings: 56
  },
  {
    _id: "dummy-vendor-4",
    name: "Ravi Kumar",
    businessName: "Ravi's Fresh Farm",
    businessType: "Farm Products",
    businessLocation: {
      type: "Point",
      coordinates: [76.661000, 30.516000] as [number, number],
      address: "Sector 17, Chandigarh"
    },
    businessImage: "/placeholder.jpg",
    distance: 550, // meters
    averageRating: 4.3,
    totalRatings: 29
  },
  {
    _id: "dummy-vendor-5",
    name: "Priya Singh",
    businessName: "Priya's Organic Store",
    businessType: "Organic Products",
    businessLocation: {
      type: "Point",
      coordinates: [76.659500, 30.514900] as [number, number],
      address: "Sector 18, Chandigarh"
    },
    businessImage: "/placeholder.jpg",
    distance: 620, // meters
    averageRating: 4.6,
    totalRatings: 47
  }
];

interface VendorGridProps {
  onVendorSelect?: (vendor: Vendor) => void;
}

interface VendorProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  images: Array<{ url: string; public_id: string }>;
  averageRating: number;
  totalRatings: number;
  seller: string;
}

interface Vendor {
  _id: string;
  name: string;
  businessName?: string;
  businessType?: string;
  businessLocation?: {
    type: string;
    coordinates: [number, number];
    address?: string;
  };
  businessImage?: string;
  distance?: number;
  averageRating?: number;
  totalRatings?: number;
  products?: any[];
}

const VendorGrid = ({ onVendorSelect }: VendorGridProps) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; radius?: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState(5000); // 5km default
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { addToCart } = useConsumerCart();
  const { isAuthenticated, isConsumer } = useAuth();
  const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([]);
  const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [nearbyVendor, setNearbyVendor] = useState<Vendor | null>(null);

  // Add useEffect to show notification after a delay
  useEffect(() => {
    if (vendors.length > 0 && !showNotification) {
      // Find nearby vendors (within 500m)
      const nearbyVendors = vendors.filter(v => (v.distance || 0) <= 500);
      
      if (nearbyVendors.length > 0) {
        // Set the closest vendor for notification
        setNearbyVendor(nearbyVendors[0]);
        
        // Show notification after 3 seconds
        const timer = setTimeout(() => {
          setShowNotification(true);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [vendors, showNotification]);

  // Memoize the vendor update handler
  const handleVendorUpdate = useCallback((updatedVendors: Vendor[]) => {
    console.log('Handling vendor update with vendors:', updatedVendors);
    if (updatedVendors && Array.isArray(updatedVendors)) {
      // Log each vendor to help debug
      updatedVendors.forEach((vendor, index) => {
        console.log(`Vendor ${index + 1}:`, vendor._id, vendor.name, vendor.businessName);
        // Log location details to verify coordinates
        if (vendor.businessLocation) {
          console.log(`Vendor ${index + 1} location:`, 
            vendor.businessLocation.coordinates, 
            vendor.businessLocation.address);
        } else {
          console.log(`Vendor ${index + 1} has no location data`);
        }
      });
      
      // Combine real vendors with dummy vendors
      const allVendors = [...updatedVendors, ...DUMMY_VENDORS];
      
      // Sort vendors by distance
      const sortedVendors = [...allVendors].sort((a, b) => 
        (a.distance || 0) - (b.distance || 0)
      );
      
      console.log(`Setting state with ${sortedVendors.length} sorted vendors`);
      setVendors(sortedVendors);
      setLoading(false);
      setError(null);
    } else {
      console.error('Invalid vendor data received:', updatedVendors);
      
      // If no real vendors, just use dummy vendors
      const sortedDummyVendors = [...DUMMY_VENDORS].sort((a, b) => 
        (a.distance || 0) - (b.distance || 0)
      );
      
      setVendors(sortedDummyVendors);
      setLoading(false);
      setError(null);
    }
  }, []);

  // Add a useEffect to monitor vendors state changes
  useEffect(() => {
    console.log(`Vendors state updated: ${vendors.length} vendors`);
    vendors.forEach((vendor, index) => {
      console.log(`Vendor in state ${index + 1}:`, vendor._id, vendor.name);
    });
  }, [vendors]);

  const getLocation = async (options = {}): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
        timeout: 30000, // 30 seconds
        maximumAge: 0,
        ...options
          });
        });
  };

  const initializeLocation = async (): Promise<number | undefined> => {
    try {
      setLoading(true);
      setError(null);

      // Try to get location with high accuracy first
      try {
        const position = await getLocation({ enableHighAccuracy: true });
        return handlePositionSuccess(position);
      } catch (error) {
        console.log('High accuracy location failed, trying with low accuracy...');
        // If high accuracy fails, try with low accuracy
        const position = await getLocation({ enableHighAccuracy: false });
        return handlePositionSuccess(position);
      }
    } catch (err) {
      console.error('Error initializing:', err);
      handleLocationError(err);
    }
  };

  const handlePositionSuccess = (position: GeolocationPosition) => {
        const coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          radius: searchRadius
        };

    console.log('Got user location:', coordinates);
        setUserLocation(coordinates);
    setLoading(false);
    setError(null);

    // Only attempt socket operations if authenticated
    const auth = useAuth.getState();
    if (auth.token) {
      console.log('User is authenticated, role:', auth.user?.role);
      
      socketService.initialize().then(socket => {
        if (socket?.connected) {
          console.log('Socket connected, requesting nearby vendors');
          // Always request nearby vendors
        socketService.requestNearbyVendors(coordinates);
        
          // Only update consumer location if user is a consumer
          if (auth.user?.role === 'consumer') {
            console.log('User is a consumer, updating consumer location');
          socketService.updateConsumerLocation(coordinates);
          } else {
            console.log('User is not a consumer, skipping consumer location update');
          }
        } else {
          console.log('Socket not connected, skipping location updates');
        }
      });
    } else {
      console.log('User is not authenticated, skipping socket operations');
    }

    // Start watching location changes
        const watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const newCoords = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              radius: searchRadius
            };
            
            setUserLocation(newCoords);
        
        // Only attempt socket operations if authenticated
        const auth = useAuth.getState();
        if (auth.token) {
          socketService.initialize().then(socket => {
            if (socket) {
            socketService.requestNearbyVendors(newCoords);
              socketService.updateConsumerLocation(newCoords);
            }
          });
            }
          },
          (err) => {
        console.error('Location watch error:', err);
        handleLocationError(err);
          },
          {
            enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return watchId;
  };

  const handleLocationError = (error: any) => {
    let errorMessage = 'An error occurred while getting your location';
    
    if (error instanceof GeolocationPositionError) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Please enable location services to find nearby vendors';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable';
          break;
        case error.TIMEOUT:
          errorMessage = 'Getting location timed out. Please try again';
          break;
      }
    }

    setError(errorMessage);
    setLoading(false);

    // Show toast with retry option if it's a timeout
    if (error instanceof GeolocationPositionError && error.code === error.TIMEOUT) {
      toast({
        title: "Location Error",
        description: (
          <div className="flex flex-col gap-2">
            <span>{errorMessage}</span>
            <Button 
              variant="outline" 
              onClick={() => {
                setRetryCount(prev => prev + 1);
                initializeLocation();
              }}
            >
              Retry
            </Button>
          </div>
        ),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    console.log('Initializing VendorGrid...');
    const auth = useAuth.getState();
    console.log('Authentication status:', auth.token ? 'true' : 'false');
    console.log('User role:', auth.user?.role);
    
    let mounted = true;
    let cleanup: (() => void) | null = null;
    let watchId: number | null = null;

    const initialize = async () => {
      if (auth.token) {
        console.log('User is authenticated, initializing socket');
        try {
          const socket = await socketService.initialize();
          if (socket?.connected) {
            console.log('Socket initialized and connected successfully');
            
            // Register for vendor updates
            cleanup = socketService.onNearbyVendorsUpdate((updatedVendors) => {
              console.log('Received vendors update callback with data:', updatedVendors);
              if (mounted) {
                handleVendorUpdate(updatedVendors);
              }
            });
            
            // Start location tracking
            watchId = await initializeLocation();
          } else {
            console.error('Socket failed to connect');
            setError('Failed to connect to location service. Please try again.');
            setLoading(false);
          }
        } catch (error) {
          console.error('Socket initialization error:', error);
          setError('Error connecting to location service');
          setLoading(false);
        }
      } else {
        console.log('User is not authenticated, skipping socket initialization');
        // Still try to get location for unauthenticated users
        watchId = await initializeLocation();
      }
    };

    initialize();

    return () => {
      console.log('Cleaning up VendorGrid...');
      mounted = false;
      if (cleanup) {
        cleanup();
      }
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      // Only disconnect if authenticated
      if (auth.token) {
        socketService.disconnect();
      }
    };
  }, [searchRadius, handleVendorUpdate, retryCount]);

  const handleVendorSelect = async (vendor: Vendor) => {
    console.log('Selected vendor:', vendor);
    setSelectedVendor(vendor);
    
    try {
      setVendorProducts([]);
      const response = await api.get(`/products/vendor/${vendor._id}`);
      console.log('Vendor products:', response.data);
      setVendorProducts(response.data);
      setIsProductsDialogOpen(true);
      
    if (onVendorSelect) {
      onVendorSelect(vendor);
    }
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      toast({
        title: "Error",
        description: "Failed to load vendor products. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = (product: VendorProduct) => {
    try {
      addToCart(product as unknown as Product, 1);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive",
      });
    }
  };

  const renderVendorCard = (vendor: Vendor) => {
    // Check if vendor is valid
    if (!vendor || !vendor._id) {
      console.error("Invalid vendor object:", vendor);
      return null;
    }

    console.log("Rendering vendor card for:", vendor._id, vendor.name, vendor.businessName);
    
    // Determine which default image to use based on vendor ID
    let defaultImage = '/placeholder.jpg';
    
    return (
      <Card key={vendor._id} className="overflow-hidden">
        <div className="aspect-square relative">
          <img
            src={vendor.businessImage || defaultImage}
            alt={vendor.businessName || vendor.name}
            className="object-cover w-full h-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = defaultImage;
            }}
          />
        </div>
        <CardHeader>
          <CardTitle>{vendor.businessName || vendor.name}</CardTitle>
          <CardDescription>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{vendor.distance ? `${(vendor.distance / 1000).toFixed(2)} km away` : 'Distance unknown'}</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{vendor.averageRating?.toFixed(1) || '0.0'}</span>
            </div>
            <Badge>{vendor.businessType || 'Vendor'}</Badge>
          </div>
          <Button
            className="w-full"
            onClick={() => handleVendorSelect(vendor)}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            View Products
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-[#138808]">Nearby Vendors</h2>
        
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'grid' ? "default" : "outline"} 
            onClick={() => setViewMode('grid')}
            className="h-9 px-3"
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button 
            variant={viewMode === 'map' ? "default" : "outline"}
            onClick={() => setViewMode('map')}
            className="h-9 px-3"
          >
            <MapIcon className="h-4 w-4 mr-2" />
            Map
          </Button>
          <Select value={searchRadius.toString()} onValueChange={(value) => setSearchRadius(Number(value))}>
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Search Radius" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1000">1 km</SelectItem>
              <SelectItem value="2000">2 km</SelectItem>
              <SelectItem value="5000">5 km</SelectItem>
              <SelectItem value="10000">10 km</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#138808]" />
        </div>
      ) : (
        <>
          {/* Map View */}
          {viewMode === 'map' && (
            <div className="h-[650px] bg-white rounded-lg shadow-sm overflow-hidden">
              {userLocation && (
                <NearbyVendorsMap 
                  vendors={vendors} 
                  currentLocation={userLocation} 
                  onMarkerClick={handleVendorSelect}
                />
              )}
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <>
              {vendors.length === 0 ? (
                <div className="text-center py-10">
                  <Store className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium">No vendors found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try increasing the search radius or check again later.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {vendors.map(renderVendorCard)}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Vendor Products Dialog */}
      <Dialog open={isProductsDialogOpen} onOpenChange={setIsProductsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedVendor?.businessName || selectedVendor?.name}'s Products</span>
              <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>
            </DialogTitle>
            <DialogDescription>
              Browse and add products to your cart
            </DialogDescription>
          </DialogHeader>

          {vendorProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg text-center mb-2">No products found</p>
              <p className="text-sm text-center text-muted-foreground">
                This vendor hasn't added any products yet.
            </p>
          </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {vendorProducts.map((product) => (
                <Card key={product._id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={product.images[0]?.url || '/placeholder.png'}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{product.averageRating?.toFixed(1) || '0.0'}</span>
                        <span className="text-muted-foreground">
                          ({product.totalRatings || 0})
                        </span>
                      </div>
                      <div className="font-semibold">₹{product.price}</div>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {vendorProducts.length > 0 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-muted-foreground">
                {vendorProducts.length} products found
              </div>
              <Button 
                onClick={() => {
                  const { items } = useConsumerCart.getState();
                  if (items.length > 0) {
                    setIsProductsDialogOpen(false);
                    navigate('/checkout');
                  } else {
                    toast({
                      title: "Cart is empty",
                      description: "Please add products to your cart first.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Proceed to Checkout
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Nearby Vendor Notification */}
      {showNotification && nearbyVendor && (
        <NearbyVendorNotification 
          vendor={nearbyVendor}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};

export default VendorGrid; 