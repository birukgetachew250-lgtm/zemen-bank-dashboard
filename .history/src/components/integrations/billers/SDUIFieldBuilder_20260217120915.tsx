'use client';

import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit, Trash2, Loader2, EyeOff, Search } from 'lucide-react';
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
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'password', label: 'Password' },
  { value: 'amount', label: 'Amount / Currency' },
  { value: 'otp', label: 'OTP' },
  { value: 'pin', label: 'PIN' },
  { value: 'dropdown', label: 'Dropdown Select' },
  { value: 'radio', label: 'Radio Group' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'checkbox_group', label: 'Checkbox Group' },
  { value: 'switch', label: 'Toggle Switch' },
  { value: 'date', label: 'Date Picker' },
  { value: 'time', label: 'Time Picker' },
  { value: 'datetime', label: 'Date & Time Picker' },
  { value: 'file', label: 'File Upload' },
  { value: 'image', label: 'Image Picker' },
  { value: 'slider', label: 'Slider' },
  { value: 'rating', label: 'Star Rating' },
  { value: 'signature', label: 'Signature Pad' },
  { value: 'location', label: 'Location/GPS' },
  { value: 'barcode', label: 'Barcode / QR Scanner' },
  { value: 'hidden', label: 'Hidden Field' },
  { value: 'label', label: 'Display Label' },
  { value: 'divider', label: 'Divider' },
  { value: 'header', label: 'Section Header' },
];

const KEYBOARD_TYPES = ['text', 'number', 'phone', 'email', 'url', 'decimal'];
const OPTIONS_LAYOUTS = ['vertical', 'horizontal', 'grid'];
const FIELD_WIDTHS = ['full', 'half', 'third', 'quarter'];

const defaultFormData = {
  FieldKey: '', Label: '', Placeholder: '', HelperText: '',
  FieldType: 'text', KeyboardType: 'text', IconName: '',
  IsRequired: true, IsReadOnly: false, IsHidden: false, IsMasked: false,
  MinLength: '', MaxLength: '', MinValue: '', MaxValue: '', StepValue: '',
  ValidationPattern: '', ValidationMessage: '', DefaultValue: '',
  Options: '', OptionsApiEndpoint: '', OptionsApiPath: '', OptionsLayout: 'vertical',
  GridColumns: '', MinSelections: '', MaxSelections: '',
  DigitCount: '', TextAreaLines: '',
  MinDate: '', MaxDate: '', DateFormat: '', TimeFormat: '',
  AllowedFileTypes: '', MaxFileSize: '',
  AllowCamera: false, AllowGallery: true,
  MaxRating: '', AllowHalfRating: false,
  OnText: '', OffText: '', Prefix: '', Suffix: '',
  InputMask: '', AutoFormat: false, CurrencyCode: 'ETB', DecimalPlaces: '',
  FieldGroup: '', FieldOrder: '0', StepNumber: '1',
  VisibilityCondition: '', RequiredCondition: '',
  TriggerLookup: false, LookupDebounceMs: '', LookupMinLength: '',
  LookupEndpoint: '', LookupFieldMapping: '',
  ClearDependentsOnChange: false, DependentFields: '',
  CssClass: '', FieldWidth: 'full', ExtraConfig: '',
};

export function SDUIFieldBuilder({ providerId, initialFields }: { providerId: string, initialFields: any[] }) {
  const [fields, setFields] = useState(initialFields);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ ...defaultFormData });
  const { toast } = useToast();

  const filtered = fields.filter(f =>
    f.FieldKey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.Label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAdd = () => {
    setEditingField(null);
    setFormData({ ...defaultFormData, FieldOrder: String(fields.length) });
    setDialogOpen(true);
  };

  const openEdit = (field: any) => {
    setEditingField(field);
    setFormData({
      FieldKey: field.FieldKey || '',
      Label: field.Label || '',
      Placeholder: field.Placeholder || '',
      HelperText: field.HelperText || '',
      FieldType: field.FieldType || 'text',
      KeyboardType: field.KeyboardType || 'text',
      IconName: field.IconName || '',
      IsRequired: field.IsRequired === 1 || field.IsRequired === true,
      IsReadOnly: field.IsReadOnly === 1 || field.IsReadOnly === true,
      IsHidden: field.IsHidden === 1 || field.IsHidden === true,
      IsMasked: field.IsMasked === 1 || field.IsMasked === true,
      MinLength: field.MinLength != null ? String(field.MinLength) : '',
      MaxLength: field.MaxLength != null ? String(field.MaxLength) : '',
      MinValue: field.MinValue != null ? String(field.MinValue) : '',
      MaxValue: field.MaxValue != null ? String(field.MaxValue) : '',
      StepValue: field.StepValue != null ? String(field.StepValue) : '',
      ValidationPattern: field.ValidationPattern || '',
      ValidationMessage: field.ValidationMessage || '',
      DefaultValue: field.DefaultValue || '',
      Options: field.Options || '',
      OptionsApiEndpoint: field.OptionsApiEndpoint || '',
      OptionsApiPath: field.OptionsApiPath || '',
      OptionsLayout: field.OptionsLayout || 'vertical',
      GridColumns: field.GridColumns != null ? String(field.GridColumns) : '',
      MinSelections: field.MinSelections != null ? String(field.MinSelections) : '',
      MaxSelections: field.MaxSelections != null ? String(field.MaxSelections) : '',
      DigitCount: field.DigitCount != null ? String(field.DigitCount) : '',
      TextAreaLines: field.TextAreaLines != null ? String(field.TextAreaLines) : '',
      MinDate: field.MinDate || '',
      MaxDate: field.MaxDate || '',
      DateFormat: field.DateFormat || '',
      TimeFormat: field.TimeFormat || '',
      AllowedFileTypes: field.AllowedFileTypes || '',
      MaxFileSize: field.MaxFileSize != null ? String(field.MaxFileSize) : '',
      AllowCamera: field.AllowCamera === 1 || field.AllowCamera === true,
      AllowGallery: field.AllowGallery === 1 || field.AllowGallery === true,
      MaxRating: field.MaxRating != null ? String(field.MaxRating) : '',
      AllowHalfRating: field.AllowHalfRating === 1 || field.AllowHalfRating === true,
      OnText: field.OnText || '',
      OffText: field.OffText || '',
      Prefix: field.Prefix || '',
      Suffix: field.Suffix || '',
      InputMask: field.InputMask || '',
      AutoFormat: field.AutoFormat === 1 || field.AutoFormat === true,
      CurrencyCode: field.CurrencyCode || 'ETB',
      DecimalPlaces: field.DecimalPlaces != null ? String(field.DecimalPlaces) : '',
      FieldGroup: field.FieldGroup || '',
      FieldOrder: field.FieldOrder != null ? String(field.FieldOrder) : '0',
      StepNumber: field.StepNumber != null ? String(field.StepNumber) : '1',
      VisibilityCondition: field.VisibilityCondition || '',
      RequiredCondition: field.RequiredCondition || '',
      TriggerLookup: field.TriggerLookup === 1 || field.TriggerLookup === true,
      LookupDebounceMs: field.LookupDebounceMs != null ? String(field.LookupDebounceMs) : '',
      LookupMinLength: field.LookupMinLength != null ? String(field.LookupMinLength) : '',
      LookupEndpoint: field.LookupEndpoint || '',
      LookupFieldMapping: field.LookupFieldMapping || '',
      ClearDependentsOnChange: field.ClearDependentsOnChange === 1 || field.ClearDependentsOnChange === true,
      DependentFields: field.DependentFields || '',
      CssClass: field.CssClass || '',
      FieldWidth: field.FieldWidth || 'full',
      ExtraConfig: field.ExtraConfig || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.FieldKey || !formData.Label) {
      toast({ variant: 'destructive', title: 'Error', description: 'Key and Label are required.' });
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = { ...formData };
      ['MinLength', 'MaxLength', 'MinValue', 'MaxValue', 'StepValue', 'GridColumns',
        'MinSelections', 'MaxSelections', 'DigitCount', 'TextAreaLines', 'MaxFileSize',
        'MaxRating', 'DecimalPlaces', 'LookupDebounceMs', 'LookupMinLength'
      ].forEach(k => { if (payload[k] === '') payload[k] = null; });

      if (editingField) payload.FieldId = editingField.FieldId;

      const res = await fetch(`/api/bill-management/providers/${providerId}/fields`, {
        method: editingField ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text() || 'Failed to save field');
      const result = await res.json();
      toast({ title: 'Success', description: `Field ${editingField ? 'updated' : 'created'} successfully.` });
      setDialogOpen(false);
      // Refetch fields from API instead of full page reload
      const refreshed = await fetch(`/api/bill-management/providers/${providerId}/fields`);
      if (refreshed.ok) setFields(await refreshed.json());
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (fieldId: string) => {
    try {
      const res = await fetch(`/api/bill-management/providers/${providerId}/fields`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fieldId })
      });
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete');
      toast({ title: 'Deleted', description: 'Field removed successfully.' });
      setFields(prev => prev.filter(f => f.FieldId !== fieldId));
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const ft = formData.FieldType;
  const showTextProps = ['text', 'textarea', 'phone', 'email', 'password'].includes(ft);
  const showNumberProps = ['number', 'amount', 'slider'].includes(ft);
  const showOptionProps = ['dropdown', 'radio', 'checkbox_group'].includes(ft);
  const showDateProps = ['date', 'datetime'].includes(ft);
  const showTimeProps = ['time', 'datetime'].includes(ft);
  const showFileProps = ['file', 'image'].includes(ft);
  const showDigitCount = ['otp', 'pin'].includes(ft);
  const showToggleProps = ['checkbox', 'switch'].includes(ft);
  const showAmountProps = ft === 'amount';
  const showRatingProps = ft === 'rating';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Dynamic Form Fields</CardTitle>
            <CardDescription>Configure the input form users see in the mobile app. {fields.length} field(s) configured.</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search fields..." className="pl-8 w-52" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Button size="sm" onClick={openAdd}><PlusCircle className="mr-2 h-4 w-4" /> Add Field</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Key / Label</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Step</TableHead>
                  <TableHead>Validation</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No fields configured. Click &quot;Add Field&quot; to start.</TableCell></TableRow>
                ) : filtered.map((f, idx) => (
                  <TableRow key={f.FieldId}>
                    <TableCell className="text-muted-foreground text-xs">{f.FieldOrder ?? idx}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-primary">{f.FieldKey}</span>
                        <span className="text-sm text-muted-foreground">{f.Label}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{f.FieldType}</Badge></TableCell>
                    <TableCell><Badge variant="secondary">Step {f.StepNumber}</Badge></TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                        {f.ValidationPattern && <span>Regex: /{f.ValidationPattern.substring(0, 20)}{f.ValidationPattern.length > 20 ? '...' : ''}/</span>}
                        {f.MinLength != null && <span>MinLen: {f.MinLength}</span>}
                        {f.MaxLength != null && <span>MaxLen: {f.MaxLength}</span>}
                        {f.MinValue != null && <span>Min: {f.MinValue}</span>}
                        {f.MaxValue != null && <span>Max: {f.MaxValue}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(f.IsRequired === 1 || f.IsRequired === true) && <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px]">Required</Badge>}
                        {(f.IsReadOnly === 1 || f.IsReadOnly === true) && <Badge variant="outline" className="text-[10px]">ReadOnly</Badge>}
                        {(f.IsHidden === 1 || f.IsHidden === true) && <Badge variant="outline" className="text-[10px]"><EyeOff className="h-3 w-3 mr-1" />Hidden</Badge>}
                        {(f.TriggerLookup === 1 || f.TriggerLookup === true) && <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">Lookup</Badge>}
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
                              <AlertDialogTitle>Delete Field?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently remove the field &quot;{f.FieldKey}&quot; from the provider configuration.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(f.FieldId)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
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
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[750px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingField ? 'Edit' : 'Add'} Form Field</DialogTitle>
            <DialogDescription>Configure how this field appears and behaves in the mobile app.</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[65vh] px-1 space-y-1">
            <Accordion type="multiple" defaultValue={['basic', 'type-specific']} className="w-full">
              {/* === BASIC PROPERTIES === */}
              <AccordionItem value="basic">
                <AccordionTrigger className="text-sm font-semibold">Basic Properties</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Field Key <span className="text-red-500">*</span></Label>
                        <Input value={formData.FieldKey} onChange={e => setFormData({ ...formData, FieldKey: e.target.value.replace(/\s/g, '_').toLowerCase() })} placeholder="e.g. account_number" className="font-mono" />
                      </div>
                      <div className="space-y-2">
                        <Label>Display Label <span className="text-red-500">*</span></Label>
                        <Input value={formData.Label} onChange={e => setFormData({ ...formData, Label: e.target.value })} placeholder="e.g. Account Number" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Field Type</Label>
                        <Select value={formData.FieldType} onValueChange={v => setFormData({ ...formData, FieldType: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{FIELD_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Step Number</Label>
                        <Input type="number" value={formData.StepNumber} onChange={e => setFormData({ ...formData, StepNumber: e.target.value })} min={1} />
                      </div>
                      <div className="space-y-2">
                        <Label>Display Order</Label>
                        <Input type="number" value={formData.FieldOrder} onChange={e => setFormData({ ...formData, FieldOrder: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Placeholder</Label>
                        <Input value={formData.Placeholder} onChange={e => setFormData({ ...formData, Placeholder: e.target.value })} placeholder="Hint text inside field" />
                      </div>
                      <div className="space-y-2">
                        <Label>Helper Text</Label>
                        <Input value={formData.HelperText} onChange={e => setFormData({ ...formData, HelperText: e.target.value })} placeholder="Text below input" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Icon Name</Label>
                        <Input value={formData.IconName} onChange={e => setFormData({ ...formData, IconName: e.target.value })} placeholder="e.g. phone, mail" />
                      </div>
                      <div className="space-y-2">
                        <Label>Keyboard Type</Label>
                        <Select value={formData.KeyboardType} onValueChange={v => setFormData({ ...formData, KeyboardType: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{KEYBOARD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Field Width</Label>
                        <Select value={formData.FieldWidth} onValueChange={v => setFormData({ ...formData, FieldWidth: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{FIELD_WIDTHS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Default Value</Label>
                        <Input value={formData.DefaultValue} onChange={e => setFormData({ ...formData, DefaultValue: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Field Group</Label>
                        <Input value={formData.FieldGroup} onChange={e => setFormData({ ...formData, FieldGroup: e.target.value })} placeholder="Group name for sections" />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-6 py-2">
                      <div className="flex items-center space-x-2">
                        <Switch checked={formData.IsRequired} onCheckedChange={v => setFormData({ ...formData, IsRequired: v })} />
                        <Label>Required</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={formData.IsReadOnly} onCheckedChange={v => setFormData({ ...formData, IsReadOnly: v })} />
                        <Label>Read Only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={formData.IsHidden} onCheckedChange={v => setFormData({ ...formData, IsHidden: v })} />
                        <Label>Hidden</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch checked={formData.IsMasked} onCheckedChange={v => setFormData({ ...formData, IsMasked: v })} />
                        <Label>Masked</Label>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* === TYPE-SPECIFIC PROPERTIES === */}
              <AccordionItem value="type-specific">
                <AccordionTrigger className="text-sm font-semibold">Type-Specific Properties</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 py-2">
                    {showTextProps && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2"><Label>Min Length</Label><Input type="number" value={formData.MinLength} onChange={e => setFormData({ ...formData, MinLength: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Max Length</Label><Input type="number" value={formData.MaxLength} onChange={e => setFormData({ ...formData, MaxLength: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Input Mask</Label><Input value={formData.InputMask} onChange={e => setFormData({ ...formData, InputMask: e.target.value })} placeholder="e.g. +251 ## ### ####" /></div>
                      </div>
                    )}
                    {ft === 'textarea' && (
                      <div className="space-y-2"><Label>Lines (Rows)</Label><Input type="number" value={formData.TextAreaLines} onChange={e => setFormData({ ...formData, TextAreaLines: e.target.value })} className="w-32" /></div>
                    )}
                    {(showNumberProps || showAmountProps) && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2"><Label>Min Value</Label><Input type="number" value={formData.MinValue} onChange={e => setFormData({ ...formData, MinValue: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Max Value</Label><Input type="number" value={formData.MaxValue} onChange={e => setFormData({ ...formData, MaxValue: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Step Value</Label><Input type="number" value={formData.StepValue} onChange={e => setFormData({ ...formData, StepValue: e.target.value })} /></div>
                      </div>
                    )}
                    {showAmountProps && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2"><Label>Currency Code</Label><Input value={formData.CurrencyCode} onChange={e => setFormData({ ...formData, CurrencyCode: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Decimal Places</Label><Input type="number" value={formData.DecimalPlaces} onChange={e => setFormData({ ...formData, DecimalPlaces: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Prefix</Label><Input value={formData.Prefix} onChange={e => setFormData({ ...formData, Prefix: e.target.value })} placeholder="e.g. ETB" /></div>
                      </div>
                    )}
                    {showOptionProps && (
                      <>
                        <div className="space-y-2">
                          <Label>Options (JSON Array)</Label>
                          <Textarea rows={4} className="font-mono text-xs" value={formData.Options} onChange={e => setFormData({ ...formData, Options: e.target.value })}
                            placeholder={'[\n  {"value": "opt1", "label": "Option 1"},\n  {"value": "opt2", "label": "Option 2"}\n]'} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Options Layout</Label>
                            <Select value={formData.OptionsLayout} onValueChange={v => setFormData({ ...formData, OptionsLayout: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>{OPTIONS_LAYOUTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2"><Label>Grid Columns</Label><Input type="number" value={formData.GridColumns} onChange={e => setFormData({ ...formData, GridColumns: e.target.value })} /></div>
                          {ft === 'checkbox_group' && (
                            <div className="flex gap-2">
                              <div className="space-y-2 flex-1"><Label>Min Sel.</Label><Input type="number" value={formData.MinSelections} onChange={e => setFormData({ ...formData, MinSelections: e.target.value })} /></div>
                              <div className="space-y-2 flex-1"><Label>Max Sel.</Label><Input type="number" value={formData.MaxSelections} onChange={e => setFormData({ ...formData, MaxSelections: e.target.value })} /></div>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Options API Endpoint</Label><Input value={formData.OptionsApiEndpoint} onChange={e => setFormData({ ...formData, OptionsApiEndpoint: e.target.value })} placeholder="Remote endpoint for options" /></div>
                          <div className="space-y-2"><Label>Options API Path</Label><Input value={formData.OptionsApiPath} onChange={e => setFormData({ ...formData, OptionsApiPath: e.target.value })} placeholder="$.data.items" /></div>
                        </div>
                      </>
                    )}
                    {showDigitCount && (
                      <div className="space-y-2"><Label>Digit Count</Label><Input type="number" value={formData.DigitCount} onChange={e => setFormData({ ...formData, DigitCount: e.target.value })} className="w-32" /></div>
                    )}
                    {showDateProps && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2"><Label>Min Date</Label><Input value={formData.MinDate} onChange={e => setFormData({ ...formData, MinDate: e.target.value })} placeholder="YYYY-MM-DD or today" /></div>
                        <div className="space-y-2"><Label>Max Date</Label><Input value={formData.MaxDate} onChange={e => setFormData({ ...formData, MaxDate: e.target.value })} /></div>
                        <div className="space-y-2"><Label>Date Format</Label><Input value={formData.DateFormat} onChange={e => setFormData({ ...formData, DateFormat: e.target.value })} placeholder="yyyy-MM-dd" /></div>
                      </div>
                    )}
                    {showTimeProps && (
                      <div className="space-y-2"><Label>Time Format</Label><Input value={formData.TimeFormat} onChange={e => setFormData({ ...formData, TimeFormat: e.target.value })} placeholder="HH:mm" className="w-48" /></div>
                    )}
                    {showFileProps && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Allowed File Types</Label><Input value={formData.AllowedFileTypes} onChange={e => setFormData({ ...formData, AllowedFileTypes: e.target.value })} placeholder="pdf,jpg,png" /></div>
                        <div className="space-y-2"><Label>Max File Size (bytes)</Label><Input type="number" value={formData.MaxFileSize} onChange={e => setFormData({ ...formData, MaxFileSize: e.target.value })} /></div>
                      </div>
                    )}
                    {ft === 'image' && (
                      <div className="flex gap-6 py-2">
                        <div className="flex items-center space-x-2"><Switch checked={formData.AllowCamera} onCheckedChange={v => setFormData({ ...formData, AllowCamera: v })} /><Label>Allow Camera</Label></div>
                        <div className="flex items-center space-x-2"><Switch checked={formData.AllowGallery} onCheckedChange={v => setFormData({ ...formData, AllowGallery: v })} /><Label>Allow Gallery</Label></div>
                      </div>
                    )}
                    {showRatingProps && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Max Rating</Label><Input type="number" value={formData.MaxRating} onChange={e => setFormData({ ...formData, MaxRating: e.target.value })} /></div>
                        <div className="flex items-center space-x-2 pt-6"><Switch checked={formData.AllowHalfRating} onCheckedChange={v => setFormData({ ...formData, AllowHalfRating: v })} /><Label>Allow Half Rating</Label></div>
                      </div>
                    )}
                    {showToggleProps && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>On Text</Label><Input value={formData.OnText} onChange={e => setFormData({ ...formData, OnText: e.target.value })} placeholder="Yes / Enabled" /></div>
                        <div className="space-y-2"><Label>Off Text</Label><Input value={formData.OffText} onChange={e => setFormData({ ...formData, OffText: e.target.value })} placeholder="No / Disabled" /></div>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch checked={formData.AutoFormat} onCheckedChange={v => setFormData({ ...formData, AutoFormat: v })} />
                      <Label>Auto Format Input</Label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* === VALIDATION === */}
              <AccordionItem value="validation">
                <AccordionTrigger className="text-sm font-semibold">Validation</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Regex Pattern</Label><Input className="font-mono" value={formData.ValidationPattern} onChange={e => setFormData({ ...formData, ValidationPattern: e.target.value })} placeholder="^[0-9]{10}$" /></div>
                      <div className="space-y-2"><Label>Validation Message</Label><Input value={formData.ValidationMessage} onChange={e => setFormData({ ...formData, ValidationMessage: e.target.value })} placeholder="Custom error message" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Visibility Condition (JSON)</Label><Textarea rows={2} className="font-mono text-xs" value={formData.VisibilityCondition} onChange={e => setFormData({ ...formData, VisibilityCondition: e.target.value })} placeholder='{"field": "type", "operator": "==", "value": "business"}' /></div>
                      <div className="space-y-2"><Label>Required Condition (JSON)</Label><Textarea rows={2} className="font-mono text-xs" value={formData.RequiredCondition} onChange={e => setFormData({ ...formData, RequiredCondition: e.target.value })} /></div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* === LOOKUP / DEPENDENCIES === */}
              <AccordionItem value="lookup">
                <AccordionTrigger className="text-sm font-semibold">Lookup & Dependencies</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 py-2">
                    <div className="flex items-center space-x-2">
                      <Switch checked={formData.TriggerLookup} onCheckedChange={v => setFormData({ ...formData, TriggerLookup: v })} />
                      <Label>Trigger Lookup on Change</Label>
                    </div>
                    {formData.TriggerLookup && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Lookup Endpoint</Label><Input value={formData.LookupEndpoint} onChange={e => setFormData({ ...formData, LookupEndpoint: e.target.value })} placeholder="/api/lookup/..." /></div>
                          <div className="space-y-2"><Label>Lookup Field Mapping (JSON)</Label><Input className="font-mono text-xs" value={formData.LookupFieldMapping} onChange={e => setFormData({ ...formData, LookupFieldMapping: e.target.value })} placeholder='{"name": "$.data.name"}' /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Debounce (ms)</Label><Input type="number" value={formData.LookupDebounceMs} onChange={e => setFormData({ ...formData, LookupDebounceMs: e.target.value })} /></div>
                          <div className="space-y-2"><Label>Min Input Length</Label><Input type="number" value={formData.LookupMinLength} onChange={e => setFormData({ ...formData, LookupMinLength: e.target.value })} /></div>
                        </div>
                      </>
                    )}
                    <div className="flex items-center space-x-2">
                      <Switch checked={formData.ClearDependentsOnChange} onCheckedChange={v => setFormData({ ...formData, ClearDependentsOnChange: v })} />
                      <Label>Clear Dependent Fields on Change</Label>
                    </div>
                    {formData.ClearDependentsOnChange && (
                      <div className="space-y-2"><Label>Dependent Fields (comma-separated keys)</Label><Input value={formData.DependentFields} onChange={e => setFormData({ ...formData, DependentFields: e.target.value })} placeholder="customer_name, balance" /></div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* === ADVANCED === */}
              <AccordionItem value="advanced">
                <AccordionTrigger className="text-sm font-semibold">Advanced</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>CSS Class</Label><Input value={formData.CssClass} onChange={e => setFormData({ ...formData, CssClass: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Prefix / Suffix Display</Label>
                        <div className="flex gap-2">
                          <Input value={formData.Prefix} onChange={e => setFormData({ ...formData, Prefix: e.target.value })} placeholder="Prefix" />
                          <Input value={formData.Suffix} onChange={e => setFormData({ ...formData, Suffix: e.target.value })} placeholder="Suffix" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2"><Label>Extra Config (JSON)</Label><Textarea rows={3} className="font-mono text-xs" value={formData.ExtraConfig} onChange={e => setFormData({ ...formData, ExtraConfig: e.target.value })} placeholder='{"customProp": "value"}' /></div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
