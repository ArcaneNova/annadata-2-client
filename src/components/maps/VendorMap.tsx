import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import L from 'leaflet';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

// Custom marker icons
const vendorIcon = new L.Icon({
  iconUrl: '/vendor-marker.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const userIcon = new L.Icon({
  iconUrl: '/user-marker.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface Vendor {
  _id: string;
  businessName: string;
  businessType: string;
  location: {
    coordinates: [number, number];
    address?: string;
  };
  distance: number;
  averageRating: number;
  products: Array<{
    _id: string;
    name: string;
    price: number;
  }>;
}

interface VendorMapProps {
  initialVendors: Vendor[];
  userLocation: { lat: number; lng: number };
  onVendorSelect?: (vendor: Vendor) => void;
}

// Component to handle map center updates
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const VendorMap = ({ initialVendors, userLocation, onVendorSelect }: VendorMapProps) => {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    setVendors(initialVendors);
  }, [initialVendors]);

  const handleVendorClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    if (onVendorSelect) {
      onVendorSelect(vendor);
    }
  };

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        <Marker 
          position={[userLocation.lat, userLocation.lng]}
          icon={userIcon}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-semibold">Your Location</h3>
            </div>
          </Popup>
        </Marker>

        {/* Vendor markers */}
        {vendors.map((vendor) => (
          <Marker
            key={vendor._id}
            position={[vendor.location.coordinates[1], vendor.location.coordinates[0]]}
            icon={vendorIcon}
            eventHandlers={{
              click: () => handleVendorClick(vendor)
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-lg mb-1">{vendor.businessName}</h3>
                <p className="text-sm text-gray-600 mb-2">{vendor.businessType}</p>
                <div className="flex items-center gap-2 text-sm mb-2">
                  <span>⭐ {vendor.averageRating.toFixed(1)}</span>
                  <span>•</span>
                  <span>{vendor.distance.toFixed(1)} km away</span>
                </div>
                {vendor.location.address && (
                  <p className="text-sm text-gray-600 mb-3">{vendor.location.address}</p>
                )}
                <button
                  onClick={() => handleVendorClick(vendor)}
                  className="w-full px-3 py-1.5 bg-[#138808] text-white rounded-md text-sm hover:bg-[#138808]/90 transition-colors"
                >
                  View Products
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapUpdater center={[userLocation.lat, userLocation.lng]} />
      </MapContainer>
    </div>
  );
};

export default VendorMap; 