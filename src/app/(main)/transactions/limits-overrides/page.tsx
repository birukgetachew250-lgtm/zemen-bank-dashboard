
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function TransactionLimitsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Limits & Overrides</CardTitle>
        <CardDescription>View and manage transaction limits and any temporary overrides.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content for transaction limits and overrides will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
