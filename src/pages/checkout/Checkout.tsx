import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { ShoppingCart, Check, ArrowLeft, CreditCard, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useConsumerCart } from "@/hooks/use-consumer-cart";
import { orderService, CreateOrderInput } from "@/services/order.service";
import { useAuth } from "@/hooks/use-auth";
import { socketService } from "@/services/socket.service";

// Generate a unique transaction ID for tracking payment attempts
const generateTransactionId = () => `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isConsumer } = useAuth();
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [currentTab, setCurrentTab] = useState("cart");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [transactionId, setTransactionId] = useState<string>("");
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const { items, getTotal, clearCart, getVendorId, removeFromCart } = useConsumerCart();

  useEffect(() => {
    // Check if user is authenticated first
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to proceed with checkout",
        variant: "destructive",
      });
      // Save cart state in local storage (already handled by Zustand)
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    // Check if user is a consumer
    if (!isConsumer()) {
      toast({
        title: "Access Denied",
        description: "Only consumers can access the checkout page",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    // Only then check if cart is empty
    if (items.length === 0 && !orderCompleted) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add some products first.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
  }, [isAuthenticated, isConsumer, items.length, navigate, orderCompleted]);

  // This function initiates the payment process
  const initiatePayment = async (shippingAddress: CreateOrderInput['shippingAddress']) => {
    if (isProcessing || paymentInitiated) {
      console.log('Payment already in progress, preventing duplicate');
      return;
    }

    try {
      // Check authentication again before processing payment
      if (!isAuthenticated()) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to proceed with checkout",
          variant: "destructive",
        });
        navigate("/login", { state: { from: "/checkout" } });
        return;
      }

      // Check if user is a consumer
      if (!isConsumer()) {
        toast({
          title: "Access Denied", 
          description: "Only consumers can complete checkout",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Get user information
      const { user } = useAuth.getState();
      if (!user || !user.name) {
        toast({
          title: "User Information Missing",
          description: "Please update your profile before checkout",
          variant: "destructive", 
        });
        return;
      }

      // Generate new transaction ID for this payment attempt
      const newTransactionId = generateTransactionId();
      setTransactionId(newTransactionId);
      
      console.log(`Starting payment process (${newTransactionId})...`);
      setIsProcessing(true);
      setPaymentInitiated(true);

      // Validate shipping address
      if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || 
          !shippingAddress.state || !shippingAddress.pincode) {
        throw new Error('Invalid shipping address. All fields are required.');
      }

      // Validate cart items
      if (!items || items.length === 0) {
        throw new Error('Your cart is empty. Please add products before checkout.');
      }

      console.log(`Creating order with products (${newTransactionId}):`, items.map(item => ({ 
        id: item._id, 
        name: item.name, 
        price: item.price, 
        quantity: item.quantity 
      })));

      // Add customer information to shipping address
      const enhancedShippingAddress = {
        ...shippingAddress,
        customerName: user.name,
        customerEmail: user.email
      };

      // Create order data from cart
      const orderData: CreateOrderInput = {
        products: items.map(item => ({
          productId: item._id,
          quantity: item.quantity
        })),
        shippingAddress: enhancedShippingAddress,
        paymentMethod: 'razorpay',
        orderType: 'vendor-to-consumer'
      };

      console.log(`Submitting order to backend (${newTransactionId}):`, JSON.stringify(orderData));

      // Create order
      const { order } = await orderService.createOrder(orderData);

      if (!order?._id) {
        throw new Error('Order creation failed - no order ID received');
      }

      console.log(`Order created successfully (${newTransactionId}):`, order);

      // Verify Razorpay order ID is present
      if (!order.razorpayOrderId) {
        throw new Error('Razorpay order ID is missing from the response');
      }

      // Initialize Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: getTotal() * 100, // Amount in paise
        currency: "INR",
        name: "Krishi Mitra",
        description: "Purchase from Krishi Mitra",
        order_id: order.razorpayOrderId,
        handler: async (response: any) => {
          try {
            console.log(`Payment successful (${newTransactionId}), verifying:`, response);
            
            // Verify payment
            await orderService.verifyPayment({
              orderId: order._id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });

            // Notify vendor through socket
            const vendorId = getVendorId();
            if (vendorId) {
              console.log(`Notifying vendor about new order (${newTransactionId}):`, { 
                orderId: order._id, 
                vendorId 
              });
              
              try {
                // Initialize socket connection if needed
                await socketService.initialize();
                
                // Emit the order notification with customer information
                socketService.emit('order:new', {
                  orderId: order._id,
                  vendorId,
                  customerName: user.name,
                  customerEmail: user.email,
                  orderTotal: getTotal(),
                  orderItems: items.length
                });
              } catch (socketError) {
                // Don't fail the order process if socket notification fails
                console.error('Failed to notify vendor via socket:', socketError);
              }
            }

            // Clear cart and update UI
            console.log(`Finalizing order and updating UI state (${newTransactionId})`);
            clearCart();
            setCompletedOrder(order);
            setOrderCompleted(true);
            setCurrentTab("complete");

            toast({
              title: "Order Placed",
              description: `Your order #${order.orderNumber} has been placed successfully!`,
            });
          } catch (verifyError) {
            console.error(`Payment verification error (${newTransactionId}):`, verifyError);
            toast({
              title: "Payment Verification Failed",
              description: "Please contact support if amount was deducted",
              variant: "destructive",
            });
          } finally {
            setPaymentInitiated(false);
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function() {
            // Reset flags when payment modal is closed without completing
            console.log(`Payment modal dismissed by user (${newTransactionId})`);
            setPaymentInitiated(false);
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: "", // You can get this from user context if available
        },
        theme: {
          color: "#138808",
        },
      };

      console.log(`Initializing Razorpay (${newTransactionId}) with options:`, {
        key: options.key,
        amount: options.amount,
        currency: options.currency,
        orderId: options.order_id
      });
      
      // Check if Razorpay SDK is loaded
      if (typeof window.Razorpay !== 'function') {
        throw new Error('Razorpay SDK not loaded. Please check your internet connection and try again.');
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive",
      });
      setPaymentInitiated(false);
      setIsProcessing(false);
    }
  };

  // This is the callback for the form submission
  const handleCheckoutSuccess = (shippingAddress: CreateOrderInput['shippingAddress']) => {
    if (orderCompleted) {
      console.log('Order already completed, showing success screen');
      setCurrentTab("complete");
      return;
    }
    
    initiatePayment(shippingAddress);
  };

  const handleContinueShopping = () => {
    navigate("/");
  };

  const cartItems = items;
  const totalAmount = getTotal();

  if (cartItems.length === 0 && !orderCompleted) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Your Cart is Empty</CardTitle>
            <CardDescription>Add some products to your cart to proceed with checkout</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate("/")}
              className="bg-[#138808] hover:bg-[#138808]/90"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cart">Cart</TabsTrigger>
          <TabsTrigger value="checkout" disabled={cartItems.length === 0}>Checkout</TabsTrigger>
          <TabsTrigger value="complete" disabled={!orderCompleted}>Complete</TabsTrigger>
        </TabsList>

        <TabsContent value="cart">
          <Card>
            <CardHeader>
              <CardTitle>Shopping Cart</CardTitle>
              <CardDescription>You have {cartItems.length} items in your cart</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div 
                    key={item._id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <img 
                        src={item.images[0]?.url} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ₹{item.price} x {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-medium">₹{item.price * item.quantity}</p>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => removeFromCart(item._id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="pt-4 flex justify-between text-lg font-bold">
                  <p>Total</p>
                  <p>₹{totalAmount}</p>
                </div>

                <div className="pt-4 flex gap-2">
                  <Button 
                    variant="outline"
                    className="text-red-500 border-red-200 hover:bg-red-50 flex-1"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                  <Button 
                    className="w-full bg-[#138808] hover:bg-[#138808]/90 flex-1"
                    onClick={() => setCurrentTab("checkout")}
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkout">
          <CheckoutForm
            cartItems={cartItems.map(item => ({
              id: item._id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.images?.[0]?.url
            }))}
            totalAmount={totalAmount}
            onSuccess={handleCheckoutSuccess}
            isProcessing={isProcessing}
          />
        </TabsContent>

        <TabsContent value="complete">
          <Card className="text-center p-8">
            <CardHeader>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
              <CardDescription>Thank you for your purchase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {completedOrder && (
                <div className="bg-gray-50 p-4 rounded-lg text-left">
                  <p className="font-medium">Order #{completedOrder.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    Total: ₹{completedOrder.totalAmount} • {completedOrder.items?.length || 0} items
                  </p>
                </div>
              )}
              <p className="text-muted-foreground">
                Your order has been placed successfully and is being processed.
                You will receive an email confirmation shortly.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard/consumer')}
                  className="flex-1 max-w-xs mx-auto"
                >
                  View My Orders
                </Button>
                <Button
                  className="flex-1 max-w-xs mx-auto bg-[#138808] hover:bg-[#138808]/90"
                  onClick={handleContinueShopping}
                >
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Checkout;
