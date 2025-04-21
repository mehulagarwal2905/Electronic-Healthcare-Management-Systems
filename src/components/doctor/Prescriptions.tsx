
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  loadPrescriptionsFromStorage,
  savePrescriptionsToStorage,
  Prescription,
} from "./prescriptionHelpers";
import { PrescriptionForm } from "./PrescriptionForm";
import { PrescriptionList } from "./PrescriptionList";

export function DoctorPrescriptions() {
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>(
    () => loadPrescriptionsFromStorage()
  );

  // Always save to localStorage when prescriptions change
  useEffect(() => {
    savePrescriptionsToStorage(recentPrescriptions);
  }, [recentPrescriptions]);

  // Handles new prescription creation
  const handleCreatePrescription = (newPrescription: Prescription) => {
    const updated = [newPrescription, ...recentPrescriptions];
    setRecentPrescriptions(updated);
    savePrescriptionsToStorage(updated);
  };

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">Write Prescriptions</h2>
      <PrescriptionForm onCreate={handleCreatePrescription} />
      <h3 className="text-xl font-semibold mt-6">Recent Prescriptions</h3>
      <PrescriptionList prescriptions={recentPrescriptions} />
    </div>
  );
}
