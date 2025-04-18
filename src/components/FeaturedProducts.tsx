
import { lazy, Suspense } from "react";
import { featuredProducts } from "./featured/ProductsData";
import FilterControls from "./featured/FilterControls";
import { useProductFiltering } from "./featured/useProductFiltering";
import { useCart } from "./featured/useCart";

// Lazy load the product grid component
const ProductGrid = lazy(() => import("./featured/ProductGrid"));

// Simple loading placeholder
const GridLoading = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-80 animate-pulse bg-gray-200 rounded-md"></div>
    ))}
  </div>
);

const FeaturedProducts = () => {
  const {
    filter,
    setFilter,
    sortBy,
    setSortBy,
    visibleProducts,
    displayCount,
    showFilters,
    setShowFilters,
    priceRange,
    setPriceRange,
    loadMore,
  } = useProductFiltering(featuredProducts);

  const { addToCart, getTotalItems } = useCart(featuredProducts);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
        />

        <Suspense fallback={<GridLoading />}>
          <ProductGrid
            visibleProducts={visibleProducts}
            displayCount={displayCount}
            addToCart={addToCart}
            loadMore={loadMore}
          />
        </Suspense>
      </div>
    </section>
  );
};

export default FeaturedProducts;
