
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
  { id: 1, user: 'Customer Support', customer: 'John Doe', action: 'Approved Pin Reset', timestamp: '2023-10-27 10:00 AM' },
  { id: 2, user: 'System', customer: 'Jane Smith', action: 'Device Changed', timestamp: '2023-10-27 09:45 AM' },
  { id: 3, user: 'Compliance Officer', customer: 'Bob Johnson', action: 'Flagged Transaction', timestamp: '2023-10-26 03:20 PM' },
];

export default function CustomersAuditTrailPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customers Audit Trail</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User/System</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.timestamp}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell className="font-medium">{log.customer}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
