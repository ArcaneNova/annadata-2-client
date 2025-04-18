import { toast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface Order {
  _id: string;
  products: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface Vendor {
  _id: string;
  name: string;
  location: {
    coordinates: [number, number];
    address: string;
  };
  rating: number;
  products: string[];
}

export interface LoyaltyStatus {
  points: number;
  tier: string;
  nextTierPoints: number;
  referralCode: string;
  referralCount: number;
}

class ConsumerService {
  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getOrders() {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch orders');
      }
      
      const data = await response.json();
      return data.orders;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch orders",
        variant: "destructive",
      });
      return [];
    }
  }

  async getNearbyVendors(lat: number, lng: number) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/location/nearby?lat=${lat}&lng=${lng}`,
        {
          headers: this.getHeaders()
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch nearby vendors');
      }
      
      const data = await response.json();
      return data.vendors;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch nearby vendors",
        variant: "destructive",
      });
      return [];
    }
  }

  async getLoyaltyStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/rewards/loyalty/status`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch loyalty status');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch loyalty status",
        variant: "destructive",
      });
      return null;
    }
  }

  async subscribeToVendor(vendorId: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/location/subscribe/${vendorId}`,
        {
          method: 'POST',
          headers: this.getHeaders()
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to subscribe to vendor');
      }
      
      toast({
        title: "Success",
        description: "Successfully subscribed to vendor updates",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to subscribe to vendor",
        variant: "destructive",
      });
      return false;
    }
  }

  async unsubscribeFromVendor(vendorId: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/location/unsubscribe/${vendorId}`,
        {
          method: 'POST',
          headers: this.getHeaders()
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to unsubscribe from vendor');
      }
      
      toast({
        title: "Success",
        description: "Successfully unsubscribed from vendor updates",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unsubscribe from vendor",
        variant: "destructive",
      });
      return false;
    }
  }

  async rateProduct(productId: string, rating: number, review?: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/ratings/products/${productId}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ rating, review })
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to rate product');
      }
      
      toast({
        title: "Success",
        description: "Product rating submitted successfully",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to rate product",
        variant: "destructive",
      });
      return false;
    }
  }

  async rateVendor(vendorId: string, rating: number, review?: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/ratings/users/${vendorId}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ rating, review })
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to rate vendor');
      }
      
      toast({
        title: "Success",
        description: "Vendor rating submitted successfully",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to rate vendor",
        variant: "destructive",
      });
      return false;
    }
  }

  async redeemPoints(points: number) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/rewards/loyalty/redeem`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ points })
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to redeem points');
      }
      
      const data = await response.json();
      
      toast({
        title: "Success",
        description: `Successfully redeemed ${points} points`,
      });
      
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to redeem points",
        variant: "destructive",
      });
      return null;
    }
  }

  async applyReferralCode(code: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/rewards/referral/apply`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ code })
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to apply referral code');
      }
      
      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Referral code applied successfully",
      });
      
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply referral code",
        variant: "destructive",
      });
      return null;
    }
  }

  async createSupportTicket(subject: string, message: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/support/tickets`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ subject, message })
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create support ticket');
      }
      
      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Support ticket created successfully",
      });
      
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create support ticket",
        variant: "destructive",
      });
      return null;
    }
  }
}

export const consumerService = new ConsumerService(); 