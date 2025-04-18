import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/axios";
import { ShoppingBag, Filter, Download, Check, X, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { socketService } from "@/services/socket.service";

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
    price?: number;
  }>;
  totalAmount: number;
  status: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    customerName?: string;
    customerEmail?: string;
  };
  createdAt: string;
  consumer: {
    _id: string;
    name: string;
    email: string;
  };
}

// New notification component
const OrderNotification = ({ order, onClose }: { order: any; onClose: () => void }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5">
      <Card className="w-96 bg-white shadow-lg border-green-400 border-l-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <Bell className="h-4 w-4 mr-2 text-green-500" />
              New Order Received!
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Order #{order.orderNumber} - ₹{order.totalAmount}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm mb-2">
            <span className="font-medium">From:</span> {order.customerName || 'Customer'}
          </p>
          <p className="text-sm mb-3">
            <span className="font-medium">Items:</span> {order.itemCount} items
          </p>
          <div className="flex justify-end">
            <Button size="sm" variant="default" onClick={onClose}>
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const VendorOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  // Add new state for notifications
  const [notification, setNotification] = useState<any>(null);
  const [hasNewOrders, setHasNewOrders] = useState(false);

  useEffect(() => {
    fetchOrders();
    
    // Set up socket for real-time order notifications
    const removeListener = setupOrderNotifications();
    
    return () => {
      // Clean up socket listeners
      if (removeListener) removeListener();
    };
  }, [currentPage, statusFilter, dateFilter, sortBy, sortOrder]);
  
  // Setup order notification listeners
  const setupOrderNotifications = () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    // Listen for new orders via socket
    return socketService.onNewOrder((orderData) => {
      console.log('New order received:', orderData);
      
      // Show notification
      setNotification(orderData);
      setHasNewOrders(true);
      
      // Play sound if available
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(e => console.log('Could not play notification sound'));
      
      // Auto-refresh orders
      fetchOrders();
      
      // Auto-hide notification after 10 seconds
      setTimeout(() => {
        setNotification(null);
      }, 10000);
    });
  };

  const handleDismissNotification = () => {
    setNotification(null);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        sort: sortBy,
        order: sortOrder,
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(dateFilter !== "all" && { date: dateFilter }),
      });
      
      const response = await api.get(`/orders/vendor?${queryParams}`);
      
      setOrders(response.data.orders || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, {
        status: "confirmed",
      });
      
      toast({
        title: "Success",
        description: "Order confirmed successfully.",
      });
      
      // Update the order in the list
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status: "confirmed" } : order
        )
      );
      
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error accepting order:", error);
      toast({
        title: "Error",
        description: "Failed to accept order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, {
        status: "cancelled",
      });
      
      toast({
        title: "Success",
        description: "Order rejected successfully.",
      });
      
      // Update the order in the list
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status: "cancelled" } : order
        )
      );
      
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error rejecting order:", error);
      toast({
        title: "Error",
        description: "Failed to reject order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportOrders = async () => {
    try {
      const response = await api.get("/export/orders", { responseType: "blob" });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "vendor_orders.csv");
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Orders exported successfully.",
      });
    } catch (error) {
      console.error("Error exporting orders:", error);
      toast({
        title: "Error",
        description: "Failed to export orders. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case "delivered":
        return <Badge className="bg-blue-100 text-blue-800">Delivered</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track your customer orders
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={handleExportOrders}>
            <Download className="mr-2 h-4 w-4" />
            Export Orders
          </Button>
          <Link to="/vendor/dashboard">
            <Button variant="default">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Filters</CardTitle>
          <CardDescription>Filter and sort your orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger id="date">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sortBy">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sortBy">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date</SelectItem>
                  <SelectItem value="totalAmount">Amount</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sortOrder">Order</Label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger id="sortOrder">
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>
            {orders.length} orders found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No orders found</h3>
              <p className="text-sm text-muted-foreground">
                {statusFilter !== "all" || dateFilter !== "all" 
                  ? "Try changing your filters" 
                  : "Orders will appear here when customers place them"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>{order.orderNumber}</TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>{order.consumer?.name || order.deliveryAddress?.customerName || "Anonymous"}</TableCell>
                        <TableCell>{order.items.length} items</TableCell>
                        <TableCell>₹{order.totalAmount}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Order details and delivery information
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.product._id}
                      className="flex justify-between text-sm"
                    >
                      <span>{item.product.name} x {item.quantity}</span>
                      <span>₹{(item.price || item.product.price) * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 font-medium">
                    <div className="flex justify-between">
                      <span>Total Amount</span>
                      <span>₹{selectedOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Delivery Address</h3>
                <p className="text-sm">
                  {selectedOrder.deliveryAddress.street}<br />
                  {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state}<br />
                  {selectedOrder.deliveryAddress.pincode}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Customer</h3>
                <p className="text-sm">
                  {selectedOrder.consumer?.name || selectedOrder.deliveryAddress?.customerName || "Anonymous"}<br />
                  {selectedOrder.consumer?.email || selectedOrder.deliveryAddress?.customerEmail || "No email provided"}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Status</h3>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedOrder.status)}
                  <span>{formatDate(selectedOrder.createdAt)}</span>
                </div>
              </div>

              {selectedOrder.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleAcceptOrder(selectedOrder._id)}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Accept Order
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => handleRejectOrder(selectedOrder._id)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject Order
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      {notification && (
        <OrderNotification order={notification} onClose={handleDismissNotification} />
      )}
    </div>
  );
};

export default VendorOrders; 