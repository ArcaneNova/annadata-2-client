
import { Menu, X, ChevronDown, Download, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState("");

  // Handle scroll events for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) {
      setActiveDropdown("");
    } else {
      setActiveDropdown(name);
    }
  };

  const handleMenuItemClick = () => {
    setIsOpen(false);
    setActiveDropdown("");
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? "navbar-scrolled py-2" : "bg-white/50 backdrop-blur-md border-b border-gray-200 py-4"
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 font-bold text-2xl text-primary">
            Annadata
          </div>
          
          <div className="hidden md:flex space-x-1 lg:space-x-2">
            <a 
              href="#home" 
              className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
            >
              Home
            </a>
            
            <div className="relative group">
              <button 
                onClick={() => toggleDropdown("farmers")}
                className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100 flex items-center"
              >
                Farmers
                <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${activeDropdown === "farmers" ? "rotate-180" : ""}`} />
              </button>
              
              {activeDropdown === "farmers" && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20 animate-fade-up">
                  <a 
                    href="/dashboard/farmer" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={handleMenuItemClick}
                  >
                    Farmer Dashboard
                  </a>
                  <a 
                    href="#features" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={handleMenuItemClick}
                  >
                    How It Works
                  </a>
                  <a 
                    href="#market" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={handleMenuItemClick}
                  >
                    Market Prices
                  </a>
                </div>
              )}
            </div>
            
            <div className="relative group">
              <button 
                onClick={() => toggleDropdown("vendors")}
                className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100 flex items-center"
              >
                Vendors
                <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${activeDropdown === "vendors" ? "rotate-180" : ""}`} />
              </button>
              
              {activeDropdown === "vendors" && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20 animate-fade-up">
                  <a 
                    href="/dashboard/vendor" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={handleMenuItemClick}
                  >
                    Vendor Dashboard
                  </a>
                  <a 
                    href="#features" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={handleMenuItemClick}
                  >
                    Benefits
                  </a>
                  <a 
                    href="#testimonials" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={handleMenuItemClick}
                  >
                    Success Stories
                  </a>
                </div>
              )}
            </div>
            
            <div className="relative group">
              <button 
                onClick={() => toggleDropdown("consumers")}
                className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100 flex items-center"
              >
                Consumers
                <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${activeDropdown === "consumers" ? "rotate-180" : ""}`} />
              </button>
              
              {activeDropdown === "consumers" && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20 animate-fade-up">
                  <a 
                    href="/dashboard/consumer" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={handleMenuItemClick}
                  >
                    Consumer Dashboard
                  </a>
                  <a 
                    href="#features" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={handleMenuItemClick}
                  >
                    Fresh Produce
                  </a>
                  <a 
                    href="#testimonials" 
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={handleMenuItemClick}
                  >
                    Customer Reviews
                  </a>
                </div>
              )}
            </div>
            
            <a 
              href="/dashboard/analytics" 
              className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
            >
              Market Analytics
            </a>
            
            <a 
              href="#contact" 
              className="px-3 py-2 text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-100"
            >
              Contact
            </a>
          </div>
          
          <div className="hidden md:flex space-x-4">
            <button className="btn-secondary flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Download App
            </button>
            <button className="btn-primary flex items-center">
              <UserPlus className="w-4 h-4 mr-2" />
              Join Movement
            </button>
          </div>
          
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-gray-600 p-2 focus:outline-none"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X size={24} className="text-gray-800" />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-3 space-y-3 bg-white shadow-lg rounded-b-xl">
          <a 
            href="#home" 
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={handleMenuItemClick}
          >
            Home
          </a>
          
          {/* Mobile Farmers Dropdown */}
          <div>
            <button 
              onClick={() => toggleDropdown("mobile-farmers")}
              className="flex items-center justify-between w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Farmers
              <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${activeDropdown === "mobile-farmers" ? "rotate-180" : ""}`} />
            </button>
            
            <div className={`pl-4 mt-1 space-y-1 overflow-hidden transition-all duration-200 ${
              activeDropdown === "mobile-farmers" ? "max-h-40" : "max-h-0"
            }`}>
              <a 
                href="/dashboard/farmer" 
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={handleMenuItemClick}
              >
                Farmer Dashboard
              </a>
              <a 
                href="#features" 
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={handleMenuItemClick}
              >
                How It Works
              </a>
              <a 
                href="#market" 
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={handleMenuItemClick}
              >
                Market Prices
              </a>
            </div>
          </div>
          
          {/* Mobile Vendors Dropdown */}
          <div>
            <button 
              onClick={() => toggleDropdown("mobile-vendors")}
              className="flex items-center justify-between w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Vendors
              <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${activeDropdown === "mobile-vendors" ? "rotate-180" : ""}`} />
            </button>
            
            <div className={`pl-4 mt-1 space-y-1 overflow-hidden transition-all duration-200 ${
              activeDropdown === "mobile-vendors" ? "max-h-40" : "max-h-0"
            }`}>
              <a 
                href="/dashboard/vendor" 
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={handleMenuItemClick}
              >
                Vendor Dashboard
              </a>
              <a 
                href="#features" 
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={handleMenuItemClick}
              >
                Benefits
              </a>
              <a 
                href="#testimonials" 
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={handleMenuItemClick}
              >
                Success Stories
              </a>
            </div>
          </div>
          
          {/* Mobile Consumers Dropdown */}
          <div>
            <button 
              onClick={() => toggleDropdown("mobile-consumers")}
              className="flex items-center justify-between w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Consumers
              <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${activeDropdown === "mobile-consumers" ? "rotate-180" : ""}`} />
            </button>
            
            <div className={`pl-4 mt-1 space-y-1 overflow-hidden transition-all duration-200 ${
              activeDropdown === "mobile-consumers" ? "max-h-40" : "max-h-0"
            }`}>
              <a 
                href="/dashboard/consumer" 
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={handleMenuItemClick}
              >
                Consumer Dashboard
              </a>
              <a 
                href="#features" 
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={handleMenuItemClick}
              >
                Fresh Produce
              </a>
              <a 
                href="#testimonials" 
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                onClick={handleMenuItemClick}
              >
                Customer Reviews
              </a>
            </div>
          </div>
          
          <a 
            href="/dashboard/analytics" 
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={handleMenuItemClick}
          >
            Market Analytics
          </a>
          
          <a 
            href="#contact" 
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={handleMenuItemClick}
          >
            Contact
          </a>
          
          <div className="pt-2 space-y-3">
            <button className="w-full btn-secondary flex items-center justify-center">
              <Download className="w-4 h-4 mr-2" />
              Download App
            </button>
            <button className="w-full btn-primary flex items-center justify-center">
              <UserPlus className="w-4 h-4 mr-2" />
              Join Movement
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
