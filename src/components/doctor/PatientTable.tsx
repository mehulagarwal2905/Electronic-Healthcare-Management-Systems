
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

interface Patient {
  _id: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  address: {
    city: string;
    state: string;
  };
  nextVisit: string;
}

const demoPatients: Patient[] = [
  {
    _id: 1020345,
    name: "Arjun Kumar",
    age: 29,
    gender: "Male",
    phone: "9876543210",
    address: { city: "Bengaluru", state: "Karnataka" },
    nextVisit: "2024-11-10",
  },
  {
    _id: 1020378,
    name: "Meera Singh",
    age: 35,
    gender: "Female",
    phone: "9001234567",
    address: { city: "Chennai", state: "Tamil Nadu" },
    nextVisit: "2024-11-10",
  },
  {
    _id: 1020567,
    name: "Ravi Gupta",
    age: 32,
    gender: "Male",
    phone: "7896541230",
    address: { city: "New Delhi", state: "Delhi" },
    nextVisit: "2024-11-11",
  },
  {
    _id: 1020459,
    name: "Sneha Reddy",
    age: 23,
    gender: "Female",
    phone: "8123456789",
    address: { city: "Hyderabad", state: "Telangana" },
    nextVisit: "2024-11-12",
  },
  {
    _id: 1020891,
    name: "Karan Patel",
    age: 39,
    gender: "Male",
    phone: "9567890123",
    address: { city: "Mumbai", state: "Maharashtra" },
    nextVisit: "2024-11-10",
  },
  {
    _id: 1020784,
    name: "Pooja Sharma",
    age: 26,
    gender: "Female",
    phone: "7006543210",
    address: { city: "Jaipur", state: "Rajasthan" },
    nextVisit: "2024-11-13",
  },
  {
    _id: 1020672,
    name: "Amit Verma",
    age: 34,
    gender: "Male",
    phone: "9998877655",
    address: { city: "Chandigarh", state: "Punjab" },
    nextVisit: "2024-11-14",
  },
  {
    _id: 1020943,
    name: "Divya Jain",
    age: 27,
    gender: "Female",
    phone: "8765432109",
    address: { city: "Kochi", state: "Kerala" },
    nextVisit: "2024-11-15",
  },
  {
    _id: 1020329,
    name: "Rahul Desai",
    age: 42,
    gender: "Male",
    phone: "8543210987",
    address: { city: "Bengaluru", state: "Karnataka" },
    nextVisit: "2024-11-16",
  },
  {
    _id: 1020615,
    name: "Neha Agarwal",
    age: 31,
    gender: "Female",
    phone: "7890123456",
    address: { city: "Lucknow", state: "Uttar Pradesh" },
    nextVisit: "2024-11-16",
  },
];

export function PatientTable() {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>City</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Next Visit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {demoPatients.map((patient) => (
            <TableRow key={patient._id}>
              <TableCell>{patient._id}</TableCell>
              <TableCell>{patient.name}</TableCell>
              <TableCell>{patient.age}</TableCell>
              <TableCell>{patient.gender}</TableCell>
              <TableCell>{patient.phone}</TableCell>
              <TableCell>{patient.address.city}</TableCell>
              <TableCell>{patient.address.state}</TableCell>
              <TableCell>{patient.nextVisit}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
