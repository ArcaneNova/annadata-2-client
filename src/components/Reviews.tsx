
import { useEffect, useRef } from "react";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Rajesh Kumar",
    role: "Farmer",
    content: "Annadata has transformed how I sell my produce. Direct connection with consumers means better prices and relationships.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    name: "Priya Singh",
    role: "Consumer",
    content: "Fresh produce directly from farmers at reasonable prices. The transparency and quality are exceptional.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  },
  {
    name: "Amit Patel",
    role: "Vendor",
    content: "The platform has helped me expand my business and build trust with both farmers and consumers.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
  },
];

const Reviews = () => {
  const reviewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("active");
            }, index * 100);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const reviewElements = reviewsRef.current?.querySelectorAll(".review-card");
    reviewElements?.forEach((el, index) => {
      observer.observe(el);
    });

    return () => {
      reviewElements?.forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 reveal reveal-up">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Reviews & Feedback</h2>
          <p className="text-lg text-gray-600">
            Hear from our community of farmers, vendors, and consumers
          </p>
        </div>

        <div ref={reviewsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="review-card glass-card p-6 flex flex-col reveal reveal-up"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <h3 className="font-semibold">{review.name}</h3>
                  <p className="text-sm text-gray-600">{review.role}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-700">{review.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
