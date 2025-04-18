import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, Package, Loader2 } from "lucide-react";
import { api } from "@/lib/axios";
import { bulkOrderService, BulkOrder } from "@/services/bulk-order.service";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Product } from "@/types/product";

const FarmerMarketplace = () => {
  const [farmerProducts, setFarmerProducts] = useState<Product[]>([]);
  const [loadingFarmerProducts, setLoadingFarmerProducts] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<{productId: string; quantity: number}[]>([]);
  const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    fetchFarmerProducts();
    fetchBulkOrders();
  }, []);

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
    <ProtectedRoute allowedRoles={["vendor"]}>
      <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Farmer Marketplace</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

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
                          <TableCell className="font-medium">Order ID</TableCell>
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
      </div>
    </ProtectedRoute>
  );
};

export default FarmerMarketplace; 