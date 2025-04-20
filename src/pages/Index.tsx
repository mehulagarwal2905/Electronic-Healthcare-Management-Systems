
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";

export default function Index() {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data", error);
      }
    }
  }, []);

  const handleGetStarted = () => {
    if (user) {
      if (user.role === "patient") {
        navigate("/patient-dashboard");
      } else {
        navigate("/doctor-dashboard");
      }
    } else {
      navigate("/login");
    }
  };

  return (
    <MainLayout>
      <div className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
            Healthcare Made Simple
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            MedConnect helps patients and doctors connect seamlessly, manage appointments, 
            prescriptions, and medical records all in one secure platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-medconnect-primary hover:bg-medconnect-secondary"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              asChild
            >
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="py-12 bg-white rounded-lg shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-medconnect-primary font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for better healthcare
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-medconnect-light p-6 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-medconnect-primary text-white mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Electronic Health Records</h3>
              <p className="text-gray-600">Access your complete medical history in one secure location.</p>
            </div>

            <div className="bg-medconnect-light p-6 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-medconnect-primary text-white mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Easy Scheduling</h3>
              <p className="text-gray-600">Book and manage appointments with your healthcare providers.</p>
            </div>

            <div className="bg-medconnect-light p-6 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-medconnect-primary text-white mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Secure Communication</h3>
              <p className="text-gray-600">Message your healthcare team securely and get timely responses.</p>
            </div>

            <div className="bg-medconnect-light p-6 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-medconnect-primary text-white mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Digital Prescriptions</h3>
              <p className="text-gray-600">Receive and manage prescriptions electronically.</p>
            </div>

            <div className="bg-medconnect-light p-6 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-medconnect-primary text-white mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Lab Results</h3>
              <p className="text-gray-600">View and understand your lab results as soon as they're available.</p>
            </div>

            <div className="bg-medconnect-light p-6 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-medconnect-primary text-white mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reminders & Alerts</h3>
              <p className="text-gray-600">Get timely notifications for medications, appointments, and preventive care.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
