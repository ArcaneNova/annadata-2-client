export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  category: string;
  images: Array<{ url: string; public_id: string }>;
  seller: string;
  sellerType: string;
  marginPercentage: number;
  basePrice: number;
  averageRating: number;
  totalRatings: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
} 