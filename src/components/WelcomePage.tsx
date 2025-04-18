
import { CircleUserRound } from "lucide-react";

const WelcomePage = () => {
  return (
    <div className="min-h-screen gradient-background flex flex-col items-center justify-between p-6">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center flex-grow gap-8">
        {/* Logo and Header */}
        <div className="text-center space-y-4 animate-fade-up">
          <img 
            src="/logo-placeholder.svg" 
            alt="Annadata Logo" 
            className="w-32 h-32 mx-auto annadata-logo"
          />
          <h1 className="text-4xl font-bold">WELCOME TO ANNADATA</h1>
        </div>

        {/* QR Code Section */}
        <div className="glass-card p-6 w-full animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="w-48 h-48 mx-auto mb-4 bg-gray-200 rounded-lg"></div>
          <div className="flex items-center justify-center gap-2 text-xl">
            <CircleUserRound className="w-6 h-6" />
            <span>SCAN ME</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-center text-lg max-w-md animate-fade-up" style={{ animationDelay: "0.3s" }}>
          Join the platform that connects farmers directly with consumers, eliminating middlemen and ensuring fair pricing for all.
        </p>

        {/* Continue Button */}
        <button className="btn-primary mt-4 animate-fade-up" style={{ animationDelay: "0.4s" }}>
          Continue
        </button>
      </div>

      {/* Need Help Button */}
      <button className="need-help-button animate-fade-up" style={{ animationDelay: "0.5s" }}>
        <CircleUserRound className="w-6 h-6" />
        NEED HELP ?
      </button>
    </div>
  );
};

export default WelcomePage;
