import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, MapPin, Truck, Package, Star } from "lucide-react";
import { orderService, Order } from "@/services/order.service";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useConsumerCart } from "@/hooks/use-consumer-cart";
import { toast } from "@/hooks/use-toast";
import { logout } from "@/utils/auth";

const ConsumerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getTotal, getTotalItems } = useConsumerCart();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedOrders = await orderService.getOrders();
      setOrders(fetchedOrders || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch orders";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActiveOrders = () => {
    return orders.filter(order => 
      ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)
    );
  };

  const calculateTotalSavings = () => {
    // Calculate savings based on the margin difference
    return orders.reduce((total, order) => {
      return total + (order.totalAmount * 0.1); // Assuming 10% average savings
    }, 0);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'Customer'}! <Button variant="outline" onClick={logout}>
              Logout
            </Button></h1>
          <p className="text-muted-foreground">Manage your orders and track deliveries</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#138808]" />
                Active Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{getActiveOrders().length}</div>
              <p className="text-sm text-muted-foreground">Orders in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#FF9933]" />
                Delivery Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {getActiveOrders().filter(order => order.status === 'in-transit').length}
              </div>
              <p className="text-sm text-muted-foreground">Orders out for delivery</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-[#138808]" />
                Total Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₹{calculateTotalSavings().toFixed(2)}</div>
              <p className="text-sm text-muted-foreground">Saved on your orders</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Track and manage your recent orders</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading orders...
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start shopping to see your orders here
                  </p>
                  <Button 
                    onClick={() => navigate("/")}
                    className="mt-4 bg-[#138808] hover:bg-[#138808]/90"
                  >
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div 
                      key={order._id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100' :
                          order.status === 'in-transit' ? 'bg-blue-100' :
                          order.status === 'accepted' ? 'bg-yellow-100' :
                          'bg-gray-100'
                        }`}>
                          <Truck className={`h-5 w-5 ${
                            order.status === 'delivered' ? 'text-green-600' :
                            order.status === 'in-transit' ? 'text-blue-600' :
                            order.status === 'accepted' ? 'text-yellow-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()} • 
                            {order.items.length} items • ₹{order.totalAmount}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'in-transit' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'accepted' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/orders/${order._id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ConsumerDashboard;
