
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TransactionTracingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distributed Transaction Tracing</CardTitle>
        <CardDescription>Trace a transaction's end-to-end journey across all microservices to debug failures.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
            <h3 className="text-lg font-semibold">Trace Visualization</h3>
            <p className="text-muted-foreground mt-2">
                A search interface and waterfall diagram visualizing transaction lifecycles will be implemented here.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
