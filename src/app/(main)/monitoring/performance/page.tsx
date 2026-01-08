
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PerformanceMetricsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
        <CardDescription>Deep dive into resource consumption and performance KPIs per microservice to identify bottlenecks.</CardDescription>
      </CardHeader>
      <CardContent>
         <div className="text-center py-12">
            <h3 className="text-lg font-semibold">Performance Metrics Dashboard</h3>
            <p className="text-muted-foreground mt-2">
                This area will feature real-time charts and gauges for latency, error rates, CPU/memory usage, and throughput per service.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
