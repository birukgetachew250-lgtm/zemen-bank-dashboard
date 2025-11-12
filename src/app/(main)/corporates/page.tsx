
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

// Mock data for corporates
const corporates = [
  { id: "corp_1", name: "Dangote Cement", industry: "Manufacturing", status: "Active" },
  { id: "corp_2", name: "MTN Nigeria", industry: "Telecommunications", status: "Active" },
  { id: "corp_3", name: "Zenith Bank", industry: "Finance", status: "Inactive" },
  { id: "corp_4", name: "Jumia Group", industry: "E-commerce", status: "Active" },
];

export default function CorporatesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Existing Corporates</CardTitle>
      </CardHeader>
      <CardContent>
         <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Corporate Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {corporates.map((corporate) => (
                <TableRow key={corporate.id}>
                  <TableCell className="font-medium">{corporate.name}</TableCell>
                  <TableCell>{corporate.industry}</TableCell>
                  <TableCell>
                     <Badge variant={corporate.status === 'Active' ? 'secondary' : 'destructive'}>
                        {corporate.status}
                     </Badge>
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
