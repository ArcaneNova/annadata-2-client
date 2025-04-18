import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Leaf,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  PhoneCall,
  MapPin,
  ArrowRight
} from "lucide-react";

const EnhancedFooter = () => {
  return (
    <footer className="bg-[#F2FCE2] border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Leaf className="h-6 w-6 text-[#138808]" />
              <span className="font-bold text-xl">ANNADATA</span>
            </Link>
            <p className="text-gray-600 mb-6 max-w-md">
              An integrated digital platform that seamlessly connects farmers, vendors, and consumers,
              ensuring transparency, security, and an exceptional agricultural marketplace experience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-colors">
                <Facebook className="h-5 w-5 text-gray-700" />
              </a>
              <a href="#" className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-colors">
                <Twitter className="h-5 w-5 text-gray-700" />
              </a>
              <a href="#" className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-colors">
                <Instagram className="h-5 w-5 text-gray-700" />
              </a>
              <a href="#" className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition-colors">
                <Youtube className="h-5 w-5 text-gray-700" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-600 hover:text-[#138808]">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-[#138808]">About Us</Link>
              </li>
              <li>
                <Link to="/market-prices" className="text-gray-600 hover:text-[#138808]">Market Prices</Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-[#138808]">Agricultural Blog</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-[#138808]">Contact Us</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">For Users</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/dashboard/farmer" className="text-gray-600 hover:text-[#138808]">Farmer Portal</Link>
              </li>
              <li>
                <Link to="/dashboard/vendor" className="text-gray-600 hover:text-[#138808]">Vendor Portal</Link>
              </li>
              <li>
                <Link to="/dashboard/consumer" className="text-gray-600 hover:text-[#138808]">Consumer Portal</Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-600 hover:text-[#138808]">Help & Support</Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-[#138808]">FAQs</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-[#138808] mr-2 mt-0.5" />
                <span className="text-gray-600">123 Agricultural Zone, New Delhi, 110001, India</span>
              </li>
              <li className="flex items-center">
                <PhoneCall className="h-5 w-5 text-[#138808] mr-2" />
                <span className="text-gray-600">+91 98765 43210</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-[#138808] mr-2" />
                <span className="text-gray-600">info@annadataharmony.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="bg-[#138808]/5 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h3 className="font-bold text-lg mb-2">Subscribe to Our Newsletter</h3>
              <p className="text-gray-600">
                Stay updated with the latest market prices, agricultural tips, and platform features.
              </p>
            </div>
            <div className="flex gap-2">
              <Input type="email" placeholder="Enter your email" className="bg-white" />
              <Button className="bg-[#138808] hover:bg-[#138808]/90">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} ANNADATA. All rights reserved.
          </p>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <Link to="/terms" className="hover:underline">Terms of Service</Link>
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link to="/refund" className="hover:underline">Refund Policy</Link>
            <Link to="/sitemap" className="hover:underline">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default EnhancedFooter;
