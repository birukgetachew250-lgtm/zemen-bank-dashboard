
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data for audit trail
const auditLogs = [
  { id: 1, user: 'Admin User', action: 'Updated System Settings', details: 'Changed transaction limit to $10,000', timestamp: '2023-10-27 11:00 AM' },
  { id: 2, user: 'Admin User', action: 'Accessed Corporate Report', details: 'Viewed report for Dangote Cement', timestamp: '2023-10-27 10:55 AM' },
  { id: 3, user: 'Support Lead', action: 'Granted Permissions', details: 'Gave "Approve Pin Reset" permission to new support staff', timestamp: '2023-10-26 04:00 PM' },
];

export default function UsersAuditTrailPage() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>System Users Audit Trail</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
