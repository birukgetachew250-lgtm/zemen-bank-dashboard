
"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, PlusCircle, Trash2, Loader2, Search, FilterX, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
import type { ExceptionalLimit } from "@/app/(main)/limits/exceptional-limits/page";

interface ExceptionalLimitsClientProps {
    initialItems: ExceptionalLimit[];
}

const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'Not Set';
    return `ETB ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}


export function ExceptionalLimitsClient({ initialItems }: ExceptionalLimitsClientProps) {
  const [limits, setLimits] = useState<ExceptionalLimit[]>(initialItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState<"ALL" | "OVERRIDE" | "ADDITIONAL">("ALL");
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingLimit, setEditingLimit] = useState<ExceptionalLimit | null>(null);
  const [limitToDelete, setLimitToDelete] = useState<ExceptionalLimit | null>(null);
  const [viewingLimit, setViewingLimit] = useState<ExceptionalLimit | null>(null);

  const [limitData, setLimitData] = useState({
    cifNumber: "",
    accountNumber: "",
    additionalDailyLimit: "",
    additionalWeeklyLimit: "",
    additionalMonthlyLimit: "",
    isOverride: false,
    reason: "",
    effectiveFrom: "",
    effectiveTo: "",
  });
  const { toast } = useToast();

  const filteredLimits = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return limits.filter((limit) => {
      if (modeFilter === "OVERRIDE" && !limit.isOverride) return false;
      if (modeFilter === "ADDITIONAL" && limit.isOverride) return false;

      if (!term) return true;

      const modeText = limit.isOverride ? "override" : "additional";
      return (
        String(limit.cifNumber || "").toLowerCase().includes(term) ||
        String(limit.accountNumber || "").toLowerCase().includes(term) ||
        String(limit.reason || "").toLowerCase().includes(term) ||
        modeText.includes(term)
      );
    });
  }, [limits, searchTerm, modeFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setModeFilter("ALL");
  };

  const openAddDialog = () => {
    setEditingLimit(null);
    setLimitData({ cifNumber: "", accountNumber: "", additionalDailyLimit: "", additionalWeeklyLimit: "", additionalMonthlyLimit: "", isOverride: false, reason: "", effectiveFrom: "", effectiveTo: "" });
    setDialogOpen(true);
  };
  
  const openEditDialog = (limit: ExceptionalLimit) => {
    setEditingLimit(limit);
    setLimitData({
        cifNumber: limit.cifNumber || "",
        accountNumber: limit.accountNumber,
        additionalDailyLimit: limit.additionalDailyLimit?.toString() || "",
        additionalWeeklyLimit: limit.additionalWeeklyLimit?.toString() || "",
        additionalMonthlyLimit: limit.additionalMonthlyLimit?.toString() || "",
        isOverride: limit.isOverride,
        reason: limit.reason || "",
        effectiveFrom: limit.effectiveFrom ? new Date(limit.effectiveFrom).toISOString().slice(0, 16) : "",
        effectiveTo: limit.effectiveTo ? new Date(limit.effectiveTo).toISOString().slice(0, 16) : "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!limitData.accountNumber || !limitData.cifNumber) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "CIF Number and Account Number are required."
      });
      return;
    }

    setIsSaving(true);
    const method = editingLimit ? 'PUT' : 'POST';
    const payload = {
        id: editingLimit?.id,
        ...limitData,
    };

    try {
        const res = await fetch('/api/limits/exceptions', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        if (editingLimit) {
            setLimits(prev => prev.map(l => l.id === editingLimit.id ? result : l));
            toast({ title: "Exception Updated", description: "The exceptional limit has been updated successfully." });
        } else {
            setLimits(prev => [result, ...prev]);
            toast({ title: "Exception Added", description: "New exceptional limit has been added successfully." });
        }
        
        setDialogOpen(false);
        setEditingLimit(null);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async () => {
      if (!limitToDelete) return;
      setIsSaving(true);
      try {
          const res = await fetch('/api/limits/exceptions', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: limitToDelete.id })
          });
          if (res.status !== 204) throw new Error((await res.json()).message || 'Failed to delete');

          setLimits(prev => prev.filter(r => r.id !== limitToDelete.id));
          toast({ title: "Exception Removed", description: "The exceptional limit has been deleted."});
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Error deleting exception', description: error.message });
      } finally {
          setIsSaving(false);
          setLimitToDelete(null);
      }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Exceptional Limits</CardTitle>
            <CardDescription>Manage specific, one-off limit exceptions for individual accounts.</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search CIF, account, reason, mode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-[280px]"
              />
            </div>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as "ALL" | "OVERRIDE" | "ADDITIONAL")}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="ALL">All Modes</option>
              <option value="OVERRIDE">Override</option>
              <option value="ADDITIONAL">Additional</option>
            </select>
            <Button variant="outline" onClick={clearFilters}>
              <FilterX className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Exception
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CIF Number</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Limit Summary</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Effective</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLimits.map((limit) => (
                  <TableRow key={limit.id}>
                    <TableCell className="font-mono">{limit.cifNumber}</TableCell>
                    <TableCell className="font-mono">{limit.accountNumber}</TableCell>
                    <TableCell className="text-sm">
                      <div>D: {formatCurrency(limit.additionalDailyLimit)}</div>
                      <div>W: {formatCurrency(limit.additionalWeeklyLimit)}</div>
                      <div>M: {formatCurrency(limit.additionalMonthlyLimit)}</div>
                    </TableCell>
                    <TableCell>{limit.isOverride ? <Badge variant="destructive">Override</Badge> : <Badge variant="outline">Additional</Badge>}</TableCell>
                    <TableCell className="text-xs">
                      <div>{limit.effectiveFrom ? new Date(limit.effectiveFrom).toLocaleString() : '-'}</div>
                      <div className="text-muted-foreground">to {limit.effectiveTo ? new Date(limit.effectiveTo).toLocaleString() : '-'}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setViewingLimit(limit)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                       <Button variant="ghost" size="icon" onClick={() => openEditDialog(limit)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setLimitToDelete(limit)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!viewingLimit} onOpenChange={(open) => !open && setViewingLimit(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exceptional Limit Details</AlertDialogTitle>
            <AlertDialogDescription>
              Full details for account {viewingLimit?.accountNumber}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">CIF:</span> {viewingLimit?.cifNumber || '-'}</div>
            <div><span className="text-muted-foreground">Account:</span> {viewingLimit?.accountNumber || '-'}</div>
            <div><span className="text-muted-foreground">Daily:</span> {formatCurrency(viewingLimit?.additionalDailyLimit ?? null)}</div>
            <div><span className="text-muted-foreground">Weekly:</span> {formatCurrency(viewingLimit?.additionalWeeklyLimit ?? null)}</div>
            <div><span className="text-muted-foreground">Monthly:</span> {formatCurrency(viewingLimit?.additionalMonthlyLimit ?? null)}</div>
            <div><span className="text-muted-foreground">Mode:</span> {viewingLimit?.isOverride ? 'Override' : 'Additional'}</div>
            <div><span className="text-muted-foreground">Effective From:</span> {viewingLimit?.effectiveFrom ? new Date(viewingLimit.effectiveFrom).toLocaleString() : '-'}</div>
            <div><span className="text-muted-foreground">Effective To:</span> {viewingLimit?.effectiveTo ? new Date(viewingLimit.effectiveTo).toLocaleString() : '-'}</div>
            <div className="col-span-2"><span className="text-muted-foreground">Reason:</span> {viewingLimit?.reason || '-'}</div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isDialogOpen && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{editingLimit ? 'Edit' : 'Add'} Exceptional Limit</CardTitle>
            <CardDescription>
              Provide additional limits for a specific account. Leave fields blank to not set a specific additional limit.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 py-2">
            <div className="space-y-2">
                <Label>CIF Number</Label>
                <Input value={limitData.cifNumber} onChange={e => setLimitData(p => ({...p, cifNumber: e.target.value}))} placeholder="Customer CIF Number"/>
            </div>
            <div className="space-y-2">
                <Label>Account Number</Label>
                <Input value={limitData.accountNumber} onChange={e => setLimitData(p => ({...p, accountNumber: e.target.value}))}/>
            </div>
            <div className="space-y-2">
                <Label>Additional Daily Limit</Label>
                <Input type="number" placeholder="e.g. 50000" value={limitData.additionalDailyLimit} onChange={e => setLimitData(p => ({...p, additionalDailyLimit: e.target.value}))}/>
            </div>
             <div className="space-y-2">
                <Label>Additional Weekly Limit</Label>
                <Input type="number" placeholder="e.g. 200000" value={limitData.additionalWeeklyLimit} onChange={e => setLimitData(p => ({...p, additionalWeeklyLimit: e.target.value}))}/>
            </div>
             <div className="space-y-2">
                <Label>Additional Monthly Limit</Label>
                <Input type="number" placeholder="e.g. 500000" value={limitData.additionalMonthlyLimit} onChange={e => setLimitData(p => ({...p, additionalMonthlyLimit: e.target.value}))}/>
            </div>
            <div className="space-y-2">
                <Label>Override Mode</Label>
                <div className="flex items-center gap-2">
                    <input type="checkbox" checked={limitData.isOverride} onChange={e => setLimitData(p => ({...p, isOverride: e.target.checked}))} className="h-4 w-4" />
                    <span className="text-sm text-muted-foreground">Override base limits instead of adding to them</span>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Reason for Exception</Label>
                <Input value={limitData.reason} onChange={e => setLimitData(p => ({...p, reason: e.target.value}))} />
            </div>
            <div className="space-y-2">
                <Label>Effective From</Label>
                <Input type="datetime-local" value={limitData.effectiveFrom} onChange={e => setLimitData(p => ({...p, effectiveFrom: e.target.value}))} />
            </div>
            <div className="space-y-2">
                <Label>Effective To</Label>
                <Input type="datetime-local" value={limitData.effectiveTo} onChange={e => setLimitData(p => ({...p, effectiveTo: e.target.value}))} />
            </div>
          </CardContent>
          <div className="flex items-center justify-end gap-2 p-6 pt-0">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Exception
            </Button>
          </div>
        </Card>
      )}
      <AlertDialog open={!!limitToDelete} onOpenChange={(open) => !open && setLimitToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete the exceptional limit for account {limitToDelete?.accountNumber}.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
