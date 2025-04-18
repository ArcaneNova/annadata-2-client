import { Vendor } from '@/types/vendor';
import { formatDistance } from '@/utils/format';

interface VendorCardProps {
  vendor: Vendor;
  onClick?: () => void;
}

const VendorCard = ({ vendor, onClick }: VendorCardProps) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold">{vendor.businessName}</h3>
      <p className="text-gray-600">{vendor.businessType}</p>
      <p className="text-sm text-gray-500">{vendor.businessLocation.address}</p>
      {vendor.distance !== undefined && (
        <p className="text-sm text-blue-600">{formatDistance(vendor.distance)}</p>
      )}
      <div className="mt-2">
        <span className="text-yellow-500">★</span>
        <span className="ml-1">{vendor.averageRating.toFixed(1)}</span>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        {vendor.products.length} products available
      </p>
    </div>
  );
};

export default VendorCard; 