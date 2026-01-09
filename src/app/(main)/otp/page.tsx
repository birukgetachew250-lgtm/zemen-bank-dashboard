
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
import { systemDb } from "@/lib/system-db";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { OtpCode as OtpCodeType } from "@prisma/client/system";


async function getOtpCodes() {
  try {
    const data = await systemDb.otpCode.findMany({
      orderBy: { UpdateDate: 'desc' },
      take: 20
    });
    return data;
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
