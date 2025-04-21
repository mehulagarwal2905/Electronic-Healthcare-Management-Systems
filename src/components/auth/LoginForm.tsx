
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call for login with basic validation
      setTimeout(() => {
        setIsLoading(false);
        
        // Get registered users from localStorage
        const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
        
        // Check if user exists with matching credentials
        const userExists = registeredUsers.find(
          (user: any) => user.email === email && user.password === password && user.role === role
        );
        
        if (userExists) {
          // Store user info in localStorage - in a real app, use secure tokens
          localStorage.setItem("user", JSON.stringify({ email, role }));
          
          if (role === "patient") {
            navigate("/patient-dashboard");
          } else {
            navigate("/doctor-dashboard");
          }
          
          toast({
            title: "Login successful",
            description: `Welcome back!`,
          });
        } else {
          toast({
            title: "Login failed",
            description: "Invalid credentials or account doesn't exist",
            variant: "destructive",
          });
        }
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-medconnect-dark">Healthcare Portal</h1>
        <p className="text-sm text-medconnect-primary mt-1">Electronic Healthcare Management System</p>
      </div>

      <Tabs defaultValue="patient" className="w-full mb-6" onValueChange={(value) => setRole(value)}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="patient">Patient</TabsTrigger>
          <TabsTrigger value="doctor">Doctor</TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remember" 
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
          </div>
          <Link to="/forgot-password" className="text-sm text-medconnect-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-medconnect-primary hover:bg-medconnect-secondary"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
        
        <p className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-medconnect-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
