
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignupForm } from "@/components/auth/SignupForm";

export default function Signup() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        // Redirect to appropriate dashboard based on role
        if (userData.role === "patient") {
          navigate("/patient-dashboard");
        } else if (userData.role === "doctor") {
          navigate("/doctor-dashboard");
        }
      } catch (error) {
        console.error("Error parsing user data", error);
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-medconnect-light p-4">
      <SignupForm />
    </div>
  );
}
