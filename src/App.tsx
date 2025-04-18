import { Suspense, lazy, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import AppNavbar from "./components/AppNavbar";
import EnhancedFooter from "./components/EnhancedFooter";
import KrishiMitra from "./components/KrishiMitra";
import VendorAnalytics from "./pages/vendor/VendorAnalytics";
import VendorProducts from "./pages/vendor/VendorProducts";
import ProtectedRoute from "./components/ProtectedRoute";
import axios from 'axios';

// Lazy load pages to improve initial load time
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const FarmerDashboard = lazy(() => import("./pages/dashboards/FarmerDashboard"));
const VendorDashboard = lazy(() => import("./pages/dashboards/VendorDashboard"));
const ConsumerDashboard = lazy(() => import("./pages/dashboards/ConsumerDashboard"));
const MarketAnalytics = lazy(() => import("./pages/dashboards/MarketAnalytics"));
const ManageProducts = lazy(() => import("./pages/farmer/ManageProducts"));
const Marketplace = lazy(() => import("./pages/vendor/Marketplace"));
const NearbyVendors = lazy(() => import("./pages/consumer/NearbyVendors"));
const Checkout = lazy(() => import("./pages/checkout/Checkout"));
const CropHealthDashboard = lazy(() => import("./pages/agriculture/CropHealthDashboard"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const FeaturedProducts = lazy(() => import("./components/featured/FeaturedProducts"));
const VendorGrid = lazy(() => import("./components/featured/VendorGrid"));
const VendorExport = lazy(() => import("./pages/vendor/VendorExport"));
const FarmerMarketplace = lazy(() => import("./pages/vendor/FarmerMarketplace"));
const VendorOrders = lazy(() => import("./pages/vendor/VendorOrders"));

// Add a loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#138808] border-t-transparent"></div>
  </div>
);

// Layout component to handle logic for showing/hiding navbar and footer
const AppLayout = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate checking if resources are loaded
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Determine if the current route is an auth page to hide navbar/footer
  const isAuthRoute = location.pathname === "/login" || 
                     location.pathname === "/register" || 
                     location.pathname === "/forgot-password";
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="bg-[#F2FCE2] min-h-screen">
      {!isAuthRoute && <AppNavbar />}
      <main>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<VendorGrid />} />
            <Route path="/featured" element={<FeaturedProducts />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard/farmer" element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <FarmerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/vendor" element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/consumer" element={
              <ProtectedRoute allowedRoles={["consumer"]}>
                <ConsumerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/analytics" element={<MarketAnalytics />} />
            <Route path="/agriculture/crop-health" element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <CropHealthDashboard />
              </ProtectedRoute>
            } />
            <Route path="/farmer/products" element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <ManageProducts />
              </ProtectedRoute>
            } />
            <Route path="/vendor/products" element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorProducts />
              </ProtectedRoute>
            } />
            <Route path="/vendor/products/:id" element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <ManageProducts />
              </ProtectedRoute>
            } />
            <Route path="/vendor/marketplace" element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <FarmerMarketplace />
              </ProtectedRoute>
            } />
            <Route path="/vendor/dashboard" element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/vendor/analytics" element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/vendor/export" element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorExport />
              </ProtectedRoute>
            } />
            <Route path="/vendor/orders" element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorOrders />
              </ProtectedRoute>
            } />
            <Route path="/consumer/nearby-vendors" element={<NearbyVendors />} />
            <Route path="/checkout" element={
              <ProtectedRoute allowedRoles={["consumer"]}>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAuthRoute && <EnhancedFooter />}
      <KrishiMitra />
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // Cache data for 1 minute
      refetchOnWindowFocus: false, // Disable automatic refetch on window focus
      retry: 1, // Reduce retry attempts
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
