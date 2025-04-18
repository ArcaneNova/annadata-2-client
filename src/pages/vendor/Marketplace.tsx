import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, Search, Filter, ShoppingCart, MapPin, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Product } from "@/services/product.service";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";

interface FilterState {
  category: string;
  minPrice: string;
  maxPrice: string;
  sort: string;
  order: 'asc' | 'desc';
  search: string;
}

const VendorMarketplace = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    minPrice: "",
    maxPrice: "",
    sort: "createdAt",
    order: "desc",
    search: ""
  });
  const [cart, setCart] = useState<{id: string, quantity: number}[]>([]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort: filters.sort,
        order: filters.order,
        sellerType: 'farmer',
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/public?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, itemsPerPage, filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleAddToCart = (productId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { id: productId, quantity: 1 }];
      }
    });
    
    toast({
      title: "Added to cart",
      description: "The product has been added to your cart.",
    });
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Farmer Marketplace</h1>
        <p className="text-muted-foreground">
          Source quality products directly from local farmers
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Advanced Filters</CardTitle>
          <CardDescription>Refine your product search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Search products..."
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="vegetables">Vegetables</SelectItem>
                  <SelectItem value="fruits">Fruits</SelectItem>
                  <SelectItem value="crops">Crops</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Price Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                  placeholder="Min"
                />
                <Input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                  placeholder="Max"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select
                value={filters.sort}
                onValueChange={(value) => handleFilterChange("sort", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Added</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="averageRating">Rating</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#138808]"></div>
            <p className="mt-4 text-sm text-gray-500">Loading products...</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product._id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={product.images[0]?.url || "https://via.placeholder.com/400x300"}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  {product.averageRating && (
                    <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs text-yellow-700">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {product.averageRating.toFixed(1)}
                    </div>
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {product.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium text-[#FF9933]">₹{product.price}/{product.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Available</p>
                    <p className="font-medium">{product.stock} {product.unit}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Link to={`/vendor/products/${product._id}`} className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full"
                  >
                    View Details
                  </Button>
                </Link>
                <Button
                  className="flex-1 bg-[#138808] hover:bg-[#138808]/90"
                  onClick={() => handleAddToCart(product._id)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={itemsPerPage.toString()}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Items per page
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VendorMarketplace;
