'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Edit, Trash2, GripVertical, Loader2, Copy, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const SCREEN_TYPES = ['confirmation', 'receipt'];
const VALUE_FORMATS = ['text', 'currency', 'date', 'datetime', 'number', 'phone', 'masked', 'status', 'qrcode', 'barcode'];
const TEXT_STYLES = ['normal', 'bold', 'large', 'muted', 'accent', 'heading', 'caption'];
const ICON_OPTIONS = ['', 'check', 'info', 'warning', 'money', 'calendar', 'user', 'phone', 'receipt', 'copy', 'share'];

const defaultFormData = {
  ScreenType: 'confirmation',
  SourceField: '',
  Label: '',
  DisplayOrder: '0',
  ValueFormat: 'text',
  FormatString: '',
  DefaultValue: '',
  IsHighlighted: false,
  GroupName: '',
  IconName: '',
  TextStyle: 'normal',
  TextColor: '',
  Prefix: '',
  Suffix: '',
  Copyable: false,
  VisibilityCondition: '',
};

export function SDUIDisplayConfig({ providerId, initialFields }: { providerId: string, initialFields: any[] }) {
  const [fields, setFields] = useState(initialFields);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [formData, setFormData] = useState({ ...defaultFormData });
  const [activeTab, setActiveTab] = useState('confirmation');
  const { toast } = useToast();

  const groupedFields = fields.reduce((acc: any, field: any) => {
    const type = field.ScreenType || 'confirmation';
    if (!acc[type]) acc[type] = [];
    acc[type].push(field);
    return acc;
  }, { confirmation: [], receipt: [] });

  // Sort each group by DisplayOrder
  Object.keys(groupedFields).forEach(key => {
    groupedFields[key].sort((a: any, b: any) => (a.DisplayOrder || 0) - (b.DisplayOrder || 0));
  });

  const openAdd = (screenType?: string) => {
    setEditingField(null);
    const currentScreenFields = groupedFields[screenType || activeTab] || [];
    setFormData({
      ...defaultFormData,
      ScreenType: screenType || activeTab,
      DisplayOrder: String(currentScreenFields.length),
    });
    setDialogOpen(true);
  };

  const openEdit = (field: any) => {
    setEditingField(field);
    setFormData({
      ScreenType: field.ScreenType || 'confirmation',
      SourceField: field.SourceField || '',
      Label: field.Label || '',
      DisplayOrder: field.DisplayOrder != null ? String(field.DisplayOrder) : '0',
      ValueFormat: field.ValueFormat || 'text',
      FormatString: field.FormatString || '',
      DefaultValue: field.DefaultValue || '',
      IsHighlighted: field.IsHighlighted === 1 || field.IsHighlighted === true,
      GroupName: field.GroupName || '',
      IconName: field.IconName || '',
      TextStyle: field.TextStyle || 'normal',
      TextColor: field.TextColor || '',
      Prefix: field.Prefix || '',
      Suffix: field.Suffix || '',
      Copyable: field.Copyable === 1 || field.Copyable === true,
      VisibilityCondition: field.VisibilityCondition || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.SourceField || !formData.Label) {
      toast({ variant: 'destructive', title: 'Error', description: 'Source field and label are required.' });
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = { ...formData };
      if (editingField) payload.DisplayFieldId = editingField.DisplayFieldId;

      const res = await fetch(`/api/bill-management/providers/${providerId}/display`, {
        method: editingField ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text() || 'Failed to save display field');
      toast({ title: 'Success', description: `Display field ${editingField ? 'updated' : 'created'}.` });
      setDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (fieldId: string) => {
    try {
      const res = await fetch(`/api/bill-management/providers/${providerId}/display`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fieldId }),
      });
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete');
      toast({ title: 'Deleted', description: 'Display field removed.' });
      setFields(prev => prev.filter(f => f.DisplayFieldId !== fieldId));
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const getFormatBadgeColor = (format: string) => {
    switch (format) {
      case 'currency': return 'bg-green-100 text-green-800';
      case 'date': case 'datetime': return 'bg-blue-100 text-blue-800';
      case 'phone': return 'bg-purple-100 text-purple-800';
      case 'masked': return 'bg-red-100 text-red-800';
      case 'qrcode': case 'barcode': return 'bg-yellow-100 text-yellow-800';
      default: return '';
    }
  };

  const renderTable = (screenFields: any[], screenType: string) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35px]"></TableHead>
            <TableHead>Label</TableHead>
            <TableHead>Source Key</TableHead>
            <TableHead>Format</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Flags</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {screenFields.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                No display fields for {screenType} screen.
                <Button variant="link" className="ml-2" onClick={() => openAdd(screenType)}>Add one</Button>
              </TableCell>
            </TableRow>
          ) : screenFields.map((f: any) => (
            <TableRow key={f.DisplayFieldId} className={cn((f.IsHighlighted === 1 || f.IsHighlighted === true) && 'bg-yellow-50')}>
              <TableCell><GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" /></TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{f.Label}</span>
                  {(f.IsHighlighted === 1 || f.IsHighlighted === true) && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">{f.SourceField}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('text-[10px]', getFormatBadgeColor(f.ValueFormat))}>{f.ValueFormat}</Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{f.GroupName || '—'}</TableCell>
              <TableCell className="text-sm">{f.DisplayOrder}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {(f.Copyable === 1 || f.Copyable === true) && <span title="Copyable"><Copy className="h-3 w-3 text-muted-foreground" /></span>}
                  {f.TextStyle && f.TextStyle !== 'normal' && <Badge variant="outline" className="text-[9px]">{f.TextStyle}</Badge>}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(f)} title="Edit"><Edit className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" title="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Display Field?</AlertDialogTitle>
                        <AlertDialogDescription>Remove &quot;{f.Label}&quot; from the {f.ScreenType} screen?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(f.DisplayFieldId)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Display Mapping</CardTitle>
            <CardDescription>Control how data appears on the confirmation and receipt screens. {fields.length} field(s) total.</CardDescription>
          </div>
          <Button size="sm" onClick={() => openAdd()}><PlusCircle className="mr-2 h-4 w-4" /> Add Mapping</Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="confirmation">
                Confirmation Screen
                <Badge variant="secondary" className="ml-2 text-[10px]">{groupedFields.confirmation?.length || 0}</Badge>
              </TabsTrigger>
              <TabsTrigger value="receipt">
                Receipt Screen
                <Badge variant="secondary" className="ml-2 text-[10px]">{groupedFields.receipt?.length || 0}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="confirmation">
              {renderTable(groupedFields.confirmation || [], 'confirmation')}
            </TabsContent>
            <TabsContent value="receipt">
              {renderTable(groupedFields.receipt || [], 'receipt')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingField ? 'Edit' : 'Add'} Display Field</DialogTitle>
            <DialogDescription>Configure how a data field is displayed on the mobile screen.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Screen Type</Label>
                <Select value={formData.ScreenType} onValueChange={v => setFormData({ ...formData, ScreenType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SCREEN_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" value={formData.DisplayOrder} onChange={e => setFormData({ ...formData, DisplayOrder: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source Field <span className="text-red-500">*</span></Label>
                <Input value={formData.SourceField} onChange={e => setFormData({ ...formData, SourceField: e.target.value })} placeholder="customer_name" className="font-mono text-sm" />
                <p className="text-xs text-muted-foreground">Key from API response mapping</p>
              </div>
              <div className="space-y-2">
                <Label>Label <span className="text-red-500">*</span></Label>
                <Input value={formData.Label} onChange={e => setFormData({ ...formData, Label: e.target.value })} placeholder="Customer Name" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Value Format</Label>
                <Select value={formData.ValueFormat} onValueChange={v => setFormData({ ...formData, ValueFormat: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{VALUE_FORMATS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Text Style</Label>
                <Select value={formData.TextStyle} onValueChange={v => setFormData({ ...formData, TextStyle: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TEXT_STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Icon Name</Label>
                <Select value={formData.IconName || 'none'} onValueChange={v => setFormData({ ...formData, IconName: v === 'none' ? '' : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {ICON_OPTIONS.filter(Boolean).map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(formData.ValueFormat === 'currency' || formData.ValueFormat === 'date' || formData.ValueFormat === 'datetime' || formData.ValueFormat === 'number') && (
              <div className="space-y-2">
                <Label>Format String</Label>
                <Input value={formData.FormatString} onChange={e => setFormData({ ...formData, FormatString: e.target.value })}
                  placeholder={formData.ValueFormat === 'currency' ? '#,##0.00 ETB' : formData.ValueFormat === 'date' ? 'dd/MM/yyyy' : ''}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Value</Label>
                <Input value={formData.DefaultValue} onChange={e => setFormData({ ...formData, DefaultValue: e.target.value })} placeholder="N/A" />
                <p className="text-xs text-muted-foreground">Shown when source is empty</p>
              </div>
              <div className="space-y-2">
                <Label>Group Name</Label>
                <Input value={formData.GroupName} onChange={e => setFormData({ ...formData, GroupName: e.target.value })} placeholder="Payment Details" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Prefix</Label>
                <Input value={formData.Prefix} onChange={e => setFormData({ ...formData, Prefix: e.target.value })} placeholder="ETB" />
              </div>
              <div className="space-y-2">
                <Label>Suffix</Label>
                <Input value={formData.Suffix} onChange={e => setFormData({ ...formData, Suffix: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Text Color</Label>
                <Input value={formData.TextColor} onChange={e => setFormData({ ...formData, TextColor: e.target.value })} placeholder="#333333" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Visibility Condition</Label>
              <Input value={formData.VisibilityCondition} onChange={e => setFormData({ ...formData, VisibilityCondition: e.target.value })} placeholder="e.g. amount > 0" className="font-mono text-xs" />
              <p className="text-xs text-muted-foreground">Expression to conditionally show/hide this field</p>
            </div>

            <div className="flex flex-wrap gap-6 pt-2 border-t">
              <div className="flex items-center space-x-2"><Switch checked={formData.IsHighlighted} onCheckedChange={v => setFormData({ ...formData, IsHighlighted: v })} /><Label>Highlighted</Label></div>
              <div className="flex items-center space-x-2"><Switch checked={formData.Copyable} onCheckedChange={v => setFormData({ ...formData, Copyable: v })} /><Label>Copyable</Label></div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingField ? 'Update Field' : 'Create Field'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
