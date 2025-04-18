import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useConsumerCart } from '@/hooks/use-consumer-cart';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/types/product';
import { Vendor } from '@/types/vendor';
import { productService } from '@/services/product.service';

interface VendorProductsDialogProps {
  vendor: Vendor | null;
  onClose: () => void;
}

export function VendorProductsDialog({ vendor, onClose }: VendorProductsDialogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, isConsumer } = useAuth();
  const { addToCart } = useConsumerCart();

  useEffect(() => {
    const fetchVendorProducts = async () => {
      if (!vendor) return;
      
      try {
        setLoading(true);
        const vendorProducts = await productService.getVendorProducts(vendor._id);
        setProducts(vendorProducts);
      } catch (error) {
        console.error('Error fetching vendor products:', error);
        toast({
          title: "Error",
          description: "Failed to load vendor products",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVendorProducts();
  }, [vendor]);

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please sign in as a consumer to add items to cart",
        variant: "destructive",
      });
      onClose();
      navigate("/login", { state: { from: "/" } });
      return;
    }

    if (!isConsumer()) {
      toast({
        title: "Access Denied",
        description: "Only consumers can add items to cart",
        variant: "destructive",
      });
      return;
    }

    addToCart(product, 1);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  return (
    <Dialog open={!!vendor} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vendor?.businessName} Products</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#138808] border-t-transparent"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No products available from this vendor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {products.map((product) => (
              <div key={product._id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.images[0] || '/placeholder-product.png'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">₹{product.price}</span>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="bg-[#138808] hover:bg-[#138808]/90"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 