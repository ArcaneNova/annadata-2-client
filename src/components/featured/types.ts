
export interface ProductType {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  vendor: string;
  location: string;
  stock: number;
  isNew: boolean;
  isFeatured: boolean;
  discount: number;
  tags: string[];
}
