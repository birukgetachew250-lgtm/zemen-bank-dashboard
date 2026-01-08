
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function OverviewMetricsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview Metrics</CardTitle>
        <CardDescription>View key performance indicators like DAU/MAU, transaction value/volume, and growth trends.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A dashboard with overview metrics will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
