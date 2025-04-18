
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, ArrowRight, Star, ShoppingCart, MapPin, Tag, ChevronDown, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

// Enhanced product data with more details
const products = [
  {
    id: 1,
    name: "Premium Organic Rice",
    description: "Sustainably grown by local farmers using traditional methods",
    price: 120,
    originalPrice: 140,
    rating: 4.8,
    reviews: 156,
    category: "grains",
    tags: ["organic", "sustainable", "local"],
    image: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?q=80&w=2070&auto=format&fit=crop",
    vendor: {
      name: "Green Earth Farms",
      location: "Bhavnagar, Gujarat",
      distance: 5.2,
      rating: 4.9
    },
    stock: 250,
    isNew: false,
    isFeatured: true,
    discount: 14
  },
  {
    id: 2,
    name: "Fresh Seasonal Vegetables",
    description: "Farm-to-table vegetables harvested daily",
    price: 80,
    originalPrice: 90,
    rating: 4.7,
    reviews: 124,
    category: "vegetables",
    tags: ["fresh", "seasonal", "farm-to-table"],
    image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?q=80&w=2069&auto=format&fit=crop",
    vendor: {
      name: "Lakshmi Reddy Farms",
      location: "Vijayawada, Andhra Pradesh",
      distance: 8.7,
      rating: 4.6
    },
    stock: 85,
    isNew: true,
    isFeatured: true,
    discount: 11
  },
  {
    id: 3,
    name: "Pure Honey",
    description: "Raw, unfiltered honey from forest beekeepers",
    price: 350,
    originalPrice: 400,
    rating: 5.0,
    reviews: 78,
    category: "dairy",
    tags: ["raw", "natural", "forest-harvested"],
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?q=80&w=2080&auto=format&fit=crop",
    vendor: {
      name: "Himalayan Bee Farm",
      location: "Uttarkashi, Uttarakhand",
      distance: 12.3,
      rating: 4.9
    },
    stock: 35,
    isNew: false,
    isFeatured: true,
    discount: 12
  },
  {
    id: 4,
    name: "Artisanal Cheese",
    description: "Handcrafted cheese from grass-fed cows",
    price: 280,
    originalPrice: 320,
    rating: 4.6,
    reviews: 92,
    category: "dairy",
    tags: ["artisanal", "grass-fed", "handcrafted"],
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?q=80&w=2073&auto=format&fit=crop",
    vendor: {
      name: "Mountain Dairy",
      location: "Ooty, Tamil Nadu",
      distance: 15.1,
      rating: 4.7
    },
    stock: 42,
    isNew: false,
    isFeatured: false,
    discount: 12
  },
  {
    id: 5,
    name: "Organic Wheat Flour",
    description: "Stone-ground flour from heritage wheat varieties",
    price: 65,
    originalPrice: 80,
    rating: 4.5,
    reviews: 112,
    category: "grains",
    tags: ["organic", "stone-ground", "heritage"],
    image: "https://images.unsplash.com/photo-1568718247028-46f14cfb7533?q=80&w=2070&auto=format&fit=crop",
    vendor: {
      name: "Punjab Grain Collective",
      location: "Amritsar, Punjab",
      distance: 15.8,
      rating: 4.5
    },
    stock: 180,
    isNew: false,
    isFeatured: true,
    discount: 18
  },
  {
    id: 6,
    name: "Fresh Fruit Basket",
    description: "Seasonal mixed fruits from local orchards",
    price: 250,
    originalPrice: 300,
    rating: 4.9,
    reviews: 67,
    category: "fruits",
    tags: ["seasonal", "mixed", "gift-ready"],
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?q=80&w=2070&auto=format&fit=crop",
    vendor: {
      name: "Himalayan Orchard",
      location: "Shimla, Himachal Pradesh",
      distance: 18.5,
      rating: 4.8
    },
    stock: 25,
    isNew: true,
    isFeatured: true,
    discount: 16
  },
  {
    id: 7,
    name: "Organic Pulses Mix",
    description: "Protein-rich mix of locally grown pulses",
    price: 180,
    originalPrice: 210,
    rating: 4.7,
    reviews: 88,
    category: "grains",
    tags: ["organic", "protein-rich", "mixed"],
    image: "https://images.unsplash.com/photo-1515543904379-3d757afe93e1?q=80&w=2070&auto=format&fit=crop",
    vendor: {
      name: "Organic Harvest Co-op",
      location: "Indore, Madhya Pradesh",
      distance: 10.2,
      rating: 4.6
    },
    stock: 75,
    isNew: false,
    isFeatured: false,
    discount: 14
  },
  {
    id: 8,
    name: "Farm-Fresh Eggs",
    description: "Free-range eggs from pasture-raised hens",
    price: 120,
    originalPrice: 140,
    rating: 4.8,
    reviews: 105,
    category: "dairy",
    tags: ["free-range", "pasture-raised", "high-protein"],
    image: "https://images.unsplash.com/photo-1598965402089-897e8f3b4133?q=80&w=2069&auto=format&fit=crop",
    vendor: {
      name: "Happy Hen Farms",
      location: "Coimbatore, Tamil Nadu",
      distance: 7.5,
      rating: 4.8
    },
    stock: 90,
    isNew: false,
    isFeatured: true,
    discount: 14
  },
];

// Available categories for filtering
const categories = [
  { id: "all", label: "All Products" },
  { id: "vegetables", label: "Vegetables" },
  { id: "fruits", label: "Fruits" },
  { id: "grains", label: "Grains & Cereals" },
  { id: "dairy", label: "Dairy & Protein" },
];

const ProductShowcase = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [displayCount, setDisplayCount] = useState(4);
  const productsRef = useRef<HTMLDivElement>(null);

  // Filter and sort products when category or sorting option changes
  useEffect(() => {
    let filtered = [...products];
    
    // Apply category filter
    if (activeCategory !== "all") {
      filtered = filtered.filter((product) => product.category === activeCategory);
    }
    
    // Apply sorting
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "discount") {
      filtered.sort((a, b) => b.discount - a.discount);
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => (a.isNew === b.isNew) ? 0 : a.isNew ? -1 : 1);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else {
      // Default: popular/featured
      filtered.sort((a, b) => (a.isFeatured === b.isFeatured) ? 0 : a.isFeatured ? -1 : 1);
    }
    
    setFilteredProducts(filtered);

    // Add reveal animation to products after filtering
    const timer = setTimeout(() => {
      const productElements = productsRef.current?.querySelectorAll(".product-card");
      productElements?.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add("active");
        }, index * 100);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [activeCategory, sortBy]);

  const addToCart = (productId: number) => {
    setCart(prevCart => ({
      ...prevCart,
      [productId]: (prevCart[productId] || 0) + 1,
    }));

    // Find the product
    const product = products.find(p => p.id === productId);
    
    toast({
      title: "Added to Cart",
      description: `${product?.name} has been added to your cart.`,
    });
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const loadMore = () => {
    setDisplayCount(prev => 
      prev + 4 > filteredProducts.length ? filteredProducts.length : prev + 4
    );
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 reveal reveal-up">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Featured Products</h2>
          <p className="text-lg text-gray-600">
            Discover premium quality farm-fresh products directly from our network of farmers
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-10">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-[#138808] text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {category.id === "all" ? (
                  <span className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    {category.label}
                  </span>
                ) : (
                  category.label
                )}
              </button>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center">
              <p className="text-sm text-gray-500">
                Showing {Math.min(displayCount, filteredProducts.length)} of {filteredProducts.length} products
              </p>
            </div>
            
            <div className="flex gap-2 items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
                className="gap-1"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              
              <div className="relative">
                <select 
                  className="appearance-none bg-white border rounded-md px-4 py-2 pr-8 text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="discount">Biggest Discount</option>
                  <option value="newest">Newest</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
              </div>
              
              {getTotalItems() > 0 && (
                <Link to="/checkout">
                  <Button className="bg-[#138808] hover:bg-[#138808]/90">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart ({getTotalItems()})
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          {showFilters && (
            <div className="bg-white p-4 rounded-md shadow-sm mt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Price Range</h3>
                  <div className="flex items-center gap-2">
                    <input 
                      type="range" 
                      min="0" 
                      max="400" 
                      className="flex-grow"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>₹0</span>
                    <span>₹400</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Product Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {["organic", "fresh", "seasonal", "local", "artisanal", "sustainable"].map(tag => (
                      <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-gray-100">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Vendor Ratings</h3>
                  <div className="flex flex-col gap-1 text-sm">
                    {[5, 4, 3].map(rating => (
                      <label key={rating} className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                            />
                          ))}
                          <span className="ml-1">& up</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button size="sm" variant="outline" className="mr-2">Reset</Button>
                <Button size="sm" className="bg-[#138808]">Apply Filters</Button>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div
          ref={productsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {filteredProducts.slice(0, displayCount).map((product) => (
            <Card
              key={product.id}
              className="product-card opacity-0 transform translate-y-4 transition-all duration-500 overflow-hidden hover:shadow-xl"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  loading="lazy"
                />
                {product.discount > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{product.discount}%
                  </div>
                )}
                {product.isNew && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                    NEW
                  </div>
                )}
                <div className="absolute bottom-2 right-2">
                  <Button size="icon" variant="secondary" className="rounded-full bg-white/80 hover:bg-white">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardHeader className="p-4 pb-0">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <span className="flex items-center text-yellow-500 text-sm font-medium">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    {product.rating} <span className="text-gray-400 text-xs ml-1">({product.reviews})</span>
                  </span>
                </div>
                <CardDescription className="text-sm line-clamp-2">{product.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-2 px-4">
                <div className="flex flex-col space-y-2 mt-2">
                  <div className="flex items-baseline gap-2">
                    <p className="font-semibold text-[#FF9933]">₹{product.price}</p>
                    {product.originalPrice > product.price && (
                      <p className="text-gray-400 line-through text-sm">₹{product.originalPrice}</p>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Tag className="w-3 h-3 mr-1" />
                    {product.vendor.name}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    {product.vendor.location} • {product.vendor.distance} km
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button
                  variant="outline"
                  className="border-[#138808] text-[#138808] hover:bg-[#138808] hover:text-white flex-1"
                  onClick={() => addToCart(product.id)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Link to={`/products/${product.id}`} className="ml-2">
                  <Button 
                    variant="ghost"
                    className="group"
                  >
                    Details
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        {displayCount < filteredProducts.length && (
          <div className="mt-8 text-center">
            <Button 
              onClick={loadMore} 
              variant="outline"
            >
              Load More Products
            </Button>
          </div>
        )}

        {/* View All Products Button */}
        <div className="mt-12 text-center">
          <Link to="/consumer/dashboard">
            <Button className="bg-[#FF9933] hover:bg-[#FF9933]/90 text-white">
              Browse All Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
