import { toast } from "@/hooks/use-toast";
import { Product } from "@/types/product";
import { api } from '@/lib/axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  images?: FileList;
  // Vendor specific fields
  brand?: string;
  manufacturer?: string;
  expiryDate?: string;
  batchNumber?: string;
}

class ProductService {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  async getProducts(): Promise<Product[]> {
    const response = await api.get('/products/public');
    return response.data.products;
  }

  async getFarmerOwnProducts(): Promise<Product[]> {
    try {
      const response = await api.get('/products', {
        params: {
          role: 'farmer'
        }
      });
      return response.data.products;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch your products",
        variant: "destructive",
      });
      return [];
    }
  }

  async getVendorProducts(vendorId: string): Promise<Product[]> {
    const response = await api.get(`/products/vendor/${vendorId}`);
    return response.data;
  }

  async createProduct(productData: ProductFormData) {
    try {
      const formData = new FormData();
      Object.entries(productData).forEach(([key, value]) => {
        if (key === 'images' && value instanceof FileList) {
          Array.from(value).forEach(file => {
            formData.append('images', file);
          });
        } else if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });

      const response = await api.post('/products', formData);
      const data = response.data;
      toast({
        title: "Success",
        description: "Product created successfully",
      });
      return data.product;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      });
      throw error;
    }
  }

  async updateProduct(id: string, productData: Partial<ProductFormData>) {
    try {
      const formData = new FormData();
      Object.entries(productData).forEach(([key, value]) => {
        if (key === 'images' && value instanceof FileList) {
          Array.from(value).forEach(file => {
            formData.append('images', file);
          });
        } else if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
        }
      });

      const response = await api.put(`/products/${id}`, formData);
      const data = response.data;
      toast({
        title: "Success",
        description: "Product updated successfully",
      });
      return data.product;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update product",
        variant: "destructive",
      });
      throw error;
    }
  }

  async deleteProduct(id: string) {
    try {
      await api.delete(`/products/${id}`);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
      throw error;
    }
  }

  async getFarmerProducts() {
    try {
      const response = await api.get('/products/marketplace/farmers');
      return response.data.products;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch farmer products",
        variant: "destructive",
      });
      return [];
    }
  }
  
  // New method for vendors to purchase from farmers
  async createBulkPurchase(data: {
    farmerId: string;
    items: Array<{productId: string; quantity: number}>;
    deliveryAddress: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    deliveryDate: string;
  }) {
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
  
  // Get bulk purchase orders for farmers
  async getFarmerBulkOrders() {
    try {
      const response = await api.get('/bulk/orders', {
        params: { role: 'seller' }
      });
      return response.data.orders;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch bulk orders",
        variant: "destructive",
      });
      return [];
    }
  }
  
  // Get bulk purchase orders for vendors
  async getVendorBulkOrders() {
    try {
      const response = await api.get('/bulk/orders', {
        params: { role: 'buyer' }
      });
      return response.data.orders;
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

export const productService = new ProductService(); 