import { Product } from './product';

export interface Vendor {
  _id: string;
  name: string;
  businessName: string;
  businessType: string;
  businessLocation: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  distance: number;
  averageRating: number;
  products: Product[];
  lastUpdate: number;
  isVerified?: boolean;
  isActive?: boolean;
} 