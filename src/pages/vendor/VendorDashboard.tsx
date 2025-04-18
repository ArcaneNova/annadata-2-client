import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { MapPin, Users, Bell, ShoppingCart, BarChart2, Package, Loader2, Tractor, ShoppingBag, AlertTriangle } from "lucide-react";
import { socketService } from "@/services/socket.service";
import NearbyConsumersMap from "@/components/vendor/NearbyConsumersMap";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/axios";
import { bulkOrderService } from "@/services/bulk-order.service";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";

interface Consumer {
  _id: string;
  name: string;
  location: {
    coordinates: [number, number];
  };
  distance: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  images: { url: string }[];
  seller: string;
}

const VendorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [nearbyConsumers, setNearbyConsumers] = useState<Consumer[]>([]);
  const [farmerProducts, setFarmerProducts] = useState<Product[]>([]);
  const [loadingFarmerProducts, setLoadingFarmerProducts] = useState(false);
  const [cartItems, setCartItems] = useState<{productId: string; quantity: number}[]>([]);
  const [bulkOrders, setBulkOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null);

  // Fetch vendor's own products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products/vendor/own');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive",
        });
      }
    };
    fetchProducts();
  }, []);

  // Initialize Socket.IO connection
  useEffect(() => {
    socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Handle location broadcasting
  useEffect(() => {
    if (isLocationEnabled && currentLocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(newLocation);
          socketService.emit('vendor:location:update', {
            coordinates: [newLocation.lng, newLocation.lat]
          });
        },
        (error) => {
          console.error('Location watch error:', error);
          toast({
            title: "Location Error",
            description: "Failed to update location",
            variant: "destructive",
          });
        },
        { enableHighAccuracy: true }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [isLocationEnabled, currentLocation]);

  // Listen for consumer location updates
  useEffect(() => {
    console.log('Consumer location updates will be implemented later');
    
    return () => {
      // Clean up
    };
  }, []);

  // Add a new useEffect to fetch farmer products
  useEffect(() => {
    if (activeTab === "farmerMarketplace") {
      fetchFarmerProducts();
      fetchBulkOrders();
    }
  }, [activeTab]);

  const handleLocationToggle = () => {
    if (!isLocationEnabled) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setCurrentLocation(newLocation);
            setIsLocationEnabled(true);
            toast({
              title: "Location Enabled",
              description: "Your location is now being shared with nearby consumers.",
            });
          },
          (error) => {
            console.error("Error getting location:", error);
            toast({
              title: "Location Error",
              description: "Please enable location services to share your location.",
              variant: "destructive",
            });
          }
        );
      } else {
        toast({
          title: "Location Not Supported",
          description: "Your browser does not support location services.",
          variant: "destructive",
        });
      }
    } else {
      setIsLocationEnabled(false);
      toast({
        title: "Location Disabled",
        description: "Your location is no longer being shared.",
      });
    }
  };

  const onAddProduct = async (data: any) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'images') {
          Array.from(data.images).forEach((file: any) => {
            formData.append('images', file);
          });
        } else {
          formData.append(key, data[key]);
        }
      });
      formData.append('sellerType', 'vendor');

      const response = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setProducts(prev => [...prev, response.data]);
      setIsAddProductOpen(false);
      reset();
      toast({
        title: "Success",
        description: "Product added successfully",
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  // Add new functions for farmer marketplace
  const fetchFarmerProducts = async () => {
    try {
      setLoadingFarmerProducts(true);
      const response = await api.get('/products/marketplace/farmers');
      setFarmerProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching farmer products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch farmer products",
        variant: "destructive",
      });
    } finally {
      setLoadingFarmerProducts(false);
    }
  };

  const fetchBulkOrders = async () => {
    try {
      setLoadingOrders(true);
      const orders = await bulkOrderService.getVendorBulkOrders();
      setBulkOrders(orders);
    } catch (error) {
      console.error('Error fetching bulk orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const addToCart = (productId: string) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.productId === productId);
      if (existingItem) {
        return prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prev, { productId, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev => 
      prev.map(item => 
        item.productId === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = farmerProducts.find(p => p._id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const getProductById = (productId: string) => {
    return farmerProducts.find(p => p._id === productId);
  };

  const handleCheckout = async () => {
    if (!selectedFarmer || cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select a farmer and add products to your cart",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get the current user's business address
      const userResponse = await api.get('/users/profile');
      const user = userResponse.data;
      
      if (!user.businessLocation || !user.businessLocation.address) {
        toast({
          title: "Error",
          description: "Please update your business address in your profile",
          variant: "destructive",
        });
        return;
      }

      // Create the delivery address from the business location
      const deliveryAddress = {
        street: user.businessLocation.address,
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || ""
      };

      // Set delivery date to 7 days from now
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 7);

      // Create the bulk purchase order
      await bulkOrderService.createBulkPurchase({
        farmerId: selectedFarmer,
        items: cartItems,
        deliveryAddress,
        deliveryDate: deliveryDate.toISOString()
      });

      // Clear the cart and refresh orders
      clearCart();
      fetchBulkOrders();

      toast({
        title: "Success",
        description: "Bulk purchase order created successfully",
      });
    } catch (error) {
      console.error('Error creating bulk purchase:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, label: string }> = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'accepted': { color: 'bg-blue-100 text-blue-800', label: 'Accepted' },
      'processing': { color: 'bg-purple-100 text-purple-800', label: 'Processing' },
      'ready-for-delivery': { color: 'bg-indigo-100 text-indigo-800', label: 'Ready for Delivery' },
      'in-transit': { color: 'bg-orange-100 text-orange-800', label: 'In Transit' },
      'delivered': { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      'rejected': { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      'cancelled': { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };

    const statusInfo = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your store, inventory, and orders
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={() => navigate('/login')}>
            Logout
          </Button>
          <Button onClick={() => setIsAddProductOpen(true)}>
            Add New Product
          </Button>
        </div>
      </div>

      {locationError && (
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardContent className="flex items-center gap-2 py-3 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            <p>{locationError}</p>
          </CardContent>
        </Card>
      )}

      {/* Navigation Cards for Vendor Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Link to="/vendor/dashboard">
          <Card className="hover:bg-gray-50 cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
              <ShoppingBag className="h-8 w-8 mb-2 text-blue-500" />
              <h3 className="font-medium">Dashboard</h3>
              <p className="text-xs text-muted-foreground">Overview & Stats</p>
            </CardContent>
          </Card>
        </Link>
        
        {/* ... other navigation cards ... */}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="farmerMarketplace">Farmer Marketplace</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#138808]" />
                  Location Settings
                </CardTitle>
                <CardDescription>
                  Control your location sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="location-sharing">
                    Share location with consumers
                  </Label>
                  <Switch
                    id="location-sharing"
                    checked={isLocationEnabled}
                    onCheckedChange={handleLocationToggle}
                  />
                </div>
                {isLocationEnabled && (
                  <p className="mt-2 text-sm text-green-600">
                    Your location is being shared with nearby consumers
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#FF9933]" />
                  Products
                </CardTitle>
                <CardDescription>
                  {products.length} products in your inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={() => setIsAddProductOpen(true)} className="w-full">
                    Add New Product
                  </Button>
                  <Link to="/vendor/products" className="block">
                    <Button variant="outline" className="w-full">
                      Manage Products
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-[#000080]" />
                  Analytics
                </CardTitle>
                <CardDescription>
                  Track your business performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/vendor/analytics">
                  <Button className="w-full">
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tractor className="h-5 w-5 text-green-600" />
                  Farmer Marketplace
                </CardTitle>
                <CardDescription>Purchase products directly from farmers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Browse and purchase agricultural products in bulk directly from farmers.
                </p>
                <Link to="/vendor/marketplace">
                  <Button className="w-full">
                    Visit Farmer Marketplace
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Map showing nearby consumers */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Nearby Consumers</CardTitle>
                <CardDescription>
                  View consumers in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NearbyConsumersMap 
                  consumers={nearbyConsumers} 
                  vendorLocation={currentLocation || { lat: 0, lng: 0 }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="inventory">
          {/* ... existing inventory content ... */}
        </TabsContent>
        
        <TabsContent value="orders">
          {/* ... existing orders content ... */}
        </TabsContent>
        
        <TabsContent value="farmerMarketplace">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Farmer Products</CardTitle>
                  <CardDescription>Browse and purchase products directly from farmers</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingFarmerProducts ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : farmerProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No Farmer Products Available</h3>
                      <p className="text-gray-500">There are no farmer products available at the moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {farmerProducts.map((product) => {
                          const isInCart = cartItems.some(item => item.productId === product._id);
                          const cartItem = cartItems.find(item => item.productId === product._id);
                          
                          return (
                            <div 
                              key={product._id} 
                              className={`p-4 rounded-lg border ${
                                product.seller === selectedFarmer ? 'border-primary bg-primary/5' : 'border-gray-200'
                              } hover:shadow-md transition-all`}
                              onClick={() => setSelectedFarmer(product.seller)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{product.name}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.stock > 0 ? `${product.stock} ${product.unit} Available` : 'Out of Stock'}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div>
                                  <p className="text-gray-500">Price/{product.unit}</p>
                                  <p className="font-medium">₹{product.price}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Category</p>
                                  <p className="font-medium capitalize">{product.category}</p>
                                </div>
                              </div>
                              
                              {isInCart ? (
                                <div className="flex items-center justify-between mt-4">
                                  <div className="flex items-center border rounded-md">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (cartItem) {
                                          updateQuantity(product._id, cartItem.quantity - 1);
                                        }
                                      }}
                                    >
                                      -
                                    </Button>
                                    <span className="px-2">{cartItem?.quantity || 0}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (cartItem) {
                                          updateQuantity(product._id, cartItem.quantity + 1);
                                        }
                                      }}
                                    >
                                      +
                                    </Button>
                                  </div>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeFromCart(product._id);
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ) : (
                                <Button 
                                  className="w-full mt-4" 
                                  disabled={product.stock <= 0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(product._id);
                                  }}
                                >
                                  Add to Cart
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Bulk Purchase Orders</CardTitle>
                  <CardDescription>Track your bulk purchase orders from farmers</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingOrders ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : bulkOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No Bulk Orders Yet</h3>
                      <p className="text-gray-500">You haven't placed any bulk orders with farmers yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableCell className="font-medium w-[100px]">Order ID</TableCell>
                            <TableCell className="font-medium">Farmer</TableCell>
                            <TableCell className="font-medium">Items</TableCell>
                            <TableCell className="font-medium">Total Amount</TableCell>
                            <TableCell className="font-medium">Status</TableCell>
                            <TableCell className="font-medium">Expected Delivery</TableCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bulkOrders.map((order) => (
                            <TableRow key={order._id}>
                              <TableCell className="font-medium">{order._id.substring(0, 8)}...</TableCell>
                              <TableCell>{order.seller.name}</TableCell>
                              <TableCell>{order.items.length} items</TableCell>
                              <TableCell>₹{order.totalAmount.toLocaleString()}</TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell>{formatDate(order.expectedDeliveryDate)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Shopping Cart</CardTitle>
                  <CardDescription>
                    {selectedFarmer 
                      ? `Products from selected farmer` 
                      : 'Select a farmer to purchase from'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Your Cart is Empty</h3>
                      <p className="text-gray-500">Add products from farmers to your cart</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => {
                        const product = getProductById(item.productId);
                        if (!product) return null;
                        
                        return (
                          <div key={item.productId} className="flex justify-between items-center border-b pb-4">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <div className="flex items-center text-sm text-gray-500">
                                <span>{item.quantity} x ₹{product.price}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">₹{(product.price * item.quantity).toLocaleString()}</p>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 h-8 px-2"
                                onClick={() => removeFromCart(item.productId)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="pt-4 border-t">
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>₹{getCartTotal().toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="pt-4 space-y-2">
                        <Button 
                          className="w-full" 
                          disabled={cartItems.length === 0 || !selectedFarmer}
                          onClick={handleCheckout}
                        >
                          Place Bulk Order
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={clearCart}
                          disabled={cartItems.length === 0}
                        >
                          Clear Cart
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your inventory
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onAddProduct)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name')} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select {...register('category')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="groceries">Groceries</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="snacks">Snacks</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price</Label>
                <Input type="number" id="price" {...register('price')} required min="0" step="0.01" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input type="number" id="stock" {...register('stock')} required min="0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Select {...register('unit')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogram</SelectItem>
                    <SelectItem value="gram">Gram</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="dozen">Dozen</SelectItem>
                    <SelectItem value="liter">Liter</SelectItem>
                    <SelectItem value="packet">Packet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="images">Images</Label>
                <Input type="file" id="images" {...register('images')} multiple accept="image/*" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorDashboard; 