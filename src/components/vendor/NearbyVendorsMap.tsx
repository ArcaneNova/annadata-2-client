import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import L from 'leaflet';

// Fix Leaflet marker icon issue with absolute URLs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: `${window.location.origin}/marker-icon-2x.png`,
  iconUrl: `${window.location.origin}/marker-icon.png`,
  shadowUrl: `${window.location.origin}/marker-shadow.png`,
});

// Create custom icons with absolute URLs
const vendorIcon = new L.Icon({
  iconUrl: `${window.location.origin}/vendor-marker.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const userIcon = new L.Icon({
  iconUrl: `${window.location.origin}/user-marker.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface Vendor {
  _id: string;
  name: string;
  businessName?: string;
  businessType?: string;
  businessLocation?: {
    type: string;
    coordinates: [number, number];
    address?: string;
  };
  distance?: number;
  averageRating?: number;
}

interface NearbyVendorsMapProps {
  vendors: Vendor[];
  currentLocation?: { lat: number; lng: number };
  onMarkerClick?: (vendor: Vendor) => void;
}

const NearbyVendorsMap = ({ vendors, currentLocation, onMarkerClick }: NearbyVendorsMapProps) => {
  const defaultLocation: [number, number] = [31.2447532, 75.7022453]; // Default to Phagwara
  const mapCenter: [number, number] = currentLocation 
    ? [currentLocation.lat, currentLocation.lng]
    : defaultLocation;
  
  const [loading, setLoading] = useState(false);

  // Log received vendors for debugging
  useEffect(() => {
    console.log(`NearbyVendorsMap received ${vendors.length} vendors:`, vendors);
    vendors.forEach((vendor, index) => {
      console.log(`Map vendor ${index + 1}:`, vendor._id, vendor.name);
      if (vendor.businessLocation) {
        console.log(`Map vendor ${index + 1} location:`, 
          vendor.businessLocation.coordinates,
          vendor.businessLocation.type);
      } else {
        console.warn(`Map vendor ${index + 1} has no location data`);
      }
    });
  }, [vendors]);

  // Create map content as a regular component to avoid Context issues
  const MapContent = () => {
    console.log('Rendering MapContent with vendors:', vendors.length);
    const validVendors = vendors.filter(v => 
      v.businessLocation && 
      Array.isArray(v.businessLocation.coordinates) && 
      v.businessLocation.coordinates.length === 2
    );
    console.log(`Found ${validVendors.length} valid vendors with coordinates`);
    
    return (
      <>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}
        
        {/* Vendor markers */}
        {validVendors.map((vendor) => {
          console.log(`Adding marker for vendor ${vendor._id} at position:`, vendor.businessLocation!.coordinates);
          return (
            <Marker
              key={vendor._id}
              position={vendor.businessLocation!.coordinates}
              icon={vendorIcon}
              eventHandlers={{
                click: () => {
                  console.log('Vendor marker clicked:', vendor._id);
                  if (onMarkerClick) onMarkerClick(vendor);
                },
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{vendor.businessName || vendor.name}</h3>
                  <p className="text-sm">{vendor.businessType}</p>
                  <p className="text-sm text-gray-600">
                    {vendor.distance ? `${(vendor.distance / 1000).toFixed(1)} km away` : 'Distance unknown'}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#138808]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nearby Vendors</CardTitle>
        <CardDescription>
          Find vendors in your area
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] relative">
          {typeof window !== 'undefined' && (
            <MapContainer
              center={mapCenter}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
            >
              <MapContent />
            </MapContainer>
          )}
          
          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white p-2 rounded-md shadow-md text-xs">
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span>Your Location</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>Vendors</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NearbyVendorsMap;
