
import { useEffect, useRef } from "react";

const steps = [
  {
    title: "Register & Verify",
    description: "Create your account and complete the verification process to join our trusted network.",
    icon: "🌱",
  },
  {
    title: "List Your Products",
    description: "Farmers can list their produce while consumers can browse and select items.",
    icon: "📝",
  },
  {
    title: "Connect Directly",
    description: "Remove middlemen by connecting farmers and consumers directly through our platform.",
    icon: "🤝",
  },
  {
    title: "Secure Transaction",
    description: "Complete secure transactions and arrange for delivery or pickup of products.",
    icon: "✅",
  },
];

const HowItWorks = () => {
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    const stepElements = stepsRef.current?.querySelectorAll(".step-card");
    stepElements?.forEach((el) => {
      observer.observe(el);
    });

    return () => {
      stepElements?.forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 reveal reveal-up">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How Annadata Works</h2>
          <p className="text-lg text-gray-600">
            Follow these simple steps to start your journey with Annadata
          </p>
        </div>

        <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="step-card glass-card p-6 text-center reveal reveal-up"
              style={{ animationDelay: `${0.2 * (index + 1)}s` }}
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
