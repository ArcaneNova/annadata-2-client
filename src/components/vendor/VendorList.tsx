import React, { useEffect, useState, useCallback } from 'react';
import { socketService } from '@/services/socket.service';
import { Vendor } from '@/types/vendor';
import { useAuth } from '@/hooks/use-auth';
import { VendorProductsDialog } from './VendorProductsDialog';
import { Store, MapPin, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const VendorList = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState(5000); // 5km default
  const { isAuthenticated } = useAuth();

  // Memoize the vendor update handler
  const handleVendorUpdate = useCallback((updatedVendors: Vendor[]) => {
    console.log('Handling vendor update in VendorList:', updatedVendors);
    
    // Always update vendors state, even if empty
    const sortedVendors = (updatedVendors || [])
      .filter(vendor => 
        vendor && 
        vendor._id && 
        vendor.businessLocation?.coordinates &&
        Array.isArray(vendor.businessLocation.coordinates) &&
        vendor.businessLocation.coordinates.length === 2
      )
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    console.log('Setting vendors state with sorted vendors:', sortedVendors);
    setVendors(sortedVendors);
    setLoading(false);
  }, []);

  // Initialize socket and location tracking
  useEffect(() => {
    let cleanup: (() => void) | null = null;
    let watchId: number | null = null;
    let mounted = true;

    const initializeLocation = async () => {
      try {
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported by your browser');
        }

        if (!isAuthenticated()) {
          throw new Error('Please sign in to see nearby vendors');
        }

        // Initialize socket connection first
        socketService.connect();

        // Set up vendor updates listener before requesting location
        cleanup = socketService.onNearbyVendorsUpdate((updatedVendors) => {
          if (mounted) {
            handleVendorUpdate(updatedVendors);
          }
        });

        // Get initial position
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        if (!mounted) return;

        const { latitude, longitude } = position.coords;
        console.log('Initial user location:', { latitude, longitude });
        setUserLocation([latitude, longitude]);

        // Request nearby vendors with initial position
        socketService.requestNearbyVendors({
          lat: latitude,
          lng: longitude,
          radius: searchRadius
        });

        // Update consumer location
        socketService.updateConsumerLocation({
          lat: latitude,
          lng: longitude
        });

        // Watch for location changes
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            if (!mounted) return;
            
            const { latitude: lat, longitude: lng } = pos.coords;
            setUserLocation([lat, lng]);
            
            if (socketService.isConnected()) {
              console.log('Requesting vendors for new location:', { lat, lng });
              socketService.requestNearbyVendors({
                lat,
                lng,
                radius: searchRadius
              });

              socketService.updateConsumerLocation({
                lat,
                lng
              });
            }
          },
          (err) => {
            console.error('Error watching position:', err);
            if (mounted) {
              toast({
                title: "Location Error",
                description: "Error tracking your location",
                variant: "destructive",
              });
            }
          },
          {
            enableHighAccuracy: true,
            maximumAge: 30000,
            timeout: 27000
          }
        );

      } catch (err) {
        console.error('Error initializing:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setLoading(false);
        }
      }
    };

    initializeLocation();

    // Cleanup function
    return () => {
      console.log('Cleaning up VendorList component');
      mounted = false;
      if (cleanup) {
        cleanup();
      }
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      socketService.disconnect();
    };
  }, [searchRadius, isAuthenticated, handleVendorUpdate]);

  // Effect to handle search radius changes
  useEffect(() => {
    if (userLocation && socketService.isConnected()) {
      console.log('Search radius changed, requesting vendors with new radius:', searchRadius);
      socketService.requestNearbyVendors({
        lat: userLocation[0],
        lng: userLocation[1],
        radius: searchRadius
      });
    }
  }, [searchRadius, userLocation]);

  // Render vendor card
  const renderVendorCard = (vendor: Vendor) => (
    <div
      key={vendor._id}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => setSelectedVendor(vendor)}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{vendor.businessName}</h3>
            <p className="text-gray-600 text-sm">{vendor.businessType}</p>
          </div>
          <Store className="h-5 w-5 text-[#FF9933]" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-gray-600 line-clamp-2">{vendor.businessLocation.address}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>{(vendor.distance / 1000).toFixed(1)} km away</span>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span>{vendor.averageRating?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm font-medium">
              {vendor.products?.length || 0} products available
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#138808] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 font-semibold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#138808] text-white rounded-md hover:bg-[#138808]/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Nearby Vendors</h2>
          <p className="text-gray-600">Found {vendors.length} vendors in your area</p>
        </div>
        <select
          value={searchRadius}
          onChange={(e) => setSearchRadius(Number(e.target.value))}
          className="border rounded-md px-3 py-1.5 text-sm"
        >
          <option value={1000}>1 km radius</option>
          <option value={2000}>2 km radius</option>
          <option value={5000}>5 km radius</option>
          <option value={10000}>10 km radius</option>
        </select>
      </div>

      {vendors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Store className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No vendors found</h3>
          <p className="mt-2 text-gray-500">
            Try increasing the search radius or check back later
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vendors.map(renderVendorCard)}
        </div>
      )}

      {selectedVendor && (
        <VendorProductsDialog
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
        />
      )}
    </div>
  );
};

export default VendorList; 