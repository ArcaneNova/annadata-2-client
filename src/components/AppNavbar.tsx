import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Menu,
  User,
  ShoppingCart,
  Leaf,
  Settings,
  LogOut,
  ChevronRight,
  Home,
  Package,
  Users,
  Warehouse,
  BarChart3,
  MapPin,
  Trash2,
} from "lucide-react";
import { useConsumerCart } from "@/hooks/use-consumer-cart";
import { useAuth } from "@/hooks/use-auth";
import { getUserRole } from "@/utils/auth";

const AppNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout, isConsumer } = useAuth();
  const { items, getTotalItems, clearCart } = useConsumerCart();
  const cartItemCount = getTotalItems();
  const userRole = getUserRole();
  
  // Helper functions to check user roles
  const isFarmer = () => userRole === 'farmer';
  const isVendor = () => userRole === 'vendor';
  const isUserConsumer = () => userRole === 'consumer';
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const dashboardLink = isFarmer() ? "/dashboard/farmer" : 
                       isVendor() ? "/dashboard/vendor" : 
                       isUserConsumer() ? "/dashboard/consumer" : "/";
  
  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-[#F2FCE2]"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-[#138808]" />
              <span className="font-bold text-xl">ANNADATA</span>
            </Link>
            
            <div className="hidden md:flex ml-10">
              <NavigationMenu>
                <NavigationMenuList>
                  {/* Show Farmer menu only if user is a farmer or not authenticated */}
                  {(!isAuthenticated() || isFarmer()) && (
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>For Farmers</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                          <li className="row-span-3">
                            <NavigationMenuLink asChild>
                              <Link
                                to="/dashboard/farmer"
                                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-green-50 to-green-100 p-6 no-underline outline-none focus:shadow-md"
                              >
                                <Leaf className="h-6 w-6 text-[#138808]" />
                                <div className="mb-2 mt-4 text-lg font-medium">
                                  Farmer Dashboard
                                </div>
                                <p className="text-sm leading-tight text-muted-foreground">
                                  Manage your products, track orders, and monitor crop health
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <Link to="/farmer/products" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                              <div className="text-sm font-medium leading-none">Manage Products</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Add, edit and manage your product listings
                              </p>
                            </Link>
                          </li>
                          <li>
                            <Link to="/agriculture/crop-health" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                              <div className="text-sm font-medium leading-none">Crop Health</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Monitor and optimize your crop health
                              </p>
                            </Link>
                          </li>
                          <li>
                            <Link to="/dashboard/analytics" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                              <div className="text-sm font-medium leading-none">Market Analytics</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Get insights on market trends and prices
                              </p>
                            </Link>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )}
                  
                  {/* Show Vendor menu only if user is a vendor or not authenticated */}
                  {(!isAuthenticated() || isVendor()) && (
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>For Vendors</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                          <li className="row-span-3">
                            <NavigationMenuLink asChild>
                              <Link
                                to="/dashboard/vendor"
                                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-amber-50 to-amber-100 p-6 no-underline outline-none focus:shadow-md"
                              >
                                <Warehouse className="h-6 w-6 text-[#FF9933]" />
                                <div className="mb-2 mt-4 text-lg font-medium">
                                  Vendor Dashboard
                                </div>
                                <p className="text-sm leading-tight text-muted-foreground">
                                  Source products, manage inventory, and grow your business
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <Link to="/vendor/marketplace" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                              <div className="text-sm font-medium leading-none">Marketplace</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Discover and source fresh produce directly from farmers
                              </p>
                            </Link>
                          </li>
                          <li>
                            <Link to="/vendor/orders" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                              <div className="text-sm font-medium leading-none">Orders & Delivery</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Manage your orders and delivery schedules
                              </p>
                            </Link>
                          </li>
                          <li>
                            <Link to="/dashboard/analytics" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                              <div className="text-sm font-medium leading-none">Business Analytics</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Track your business performance and growth
                              </p>
                            </Link>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )}
                  
                  {/* Show Consumer menu only if user is a consumer or not authenticated */}
                  {(!isAuthenticated() || isUserConsumer()) && (
                    <NavigationMenuItem>
                      <NavigationMenuTrigger>For Consumers</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                          <li className="row-span-3">
                            <NavigationMenuLink asChild>
                              <Link
                                to="/dashboard/consumer"
                                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-50 to-blue-100 p-6 no-underline outline-none focus:shadow-md"
                              >
                                <Users className="h-6 w-6 text-[#0000FF]" />
                                <div className="mb-2 mt-4 text-lg font-medium">
                                  Consumer Dashboard
                                </div>
                                <p className="text-sm leading-tight text-muted-foreground">
                                  Find nearby vendors, shop for fresh produce, and track orders
                                </p>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                          <li>
                            <Link to="/consumer/nearby-vendors" className="bg-white block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                              <div className="text-sm font-medium leading-none">Nearby Vendors</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Discover vendors in your locality
                              </p>
                            </Link>
                          </li>
                          <li>
                            <Link to="/checkout" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                              <div className="text-sm font-medium leading-none">Checkout</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Complete your purchase with secure payment options
                              </p>
                            </Link>
                          </li>
                          <li>
                            <Link to="/consumer/orders" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                              <div className="text-sm font-medium leading-none">Order History</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                View and track your past orders
                              </p>
                            </Link>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )}
                  
                  <NavigationMenuItem>
                    <Link to="/market-prices" className={navigationMenuTriggerStyle()}>
                      Market Prices
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated() ? (
              <>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full p-0">
                    3
                  </Badge>
                </Button>
                
                {isUserConsumer() && cartItemCount > 0 && (
                  <div className="relative mr-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                          <ShoppingCart className="h-5 w-5" />
                          <Badge className="absolute -top-2 -right-2 bg-[#138808]">
                            {cartItemCount}
                          </Badge>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80">
                        <div className="p-4">
                          <h3 className="font-medium mb-2">Shopping Cart ({cartItemCount} items)</h3>
                          <div className="space-y-3 max-h-60 overflow-y-auto mb-3">
                            {items.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Your cart is empty</p>
                            ) : (
                              items.map(item => (
                                <div key={item._id} className="flex items-center gap-2">
                                  <img 
                                    src={item.images[0]?.url} 
                                    alt={item.name} 
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium truncate">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">₹{item.price} x {item.quantity}</p>
                                  </div>
                                  <p className="text-sm font-semibold">₹{item.price * item.quantity}</p>
                                </div>
                              ))
                            )}
                          </div>
                          {items.length > 0 && (
                            <>
                              <div className="flex justify-between py-2 font-medium border-t">
                                <span>Total:</span>
                                <span>₹{items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                              </div>
                              <div className="mt-4 flex gap-2">
                                <Button 
                                  variant="outline" 
                                  className="w-1/2 gap-1 border-red-200 text-red-600 hover:bg-red-50"
                                  onClick={() => clearCart()}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Clear
                                </Button>
                                <Button 
                                  className="w-1/2 bg-[#138808] hover:bg-[#138808]/90 gap-1"
                                  onClick={() => navigate('/checkout')}
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                  Checkout
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer">
                      <AvatarImage src="https://randomuser.me/api/portraits/men/1.jpg" alt="User" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link to={dashboardLink} className="flex w-full">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      logout();
                      navigate('/login');
                    }} className="text-red-600 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-[#138808] hover:bg-[#138808]/90">Register</Button>
                </Link>
              </div>
            )}
            
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Annadata Harmony</SheetTitle>
                    <SheetDescription>
                      Your integrated agricultural marketplace
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-6">
                    <div className="flex flex-col space-y-4">
                      {isAuthenticated() ? (
                        <>
                          <div className="flex items-center gap-3 mb-4">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src="https://randomuser.me/api/portraits/men/1.jpg" alt="User" />
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user?.name || 'User'}</p>
                              <p className="text-sm text-muted-foreground capitalize">{isFarmer() ? 'Farmer' : isVendor() ? 'Vendor' : isUserConsumer() ? 'Consumer' : 'User'}</p>
                            </div>
                          </div>
                          
                          <Link to={dashboardLink} className="flex items-center justify-between rounded-md p-2 hover:bg-gray-100">
                            <div className="flex items-center">
                              <BarChart3 className="mr-2 h-5 w-5 text-[#138808]" />
                              <span>Dashboard</span>
                            </div>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </>
                      ) : (
                        <div className="space-y-2 mb-6">
                          <Link to="/login">
                            <Button variant="outline" className="w-full">Login</Button>
                          </Link>
                          <Link to="/register">
                            <Button className="w-full bg-[#138808] hover:bg-[#138808]/90">Register</Button>
                          </Link>
                        </div>
                      )}
                      
                      <Link to="/" className="flex items-center rounded-md p-2 hover:bg-gray-100">
                        <Home className="mr-2 h-5 w-5" />
                        <span>Home</span>
                      </Link>
                      
                      {/* Show Farmer options only if user is a farmer or not authenticated */}
                      {(!isAuthenticated() || isFarmer()) && (
                        <>
                          <div className="pt-2 pb-1">
                            <p className="text-sm font-medium text-muted-foreground px-2">For Farmers</p>
                          </div>
                          
                          <Link to="/dashboard/farmer" className="flex items-center rounded-md p-2 hover:bg-gray-100 pl-4">
                            <Leaf className="mr-2 h-5 w-5 text-[#138808]" />
                            <span>Farmer Dashboard</span>
                          </Link>
                          
                          <Link to="/farmer/products" className="flex items-center rounded-md p-2 hover:bg-gray-100 pl-4">
                            <Package className="mr-2 h-5 w-5" />
                            <span>Manage Products</span>
                          </Link>
                        </>
                      )}
                      
                      {/* Show Vendor options only if user is a vendor or not authenticated */}
                      {(!isAuthenticated() || isVendor()) && (
                        <>
                          <div className="pt-2 pb-1">
                            <p className="text-sm font-medium text-muted-foreground px-2">For Vendors</p>
                          </div>
                          
                          <Link to="/dashboard/vendor" className="flex items-center rounded-md p-2 hover:bg-gray-100 pl-4">
                            <Warehouse className="mr-2 h-5 w-5 text-[#FF9933]" />
                            <span>Vendor Dashboard</span>
                          </Link>
                          
                          <Link to="/vendor/marketplace" className="flex items-center rounded-md p-2 hover:bg-gray-100 pl-4">
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            <span>Marketplace</span>
                          </Link>
                        </>
                      )}
                      
                      {/* Show Consumer options only if user is a consumer or not authenticated */}
                      {(!isAuthenticated() || isUserConsumer()) && (
                        <>
                          <div className="pt-2 pb-1">
                            <p className="text-sm font-medium text-muted-foreground px-2">For Consumers</p>
                          </div>
                          
                          <Link to="/dashboard/consumer" className="flex items-center rounded-md p-2 hover:bg-gray-100 pl-4">
                            <Users className="mr-2 h-5 w-5 text-[#0000FF]" />
                            <span>Consumer Dashboard</span>
                          </Link>
                          
                          <Link to="/consumer/nearby-vendors" className="flex items-center rounded-md p-2 hover:bg-gray-100 pl-4">
                            <MapPin className="mr-2 h-5 w-5" />
                            <span>Nearby Vendors</span>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppNavbar;
