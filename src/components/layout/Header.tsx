
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface User {
  email: string;
  role: string;
}

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get user info from localStorage
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
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };
  
  const getAppointmentButtonText = () => {
    if (!user) return "Book Appointment";
    return user.role === "patient" ? "Book Appointment" : "Check Appointments";
  };
  
  const getAppointmentLink = () => {
    if (!user) return "/login";
    return user.role === "patient" ? "/patient-dashboard/appointments" : "/doctor-dashboard/appointments";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-medconnect-primary">
            MedConnect
          </Link>
          
          {user && (
            <nav className="ml-8 hidden md:flex space-x-6">
              {user.role === "patient" ? (
                <>
                  <Link to="/doctors" className="text-sm text-gray-600 hover:text-medconnect-primary">
                    Doctors
                  </Link>
                  <Link to="/specialties" className="text-sm text-gray-600 hover:text-medconnect-primary">
                    Specialties
                  </Link>
                  <Link to="/locations" className="text-sm text-gray-600 hover:text-medconnect-primary">
                    Locations
                  </Link>
                  <Link to="/hospitals" className="text-sm text-gray-600 hover:text-medconnect-primary">
                    Hospitals
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/patients" className="text-sm text-gray-600 hover:text-medconnect-primary">
                    Patients
                  </Link>
                  <Link to="/locations" className="text-sm text-gray-600 hover:text-medconnect-primary">
                    Locations
                  </Link>
                  <Link to="/hospitals" className="text-sm text-gray-600 hover:text-medconnect-primary">
                    Hospitals
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="default"
            size="sm"
            className="bg-medconnect-primary hover:bg-medconnect-secondary text-white"
            asChild
          >
            <Link to={getAppointmentLink()}>
              {getAppointmentButtonText()}
            </Link>
          </Button>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-medconnect-primary">
                <Bell size={20} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="text-gray-500 hover:text-medconnect-primary"
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-500 hover:text-medconnect-primary"
              asChild
            >
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
