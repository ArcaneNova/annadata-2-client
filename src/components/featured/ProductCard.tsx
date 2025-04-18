import { memo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Eye, Tag, Clock } from "lucide-react";
import { Product } from "@/services/product.service";

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const ProductCard = memo(({ product, onProductClick, onAddToCart }: ProductCardProps) => {
  const imageUrl = product.images[0]?.url || "https://via.placeholder.com/400x300";
  const discount = product.basePrice && product.price < product.basePrice
    ? Math.round(((product.basePrice - product.price) / product.basePrice) * 100)
    : 0;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          loading="lazy"
        />
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </div>
        )}
        {product.isActive && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
            ACTIVE
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          <Button 
            size="icon" 
            variant="secondary" 
            className="rounded-full bg-white/80 hover:bg-white"
            onClick={() => onProductClick(product)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <span className="flex items-center text-yellow-500 font-medium text-sm">
            <Star className="w-4 h-4 fill-current mr-1" />
            {product.averageRating?.toFixed(1) || "New"} 
            {product.totalRatings > 0 && (
              <span className="text-gray-400 ml-1">({product.totalRatings})</span>
            )}
          </span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-col space-y-2">
          <div className="flex items-baseline gap-2">
            <p className="font-bold text-[#FF9933] text-lg">₹{product.price}</p>
            {product.basePrice && product.basePrice > product.price && (
              <p className="text-gray-400 line-through text-sm">₹{product.basePrice}</p>
            )}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Tag className="w-3 h-3 mr-1" />
            {product.seller.name} • {product.sellerType}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            {product.stock > 50 ? "In Stock" : product.stock > 10 ? "Limited Stock" : "Low Stock"}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button
          variant="outline"
          className="border-[#138808] text-[#138808] hover:bg-[#138808] hover:text-white flex-1"
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
        <Button 
          variant="ghost"
          onClick={() => onProductClick(product)}
        >
          Details
        </Button>
      </CardFooter>
    </Card>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;
