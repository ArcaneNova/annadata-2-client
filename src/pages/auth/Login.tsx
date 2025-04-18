import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, Smartphone, ArrowRight, Leaf, ShoppingCart, Users } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PublicRoute from "@/components/PublicRoute";

// Define user type
interface User {
  _id: string;
  name: string;
  email: string;
  role: "farmer" | "vendor" | "consumer";
  phone: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<"farmer" | "vendor" | "consumer">("farmer");
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    rememberMe: false,
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, rememberMe: checked }));
  };

  const handleUserTypeChange = (value: "farmer" | "vendor" | "consumer") => {
    setUserType(value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Form validation
    if (loginMethod === "email" && !formData.email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    if (loginMethod === "phone" && !formData.phone) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    if (!formData.password) {
      toast({
        title: "Error",
        description: "Please enter your password",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/${userType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginMethod === "email" ? formData.email : undefined,
          phone: loginMethod === "phone" ? formData.phone : undefined,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store JWT token and user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // If remember me is checked, store credentials
      if (formData.rememberMe) {
        localStorage.setItem('rememberedCredential', loginMethod === "email" ? formData.email : formData.phone);
        localStorage.setItem('rememberedMethod', loginMethod);
        localStorage.setItem('rememberedUserType', userType);
      } else {
        // Clear remembered credentials if not checked
        localStorage.removeItem('rememberedCredential');
        localStorage.removeItem('rememberedMethod');
        localStorage.removeItem('rememberedUserType');
      }
      
      toast({
        title: "Login Successful",
        description: "Welcome back to Annadata Harmony!",
      });
      
      // Redirect based on user role from API response
      navigate(`/dashboard/${data.user.role}`);
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check for remembered credentials on component mount
  useEffect(() => {
    const rememberedMethod = localStorage.getItem('rememberedMethod') as "email" | "phone" | null;
    const rememberedCredential = localStorage.getItem('rememberedCredential');
    const rememberedUserType = localStorage.getItem('rememberedUserType') as "farmer" | "vendor" | "consumer" | null;
    
    if (rememberedMethod && rememberedCredential && rememberedUserType) {
      setLoginMethod(rememberedMethod);
      setUserType(rememberedUserType);
      setFormData(prev => ({
        ...prev,
        [rememberedMethod]: rememberedCredential,
        rememberMe: true,
      }));
    }
  }, []);

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Link to="/" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-[#138808]"
              >
                <path d="M12 2a9 9 0 0 0-9 9c0 4.17 2.84 7.67 6.69 8.69a.5.5 0 0 0 .62-.45V17.5c0-.23-.21-.39-.42-.35-1.63.33-2-.7-2-1.5-.05-.23-.15-.44-.3-.6-.15-.18-.18-.31-.09-.39.2-.18.46.07.65.28.33.34.98.74 1.87.32.17-.32.47-.54.83-.6.08-.42.3-.8.63-1.08-2.49-.38-3.5-1.85-3.5-3.69 0-.83.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.32.82 2.15 0 1.84-1.01 3.31-3.5 3.69.4.34.63.87.63 1.54v1.77c0 .22.2.42.4.48A9 9 0 0 0 12 2z" />
              </svg>
              <span className="text-2xl font-bold text-gray-900">Annadata Harmony</span>
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please sign in to your account
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">
                    <Link to="/register" className="w-full h-full flex items-center justify-center">
                      Register
                    </Link>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                    {/* User Type Selection */}
                    <div className="space-y-3">
                      <Label>I am a</Label>
                      <RadioGroup
                        value={userType}
                        onValueChange={handleUserTypeChange}
                        className="grid grid-cols-3 gap-4"
                      >
                        <div className={`flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer transition-colors ${userType === "farmer" ? "border-[#138808] bg-[#138808]/5" : "border-gray-200"}`}>
                          <RadioGroupItem value="farmer" id="login-farmer" className="sr-only" />
                          <Label htmlFor="login-farmer" className="cursor-pointer flex flex-col items-center gap-2">
                            <Leaf className="h-8 w-8 text-[#138808]" />
                            <span>Farmer</span>
                          </Label>
                        </div>
                        
                        <div className={`flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer transition-colors ${userType === "vendor" ? "border-[#FF9933] bg-[#FF9933]/5" : "border-gray-200"}`}>
                          <RadioGroupItem value="vendor" id="login-vendor" className="sr-only" />
                          <Label htmlFor="login-vendor" className="cursor-pointer flex flex-col items-center gap-2">
                            <ShoppingCart className="h-8 w-8 text-[#FF9933]" />
                            <span>Vendor</span>
                          </Label>
                        </div>
                        
                        <div className={`flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer transition-colors ${userType === "consumer" ? "border-[#0000FF] bg-[#0000FF]/5" : "border-gray-200"}`}>
                          <RadioGroupItem value="consumer" id="login-consumer" className="sr-only" />
                          <Label htmlFor="login-consumer" className="cursor-pointer flex flex-col items-center gap-2">
                            <Users className="h-8 w-8 text-[#0000FF]" />
                            <span>Consumer</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            className={`px-3 py-1 text-sm rounded-full ${
                              loginMethod === "email"
                                ? "bg-[#138808] text-white"
                                : "bg-gray-100 text-gray-700"
                            }`}
                            onClick={() => setLoginMethod("email")}
                          >
                            Email
                          </button>
                          <button
                            type="button"
                            className={`px-3 py-1 text-sm rounded-full ${
                              loginMethod === "phone"
                                ? "bg-[#138808] text-white"
                                : "bg-gray-100 text-gray-700"
                            }`}
                            onClick={() => setLoginMethod("phone")}
                          >
                            Phone
                          </button>
                        </div>
                      </div>

                      {loginMethod === "email" ? (
                        <div className="space-y-1">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              autoComplete="email"
                              value={formData.email}
                              onChange={handleChange}
                              className="pl-10"
                              placeholder="Enter your email"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Label htmlFor="phone">Phone Number</Label>
                          <div className="relative">
                            <Smartphone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              autoComplete="tel"
                              value={formData.phone}
                              onChange={handleChange}
                              className="pl-10"
                              placeholder="Enter your phone number"
                              maxLength={10}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          value={formData.password}
                          onChange={handleChange}
                          className="pl-10 pr-10"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          checked={formData.rememberMe}
                          onCheckedChange={handleCheckboxChange}
                        />
                        <Label
                          htmlFor="remember"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Remember me
                        </Label>
                      </div>
                      <div className="text-sm">
                        <Link
                          to="/forgot-password"
                          className="font-medium text-[#138808] hover:text-[#138808]/80"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#138808] hover:bg-[#138808]/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          Sign in
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-2 text-gray-500">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <Button variant="outline" type="button">
                        <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </Button>
                      <Button variant="outline" type="button">
                        <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                        </svg>
                      </Button>
                      <Button variant="outline" type="button">
                        <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z" />
                        </svg>
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-[#138808] hover:text-[#138808]/80"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PublicRoute>
  );
};

export default Login;
