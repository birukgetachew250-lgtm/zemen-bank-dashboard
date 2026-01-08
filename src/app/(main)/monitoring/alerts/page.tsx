
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AlertsCenterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts & Notifications Center</CardTitle>
        <CardDescription>A central place for real-time incidents and deep-dive log analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
            <h3 className="text-lg font-semibold">Alerts Feed & Log Explorer</h3>
            <p className="text-muted-foreground mt-2">
                This area will display a chronological list of system alerts and a powerful log explorer interface.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
