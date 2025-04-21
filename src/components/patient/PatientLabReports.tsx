
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PatientLabReports() {
  // Using MongoDB data provided earlier
  const labReports = [
    {
      id: 7001234,
      testName: "Complete Blood Count",
      collectionType: "In-Lab",
      collectionDate: "2024-11-01",
      reportDate: "2024-11-02",
      findings: "Normal Hemoglobin Level"
    },
    {
      id: 7001456,
      testName: "Liver Function Test",
      collectionType: "Home Collection",
      collectionDate: "2024-10-15",
      reportDate: "2024-10-16",
      findings: "Slightly Elevated Enzymes"
    },
    {
      id: 7001678,
      testName: "Lipid Profile",
      collectionType: "In-Lab",
      collectionDate: "2024-11-05",
      reportDate: "2024-11-06",
      findings: "High Cholesterol Detected"
    },
    {
      id: 7001890,
      testName: "Thyroid Function Test",
      collectionType: "In-Lab",
      collectionDate: "2024-10-20",
      reportDate: "2024-10-21",
      findings: "TSH Within Range"
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Lab Reports</h2>
      
      {labReports.length === 0 ? (
        <p className="text-gray-500">You don't have any lab reports yet.</p>
      ) : (
        <div className="grid gap-4">
          {labReports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle className="text-lg">{report.testName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <span className="text-sm">{report.collectionType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Collection Date:</span>
                    <span className="text-sm">{report.collectionDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Report Date:</span>
                    <span className="text-sm">{report.reportDate}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Findings:</span>
                    <div className="text-sm">{report.findings}</div>
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
