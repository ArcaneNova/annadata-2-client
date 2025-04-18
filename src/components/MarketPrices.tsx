
import { useEffect, useRef } from "react";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";

const products = [
  {
    name: "Wheat",
    price: "₹2,450",
    change: "+5.2%",
    trend: "up",
  },
  {
    name: "Rice",
    price: "₹3,200",
    change: "-2.1%",
    trend: "down",
  },
  {
    name: "Corn",
    price: "₹1,850",
    change: "+3.7%",
    trend: "up",
  },
  {
    name: "Soybeans",
    price: "₹4,100",
    change: "+1.5%",
    trend: "up",
  },
];

const MarketPrices = () => {
  const marketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.2 }
    );

    if (marketRef.current) {
      observer.observe(marketRef.current);
    }

    return () => {
      if (marketRef.current) {
        observer.unobserve(marketRef.current);
      }
    };
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={marketRef} className="flex flex-col lg:flex-row items-center gap-12 reveal reveal-up">
          <div className="flex-1 text-center lg:text-left space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Real-Time Market Prices</h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Stay updated with the latest market prices and trends. Make informed decisions for your agricultural business.
            </p>
            <button className="btn-primary flex items-center gap-2 mx-auto lg:mx-0">
              View All Prices
              <TrendingUp size={20} />
            </button>
          </div>

          <div className="flex-1 w-full">
            <div className="glass-card p-6 reveal reveal-right">
              <h3 className="text-xl font-semibold mb-4 text-center lg:text-left">Latest Prices</h3>
              {products.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors rounded-lg"
                >
                  <span className="font-semibold">{product.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-bold">{product.price}</span>
                    <span className={`flex items-center ${
                      product.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {product.trend === 'up' ? (
                        <ArrowUpRight size={16} />
                      ) : (
                        <ArrowDownRight size={16} />
                      )}
                      {product.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketPrices;
