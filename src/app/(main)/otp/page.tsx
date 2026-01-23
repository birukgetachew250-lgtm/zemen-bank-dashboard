
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

async function getOtpCodes() {
  try {
    const data = await db.otpCode.findMany({
      orderBy: { InsertDate: 'desc' },
      take: 20
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch OTP codes from PostgreSQL:", error);
    // This will happen if the migration hasn't been run.
    // We throw an error that the page component can catch and display.
    throw new Error("Could not connect to the OTP code table. Please ensure you have run database migrations: `npm run migrate:dev`");
  }
}

export default async function OtpSmsPage() {
    let otpCodes = [];
    let error: string | null = null;
    
    try {
        otpCodes = await getOtpCodes();
    } catch (e: any) {
        error = e.message;
    }

  return (
    <div className="w-full h-full">
      <Card>
        <CardHeader>
          <CardTitle>Recent OTP Codes (System Users)</CardTitle>
          <CardDescription>Displaying the last 20 generated MFA codes from the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Database Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Expires At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otpCodes.length > 0 ? (
                  otpCodes.map((code) => (
                  <TableRow key={code.Id}>
                    <TableCell className="font-mono">{code.UserId}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{code.Purpose}</Badge>
                    </TableCell>
                    <TableCell>{code.OtpType}</TableCell>
                    <TableCell className="font-mono tracking-widest">******</TableCell>
                    <TableCell>
                      <Badge variant={code.IsUsed ? "secondary" : "destructive"} className={code.IsUsed ? 'bg-green-100 text-green-800' : ''}>
                        {code.IsUsed ? "Yes" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>{code.Attempts}</TableCell>
                    <TableCell>{format(new Date(code.ExpiresAt), "dd MMM yyyy, HH:mm:ss")}</TableCell>
                  </TableRow>
                ))) : (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                           {!error && "No OTP codes found."}
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
