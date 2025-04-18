import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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

const consumerIcon = new L.Icon({
  iconUrl: `${window.location.origin}/consumer-marker.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface Consumer {
  _id: string;
  name: string;
  location: {
    coordinates: [number, number];
  };
  distance: number;
}

interface NearbyConsumersMapProps {
  consumers?: Consumer[];
  vendorLocation: {
    lat: number;
    lng: number;
  };
}

const NearbyConsumersMap = ({ consumers = [], vendorLocation }: NearbyConsumersMapProps) => {
  const [loading, setLoading] = useState(false);
  const currentLocation: [number, number] = [vendorLocation.lat, vendorLocation.lng];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#138808]" />
        </CardContent>
      </Card>
    );
  }

  // Create map content as a regular component to avoid Context issues
  const MapContent = () => (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Vendor's location marker */}
      <Marker position={currentLocation} icon={vendorIcon}>
        <Popup>Your Location</Popup>
      </Marker>

      {/* Consumer markers */}
      {consumers.map((consumer) => (
        <Marker
          key={consumer._id}
          position={[
            consumer.location.coordinates[0],
            consumer.location.coordinates[1]
          ]}
          icon={consumerIcon}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">Consumer</h3>
              <p className="text-sm text-gray-600">
                {(consumer.distance / 1000).toFixed(1)} km away
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[#FF9933]" />
          Nearby Consumers Map
        </CardTitle>
        <CardDescription>
          Track consumers viewing your products
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[400px]">
          {typeof window !== 'undefined' && (
            <MapContainer
              center={currentLocation}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <MapContent />
            </MapContainer>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white p-2 rounded-md shadow-md text-xs">
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full bg-[#138808] mr-2"></div>
              <span>Your Location</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-no-repeat bg-contain mr-2" style={{ backgroundImage: "url('/consumer-marker.png')" }}></div>
              <span>Consumer</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NearbyConsumersMap; 