import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  unit: string;
  images: Array<{
    url: string;
    public_id: string;
  }>;
  seller: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
  getVendorId: () => string | null;
}

export const useConsumerCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (product: Product, quantity: number) => {
        const items = get().items;
        
        const existingItem = items.find(item => item._id === product._id);
        
        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          if (newQuantity > product.stock) {
            toast({
              title: "Error",
              description: "Cannot exceed available stock",
              variant: "destructive",
            });
            return;
          }
          
          set({
            items: items.map(item =>
              item._id === product._id
                ? { ...item, quantity: newQuantity }
                : item
            ),
          });
        } else {
          if (quantity > product.stock) {
            toast({
              title: "Error",
              description: "Cannot exceed available stock",
              variant: "destructive",
            });
            return;
          }
          
          set({ items: [...items, { ...product, quantity }] });
        }
        
        toast({
          title: "Success",
          description: "Product added to cart",
        });
      },
      
      removeFromCart: (productId: string) => {
        set({ items: get().items.filter(item => item._id !== productId) });
        toast({
          title: "Success",
          description: "Product removed from cart",
        });
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        const items = get().items;
        const item = items.find(item => item._id === productId);
        
        if (!item) return;
        
        if (quantity > item.stock) {
          toast({
            title: "Error",
            description: "Cannot exceed available stock",
            variant: "destructive",
          });
          return;
        }
        
        if (quantity < 1) {
          get().removeFromCart(productId);
          return;
        }
        
        set({
          items: items.map(item =>
            item._id === productId ? { ...item, quantity } : item
          ),
        });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        return get().items.reduce(
          (total, item) => total + item.quantity,
          0
        );
      },

      getVendorId: () => {
        const items = get().items;
        return items.length > 0 ? items[0].seller : null;
      },
    }),
    {
      name: 'consumer-cart',
    }
  )
);
