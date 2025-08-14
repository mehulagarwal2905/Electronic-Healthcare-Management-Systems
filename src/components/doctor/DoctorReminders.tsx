
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { format, parseISO, isAfter, isToday } from "date-fns";

interface Prescription {
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  medication: string;
  nextVisitDate: string;
}

export function DoctorReminders() {
  const [upcomingVisits, setUpcomingVisits] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUpcomingVisits = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/prescriptions/doctor`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch upcoming visits');
        }

        const data = await response.json();
        
        // Filter prescriptions with upcoming or today's visits
        const upcoming = data.filter((prescription: Prescription) => {
          const visitDate = new Date(prescription.nextVisitDate);
          return isAfter(visitDate, new Date()) || isToday(visitDate);
        });

        setUpcomingVisits(upcoming);
      } catch (error) {
        console.error('Error fetching upcoming visits:', error);
        toast({
          title: "Error",
          description: "Failed to load upcoming visits. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingVisits();
  }, []);

  if (isLoading) {
    return <div>Loading upcoming visits...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Upcoming Patient Visits</h2>
      {upcomingVisits.length === 0 ? (
        <p className="text-muted-foreground">No upcoming visits scheduled.</p>
      ) : (
        <div className="grid gap-4">
          {upcomingVisits.map((prescription) => (
            <Card key={prescription._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {prescription.patient.firstName} {prescription.patient.lastName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Visit Date:</span>
                    <span className="font-medium">
                      {format(parseISO(prescription.nextVisitDate), 'PPP')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Medication:</span>
                    <span className="font-medium">{prescription.medication}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Patient Email:</span>
                    <a 
                      href={`mailto:${prescription.patient.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {prescription.patient.email}
                    </a>
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
