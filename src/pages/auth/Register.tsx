import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, User, Smartphone, ArrowRight, Leaf, ShoppingCart, Users } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Role-specific form fields
interface RoleSpecificFields {
  farmer: {
    farmName: string;
    farmLocation: string;
    farmSize: string;
    primaryCrops: string;
  };
  vendor: {
    businessName: string;
    businessType: string;
    businessLocation: string;
    gstNumber: string;
  };
  consumer: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [otp, setOtp] = useState("");
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "farmer" as "farmer" | "vendor" | "consumer",
    agreeTerms: false,
    roleSpecificData: {
      farmer: {
        farmName: "",
        farmLocation: "",
        farmSize: "",
        primaryCrops: "",
      },
      vendor: {
        businessName: "",
        businessType: "",
        businessLocation: "",
        gstNumber: "",
      },
      consumer: {
        address: "",
        city: "",
        state: "",
        pincode: "",
      },
    } as RoleSpecificFields,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      // Handle nested role-specific fields
      const [role, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        roleSpecificData: {
          ...prev.roleSpecificData,
          [role]: {
            ...prev.roleSpecificData[role as keyof RoleSpecificFields],
            [field]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleUserTypeChange = (value: "farmer" | "vendor" | "consumer") => {
    setFormData(prev => ({ ...prev, userType: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, agreeTerms: checked }));
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          token: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }

      toast({
        title: "Verification Successful",
        description: "Your email has been verified. You can now log in.",
      });

      setShowOTPDialog(false);
      navigate('/login');
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      throw new Error("Please fill in all required fields");
    }

    if (formData.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    if (formData.password !== formData.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    if (!formData.agreeTerms) {
      throw new Error("Please agree to the terms and conditions");
    }

    // Validate role-specific fields
    const roleData = formData.roleSpecificData[formData.userType];
    const emptyFields = Object.entries(roleData)
      .filter(([_, value]) => !value)
      .map(([key, _]) => key);

    if (emptyFields.length > 0) {
      throw new Error(`Please fill in all ${formData.userType} details: ${emptyFields.join(', ')}`);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      validateForm();

      const response = await fetch(`${API_BASE_URL}/auth/register/${formData.userType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          ...formData.roleSpecificData[formData.userType],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      toast({
        title: "Registration Successful",
        description: "Please check your email for the verification code.",
      });
      
      setShowOTPDialog(true);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (formData.userType) {
      case "farmer":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="farmer.farmName">Farm Name</Label>
              <Input
                id="farmer.farmName"
                name="farmer.farmName"
                value={formData.roleSpecificData.farmer.farmName}
                onChange={handleChange}
                placeholder="Enter your farm name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="farmer.farmLocation">Farm Location</Label>
              <Input
                id="farmer.farmLocation"
                name="farmer.farmLocation"
                value={formData.roleSpecificData.farmer.farmLocation}
                onChange={handleChange}
                placeholder="Enter farm location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="farmer.farmSize">Farm Size (in acres)</Label>
              <Input
                id="farmer.farmSize"
                name="farmer.farmSize"
                type="number"
                value={formData.roleSpecificData.farmer.farmSize}
                onChange={handleChange}
                placeholder="Enter farm size"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="farmer.primaryCrops">Primary Crops</Label>
              <Input
                id="farmer.primaryCrops"
                name="farmer.primaryCrops"
                value={formData.roleSpecificData.farmer.primaryCrops}
                onChange={handleChange}
                placeholder="Enter primary crops (comma separated)"
              />
            </div>
          </div>
        );

      case "vendor":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vendor.businessName">Business Name</Label>
              <Input
                id="vendor.businessName"
                name="vendor.businessName"
                value={formData.roleSpecificData.vendor.businessName}
                onChange={handleChange}
                placeholder="Enter your business name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor.businessType">Business Type</Label>
              <Input
                id="vendor.businessType"
                name="vendor.businessType"
                value={formData.roleSpecificData.vendor.businessType}
                onChange={handleChange}
                placeholder="Enter business type"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor.businessLocation">Business Location</Label>
              <Input
                id="vendor.businessLocation"
                name="vendor.businessLocation"
                value={formData.roleSpecificData.vendor.businessLocation}
                onChange={handleChange}
                placeholder="Enter business location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor.gstNumber">GST Number</Label>
              <Input
                id="vendor.gstNumber"
                name="vendor.gstNumber"
                value={formData.roleSpecificData.vendor.gstNumber}
                onChange={handleChange}
                placeholder="Enter GST number"
              />
            </div>
          </div>
        );

      case "consumer":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="consumer.address">Address</Label>
              <Input
                id="consumer.address"
                name="consumer.address"
                value={formData.roleSpecificData.consumer.address}
                onChange={handleChange}
                placeholder="Enter your address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consumer.city">City</Label>
              <Input
                id="consumer.city"
                name="consumer.city"
                value={formData.roleSpecificData.consumer.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consumer.state">State</Label>
              <Input
                id="consumer.state"
                name="consumer.state"
                value={formData.roleSpecificData.consumer.state}
                onChange={handleChange}
                placeholder="Enter state"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consumer.pincode">Pincode</Label>
              <Input
                id="consumer.pincode"
                name="consumer.pincode"
                value={formData.roleSpecificData.consumer.pincode}
                onChange={handleChange}
                placeholder="Enter pincode"
                maxLength={6}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join the agricultural ecosystem
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="register" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">
                  <Link to="/login" className="w-full h-full flex items-center justify-center">
                    Login
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="register">
                <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                  <div className="space-y-4">
                    {/* User Type Selection */}
                    <div className="space-y-3">
                      <Label>I am a</Label>
                      <RadioGroup
                        value={formData.userType}
                        onValueChange={handleUserTypeChange}
                        className="grid grid-cols-3 gap-4"
                      >
                        <div className={`flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer transition-colors ${formData.userType === "farmer" ? "border-[#138808] bg-[#138808]/5" : "border-gray-200"}`}>
                          <RadioGroupItem value="farmer" id="farmer" className="sr-only" />
                          <Label htmlFor="farmer" className="cursor-pointer flex flex-col items-center gap-2">
                            <Leaf className="h-8 w-8 text-[#138808]" />
                            <span>Farmer</span>
                          </Label>
                        </div>
                        
                        <div className={`flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer transition-colors ${formData.userType === "vendor" ? "border-[#FF9933] bg-[#FF9933]/5" : "border-gray-200"}`}>
                          <RadioGroupItem value="vendor" id="vendor" className="sr-only" />
                          <Label htmlFor="vendor" className="cursor-pointer flex flex-col items-center gap-2">
                            <ShoppingCart className="h-8 w-8 text-[#FF9933]" />
                            <span>Vendor</span>
                          </Label>
                        </div>
                        
                        <div className={`flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer transition-colors ${formData.userType === "consumer" ? "border-[#0000FF] bg-[#0000FF]/5" : "border-gray-200"}`}>
                          <RadioGroupItem value="consumer" id="consumer" className="sr-only" />
                          <Label htmlFor="consumer" className="cursor-pointer flex flex-col items-center gap-2">
                            <Users className="h-8 w-8 text-[#0000FF]" />
                            <span>Consumer</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Basic Information */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="pl-10"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
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

                    <div className="space-y-2">
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

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          className="pl-10 pr-10"
                          placeholder="Create a password"
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

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="pl-10 pr-10"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-gray-400"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Role-specific fields */}
                    {renderRoleSpecificFields()}

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeTerms}
                        onCheckedChange={handleCheckboxChange}
                      />
                      <Label
                        htmlFor="terms"
                        className="text-sm font-medium leading-none"
                      >
                        I agree to the{" "}
                        <Link
                          to="/terms"
                          className="text-[#138808] hover:underline"
                        >
                          terms and conditions
                        </Link>
                      </Label>
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
                        Create Account
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
                        Or sign up with
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
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-[#138808] hover:text-[#138808]/80"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* OTP Verification Dialog */}
      <Dialog open={showOTPDialog} onOpenChange={setShowOTPDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Verification</DialogTitle>
            <DialogDescription>
              Please enter the verification code sent to your email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={handleOTPChange}
                maxLength={6}
                className="text-center text-2xl tracking-wider"
              />
            </div>
            <Button
              className="w-full bg-[#138808] hover:bg-[#138808]/90"
              onClick={handleVerifyOTP}
            >
              Verify Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Register;
