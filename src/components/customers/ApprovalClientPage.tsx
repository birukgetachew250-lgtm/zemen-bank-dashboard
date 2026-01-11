
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent } from "../ui/card";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Info } from "lucide-react";

interface Approval {
  id: string;
  customerName: string;
  customerPhone: string;
  requestedAt: string;
}

interface ApprovalClientPageProps {
  approvalType: string;
  pageTitle: string;
}

export function ApprovalClientPage({ approvalType, pageTitle }: ApprovalClientPageProps) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customers/pending?type=${approvalType}`);
      const data = await response.json();
      setApprovals(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching approvals",
        description: "Could not load data for approvals.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [approvalType]);

  const handleAction = async (action: 'approve' | 'reject', approvalId: string) => {
    setActionLoading(prev => ({ ...prev, [approvalId]: true }));
    try {
      const response = await fetch('/api/approvals/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId, action }),
      });
      const result = await response.json();
      if (response.ok) {
        if (action === 'approve' && result.newPin) {
          toast({
            duration: 10000, // Keep toast open for longer
            title: `PIN Reset Successful`,
            description: (
              <div className="flex flex-col gap-2">
                <span>The new PIN has been generated.</span>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>New Temporary PIN</AlertTitle>
                  <AlertDescription className="font-mono text-lg">{result.newPin}</AlertDescription>
                </Alert>
                <span className="text-xs">Please securely communicate this to the customer.</span>
              </div>
            ),
          });
        } else {
           toast({
            title: `Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
            description: result.message || `The request has been successfully ${action === 'approve' ? 'approved' : 'rejected'}.`,
          });
        }
        fetchApprovals(); // Refresh the list
      } else {
        throw new Error(result.message || 'Action failed');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `Failed to ${action} request`,
        description: error.message || "An error occurred while processing the request.",
      });
    } finally {
        setActionLoading(prev => ({ ...prev, [approvalId]: false }));
    }
  };

  const filteredApprovals = useMemo(() => {
    if (!searchTerm) return approvals;
    return approvals.filter(
      (approval) =>
        approval.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        approval.customerPhone.includes(searchTerm)
    );
  }, [searchTerm, approvals]);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-headline font-semibold">{pageTitle}</h2>
          <Input 
            placeholder="Search by name or phone..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="rounded-md border">
          <Table className="font-body">
            <TableHeader className="bg-sidebar-bg/5 dark:bg-sidebar-bg/20">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredApprovals.length > 0 ? (
                filteredApprovals.map((approval) => (
                  <TableRow key={approval.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{approval.customerName}</TableCell>
                    <TableCell>{approval.customerPhone}</TableCell>
                    <TableCell>{format(parseISO(approval.requestedAt), 'dd MMM yyyy, h:mm a')}</TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <Button
                        onClick={() => handleAction('approve', approval.id)}
                        className="font-medium"
                        size="sm"
                        disabled={actionLoading[approval.id]}
                      >
                         {actionLoading[approval.id] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleAction('reject', approval.id)}
                        variant="destructive"
                        className="font-medium bg-red-600 hover:bg-red-700"
                        size="sm"
                        disabled={actionLoading[approval.id]}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No pending approvals found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
