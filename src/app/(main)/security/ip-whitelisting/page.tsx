
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function IpWhitelistingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>IP Whitelisting</CardTitle>
        <CardDescription>Manage IP addresses that are permitted to access the admin panel.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A tool for managing whitelisted IP addresses will be available here.</p>
      </CardContent>
    </Card>
  );
}
