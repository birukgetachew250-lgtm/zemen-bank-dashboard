
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
import { Loader2, Info, User, Phone, Mail, Fingerprint, Shield, Smartphone, Star, Landmark, ArrowRight, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useRouter } from "next/navigation";interface Approval {
  id: string;
  customerName: string;
  customerPhone: string;
  requestedAt: string;
  details: string;
  documents?: DocumentMeta[];
  attachmentUrl?: string;
  checkerRemarks?: string;
}

interface ApprovalClientPageProps {
  approvalType: string;
  pageTitle: string;
}


export function ApprovalClientPage({ approvalType, pageTitle }: ApprovalClientPageProps) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const router = useRouter();

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


  const filteredApprovals = useMemo(() => {
    if (!searchTerm) return approvals;
    return approvals.filter(
      (approval) =>
        approval.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        approval.customerPhone.includes(searchTerm)
    );
  }, [searchTerm, approvals]);
  

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl p-6 mb-6 animate-fade-up bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
        <h1 className="text-3xl font-bold text-white relative z-10">{pageTitle}</h1>
        <p className="text-white/80 mt-2 relative z-10">Review and manage pending approval requests.</p>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      </div>

      <Card className="glass-card animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Pending Requests</h2>
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
                  filteredApprovals.map((approval, i) => (
                    <TableRow 
                      key={approval.id} 
                      className="hover:bg-muted/50 cursor-pointer animate-fade-up" 
                      style={{ animationDelay: `${i * 0.05}s`, opacity: 0, animationFillMode: 'forwards' }}
                      onClick={() => router.push(`/approvals/${approvalType}/${approval.id}`)}
                    >
                      <TableCell className="font-medium">{toTitleCase(approval.customerName)}</TableCell>
                      <TableCell>{approval.customerPhone}</TableCell>
                      <TableCell>{format(parseISO(approval.requestedAt), 'dd MMM yyyy, h:mm a')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Review</Button>
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
    </>
  );
}
