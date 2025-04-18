
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Here you would typically send this to your backend
      console.log("Subscribing email:", email);
      setSubscribed(true);
      setEmail("");
      
      // Reset the subscribed state after 3 seconds
      setTimeout(() => {
        setSubscribed(false);
      }, 3000);
    }
  };

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About Column */}
          <div className="space-y-4 animate-fade-up">
            <h3 className="text-2xl font-bold text-[#FF9933]">Annadata</h3>
            <p className="text-gray-300">
              Empowering farmers and connecting communities through sustainable agriculture and fair trade practices.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-[#FF9933] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#FF9933] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#FF9933] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#FF9933] transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <h3 className="text-xl font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  About Us
                </a>
              </li>
              <li>
                <a href="#farmers" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  For Farmers
                </a>
              </li>
              <li>
                <a href="#vendors" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  For Vendors
                </a>
              </li>
              <li>
                <a href="#consumers" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  For Consumers
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-xl font-semibold">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-[#FF9933] flex-shrink-0 mt-1" />
                <span className="text-gray-300">
                  123 Agricultural Avenue, Farmville,<br />Karnataka, India 560001
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-[#FF9933] flex-shrink-0" />
                <a href="tel:+919876543210" className="text-gray-300 hover:text-white transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-[#FF9933] flex-shrink-0" />
                <a href="mailto:info@annadata.com" className="text-gray-300 hover:text-white transition-colors">
                  info@annadata.com
                </a>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="space-y-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <h3 className="text-xl font-semibold">Newsletter</h3>
            <p className="text-gray-300">
              Subscribe to our newsletter for updates on market prices, farming tips, and community events.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-4 py-2 rounded-full bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 px-4 py-1 bg-[#FF9933] text-white rounded-full hover:bg-[#FF9933]/90 transition-colors"
                >
                  Subscribe
                </button>
              </div>
              {subscribed && (
                <p className="text-green-400 text-sm mt-1">Thanks for subscribing!</p>
              )}
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Annadata. All rights reserved.
            </p>
            <div className="flex space-x-4 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">FAQ</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
