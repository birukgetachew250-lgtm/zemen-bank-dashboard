
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TransactionTracingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Tracing</CardTitle>
        <CardDescription>Trace transactions end-to-end across multiple microservices.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A tool to visualize and trace the lifecycle of a transaction will be available here.</p>
      </CardContent>
    </Card>
  );
}
