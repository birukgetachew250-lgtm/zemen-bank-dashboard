
'use client';

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Edit, PlusCircle, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface IPSBank {
  id: string;
  bankName: string;
  bankCode: string;
  reconciliationAccount: string;
  bankLogo: string | null;
  status: string;
  rank: number;
  createdAt: string;
  updatedAt: string;
}

interface IPSBankManagementClientProps {
    initialBanks: IPSBank[];
}

const bankStatuses = ["Active", "Inactive"];

export function IPSBankManagementClient({ initialBanks }: IPSBankManagementClientProps) {
  const [banks, setBanks] = useState<IPSBank[]>(initialBanks);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedBank, setSelectedBank] = useState<IPSBank | null>(null);
  const [bankToDelete, setBankToDelete] = useState<IPSBank | null>(null);
  
  const [bankData, setBankData] = useState({
      bankName: '',
      bankCode: '',
      reconciliationAccount: '',
      bankLogo: '',
      status: 'Active',
      rank: ''
  });

  const { toast } = useToast();

  const filteredBanks = useMemo(() => {
    if (!searchTerm) return banks;
    return banks.filter(
      (b) =>
        b.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.bankCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, banks]);

  const openAddDialog = () => {
    setSelectedBank(null);
    setBankData({ bankName: '', bankCode: '', reconciliationAccount: '', bankLogo: '', status: 'Active', rank: String(banks.length + 1) });
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (bank: IPSBank) => {
    setSelectedBank(bank);
    setBankData({ ...bank, bankLogo: bank.bankLogo || '', rank: String(bank.rank) });
    setIsDialogOpen(true);
  };
  
  const openDeleteDialog = (bank: IPSBank) => {
    setBankToDelete(bank);
  };

  const handleSave = async () => {
    if (!bankData.bankName || !bankData.bankCode || !bankData.reconciliationAccount || !bankData.rank) {
        toast({ variant: 'destructive', title: 'Missing fields', description: 'Bank Name, Code, Reconciliation Account and Rank are required.'});
        return;
    }

    setIsSaving(true);
    const method = selectedBank ? 'PUT' : 'POST';
    const payload = selectedBank ? { id: selectedBank.id, ...bankData } : bankData;

    try {
        const res = await fetch('/api/ips-banks', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        toast({ title: 'Success', description: `Bank ${selectedBank ? 'updated' : 'created'}.`});
        setIsDialogOpen(false);
        const newBank = { ...result, createdAt: new Date(result.createdAt).toISOString(), updatedAt: new Date(result.updatedAt).toISOString() };
        setBanks(prev => {
            if (selectedBank) {
                return prev.map(p => p.id === result.id ? newBank : p).sort((a,b) => a.rank - b.rank);
            }
            return [...prev, newBank].sort((a,b) => a.rank - b.rank);
        });
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsSaving(false);
    }
  }

  const handleDelete = async () => {
      if (!bankToDelete) return;
      setIsDeleting(true);
      try {
        const res = await fetch('/api/ips-banks', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: bankToDelete.id }),
        });
        if (res.status !== 204) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to delete bank.');
        }

        setBanks(prev => prev.filter(p => p.id !== bankToDelete.id));
        toast({ title: 'Success', description: 'Bank removed successfully.' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
          setIsDeleting(false);
          setBankToDelete(null);
      }
  }
  
  const handleFieldChange = (field: keyof typeof bankData, value: string) => {
      setBankData(prev => ({ ...prev, [field]: value }));
  }

  return (
    <>
    <Card className="w-full">
      <CardHeader className="flex-row items-center justify-between">
        <div>
            <CardTitle>IPS Bank Management</CardTitle>
            <CardDescription>Manage Inter-bank Settlement partner banks and their accounts.</CardDescription>
        </div>
        <div className="flex items-center gap-4">
            <Input 
                placeholder="Search by name or code..."
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={openAddDialog}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Bank
            </Button>
        </div>
      </CardHeader>
      <CardContent>
         <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Bank Name</TableHead>
                <TableHead>Bank Code</TableHead>
                <TableHead>Reconciliation Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBanks.length > 0 ? filteredBanks.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.rank}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Image 
                            src={b.bankLogo || `https://picsum.photos/seed/${b.id}/40/40`} 
                            alt={`${b.bankName} logo`}
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                        {b.bankName}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{b.bankCode}</TableCell>
                  <TableCell className="font-mono">{b.reconciliationAccount}</TableCell>
                  <TableCell>
                     <Badge 
                        variant={b.status === 'Active' ? 'secondary' : 'destructive'}
                        className={cn({'bg-green-100 text-green-800 border-green-200': b.status === 'Active'})}
                     >
                        {b.status}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(b)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(b)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No banks found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{selectedBank ? 'Edit' : 'Add'} IPS Bank</DialogTitle>
                <DialogDescription>Fill in the details for the IPS bank partner.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rank" className="text-right">Rank</Label>
                    <Input id="rank" type="number" value={bankData.rank} onChange={(e) => handleFieldChange('rank', e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="bankName" className="text-right">Bank Name</Label>
                    <Input id="bankName" value={bankData.bankName} onChange={(e) => handleFieldChange('bankName', e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="bankCode" className="text-right">Bank Code</Label>
                    <Input id="bankCode" value={bankData.bankCode} onChange={(e) => handleFieldChange('bankCode', e.target.value)} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reconAccount" className="text-right">Recon. Account</Label>
                    <Input id="reconAccount" value={bankData.reconciliationAccount} onChange={(e) => handleFieldChange('reconciliationAccount', e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select value={bankData.status} onValueChange={(val) => handleFieldChange('status', val)}>
                        <SelectTrigger className="col-span-3"><SelectValue/></SelectTrigger>
                        <SelectContent>{bankStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="bankLogo" className="text-right">Logo URL</Label>
                    <Input id="bankLogo" value={bankData.bankLogo} onChange={(e) => handleFieldChange('bankLogo', e.target.value)} className="col-span-3" placeholder="Optional"/>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <AlertDialog open={!!bankToDelete} onOpenChange={(open) => !open && setBankToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the bank "{bankToDelete?.bankName}". This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
