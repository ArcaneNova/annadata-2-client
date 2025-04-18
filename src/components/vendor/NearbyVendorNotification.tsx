import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, MapPin, Store } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface NearbyVendorNotificationProps {
  vendor: {
    _id: string;
    name: string;
    businessName?: string;
    distance?: number;
  };
  onClose: () => void;
}

const NearbyVendorNotification = ({ vendor, onClose }: NearbyVendorNotificationProps) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-close notification after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow animation to complete
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleViewVendor = () => {
    navigate(`/consumer/nearby-vendors?vendorId=${vendor._id}`);
    onClose();
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <Card className="w-80 shadow-lg border-2 border-[#138808]/20">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <Store className="h-5 w-5 mr-2 text-[#138808]" />
              <span>Nearby Vendor!</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-base">{vendor.businessName || vendor.name}</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                <span>{vendor.distance ? `${(vendor.distance / 1000).toFixed(2)} km away` : 'Nearby'}</span>
              </div>
            </div>
            <Button 
              className="w-full bg-[#138808] hover:bg-[#138808]/90"
              onClick={handleViewVendor}
            >
              View Vendor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NearbyVendorNotification; 