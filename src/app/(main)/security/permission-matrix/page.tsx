
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PermissionMatrixPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions Matrix</CardTitle>
        <CardDescription>View a detailed grid of all roles and their assigned permissions.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A matrix view of roles and permissions will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
