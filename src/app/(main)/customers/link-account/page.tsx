'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Link, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CustomerDetails } from '@/components/customers/CustomerDetailsCard';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FileUpload, type UploadedFile } from '@/components/ui/FileUpload';
import { Separator } from '@/components/ui/separator';



interface Account {
    custacno: string;
    branch_code: string;
    ccy: string;
    account_type: string;
    acclassdesc: string;
    status: string; 
    isAlreadyLinked: boolean;
}

const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active': return 'secondary';
        case 'dormant': return 'outline';
        case 'inactive': return 'destructive';
        default: return 'default';
    }
}

const statusColorMap: { [key: string]: string } = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Dormant: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Inactive: 'bg-red-100 text-red-800 border-red-200',
};


export default function LinkAccountPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cifNumber, setCifNumber] = useState('');
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selection, setSelection] = useState<Record<string, boolean>>({});
  const [documents, setDocuments] = useState<UploadedFile[]>([]);


  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchAccounts() {
      if (!customer?.cifNumber) return;
      
      setIsLoading(true);
      try {
        const accRes = await fetch(`/api/online-linking/find-accounts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cif: customer.cifNumber, branch_code: customer.branchCode || '103' })
        });
        if (!accRes.ok) throw new Error((await accRes.json()).message || 'Could not fetch accounts');
        const accData = await accRes.json();
        console.log("Fetched Accounts Data:", accData); // <-- Added for debugging
        setAccounts(accData);
        setSelection({});
      setDocuments([]);

      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Could not fetch accounts', description: error.message });
      } finally {
        setIsLoading(false);
      }
    }

    fetchAccounts();
  }, [customer, toast]);

  const handleSearch = async () => {
    if (!cifNumber) {
      toast({ variant: 'destructive', title: 'CIF number required' });
      return;
    }
    setIsLoading(true);
    setCustomer(null);
    setAccounts([]);
    setSelection({});

    try {
      const custRes = await fetch(`/api/customers/${cifNumber}`);
      if (!custRes.ok) throw new Error((await custRes.json()).message || 'Customer not found');
      const custData = await custRes.json();
      setCustomer(custData);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Search Failed', description: error.message });
      setIsLoading(false); // Stop loading on search fail
    } 
    // Loading is stopped in useEffect after accounts are fetched
  };
  
  const handleSelectionChange = (accountNumber: string, isSelected: boolean) => {
    setSelection(prev => ({...prev, [accountNumber]: isSelected}));
  };

  const selectedAccounts = useMemo(() => {
    return accounts.filter(acc => !acc.isAlreadyLinked && selection[acc.custacno]);
  }, [accounts, selection]);


  const handleSubmitForApproval = async () => {
    if (!customer || selectedAccounts.length === 0) {
        toast({ variant: 'destructive', title: 'No accounts selected', description: 'Please select at least one new account to link.' });
        return;
    }
    setIsSubmitting(true);
    try {
        const response = await fetch('/api/approvals/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                cif: customer.cifNumber, 
                type: 'customer-account', 
                customerName: customer.name, 
                customerPhone: customer.phoneNumber,
                details: {
                    cif: customer.cifNumber,
                    customerName: customer.name,
                    linkedAccounts: selectedAccounts,
                },
                attachmentUrl: documents.length > 0 ? documents[0].url : undefined,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Submission failed');
        }
        toast({
            title: 'Request Submitted',
            description: `Request to link ${selectedAccounts.length} account(s) has been sent for approval.`
        });
        
        setCustomer(null);
        setAccounts([]);
        setSelection({});
        setCifNumber('');
        setDocuments([]);


    } catch (error: any) {
       toast({ variant: "destructive", title: 'Submission Failed', description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Link New Account(s)</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Search for a customer by CIF, then select accounts to link.
        </p>
      </div>
      <MakerMiniHistory approvalType="customer-account" />

      <Card className="glass-card shadow-sm border-slate-200/80 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">Find Customer</CardTitle>
          <CardDescription>Search by CIF number</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-lg items-center gap-2">
            <Input
              type="text"
              placeholder="Enter CIF Number..."
              value={cifNumber}
              onChange={(e) => setCifNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="rounded-xl"
            />
            <Button onClick={handleSearch} disabled={isLoading} className="rounded-xl">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && !customer && (
        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      )}

      {customer && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle>Select Accounts for {customer.name}</CardTitle>
            <CardDescription>Choose the accounts to link to this customer's mobile banking profile.</CardDescription>
          </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                  <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : accounts.length > 0 ? (
                 <div className="rounded-md border">
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Link</TableHead>
                                <TableHead>Account Number</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Currency</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accounts.map(acc => (
                                <TableRow key={acc.custacno} data-state={selection[acc.custacno] ? "selected" : undefined}>
                                    <TableCell>
                                        <Checkbox 
                                            checked={selection[acc.custacno] || acc.isAlreadyLinked}
                                            disabled={acc.isAlreadyLinked}
                                            onCheckedChange={(checked) => handleSelectionChange(acc.custacno, !!checked)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-mono">{acc.custacno}</TableCell>
                                    <TableCell>{acc.acclassdesc}</TableCell>
                                    <TableCell><Badge variant="outline">{acc.ccy}</Badge></TableCell>
                                    <TableCell>
                                        <Badge variant={acc.isAlreadyLinked ? 'default' : getStatusVariant(acc.status)} className={cn(acc.isAlreadyLinked ? 'bg-indigo-100 text-indigo-800' : statusColorMap[acc.status])}>
                                            {acc.isAlreadyLinked ? 'Already Linked' : acc.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </div>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>No Unlinked Accounts Found</AlertTitle>
                  <AlertDescription>No unlinked bank accounts were found for this customer.</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardContent className="pt-0 space-y-3">
              <Separator />
              <h3 className="text-sm font-semibold">Supporting Documents</h3>
              <FileUpload
                value={documents}
                onChange={setDocuments}
                label="Supporting Documents"
                required
                maxFiles={5}
                maxSizeMB={10}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSubmitForApproval} disabled={selectedAccounts.length === 0 || isSubmitting} className="rounded-xl gap-2">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4" />}
                Request Link for {selectedAccounts.length} Account(s)
              </Button>
            </CardFooter>
        </Card>
      )}
    </div>
  );
}
