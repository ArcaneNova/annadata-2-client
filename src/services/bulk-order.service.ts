import { toast } from "@/hooks/use-toast";
import { api } from '@/lib/axios';

export interface BulkOrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images: Array<{ url: string }>;
  };
  quantity: number;
  price: number;
  unit: string;
}

export interface BulkOrder {
  _id: string;
  buyer: {
    _id: string;
    name: string;
    email: string;
  };
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  items: BulkOrderItem[];
  totalAmount: number;
  status: string;
  orderType: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkPurchaseInput {
  farmerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  deliveryDate: string;
}

class BulkOrderService {
  // Create a bulk purchase order (vendor buying from farmer)
  async createBulkPurchase(data: BulkPurchaseInput) {
    try {
      const response = await api.post('/bulk/farmer-purchase', data);
      toast({
        title: "Success",
        description: "Bulk purchase order created successfully",
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create bulk purchase",
        variant: "destructive",
      });
      throw error;
    }
  }
  
  // Get bulk orders for farmers (as seller)
  async getFarmerBulkOrders(): Promise<BulkOrder[]> {
    try {
      console.log('Fetching farmer bulk orders...');
      const response = await api.get('/bulk/orders', {
        params: { role: 'seller' }
      });
      console.log('Farmer bulk orders response:', response.data);
      return response.data.orders || [];
    } catch (error) {
      console.error('Error fetching farmer bulk orders:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch bulk orders",
        variant: "destructive",
      });
      return [];
    }
  }
  
  // Get bulk orders for vendors (as buyer)
  async getVendorBulkOrders(): Promise<BulkOrder[]> {
    try {
      const response = await api.get('/bulk/orders', {
        params: { role: 'buyer' }
      });
      return response.data.orders || [];
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch bulk orders",
        variant: "destructive",
      });
      return [];
    }
  }
  
  // Update bulk order status
  async updateBulkOrderStatus(orderId: string, status: string) {
    try {
      const response = await api.put(`/bulk/orders/${orderId}/status`, { status });
      toast({
        title: "Success",
        description: `Order status updated to ${status}`,
      });
      return response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order status",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export const bulkOrderService = new BulkOrderService(); 