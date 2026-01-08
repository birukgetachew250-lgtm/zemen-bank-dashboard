
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AllTransactionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Transactions</CardTitle>
        <CardDescription>Search and filter all transactions across the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content for managing all transactions will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
