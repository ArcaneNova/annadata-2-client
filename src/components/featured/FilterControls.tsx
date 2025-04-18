import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, ChevronDown, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

interface FilterControlsProps {
  filter: string | null;
  setFilter: (filter: string | null) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  showFilters: boolean;
  setShowFilters: (showFilters: boolean) => void;
  priceRange: [number, number];
  setPriceRange: (priceRange: [number, number]) => void;
  totalCartItems: number;
  onCartClick: () => void;
  onClearCart?: () => void;
}

const CATEGORIES = [
  'vegetables',
  'fruits',
  'crops',
  'dairy',
  'groceries',
  'snacks',
  'beverages',
  'other'
];

const FilterControls = ({
  filter,
  setFilter,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  priceRange,
  setPriceRange,
  totalCartItems,
  onCartClick,
  onClearCart
}: FilterControlsProps) => {
  return (
    <div className="flex flex-col gap-4 mb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
          <p className="text-lg text-gray-600">
            Explore our best-selling farm-fresh products
          </p>
        </div>
        {totalCartItems > 0 && (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="text-red-500 border-red-200 hover:bg-red-50"
              onClick={onClearCart}
            >
              Clear Cart
            </Button>
            <Button 
              className="bg-[#138808] hover:bg-[#138808]/90"
              onClick={onCartClick}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart ({totalCartItems})
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={filter === null ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter(null)}
            className={filter === null ? "bg-[#138808]" : ""}
          >
            All
          </Button>
          {CATEGORIES.map(category => (
            <Button 
              key={category}
              variant={filter === category ? "default" : "outline"} 
              size="sm" 
              onClick={() => setFilter(category)}
              className={filter === category ? "bg-[#138808]" : ""}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
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
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
          </div>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-md mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Price Range</h3>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  min="0"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="w-24 px-2 py-1 border rounded"
                />
                <span>to</span>
                <input 
                  type="number"
                  min="0"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 0])}
                  className="w-24 px-2 py-1 border rounded"
                />
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Product Tags</h3>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="cursor-pointer">organic</Badge>
                <Badge variant="outline" className="cursor-pointer">fresh</Badge>
                <Badge variant="outline" className="cursor-pointer">local</Badge>
                <Badge variant="outline" className="cursor-pointer">seasonal</Badge>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              size="sm" 
              variant="outline" 
              className="mr-2"
              onClick={() => {
                setFilter(null);
                setSortBy("featured");
                setPriceRange([0, 10000]);
              }}
            >
              Reset
            </Button>
            <Button 
              size="sm" 
              className="bg-[#138808]"
              onClick={() => setShowFilters(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;
