
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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { executeQuery } from "@/lib/oracle-db";

// Define the type locally based on what the component needs and what the DB provides
interface OtpCodeType {
  Id: string;
  UserId: string;
  Purpose: string;
  OtpType: string;
  IsUsed: boolean;
  Attempts: number;
  ExpiresAt: Date;
}

async function getOtpCodes(): Promise<OtpCodeType[]> {
  if (!process.env.OTP_MODULE_DB_CONNECTION_STRING) {
    console.warn("OTP_MODULE_DB_CONNECTION_STRING not set, returning empty OTP code list.");
    return [];
  }
  try {
    // Note: Oracle uses FETCH FIRST ... ROWS ONLY instead of LIMIT
    const query = `SELECT "Id", "UserId", "Purpose", "OtpType", "IsUsed", "Attempts", "ExpiresAt" FROM "OTP_MODULE"."OtpCodes" ORDER BY "InsertDate" DESC FETCH FIRST 20 ROWS ONLY`;
    const result: any = await executeQuery(process.env.OTP_MODULE_DB_CONNECTION_STRING, query);
    
    if (!result.rows) {
        return [];
    }

    // Map Oracle DB results to our expected type
    return result.rows.map((row: any) => ({
      Id: row.Id,
      UserId: row.UserId,
      Purpose: row.Purpose,
      OtpType: row.OtpType,
      IsUsed: row.IsUsed === 1,
      Attempts: row.Attempts,
      ExpiresAt: new Date(row.ExpiresAt),
    }));
  } catch (error) {
    console.error("Failed to fetch OTP codes:", error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("An unknown error occurred while fetching OTP codes.");
  }
}


export default async function OtpSmsPage() {
    let otpCodes: OtpCodeType[] = [];
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
          <CardTitle>Recent OTP Codes</CardTitle>
          <CardDescription>Displaying the last 20 generated OTP codes from the system.</CardDescription>
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
                  <TableHead>User ID (CIF)</TableHead>
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
                            No OTP codes found.
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
