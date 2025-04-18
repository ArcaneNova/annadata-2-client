import { useState, useEffect } from "react";
import { productService } from "@/services/product.service";
import { useConsumerCart } from "@/hooks/use-consumer-cart";
import { useAuth } from "@/hooks/use-auth";
import FilterControls from "./FilterControls";
import ProductGrid from "./ProductGrid";
import { ProductDialog } from "./ProductDialog";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isConsumer } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filter, setFilter] = useState(null);
  const [sortBy, setSortBy] = useState("featured");
  const [displayCount, setDisplayCount] = useState(8);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const { addToCart, getTotalItems } = useConsumerCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await productService.getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to cart",
        variant: "destructive",
      });
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
  };

  const handleCartClick = () => {
    if (!isAuthenticated()) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to view cart",
        variant: "destructive",
      });
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    if (!isConsumer()) {
      toast({
        title: "Access Denied",
        description: "Only consumers can access the cart",
        variant: "destructive",
      });
      return;
    }

    navigate("/checkout");
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const filteredProducts = products
    .filter(product => !filter || product.category === filter)
    .filter(product => product.price >= priceRange[0] && product.price <= priceRange[1])
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return (b.averageRating || 0) - (a.averageRating || 0);
        default:
          return 0;
      }
    });

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 8, filteredProducts.length));
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <FilterControls
        filter={filter}
        setFilter={setFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        totalCartItems={getTotalItems()}
        onCartClick={handleCartClick}
      />

      <ProductGrid
        products={filteredProducts}
        displayCount={displayCount}
        onProductClick={handleProductClick}
        onAddToCart={handleAddToCart}
        loadMore={loadMore}
      />

      {selectedProduct && (
        <ProductDialog
          vendor={null}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(product, quantity) => handleAddToCart(product)}
        />
      )}
    </div>
  );
};

export default FeaturedProducts; 