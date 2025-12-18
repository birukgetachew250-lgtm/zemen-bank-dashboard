

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
import { db } from "@/lib/db";
import config from "@/lib/config";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface OtpCode {
  Id: string;
  UserId: string;
  Purpose: string;
  OtpType: string;
  IsUsed: number;
  Attempts: number;
  ExpiresAt: string;
}

async function getOtpCodes() {
  try {
    let data: any[];
    if (config.db.isProduction) {
      // For Oracle, use case-sensitive and quoted identifiers
      data = await db.prepare(
        'SELECT "Id", "UserId", "Purpose", "OtpType", "IsUsed", "Attempts", "ExpiresAt" FROM "OTP_MODULE"."OtpCodes" ORDER BY "UpdateDate" DESC FETCH FIRST 20 ROWS ONLY'
      ).all();
    } else {
      // For SQLite, use standard identifiers
      data = db.prepare(
        'SELECT Id, UserId, Purpose, OtpType, IsUsed, Attempts, ExpiresAt FROM OtpCodes ORDER BY UpdateDate DESC LIMIT 20'
      ).all();
    }

    if (!data) return [];
    
    // Map Oracle's uppercase field names to our desired camelCase format
    return data.map((row: any) => ({
      Id: row.Id || row.ID,
      UserId: row.UserId || row.USERID,
      Purpose: row.Purpose || row.PURPOSE,
      OtpType: row.OtpType || row.OTPTYPE,
      IsUsed: row.IsUsed ?? row.ISUSED,
      Attempts: row.Attempts ?? row.ATTEMPTS,
      ExpiresAt: row.ExpiresAt || row.EXPIRESAT,
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
    let otpCodes: OtpCode[] = [];
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
                        <TableCell colSpan={6} className="h-24 text-center">
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
