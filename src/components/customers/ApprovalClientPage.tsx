
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
import { Loader2, Info, User, Phone, Mail, Fingerprint, Shield, Smartphone, Star, Landmark, ArrowRight, FileText, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useRouter } from "next/navigation";
import { toTitleCase } from "@/lib/utils";

interface Approval {
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
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review and manage pending approval requests.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input 
            placeholder="Search by name or phone..."
            className="pl-8 h-8 text-sm rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <Table className="font-body">
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-semibold uppercase tracking-wider pl-4">Name</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Phone</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Request Date</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-right pr-4">Action</TableHead>
            </TableRow>
          </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="pl-4"><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell className="text-right pr-4"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
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
                      <TableCell className="pl-4 font-medium py-3 text-sm">{toTitleCase(approval.customerName)}</TableCell>
                      <TableCell className="py-3 text-sm">{approval.customerPhone}</TableCell>
                      <TableCell className="py-3 text-sm">{format(parseISO(approval.requestedAt), 'dd MMM yyyy, h:mm a')}</TableCell>
                      <TableCell className="text-right py-3 pr-4">
                        <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs">Review</Button>
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
    </div>
  );
}
