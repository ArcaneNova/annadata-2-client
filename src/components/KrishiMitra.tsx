
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, Send, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const KrishiMitra = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Get initial greeting based on selected language
  const getInitialGreeting = () => {
    switch(language) {
      case 'hindi':
        return "नमस्ते! मैं कृषि मित्र हूँ। मैं आपकी कृषि संबंधित प्रश्नों में मदद कर सकता हूँ। आप मुझसे कुछ भी पूछ सकते हैं!";
      case 'punjabi':
        return "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕ੍ਰਿਸ਼ੀ ਮਿੱਤਰ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੇ ਖੇਤੀਬਾੜੀ ਨਾਲ ਸਬੰਧਤ ਸਵਾਲਾਂ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਤੁਸੀਂ ਮੈਨੂੰ ਕੁਝ ਵੀ ਪੁੱਛ ਸਕਦੇ ਹੋ!";
      default:
        return "Hello! I am Krishi Mitra. I can help with your agriculture-related questions. Feel free to ask me anything!";
    }
  };

  // Initial greeting message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: getInitialGreeting()
        }
      ]);
    }
  }, [isOpen, messages.length, language]);

  // Enhanced AI response function with better language model simulation
  const getAIResponse = async (userMessage: string): Promise<string> => {
    // In a real implementation, this would call a ChatGPT API endpoint
    // For now, we're simulating improved responses

    // Convert message to lowercase for simple keyword matching
    const msg = userMessage.toLowerCase();
    
    // Different responses based on language
    const getLocalizedResponses = () => {
      if (language === 'hindi') {
        return [
          "हमारी मौसम की भविष्यवाणी के अनुसार, अगले 5 दिनों में आपके क्षेत्र में हल्की से मध्यम बारिश होने की संभावना है। फसल की कटाई के लिए इस सप्ताह का समय बेहतर होगा।",
          "धान की फसल के लिए, हमारा सुझाव है कि आप NPK 18:18:18 उर्वरक का उपयोग करें, जिसमें नाइट्रोजन, फॉस्फोरस और पोटाश का संतुलित अनुपात हो। मिट्टी परीक्षण के आधार पर प्रति एकड़ 100-120 किलोग्राम की दर से प्रयोग करें।",
          "आपके क्षेत्र में गेहूं की बुवाई के लिए अक्टूबर के मध्य से नवंबर के शुरुआती सप्ताह तक का समय सबसे उपयुक्त है। HD-2967 या PBW-343 जैसी उन्नत किस्मों का चयन करें जो आपके क्षेत्र के लिए अनुकूलित हैं।",
          "सिंचाई की आवृत्ति फसल की प्रकृति, मिट्टी के प्रकार और मौसम पर निर्भर करती है। हमारा विश्लेषण बताता है कि आपकी फसल के वर्तमान चरण में, 7-10 दिनों के अंतराल पर सिंचाई करना उचित होगा। सिंचाई से पहले मिट्टी की नमी की जांच करें।",
          "हमारे विश्लेषण के अनुसार, आपके फसल में दिखने वाले लक्षण ब्लास्ट रोग के हैं। इस रोग को नियंत्रित करने के लिए, ट्राइसाइक्लाज़ोल 75% WP @ 0.6 ग्राम/लीटर पानी या आइसोप्रोथिओलेन 40% EC @ 1.5 मिली/लीटर पानी का छिड़काव करें। इससे पहले कि रोग फैले, रोगग्रस्त पौधों को हटा दें।",
          "जैविक खेती के लिए, हम गोबर की खाद (10-15 टन/हेक्टेयर), वर्मीकम्पोस्ट (5-6 टन/हेक्टेयर), और नीम की खली (2-3 क्विंटल/हेक्टेयर) के संयोजन की सिफारिश करते हैं। इन्हें बुवाई से 15-20 दिन पहले मिट्टी में मिला दें।"
        ];
      } else if (language === 'punjabi') {
        return [
          "ਸਾਡੀ ਮੌਸਮ ਦੀ ਭਵਿੱਖਬਾਣੀ ਦੇ ਅਨੁਸਾਰ, ਅਗਲੇ 5 ਦਿਨਾਂ ਵਿੱਚ ਤੁਹਾਡੇ ਖੇਤਰ ਵਿੱਚ ਹਲਕੀ ਤੋਂ ਦਰਮਿਆਨੀ ਬਾਰਸ਼ ਹੋਣ ਦੀ ਸੰਭਾਵਨਾ ਹੈ। ਫਸਲ ਦੀ ਕਟਾਈ ਲਈ ਇਸ ਹਫਤੇ ਦਾ ਸਮਾਂ ਬਿਹਤਰ ਹੋਵੇਗਾ।",
          "ਝੋਨੇ ਦੀ ਫਸਲ ਲਈ, ਸਾਡੀ ਸਲਾਹ ਹੈ ਕਿ ਤੁਸੀਂ NPK 18:18:18 ਖਾਦ ਦੀ ਵਰਤੋਂ ਕਰੋ, ਜਿਸ ਵਿੱਚ ਨਾਈਟ੍ਰੋਜਨ, ਫਾਸਫੋਰਸ ਅਤੇ ਪੋਟਾਸ਼ ਦਾ ਸੰਤੁਲਿਤ ਅਨੁਪਾਤ ਹੈ। ਮਿੱਟੀ ਦੇ ਟੈਸਟ ਦੇ ਆਧਾਰ 'ਤੇ ਪ੍ਰਤੀ ਏਕੜ 100-120 ਕਿਲੋਗ੍ਰਾਮ ਦੀ ਦਰ ਨਾਲ ਵਰਤੋਂ ਕਰੋ।",
          "ਤੁਹਾਡੇ ਖੇਤਰ ਵਿੱਚ ਕਣਕ ਦੀ ਬਿਜਾਈ ਲਈ ਅਕਤੂਬਰ ਦੇ ਮੱਧ ਤੋਂ ਨਵੰਬਰ ਦੇ ਸ਼ੁਰੂਆਤੀ ਹਫ਼ਤੇ ਤੱਕ ਦਾ ਸਮਾਂ ਸਭ ਤੋਂ ਢੁਕਵਾਂ ਹੈ। HD-2967 ਜਾਂ PBW-343 ਵਰਗੀਆਂ ਉੱਨਤ ਕਿਸਮਾਂ ਦੀ ਚੋਣ ਕਰੋ ਜੋ ਤੁਹਾਡੇ ਖੇਤਰ ਲਈ ਅਨੁਕੂਲ ਹਨ।",
          "ਸਿੰਚਾਈ ਦੀ ਬਾਰੰਬਾਰਤਾ ਫਸਲ ਦੀ ਪ੍ਰਕਿਰਤੀ, ਮਿੱਟੀ ਦੀ ਕਿਸਮ ਅਤੇ ਮੌਸਮ 'ਤੇ ਨਿਰਭਰ ਕਰਦੀ ਹੈ। ਸਾਡਾ ਵਿਸ਼ਲੇਸ਼ਣ ਦੱਸਦਾ ਹੈ ਕਿ ਤੁਹਾਡੀ ਫਸਲ ਦੇ ਮੌਜੂਦਾ ਪੜਾਅ 'ਤੇ, 7-10 ਦਿਨਾਂ ਦੇ ਅੰਤਰਾਲ 'ਤੇ ਸਿੰਚਾਈ ਕਰਨਾ ਉਚਿਤ ਹੋਵੇਗਾ। ਸਿੰਚਾਈ ਤੋਂ ਪਹਿਲਾਂ ਮਿੱਟੀ ਦੀ ਨਮੀ ਦੀ ਜਾਂਚ ਕਰੋ।"
        ];
      } else {
        return [
          "Based on our weather forecasting models, there's a 70% chance of light to moderate rainfall in your region over the next 5 days. This week would be optimal for harvesting your crops before the rain arrives.",
          "For rice cultivation, our analysis recommends using NPK 18:18:18 fertilizer with a balanced ratio of nitrogen, phosphorus, and potassium. Apply at a rate of 100-120 kg per acre based on your soil test results for optimal nutrient delivery.",
          "The ideal sowing time for wheat in your region is from mid-October to early November. Select advanced varieties like HD-2967 or PBW-343 that are adapted to your local conditions and have shown 15-20% higher yields in regional trials.",
          "Irrigation frequency depends on crop type, soil characteristics, and weather conditions. Our analysis indicates that at your crop's current growth stage, irrigation at 7-10 day intervals would be appropriate. Check soil moisture before irrigation to optimize water usage.",
          "Based on our image analysis, the symptoms visible on your crop leaves match those of blast disease. To control this, spray Tricyclazole 75% WP @ 0.6 g/liter water or Isoprothiolane 40% EC @ 1.5 ml/liter water. Remove affected plants before the disease spreads further.",
          "For organic farming, we recommend a combination of farmyard manure (10-15 tons/hectare), vermicompost (5-6 tons/hectare), and neem cake (2-3 quintals/hectare). Incorporate these into the soil 15-20 days before sowing to allow proper decomposition and nutrient release."
        ];
      }
    };

    const responses = getLocalizedResponses();
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return randomResponse;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Get AI response from our enhanced function
      const aiResponse = await getAIResponse(input);
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse }
      ]);
      setIsLoading(false);
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Could not send message. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Listening",
      description: "Speak now...",
    });
    
    // This is just a placeholder - in a real app you would implement the SpeechRecognition API
    setTimeout(() => {
      toast({
        title: "Sorry",
        description: "Speech recognition implementation requires backend configuration.",
      });
    }, 3000);
  };

  // Get title and description in the correct language
  const getBotTitle = () => {
    switch(language) {
      case 'hindi': return "कृषि मित्र";
      case 'punjabi': return "ਕ੍ਰਿਸ਼ੀ ਮਿੱਤਰ";
      default: return "Krishi Mitra";
    }
  };
  
  const getBotDescription = () => {
    switch(language) {
      case 'hindi': return "आपका कृषि सहायक";
      case 'punjabi': return "ਤੁਹਾਡਾ ਖੇਤੀਬਾੜੀ ਸਹਾਇਕ";
      default: return "Your Agricultural Assistant";
    }
  };

  const getPlaceholder = () => {
    switch(language) {
      case 'hindi': return "अपना संदेश लिखें...";
      case 'punjabi': return "ਆਪਣਾ ਸੁਨੇਹਾ ਲਿਖੋ...";
      default: return "Type your message...";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            size="icon" 
            className="h-14 w-14 rounded-full shadow-lg bg-[#138808] hover:bg-[#138808]/90"
          >
            <Bot className="h-6 w-6 text-white" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          className="sm:max-w-md md:max-w-lg w-[90vw] bg-white" 
          side="right"
        >
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="flex items-center gap-2 text-[#138808]">
              <Bot className="h-5 w-5" />
              {getBotTitle()}
            </SheetTitle>
            <SheetDescription>
              {getBotDescription()}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col h-[calc(100vh-12rem)]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-[#138808] text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === "assistant" && (
                          <Bot className="h-5 w-5 mt-1 flex-shrink-0" />
                        )}
                        <p className="text-sm">{message.content}</p>
                        {message.role === "user" && (
                          <User className="h-5 w-5 mt-1 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-gray-100">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        <div className="flex gap-1">
                          <span className="animate-pulse">●</span>
                          <span className="animate-pulse delay-150">●</span>
                          <span className="animate-pulse delay-300">●</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <form
              onSubmit={handleSubmit}
              className="border-t p-4 flex items-center gap-2"
            >
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={startSpeechRecognition}
                disabled={isLoading}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={getPlaceholder()}
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="bg-[#138808] hover:bg-[#138808]/90"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default KrishiMitra;
