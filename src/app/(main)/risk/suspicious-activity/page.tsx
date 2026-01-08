
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SuspiciousActivityPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suspicious Activity Alerts</CardTitle>
        <CardDescription>Review and manage alerts for potentially fraudulent or suspicious activities.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A list or dashboard of suspicious activity alerts will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
