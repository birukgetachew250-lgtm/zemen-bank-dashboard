
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ExportCenterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Center</CardTitle>
        <CardDescription>Download historical data and generated reports in CSV or PDF format.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A list of available exports will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
