
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function WebhookLogsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Webhook & Callback Logs</CardTitle>
        <CardDescription>Review logs for all incoming webhooks and outgoing callbacks.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A searchable log of webhook and callback events will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
