import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { CreditCard, MapPin, Truck, Check, Loader2, Plus } from "lucide-react";
import { CreateOrderInput, orderService } from "@/services/order.service";
import { useAuth } from "@/hooks/use-auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

interface CartProduct {
  id: string;
  quantity: number;
  name: string;
  price: number;
  image?: string;
}

interface CheckoutFormProps {
  cartItems: CartProduct[];
  totalAmount: number;
  onSuccess: (shippingAddress: CreateOrderInput['shippingAddress']) => void;
  isProcessing: boolean;
}

const CheckoutForm = ({ cartItems, totalAmount, onSuccess, isProcessing }: CheckoutFormProps) => {
  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  useEffect(() => {
    fetchSavedAddresses();
  }, []);

  const fetchSavedAddresses = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/addresses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedAddresses(data.addresses || []);
        if (data.addresses?.length > 0) {
          setSelectedAddressId(data.addresses[0].id);
        } else {
          setShowNewAddressForm(true);
        }
      } else {
        // If endpoint doesn't exist, just show the new address form
        setShowNewAddressForm(true);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setShowNewAddressForm(true);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    if (addressId === "new") {
      setShowNewAddressForm(true);
      setSelectedAddressId("");
    } else {
      setShowNewAddressForm(false);
      setSelectedAddressId(addressId);
      const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
      if (selectedAddress) {
        setFormData(prev => ({
          ...prev,
          ...selectedAddress
        }));
      }
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate required address fields
      if (!formData.street || !formData.city || !formData.state || !formData.pincode) {
        toast({
          title: "Missing Address Information",
          description: "Please fill in all required address fields",
          variant: "destructive",
        });
        return;
      }

      // Create shipping address object
      const shippingAddress: CreateOrderInput['shippingAddress'] = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      };

      // Ensure cartItems exist
      if (!cartItems || cartItems.length === 0) {
        toast({
          title: "Empty Cart",
          description: "Your cart is empty. Please add some products first.",
          variant: "destructive",
        });
        return;
      }

      console.log('Form validation successful, submitting address:', shippingAddress);
      
      // Call the parent's onSuccess callback with shipping address
      // The parent component will handle payment initialization
      onSuccess(shippingAddress);
      
    } catch (error) {
      console.error('Form validation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process form",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handlePayment}>
      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
          <CardDescription>Select delivery address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {savedAddresses.length > 0 && (
            <div className="space-y-2">
              <Label>Saved Addresses</Label>
              <Select value={selectedAddressId} onValueChange={handleAddressSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an address" />
                </SelectTrigger>
                <SelectContent>
                  {savedAddresses.map(address => (
                    <SelectItem key={address.id} value={address.id}>
                      {address.street}, {address.city}, {address.state} - {address.pincode}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Address
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {(showNewAddressForm || savedAddresses.length === 0) && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pincode">PIN Code</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-[#138808] hover:bg-[#138808]/90"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay ₹{totalAmount}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default CheckoutForm;
