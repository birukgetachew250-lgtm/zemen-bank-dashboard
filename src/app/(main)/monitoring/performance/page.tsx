
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PerformanceMetricsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>Analyze performance metrics like latency, error rates, and resource usage per service.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Charts and graphs for performance metrics will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
