import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { FileText, Bell, FileText as Lab, Users } from "lucide-react";
import { DoctorPrescriptions } from "@/components/doctor/Prescriptions";
import { PatientTable } from "@/components/doctor/PatientTable";
import { DoctorLabReports } from "@/components/doctor/DoctorLabReports";
import { DoctorReminders } from "@/components/doctor/DoctorReminders";

export default function DoctorDashboard() {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const navigate = useNavigate();
  const { section } = useParams();
  
  useEffect(() => {
    // Check if user is logged in and is a doctor
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return;
    }
    
    try {
      const userData = JSON.parse(userStr);
      if (userData.role !== "doctor") {
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
      description: "Write prescriptions",
      icon: <FileText className="h-6 w-6" />,
      onClick: () => navigate("/doctor-dashboard/prescriptions")
    },
    {
      id: "reminders",
      title: "Reminder",
      description: "Set appointment reminders",
      icon: <Bell className="h-6 w-6" />,
      onClick: () => navigate("/doctor-dashboard/reminders")
    },
    {
      id: "lab-reports",
      title: "Lab Reports",
      description: "View patient test results",
      icon: <Lab className="h-6 w-6" />,
      onClick: () => navigate("/doctor-dashboard/lab-reports")
    },
    {
      id: "my-patients",
      title: "My Patients",
      description: "Manage your patients",
      icon: <Users className="h-6 w-6" />,
      onClick: () => navigate("/doctor-dashboard/my-patients")
    }
  ];

  if (!user) {
    return null; // or a loading spinner
  }

  const renderSection = () => {
    switch (section) {
      case "prescriptions":
        return <DoctorPrescriptions />;
      case "reminders":
        return <DoctorReminders />;
      case "lab-reports":
        return <DoctorLabReports />;
      case "my-patients":
        return (
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">My Patients</h2>
            <PatientTable />
          </div>
        );
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
