
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ApiMonitoringPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Monitoring</CardTitle>
        <CardDescription>Monitor external calls to EthSwitch, partners, and other critical APIs.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A dashboard for monitoring external API calls will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
