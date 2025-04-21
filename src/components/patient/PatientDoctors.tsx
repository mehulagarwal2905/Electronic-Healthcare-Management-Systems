
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRound } from "lucide-react";

export function PatientDoctors() {
  // Using MongoDB data provided earlier
  const doctors = [
    {
      id: 3010456,
      name: "Dr. Anil Menon",
      qualifications: "MBBS, MD (General Medicine)",
      experienceYears: 15,
      specialty: "General Medicine"
    },
    {
      id: 3010678,
      name: "Dr. Shweta Kapoor",
      qualifications: "BDS, MDS (Oral Surgery)",
      experienceYears: 10,
      specialty: "Dentistry"
    },
    {
      id: 3010234,
      name: "Dr. Ramesh Iyer",
      qualifications: "MBBS, MS (Orthopedics)",
      experienceYears: 20,
      specialty: "Orthopedics"
    },
    {
      id: 3010789,
      name: "Dr. Priya Nair",
      qualifications: "MBBS, DNB (Dermatology)",
      experienceYears: 8,
      specialty: "Dermatology"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Doctors</h2>
      
      {doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow text-center">
          <UserRound className="h-12 w-12 text-gray-400 mb-4" />
          <p>You haven't been assigned to any doctors yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {doctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardHeader>
                <CardTitle className="text-lg">{doctor.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Specialty:</span>
                    <span className="text-sm">{doctor.specialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Qualifications:</span>
                    <span className="text-sm">{doctor.qualifications}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Experience:</span>
                    <span className="text-sm">{doctor.experienceYears} years</span>
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
