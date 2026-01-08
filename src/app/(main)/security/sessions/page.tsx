
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginSessionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Login Audit & Sessions</CardTitle>
        <CardDescription>Review user login history and manage active sessions.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A list of user login events and active sessions will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
