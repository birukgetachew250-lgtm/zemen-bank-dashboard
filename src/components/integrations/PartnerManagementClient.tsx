
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
import { Button } from "../ui/button";
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

export interface Partner {
  id: string;
  name: string;
  type: string;
  status: string;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PartnerManagementClientProps {
    initialPartners: Partner[];
}

const partnerTypes = ["Bank", "Wallet", "Utility", "Government"];
const partnerStatuses = ["Active", "Inactive"];

export function PartnerManagementClient({ initialPartners }: PartnerManagementClientProps) {
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);
  
  const [partnerData, setPartnerData] = useState({
      name: '',
      type: '',
      status: 'Active',
      logoUrl: ''
  });

  const { toast } = useToast();

  const filteredPartners = useMemo(() => {
    if (!searchTerm) return partners;
    return partners.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, partners]);

  const openAddDialog = () => {
    setSelectedPartner(null);
    setPartnerData({ name: '', type: '', status: 'Active', logoUrl: '' });
    setIsDialogOpen(true);
  };
  
  const openEditDialog = (partner: Partner) => {
    setSelectedPartner(partner);
    setPartnerData({ ...partner, logoUrl: partner.logoUrl || '' });
    setIsDialogOpen(true);
  };
  
  const openDeleteDialog = (partner: Partner) => {
    setPartnerToDelete(partner);
  };

  const handleSave = async () => {
    if (!partnerData.name || !partnerData.type) {
        toast({ variant: 'destructive', title: 'Missing fields', description: 'Partner name and type are required.'});
        return;
    }

    setIsSaving(true);
    const method = selectedPartner ? 'PUT' : 'POST';
    const payload = selectedPartner ? { id: selectedPartner.id, ...partnerData } : partnerData;

    try {
        const res = await fetch('/api/partners', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        toast({ title: 'Success', description: `Partner ${selectedPartner ? 'updated' : 'created'}.`});
        setIsDialogOpen(false);
        setPartners(prev => {
            if (selectedPartner) {
                return prev.map(p => p.id === result.id ? { ...p, ...result, createdAt: new Date(result.createdAt).toISOString(), updatedAt: new Date(result.updatedAt).toISOString() } : p);
            }
            return [...prev, { ...result, createdAt: new Date(result.createdAt).toISOString(), updatedAt: new Date(result.updatedAt).toISOString() }];
        });
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsSaving(false);
    }
  }

  const handleDelete = async () => {
      if (!partnerToDelete) return;
      setIsDeleting(true);
      try {
        const res = await fetch('/api/partners', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: partnerToDelete.id }),
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Failed to delete partner.');

        setPartners(prev => prev.filter(p => p.id !== partnerToDelete.id));
        toast({ title: 'Success', description: 'Partner removed successfully.' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
          setIsDeleting(false);
          setPartnerToDelete(null);
      }
  }

  return (
    <>
    <Card className="w-full">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Partner Management</CardTitle>
        <div className="flex items-center gap-4">
            <Input 
                placeholder="Search by name or type..."
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={openAddDialog}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Partner
            </Button>
        </div>
      </CardHeader>
      <CardContent>
         <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.length > 0 ? filteredPartners.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Image 
                            src={p.logoUrl || `https://picsum.photos/seed/${p.id}/40/40`} 
                            alt={`${p.name} logo`}
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                        {p.name}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                  <TableCell>
                     <Badge 
                        variant={p.status === 'Active' ? 'secondary' : 'destructive'}
                        className={cn({'bg-green-100 text-green-800 border-green-200': p.status === 'Active'})}
                     >
                        {p.status}
                     </Badge>
                  </TableCell>
                  <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(p)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(p)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No partners found.
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
                <DialogTitle>{selectedPartner ? 'Edit' : 'Add'} Partner</DialogTitle>
                <DialogDescription>Fill in the details for the partner.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={partnerData.name} onChange={(e) => setPartnerData(p => ({...p, name: e.target.value}))} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Type</Label>
                    <Select value={partnerData.type} onValueChange={(val) => setPartnerData(p => ({...p, type: val}))}>
                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select type"/></SelectTrigger>
                        <SelectContent>{partnerTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select value={partnerData.status} onValueChange={(val) => setPartnerData(p => ({...p, status: val}))}>
                        <SelectTrigger className="col-span-3"><SelectValue/></SelectTrigger>
                        <SelectContent>{partnerStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="logoUrl" className="text-right">Logo URL</Label>
                    <Input id="logoUrl" value={partnerData.logoUrl} onChange={(e) => setPartnerData(p => ({...p, logoUrl: e.target.value}))} className="col-span-3" placeholder="Optional"/>
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

    <AlertDialog open={!!partnerToDelete} onOpenChange={(open) => !open && setPartnerToDelete(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the partner "{partnerToDelete?.name}". This action cannot be undone.
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
