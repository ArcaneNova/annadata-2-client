import { toast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface OrderProduct {
  productId: string;  // MongoDB ObjectId string
  quantity: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CreateOrderInput {
  products: OrderProduct[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'razorpay' | 'cod';
  orderType: 'farmer-to-vendor' | 'vendor-to-consumer';
}

export interface PaymentVerificationInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  buyer: string;
  seller: string;
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
    unit: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'in-transit' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'razorpay' | 'cod';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  orderType: 'farmer-to-vendor' | 'vendor-to-consumer';
  createdAt: string;
  updatedAt: string;
}

class OrderService {
  async createOrder(orderData: CreateOrderInput): Promise<{ order: Order }> {
    try {
      // Validate product IDs before sending
      const validatedProducts = orderData.products.map(product => ({
        ...product,
        productId: product.productId.toString() // Ensure it's a string
      }));

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...orderData,
          products: validatedProducts
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const data = await response.json();
      
      if (!data.order || !data.order._id || !data.order.orderNumber) {
        throw new Error('Invalid order response from server');
      }

      return data;
    } catch (error) {
      console.error('Order creation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create order",
        variant: "destructive",
      });
      throw error;
    }
  }

  async verifyPayment(verificationData: PaymentVerificationInput): Promise<Order> {
    try {
      // Validate required fields
      if (!verificationData.orderId) {
        throw new Error('Order ID is required for payment verification');
      }
      if (!verificationData.paymentId) {
        throw new Error('Payment ID is required for payment verification');
      }
      if (!verificationData.signature) {
        throw new Error('Payment signature is required for verification');
      }

      const response = await fetch(`${API_BASE_URL}/orders/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          orderId: verificationData.orderId,
          paymentId: verificationData.paymentId,
          signature: verificationData.signature
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify payment');
      }

      if (!data.order) {
        throw new Error('Invalid response from payment verification');
      }

      return data.order;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  async cancelOrder(orderId: string): Promise<Order> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel order');
      }

      const order = await response.json();
      return order;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel order",
        variant: "destructive",
      });
      throw error;
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch orders');
      }

      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch orders",
        variant: "destructive",
      });
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch order');
      }

      const order = await response.json();
      return order;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch order",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export const orderService = new OrderService(); 