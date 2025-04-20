
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { FileText, Bell, FileText as Lab, Users } from "lucide-react";
import { PatientPrescriptions } from "@/components/patient/Prescriptions";

export default function PatientDashboard() {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const navigate = useNavigate();
  const { section } = useParams();
  
  useEffect(() => {
    // Check if user is logged in and is a patient
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return;
    }
    
    try {
      const userData = JSON.parse(userStr);
      if (userData.role !== "patient") {
        navigate("/login");
        return;
      }
      setUser(userData);
    } catch (error) {
      console.error("Error parsing user data", error);
      navigate("/login");
    }
  }, [navigate]);

  const dashboardItems = [
    {
      id: "prescriptions",
      title: "Prescription",
      description: "View your prescriptions",
      icon: <FileText className="h-6 w-6" />,
      onClick: () => navigate("/patient-dashboard/prescriptions")
    },
    {
      id: "reminders",
      title: "Reminder",
      description: "Set medication reminders",
      icon: <Bell className="h-6 w-6" />,
      onClick: () => navigate("/patient-dashboard/reminders")
    },
    {
      id: "lab-reports",
      title: "Lab Reports",
      description: "Access your test results",
      icon: <Lab className="h-6 w-6" />,
      onClick: () => navigate("/patient-dashboard/lab-reports")
    },
    {
      id: "my-doctors",
      title: "My Doctors",
      description: "Manage your doctors",
      icon: <Users className="h-6 w-6" />,
      onClick: () => navigate("/patient-dashboard/my-doctors")
    }
  ];

  if (!user) {
    return null; // or a loading spinner
  }

  // Render the appropriate section based on the URL
  const renderSection = () => {
    switch (section) {
      case "prescriptions":
        return <PatientPrescriptions />;
      case "reminders":
        return <div className="p-4 bg-white rounded-lg shadow"><h2 className="text-xl font-bold mb-4">Medication Reminders</h2><p>You have no medication reminders set up. Create your first reminder to get started.</p></div>;
      case "lab-reports":
        return <div className="p-4 bg-white rounded-lg shadow"><h2 className="text-xl font-bold mb-4">Lab Reports</h2><p>Your recent lab reports will appear here.</p></div>;
      case "my-doctors":
        return <div className="p-4 bg-white rounded-lg shadow"><h2 className="text-xl font-bold mb-4">My Doctors</h2><p>Your care team will appear here.</p></div>;
      default:
        return (
          <>
            <section className="mb-8">
              <h1 className="text-2xl font-bold mb-2">What Would You Like To Do Today?</h1>
            </section>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardItems.map((item, index) => (
                <DashboardCard
                  key={index}
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  onClick={item.onClick}
                />
              ))}
            </div>
          </>
        );
    }
  };

  return (
    <MainLayout>
      {renderSection()}
    </MainLayout>
  );
}
