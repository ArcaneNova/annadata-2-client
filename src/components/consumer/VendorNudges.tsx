
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface Nudge {
  id: number;
  vendorName: string;
  product: string;
  price: number;
  discount: string;
}

interface VendorNudgesProps {
  nudges: Nudge[];
}

const VendorNudges = ({ nudges }: VendorNudgesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Nudges from Vendors</CardTitle>
        <CardDescription>Special offers from nearby vendors</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {nudges.map((nudge) => (
            <div key={nudge.id} className="p-4 rounded-lg border bg-gradient-to-r from-amber-50 to-amber-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{nudge.vendorName}</h4>
                <span className="text-sm font-medium text-green-600">
                  {nudge.discount}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <p className="text-gray-500">Product</p>
                  <p className="font-medium">{nudge.product}</p>
                </div>
                <div>
                  <p className="text-gray-500">Price</p>
                  <p className="font-medium">₹{nudge.price}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          ))}
          <Link to="/consumer/nearby-vendors">
            <Button className="w-full" variant="outline">
              <MapPin className="w-4 h-4 mr-2" />
              View All Nearby Vendors
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorNudges;
