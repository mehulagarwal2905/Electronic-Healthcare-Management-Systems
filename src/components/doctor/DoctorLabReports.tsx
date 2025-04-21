
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const demoLabReports = [
  {
    id: 7001234,
    patient: "Arjun Kumar",
    testName: "Complete Blood Count",
    collectionType: "In-Lab",
    collectionDate: "2024-11-01",
    reportDate: "2024-11-02",
    findings: "Normal Hemoglobin Level",
  },
  {
    id: 7001456,
    patient: "Meera Singh",
    testName: "Liver Function Test",
    collectionType: "Home Collection",
    collectionDate: "2024-10-15",
    reportDate: "2024-10-16",
    findings: "Slightly Elevated Enzymes",
  },
  {
    id: 7001678,
    patient: "Ravi Gupta",
    testName: "Lipid Profile",
    collectionType: "In-Lab",
    collectionDate: "2024-11-05",
    reportDate: "2024-11-06",
    findings: "High Cholesterol Detected",
  },
  {
    id: 7001890,
    patient: "Sneha Reddy",
    testName: "Thyroid Function Test",
    collectionType: "In-Lab",
    collectionDate: "2024-10-20",
    reportDate: "2024-10-21",
    findings: "TSH Within Range",
  }
  // ...extend as needed from your data
];

export function DoctorLabReports() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Patient Lab Reports</h2>
      <div className="grid gap-4">
        {demoLabReports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <CardTitle className="text-lg">{report.patient} - {report.testName}</CardTitle>
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
    </div>
  );
}
