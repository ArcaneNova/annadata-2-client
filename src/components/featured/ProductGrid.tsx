import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { Product } from "@/services/product.service";

interface ProductGridProps {
  products: Product[];
  displayCount: number;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  loadMore: () => void;
}

const ProductGrid = ({ 
  products, 
  displayCount, 
  onProductClick,
  onAddToCart,
  loadMore 
}: ProductGridProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, displayCount).map((product) => (
          <ProductCard 
            key={product._id} 
            product={product}
            onProductClick={onProductClick}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {displayCount < products.length && (
        <div className="mt-10 text-center">
          <Button 
            onClick={loadMore} 
            variant="outline"
            className="mx-auto"
          >
            Load More Products
          </Button>
        </div>
      )}

      <div className="mt-10 text-center">
        <Link to="/marketplace">
          <Button className="bg-[#FF9933] hover:bg-[#FF9933]/90 text-white">
            Browse All Products
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </>
  );
};

export default ProductGrid;
