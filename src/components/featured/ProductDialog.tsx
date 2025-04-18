import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Star, ShoppingCart, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  category: string;
  images: Array<{
    url: string;
    public_id: string;
  }>;
  averageRating: number;
  totalRatings: number;
}

interface Vendor {
  _id: string;
  name: string;
  businessName: string;
  businessType: string;
  businessLocation: {
    coordinates: [number, number];
    address: string;
  };
  distance: number;
  averageRating: number;
  products: Product[];
}

interface ProductDialogProps {
  vendor: Vendor | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDialog = ({ vendor, onClose, onAddToCart }: ProductDialogProps) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!vendor) return null;

  const handlePrevImage = () => {
    if (!selectedProduct) return;
    setSelectedImage((prev) => (prev === 0 ? selectedProduct.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!selectedProduct) return;
    setSelectedImage((prev) => (prev === selectedProduct.images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    if (quantity > selectedProduct.stock) {
      toast({
        title: "Error",
        description: "Quantity cannot exceed available stock",
        variant: "destructive",
      });
      return;
    }

    onAddToCart(selectedProduct, quantity);
    setSelectedProduct(null);
    setQuantity(1);
  };

  return (
    <Dialog open={!!vendor} onOpenChange={() => onClose()}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl p-6 mx-4">
          {/* Vendor Details */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{vendor?.businessName}</h2>
                <p className="text-muted-foreground">{vendor?.businessType}</p>
                <div className="flex items-center gap-2 mt-2">
                  <MapPin className="h-4 w-4 text-[#FF9933]" />
                  <span className="text-sm">{vendor?.businessLocation.address}</span>
                  <span className="text-sm text-muted-foreground">
                    ({(vendor?.distance || 0 / 1000).toFixed(1)} km away)
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span>{vendor?.averageRating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          {selectedProduct ? (
            // Product Details View
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Gallery */}
              <div className="relative">
                <img
                  src={selectedProduct.images[selectedImage].url}
                  alt={selectedProduct.name}
                  className="w-full h-[400px] object-cover rounded-lg"
                />
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevImage}
                    className="hover:bg-black/20"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextImage}
                    className="hover:bg-black/20"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  {selectedProduct.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-2 h-2 rounded-full ${
                        selectedImage === index ? "bg-primary" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className="flex flex-col">
                <Button
                  variant="ghost"
                  className="self-start mb-4"
                  onClick={() => {
                    setSelectedProduct(null);
                    setQuantity(1);
                  }}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Button>

                <h2 className="text-2xl font-bold mb-2">{selectedProduct.name}</h2>
                <div className="flex items-center gap-4 mb-4">
                  <p className="text-xl font-semibold">₹{selectedProduct.price}</p>
                  <Badge variant="secondary">
                    {selectedProduct.stock} {selectedProduct.unit} available
                  </Badge>
                </div>
                <p className="text-gray-600 mb-6">{selectedProduct.description}</p>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span>{selectedProduct.averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({selectedProduct.totalRatings} ratings)
                    </span>
                  </div>
                  <Badge>{selectedProduct.category}</Badge>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center gap-4 mb-4">
                    <Input
                      type="number"
                      min="1"
                      max={selectedProduct.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(selectedProduct.stock, parseInt(e.target.value) || 1)))}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">
                      Total: ₹{(selectedProduct.price * quantity).toFixed(2)}
                    </span>
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    className="w-full bg-[#FF9933] hover:bg-[#FF9933]/90"
                    disabled={selectedProduct.stock === 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {selectedProduct.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // Products Grid View
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {vendor.products.map((product) => (
                <div
                  key={product._id}
                  className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <p className="font-medium">₹{product.price}</p>
                      <Badge variant="secondary">
                        {product.stock} {product.unit}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}; 