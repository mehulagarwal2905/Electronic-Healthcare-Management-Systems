
import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  age?: number;
  gender?: string;
  phone?: string;
  address?: {
    city?: string;
    state?: string;
  };
  nextVisit?: string;
}

export function PatientTable() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/doctors/patients`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }

        const data = await response.json();
        setPatients(data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast({
          title: "Error",
          description: "Failed to load patients. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medconnect-primary"></div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No patients found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Next Visit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient._id}>
              <TableCell>{`${patient.firstName} ${patient.lastName}`}</TableCell>
              <TableCell>{patient.email}</TableCell>
              <TableCell>{patient.phone || 'N/A'}</TableCell>
              <TableCell>
                {patient.address?.city && patient.address?.state 
                  ? `${patient.address.city}, ${patient.address.state}`
                  : 'N/A'}
              </TableCell>
              <TableCell>{patient.nextVisit || 'Not scheduled'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
