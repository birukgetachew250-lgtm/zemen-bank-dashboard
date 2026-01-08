
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ScheduledReportsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Reports</CardTitle>
        <CardDescription>Manage reports that are generated and emailed automatically on a daily or weekly basis.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A list of scheduled reports and options to create new ones will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
