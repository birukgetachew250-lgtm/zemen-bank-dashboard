
'use client';

import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Edit, Trash2, Loader2, GripVertical, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const fieldTypes = ['text', 'textarea', 'number', 'phone', 'email', 'password', 'amount', 'dropdown', 'radio', 'checkbox', 'switch', 'date', 'time', 'otp', 'pin'];

export function SDUIFieldBuilder({ providerId, initialFields }: { providerId: string, initialFields: any[] }) {
  const [fields, setFields] = useState(initialFields);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    FieldKey: '',
    Label: '',
    FieldType: 'text',
    Placeholder: '',
    HelperText: '',
    IsRequired: true,
    IsHidden: false,
    StepNumber: '1',
    FieldOrder: '0'
  });

  const { toast } = useToast();

  const openAdd = () => {
    setEditingField(null);
    setFormData({ FieldKey: '', Label: '', FieldType: 'text', Placeholder: '', HelperText: '', IsRequired: true, IsHidden: false, StepNumber: '1', FieldOrder: String(fields.length) });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.FieldKey || !formData.Label) {
      toast({ variant: 'destructive', title: 'Error', description: 'Key and Label are required.' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/bill-management/providers/${providerId}/fields`, {
        method: editingField ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingField ? { FieldId: editingField.FieldId, ...formData } : formData)
      });
      if (!res.ok) throw new Error(await res.text());
      toast({ title: 'Success', description: 'Field saved.' });
      setDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Dynamic Form Fields</CardTitle>
            <CardDescription>Configure the input form users see in the mobile app.</CardDescription>
          </div>
          <Button size="sm" onClick={openAdd}><PlusCircle className="mr-2 h-4 w-4" /> Add Field</Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Key / Label</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Step</TableHead>
                  <TableHead>Validation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((f) => (
                  <TableRow key={f.FieldId}>
                    <TableCell><GripVertical className="h-4 w-4 text-muted-foreground cursor-move" /></TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold">{f.FieldKey}</span>
                        <span className="text-sm">{f.Label}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{f.FieldType}</Badge></TableCell>
                    <TableCell><Badge variant="secondary">Step {f.StepNumber}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {f.IsRequired === 1 && <Badge className="bg-red-50 text-red-700 border-red-200">Required</Badge>}
                        {f.IsHidden === 1 && <Badge variant="outline">Hidden</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Form Field Property</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Field Key (Internal)</Label>
                <Input value={formData.FieldKey} onChange={e => setFormData({...formData, FieldKey: e.target.value})} placeholder="e.g. account_number" />
              </div>
              <div className="space-y-2">
                <Label>Display Label</Label>
                <Input value={formData.Label} onChange={e => setFormData({...formData, Label: e.target.value})} placeholder="e.g. Enter Account Number" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Field Type</Label>
                <Select value={formData.FieldType} onValueChange={v => setFormData({...formData, FieldType: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{fieldTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Step Number</Label>
                <Input type="number" value={formData.StepNumber} onChange={e => setFormData({...formData, StepNumber: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch checked={formData.IsRequired} onCheckedChange={v => setFormData({...formData, IsRequired: v})} />
                <Label>Mandatory</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={formData.IsHidden} onCheckedChange={v => setFormData({...formData, IsHidden: v})} />
                <Label>Hidden Field</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
