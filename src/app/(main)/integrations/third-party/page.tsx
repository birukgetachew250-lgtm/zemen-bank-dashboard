
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ThirdPartyIntegrationsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Third-Party Integrations</CardTitle>
        <CardDescription>Manage integrations with third-party services like remittance partners and e-commerce platforms.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A list of third-party integrations and their statuses will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
