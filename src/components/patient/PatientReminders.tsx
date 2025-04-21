
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export function PatientReminders() {
  // Using MongoDB data provided earlier
  const reminders = [
    {
      id: 5001234,
      medicationName: "Paracetamol",
      date: "2024-10-10",
      time: "10:00",
      notes: "Take with food"
    },
    {
      id: 5001567,
      medicationName: "Multivitamin",
      date: "2024-09-25",
      time: "11:30",
      notes: "Take after breakfast"
    },
    {
      id: 5001789,
      medicationName: "Atorvastatin",
      date: "2024-10-05",
      time: "09:15",
      notes: "Take before bedtime"
    },
    {
      id: 5001987,
      medicationName: "Levothyroxine",
      date: "2024-08-20",
      time: "16:00",
      notes: "Take on empty stomach"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Medication Reminders</h2>
      
      {reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow text-center">
          <Bell className="h-12 w-12 text-gray-400 mb-4" />
          <p>You have no medication reminders set up.</p>
          <p className="text-gray-500">Create your first reminder to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reminders.map((reminder) => (
            <Card key={reminder.id}>
              <CardHeader>
                <CardTitle className="text-lg">{reminder.medicationName}</CardTitle>
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
                  <span>Notes:</span>
                  <span>{reminder.notes}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
