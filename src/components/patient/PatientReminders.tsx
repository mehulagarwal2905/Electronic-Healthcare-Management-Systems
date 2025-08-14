
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO, isAfter, isToday } from "date-fns";

interface PrescriptionReminder {
  _id: string;
  medication: string;
  nextVisitDate: string;
  doctor: { firstName: string; lastName: string; email: string };
}

export function PatientReminders() {
  const [visits, setVisits] = useState<PrescriptionReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication required");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/prescriptions/patient`,
          { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        if (!response.ok) throw new Error("Failed to load reminders");
        const data: PrescriptionReminder[] = await response.json();
        const upcoming = data.filter(p => {
          const date = new Date(p.nextVisitDate);
          return isAfter(date, new Date()) || isToday(date);
        });
        setVisits(upcoming);
      } catch (error: any) {
        console.error("Error loading patient reminders:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchVisits();
  }, []);

  if (isLoading) {
    return <div>Loading reminders...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Upcoming Visits</h2>
      {visits.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow text-center">
          <Bell className="h-12 w-12 text-gray-400 mb-4" />
          <p>No upcoming visits scheduled.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {visits.map(vis => (
            <Card key={vis._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{format(parseISO(vis.nextVisitDate), 'PPP')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Medication:</span>
                    <span className="font-medium">{vis.medication}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Doctor:</span>
                    <span className="font-medium">Dr. {vis.doctor.firstName} {vis.doctor.lastName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email:</span>
                    <a href={`mailto:${vis.doctor.email}`} className="text-blue-600 hover:underline">{vis.doctor.email}</a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

