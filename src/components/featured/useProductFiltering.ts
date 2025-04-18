
import { useState, useEffect } from "react";
import { ProductType } from "./types";

export const useProductFiltering = (products: ProductType[]) => {
  const [filter, setFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [visibleProducts, setVisibleProducts] = useState(products);
  const [displayCount, setDisplayCount] = useState(4); // Initially show 4 products
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  
  useEffect(() => {
    let filtered = products;
    
    // Apply category filter
    if (filter) {
      filtered = filtered.filter(product => product.category === filter);
    }
    
    // Apply sorting
    if (sortBy === "price-low") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "discount") {
      filtered = [...filtered].sort((a, b) => b.discount - a.discount);
    } else if (sortBy === "newest") {
      filtered = [...filtered].sort((a, b) => (a.isNew === b.isNew) ? 0 : a.isNew ? -1 : 1);
    } else {
      // Default: featured
      filtered = [...filtered].sort((a, b) => (a.isFeatured === b.isFeatured) ? 0 : a.isFeatured ? -1 : 1);
    }
    
    // Apply price range filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    setVisibleProducts(filtered);
  }, [filter, sortBy, priceRange, products]);

  const loadMore = () => {
    setDisplayCount(prev => 
      prev + 4 > visibleProducts.length ? visibleProducts.length : prev + 4
    );
  };

  return {
    filter,
    setFilter,
    sortBy,
    setSortBy,
    visibleProducts,
    displayCount,
    setDisplayCount,
    showFilters,
    setShowFilters,
    priceRange,
    setPriceRange,
    loadMore,
  };
};
