
import { 
  Leaf, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  Truck, 
  Smartphone 
} from "lucide-react";
import { useEffect, useRef } from "react";

const features = [
  {
    icon: <Leaf className="w-10 h-10 text-[#138808]" />,
    title: "Sustainable Farming",
    description: "Support eco-friendly agricultural practices that preserve the environment and promote biodiversity.",
  },
  {
    icon: <TrendingUp className="w-10 h-10 text-[#FF9933]" />,
    title: "Better Income",
    description: "Help farmers earn more by connecting them directly with consumers and eliminating middlemen.",
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-[#138808]" />,
    title: "Quality Assurance",
    description: "Every product on our platform undergoes strict quality checks to ensure you receive only the best.",
  },
  {
    icon: <Users className="w-10 h-10 text-[#FF9933]" />,
    title: "Community Building",
    description: "Create lasting relationships between farmers and consumers for a stronger agricultural ecosystem.",
  },
  {
    icon: <Truck className="w-10 h-10 text-[#138808]" />,
    title: "Efficient Delivery",
    description: "Fast and reliable delivery network ensures fresh produce reaches consumers quickly.",
  },
  {
    icon: <Smartphone className="w-10 h-10 text-[#FF9933]" />,
    title: "Mobile Access",
    description: "Access all features on your mobile device for convenient farm-to-table transactions anytime, anywhere.",
  },
];

const Features = () => {
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-scale-up");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const featureElements = featuresRef.current?.querySelectorAll(".feature-card");
    featureElements?.forEach((el) => {
      observer.observe(el);
    });

    return () => {
      featureElements?.forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 reveal reveal-up">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose Annadata</h2>
          <p className="text-lg text-gray-600">
            Our platform offers unique benefits to farmers, vendors, and consumers alike
          </p>
        </div>

        <div
          ref={featuresRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card glass-card p-6 transition-all duration-300 hover:shadow-xl opacity-0"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 rounded-full bg-white shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
