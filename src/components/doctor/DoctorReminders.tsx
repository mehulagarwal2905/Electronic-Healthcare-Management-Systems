
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const demoReminders = [
  {
    id: 5001234,
    patient: "Arjun Kumar",
    date: "2024-10-10",
    time: "10:00",
    amount: 500,
  },
  {
    id: 5001567,
    patient: "Meera Singh",
    date: "2024-09-25",
    time: "11:30",
    amount: 400,
  },
  {
    id: 5001789,
    patient: "Ravi Gupta",
    date: "2024-10-05",
    time: "09:15",
    amount: 450,
  },
  {
    id: 5001987,
    patient: "Sneha Reddy",
    date: "2024-08-20",
    time: "16:00",
    amount: 600,
  }
  // ...extend/adjust from your MongoDB data if needed
];

export function DoctorReminders() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Appointment Reminders</h2>
      <div className="grid gap-4">
        {demoReminders.map((reminder) => (
          <Card key={reminder.id}>
            <CardHeader>
              <CardTitle className="text-lg">{reminder.patient}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm mb-1">
                <span>Date:</span>
                <span>{reminder.date}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Time:</span>
                <span>{reminder.time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Amount:</span>
                <span>₹{reminder.amount}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
