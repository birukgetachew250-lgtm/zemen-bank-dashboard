
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DisputeResolutionPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dispute Resolution Queue</CardTitle>
        <CardDescription>Manage and resolve customer transaction disputes and chargebacks.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A queue of customer disputes will be displayed here for management.</p>
      </CardContent>
    </Card>
  );
}
