
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  loadPrescriptionsFromAPI,
  Prescription,
} from "./prescriptionHelpers";
import { PrescriptionForm } from "./PrescriptionForm";
import { PrescriptionList } from "./PrescriptionList";

export function DoctorPrescriptions() {
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load prescriptions from API when component mounts
  useEffect(() => {
    async function fetchPrescriptions() {
      try {
        setIsLoading(true);
        const prescriptions = await loadPrescriptionsFromAPI();
        setRecentPrescriptions(prescriptions);
      } catch (error) {
        toast({
          title: "Failed to load prescriptions",
          description: "Could not retrieve your prescriptions",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPrescriptions();
  }, []);

  // Handles new prescription creation
  const handleCreatePrescription = (newPrescription: Prescription) => {
    setRecentPrescriptions([newPrescription, ...recentPrescriptions]);
    // No need to manually save - the API already handled it
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
