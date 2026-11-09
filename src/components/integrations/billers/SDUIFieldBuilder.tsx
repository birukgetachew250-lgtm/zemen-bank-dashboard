'use client';

import { useMemo, useState, type DragEvent, type ReactNode } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  PlusCircle, Edit, Trash2, Loader2, EyeOff, Search, X, Type, AlignLeft, Hash, Phone, Mail,
  Lock, Banknote, ShieldCheck, KeyRound, SquareChevronDown, CircleDot, CheckSquare, ListChecks,
  ToggleRight, Calendar, Clock, CalendarClock, Upload, Image as ImageIcon, SlidersHorizontal,
  Star, Signature, MapPin, QrCode, Tag, Minus, Heading, GripVertical, Smartphone, LayoutList,
  MousePointerClick, WandSparkles, Braces, Copy, ChevronUp, ChevronDown, Plus, Eye, Sparkles,
  type LucideIcon,
} from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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

/* ─── UI-only metadata: icons & palette grouping (does not affect saved data) ─── */
const TYPE_ICONS: Record<string, LucideIcon> = {
  text: Type, textarea: AlignLeft, number: Hash, phone: Phone, email: Mail, password: Lock,
  amount: Banknote, otp: ShieldCheck, pin: KeyRound, dropdown: SquareChevronDown, radio: CircleDot,
  checkbox: CheckSquare, checkbox_group: ListChecks, switch: ToggleRight, date: Calendar,
  time: Clock, datetime: CalendarClock, file: Upload, image: ImageIcon, slider: SlidersHorizontal,
  rating: Star, signature: Signature, location: MapPin, barcode: QrCode, hidden: EyeOff,
  label: Tag, divider: Minus, header: Heading,
};

const PALETTE_GROUPS: { title: string; accent: string; types: string[] }[] = [
  { title: 'Text Inputs', accent: 'text-sky-500 bg-sky-500/10', types: ['text', 'textarea', 'number', 'phone', 'email', 'password'] },
  { title: 'Payment & Security', accent: 'text-emerald-500 bg-emerald-500/10', types: ['amount', 'otp', 'pin'] },
  { title: 'Choices', accent: 'text-violet-500 bg-violet-500/10', types: ['dropdown', 'radio', 'checkbox', 'checkbox_group', 'switch'] },
  { title: 'Date & Time', accent: 'text-amber-500 bg-amber-500/10', types: ['date', 'time', 'datetime'] },
  { title: 'Media & Device', accent: 'text-rose-500 bg-rose-500/10', types: ['file', 'image', 'signature', 'location', 'barcode'] },
  { title: 'Interactive', accent: 'text-orange-500 bg-orange-500/10', types: ['slider', 'rating'] },
  { title: 'Layout & Hidden', accent: 'text-slate-500 bg-slate-500/10', types: ['header', 'label', 'divider', 'hidden'] },
];

const typeLabel = (v: string) => FIELD_TYPES.find(t => t.value === v)?.label || v;
const typeAccent = (v: string) => PALETTE_GROUPS.find(g => g.types.includes(v))?.accent || 'text-primary bg-primary/10';

const KEYBOARD_TYPES = ['text', 'number', 'phone', 'email', 'url', 'decimal'];
const OPTIONS_LAYOUTS = ['vertical', 'horizontal', 'grid'];
const FIELD_WIDTHS = ['full', 'half', 'third', 'quarter'];
const WIDTH_CLASS: Record<string, string> = {
  full: 'basis-full', half: 'basis-[calc(50%-6px)]', third: 'basis-[calc(33.333%-8px)]', quarter: 'basis-[calc(25%-9px)]',
};

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

type FormData = typeof defaultFormData;

const truthy = (v: any) => v === 1 || v === true;

const parseOptions = (raw: string): { value: string; label: string }[] | null => {
  if (!raw || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    if (parsed.every(o => o && typeof o === 'object' && ('value' in o || 'label' in o))) {
      return parsed.map(o => ({ value: String(o.value ?? ''), label: String(o.label ?? '') }));
    }
    return null;
  } catch {
    return null;
  }
};

const previewOptions = (raw: string): string[] => {
  try {
    const parsed = JSON.parse(raw || '[]');
    if (Array.isArray(parsed)) return parsed.map((o: any) => (typeof o === 'object' ? (o.label ?? o.value) : String(o))).slice(0, 4);
  } catch { /* noop */ }
  return ['Option 1', 'Option 2'];
};

/* ══════════════════════════════════════════════
   MOBILE PREVIEW RENDERER (visual only)
══════════════════════════════════════════════ */
function FieldPreview({ f }: { f: any }) {
  const type = f.FieldType || 'text';
  const label = f.Label || 'Untitled field';
  const required = truthy(f.IsRequired);
  const placeholder = f.Placeholder || '';
  const LabelEl = (
    <p className="mb-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
      {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
    </p>
  );
  const helper = f.HelperText ? <p className="mt-1 text-[10px] text-slate-400">{f.HelperText}</p> : null;
  const box = 'flex h-9 w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] text-slate-400 dark:border-slate-700 dark:bg-slate-900';

  switch (type) {
    case 'header':
      return <p className="pt-1 text-sm font-extrabold text-slate-900 dark:text-white">{label}</p>;
    case 'label':
      return <p className="text-[11px] text-slate-500">{label}</p>;
    case 'divider':
      return <div className="my-1 h-px w-full bg-slate-200 dark:bg-slate-700" />;
    case 'hidden':
      return (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-[10px] text-slate-400 dark:border-slate-700">
          <EyeOff className="h-3 w-3" /> Hidden: <span className="font-mono">{f.FieldKey || 'key'}</span>
        </div>
      );
    case 'textarea':
      return <div>{LabelEl}<div className={cn(box, 'h-16 items-start pt-2')}>{placeholder}</div>{helper}</div>;
    case 'amount':
      return (
        <div>{LabelEl}
          <div className={box}>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">{f.Prefix || f.CurrencyCode || 'ETB'}</span>
            <span>{placeholder || '0.00'}</span>
          </div>{helper}
        </div>
      );
    case 'otp':
    case 'pin': {
      const n = Math.min(Math.max(Number(f.DigitCount) || (type === 'pin' ? 4 : 6), 3), 8);
      return (
        <div>{LabelEl}
          <div className="flex gap-1.5">
            {Array.from({ length: n }).map((_, i) => (
              <div key={i} className="flex h-9 flex-1 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-300 dark:border-slate-700 dark:bg-slate-900">•</div>
            ))}
          </div>{helper}
        </div>
      );
    }
    case 'dropdown':
      return <div>{LabelEl}<div className={cn(box, 'justify-between')}><span>{placeholder || 'Select an option'}</span><ChevronDown className="h-3.5 w-3.5" /></div>{helper}</div>;
    case 'radio':
    case 'checkbox_group': {
      const opts = previewOptions(f.Options);
      const horizontal = f.OptionsLayout === 'horizontal' || f.OptionsLayout === 'grid';
      return (
        <div>{LabelEl}
          <div className={cn('gap-2', horizontal ? 'flex flex-wrap' : 'flex flex-col')}>
            {opts.map((o, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                <span className={cn('h-3.5 w-3.5 border border-slate-300 dark:border-slate-600', type === 'radio' ? 'rounded-full' : 'rounded')} />{o}
              </div>
            ))}
          </div>{helper}
        </div>
      );
    }
    case 'checkbox':
      return <div className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-200"><span className="h-4 w-4 rounded border border-slate-300 dark:border-slate-600" />{label}</div>;
    case 'switch':
      return (
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-200">
          {label}<span className="flex h-5 w-9 items-center rounded-full bg-slate-200 p-0.5 dark:bg-slate-700"><span className="h-4 w-4 rounded-full bg-white shadow" /></span>
        </div>
      );
    case 'date':
    case 'time':
    case 'datetime': {
      const Icon = TYPE_ICONS[type];
      return <div>{LabelEl}<div className={cn(box, 'justify-between')}><span>{placeholder || f.DateFormat || f.TimeFormat || 'Pick…'}</span><Icon className="h-3.5 w-3.5" /></div>{helper}</div>;
    }
    case 'file':
    case 'image':
    case 'signature':
    case 'barcode':
    case 'location': {
      const Icon = TYPE_ICONS[type];
      return (
        <div>{LabelEl}
          <div className="flex h-16 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 text-[10px] text-slate-400 dark:border-slate-700">
            <Icon className="h-4 w-4" />{typeLabel(type)}
          </div>{helper}
        </div>
      );
    }
    case 'slider':
      return (
        <div>{LabelEl}
          <div className="relative h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-1.5 w-1/2 rounded-full bg-[hsl(347,78%,48%)]" /><div className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[hsl(347,78%,48%)] bg-white" /></div>
          <div className="mt-1 flex justify-between text-[9px] text-slate-400"><span>{f.MinValue || 0}</span><span>{f.MaxValue || 100}</span></div>
        </div>
      );
    case 'rating': {
      const n = Math.min(Number(f.MaxRating) || 5, 10);
      return <div>{LabelEl}<div className="flex gap-1">{Array.from({ length: n }).map((_, i) => <Star key={i} className={cn('h-4 w-4', i < 3 ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />)}</div></div>;
    }
    default: {
      const Icon = TYPE_ICONS[type] || Type;
      return (
        <div>{LabelEl}
          <div className={box}>
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {f.Prefix && <span className="text-slate-500">{f.Prefix}</span>}
            <span className="truncate">{(truthy(f.IsMasked) || type === 'password') && !placeholder ? '••••••••' : placeholder || f.InputMask || ''}</span>
            {f.Suffix && <span className="ml-auto text-slate-500">{f.Suffix}</span>}
          </div>{helper}
        </div>
      );
    }
  }
}

/* ─── Small inspector building blocks ─── */
function Prop({ label, hint, children, className, required }: { label: string; hint?: string; children: ReactNode; className?: string; required?: boolean }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-xs font-semibold text-foreground/80">{label}{required && <span className="ml-0.5 text-rose-500">*</span>}</Label>
      {children}
      {hint && <p className="text-[11px] leading-snug text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ToggleCard({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(!checked); } }}
      className={cn(
        'flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-all',
        checked ? 'border-primary/40 bg-primary/[0.06]' : 'border-border/70 bg-muted/20 hover:bg-muted/40'
      )}
    >
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        {desc && <p className="text-[11px] text-muted-foreground">{desc}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} onClick={e => e.stopPropagation()} />
    </div>
  );
}

function Segmented({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-border/70 bg-muted/30 p-1">
      {options.map(o => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            'flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold capitalize transition-all',
            value === o ? 'bg-background text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <p className="pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{children}</p>;
}

export function SDUIFieldBuilder({ providerId, initialFields }: { providerId: string, initialFields: any[] }) {
  const [fields, setFields] = useState(initialFields);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<FormData>({ ...defaultFormData });
  const { toast } = useToast();

  // Pure UI state
  const [view, setView] = useState<'designer' | 'table'>('designer');
  const [paletteSearch, setPaletteSearch] = useState('');
  const [activeStep, setActiveStep] = useState<string>('all');
  const [extraSteps, setExtraSteps] = useState<number[]>([]);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [keyTouched, setKeyTouched] = useState(false);
  const [rawOptions, setRawOptions] = useState(false);
  const [rawVisibility, setRawVisibility] = useState(false);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setFormData(prev => ({ ...prev, [k]: v }));

  const filtered = fields.filter(f =>
    f.FieldKey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.Label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stepNumbers = useMemo(() => {
    const s = new Set<number>([1, ...extraSteps]);
    fields.forEach(f => s.add(Number(f.StepNumber) || 1));
    return Array.from(s).sort((a, b) => a - b);
  }, [fields, extraSteps]);

  const canvasFields = useMemo(() => {
    const list = filtered
      .filter(f => activeStep === 'all' || String(f.StepNumber ?? 1) === activeStep)
      .sort((a, b) => (Number(a.StepNumber) - Number(b.StepNumber)) || (Number(a.FieldOrder) - Number(b.FieldOrder)));
    return list;
  }, [filtered, activeStep]);

  const openAdd = (presetType?: string, presetOrder?: number) => {
    setEditingField(null);
    setKeyTouched(false);
    setRawOptions(false);
    setRawVisibility(false);
    setFormData({
      ...defaultFormData,
      FieldType: presetType || 'text',
      KeyboardType: presetType === 'number' || presetType === 'amount' ? 'number' : presetType === 'phone' ? 'phone' : presetType === 'email' ? 'email' : 'text',
      FieldOrder: String(presetOrder ?? fields.length),
      StepNumber: activeStep === 'all' ? '1' : activeStep,
      IsRequired: !['header', 'label', 'divider', 'hidden'].includes(presetType || ''),
    });
    setDialogOpen(true);
  };

  const openEdit = (field: any) => {
    setEditingField(field);
    setKeyTouched(true);
    setRawOptions(parseOptions(field.Options || '') === null);
    setRawVisibility(false);
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

  const openDuplicate = (field: any) => {
    openEdit(field);
    setEditingField(null);
    setKeyTouched(true);
    setFormData(prev => ({ ...prev, FieldKey: `${prev.FieldKey}_copy`, Label: `${prev.Label} (Copy)`, FieldOrder: String(fields.length) }));
  };

  const closeInspector = () => {
    setDialogOpen(false);
    setEditingField(null);
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
      await res.json();
      toast({ title: 'Success', description: `Field ${editingField ? 'updated' : 'created'} successfully.` });
      setDialogOpen(false);
      setEditingField(null);
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
      if (editingField?.FieldId === fieldId) closeInspector();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  /* ─── Drag & drop from palette onto the phone canvas (UI helper only) ─── */
  const onPaletteDragStart = (e: DragEvent, type: string) => {
    e.dataTransfer.setData('application/x-sdui-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };
  const onCanvasDrop = (e: DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/x-sdui-type');
    const idx = dropIndex;
    setDropIndex(null);
    if (!type) return;
    let order: number | undefined;
    if (idx != null && canvasFields.length > 0) {
      order = idx < canvasFields.length
        ? Number(canvasFields[idx].FieldOrder ?? idx)
        : Number(canvasFields[canvasFields.length - 1].FieldOrder ?? canvasFields.length - 1) + 1;
    }
    openAdd(type, order);
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

  const optionRows = parseOptions(formData.Options);
  const updateOptionRows = (rows: { value: string; label: string }[]) => set('Options', rows.length ? JSON.stringify(rows, null, 2) : '');

  const visibility = (() => {
    if (!formData.VisibilityCondition.trim()) return { field: '', operator: '==', value: '' };
    try {
      const p = JSON.parse(formData.VisibilityCondition);
      if (p && typeof p === 'object' && !Array.isArray(p) && Object.keys(p).every(k => ['field', 'operator', 'value'].includes(k))) {
        return { field: String(p.field ?? ''), operator: String(p.operator ?? '=='), value: String(p.value ?? '') };
      }
    } catch { /* noop */ }
    return null;
  })();
  const updateVisibility = (next: { field: string; operator: string; value: string }) =>
    set('VisibilityCondition', next.field ? JSON.stringify(next) : '');

  const otherFieldKeys = fields.map(f => f.FieldKey).filter(k => k && k !== formData.FieldKey);

  const paletteGroups = PALETTE_GROUPS.map(g => ({
    ...g,
    types: g.types.filter(t => !paletteSearch || typeLabel(t).toLowerCase().includes(paletteSearch.toLowerCase()) || t.includes(paletteSearch.toLowerCase())),
  })).filter(g => g.types.length > 0);

  // Live preview: the field currently being edited/created replaces/augments canvas items
  const livePreviewField = isDialogOpen ? { ...formData } : null;

  return (
    <div className="space-y-4">
      {/* ─── Toolbar ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <WandSparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Form Designer</p>
            <p className="text-[11px] text-muted-foreground">
              {fields.length} field(s) · {stepNumbers.length} step(s) · Drag components onto the phone or click to add
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Find a field…" className="h-9 w-48 pl-8 text-xs" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex rounded-xl border border-border/70 bg-muted/30 p-1">
            <button type="button" onClick={() => setView('designer')} className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold', view === 'designer' ? 'bg-background shadow-sm ring-1 ring-border' : 'text-muted-foreground')}>
              <Smartphone className="h-3.5 w-3.5" /> Designer
            </button>
            <button type="button" onClick={() => setView('table')} className={cn('flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold', view === 'table' ? 'bg-background shadow-sm ring-1 ring-border' : 'text-muted-foreground')}>
              <LayoutList className="h-3.5 w-3.5" /> Table
            </button>
          </div>
          <Button size="sm" onClick={() => openAdd()} className="h-9 rounded-xl"><PlusCircle className="mr-1.5 h-4 w-4" /> Add Field</Button>
        </div>
      </div>

      <div className={cn('grid gap-4', view === 'designer' ? 'xl:grid-cols-[250px_minmax(0,1fr)_400px]' : 'xl:grid-cols-[minmax(0,1fr)_400px]')}>
        {/* ═══ LEFT: COMPONENT PALETTE ═══ */}
        {view === 'designer' && (
          <aside className="rounded-2xl border border-border/70 bg-card/80 p-3 shadow-sm xl:sticky xl:top-4 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
            <p className="px-1 text-xs font-bold text-foreground">Components</p>
            <p className="px-1 pb-2 text-[11px] text-muted-foreground">Drag onto the phone, or click to add.</p>
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search components" className="h-8 pl-8 text-xs" value={paletteSearch} onChange={e => setPaletteSearch(e.target.value)} />
            </div>
            <div className="space-y-3">
              {paletteGroups.map(group => (
                <div key={group.title}>
                  <SectionTitle>{group.title}</SectionTitle>
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                    {group.types.map(t => {
                      const Icon = TYPE_ICONS[t] || Type;
                      return (
                        <button
                          key={t}
                          type="button"
                          draggable
                          onDragStart={e => onPaletteDragStart(e, t)}
                          onClick={() => openAdd(t)}
                          title={`Add ${typeLabel(t)}`}
                          className="group flex cursor-grab flex-col items-center gap-1 rounded-xl border border-border/60 bg-background/60 px-1.5 py-2 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md active:cursor-grabbing"
                        >
                          <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', group.accent)}>
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="line-clamp-1 text-[10.5px] font-medium text-foreground/80">{typeLabel(t).replace(' / Currency', '').replace(' Picker', '')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* ═══ CENTER: CANVAS (Phone preview) or TABLE ═══ */}
        {view === 'designer' ? (
          <section className="rounded-2xl border border-border/70 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border))_1px,transparent_0)] [background-size:18px_18px] p-4 shadow-sm">
            {/* Step tabs */}
            <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5">
              <button type="button" onClick={() => setActiveStep('all')} className={cn('rounded-full px-3 py-1 text-xs font-semibold transition', activeStep === 'all' ? 'bg-foreground text-background' : 'bg-card text-muted-foreground ring-1 ring-border hover:text-foreground')}>
                All Steps
              </button>
              {stepNumbers.map(s => (
                <button key={s} type="button" onClick={() => setActiveStep(String(s))} className={cn('rounded-full px-3 py-1 text-xs font-semibold transition', activeStep === String(s) ? 'bg-primary text-primary-foreground shadow' : 'bg-card text-muted-foreground ring-1 ring-border hover:text-foreground')}>
                  Step {s}
                  <span className="ml-1.5 opacity-70">{fields.filter(f => Number(f.StepNumber ?? 1) === s).length}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => { const next = Math.max(...stepNumbers) + 1; setExtraSteps(p => [...p, next]); setActiveStep(String(next)); }}
                className="flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary"
              >
                <Plus className="h-3 w-3" /> Step
              </button>
            </div>

            {/* Phone frame */}
            <div className="mx-auto w-full max-w-[380px]">
              <div className="rounded-[2.6rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl dark:border-slate-700">
                <div className="relative overflow-hidden rounded-[2rem] bg-slate-50 dark:bg-slate-950">
                  {/* Status bar + notch */}
                  <div className="flex items-center justify-between px-6 pt-2.5 text-[10px] font-semibold text-slate-500">
                    <span>9:41</span>
                    <span className="h-4 w-20 rounded-full bg-slate-900 dark:bg-slate-700" />
                    <span>100%</span>
                  </div>
                  {/* App bar */}
                  <div className="flex items-center gap-2 bg-gradient-to-r from-[hsl(347,78%,46%)] to-[hsl(335,70%,38%)] px-4 py-3 text-white">
                    <ChevronDown className="h-4 w-4 rotate-90" />
                    <p className="text-sm font-bold">Bill Payment</p>
                    <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
                      {activeStep === 'all' ? 'All steps' : `Step ${activeStep}`}
                    </span>
                  </div>

                  {/* Canvas body */}
                  <div
                    className={cn('min-h-[460px] px-3 py-4 transition-colors', dropIndex != null && 'bg-primary/[0.04]')}
                    onDragOver={e => { e.preventDefault(); if (dropIndex == null) setDropIndex(canvasFields.length); }}
                    onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropIndex(null); }}
                    onDrop={onCanvasDrop}
                  >
                    {canvasFields.length === 0 && !(livePreviewField && !editingField) ? (
                      <div className="flex h-[420px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 text-center dark:border-slate-700">
                        <MousePointerClick className="h-7 w-7 text-slate-400" />
                        <p className="text-xs font-semibold text-slate-500">Drop components here</p>
                        <p className="max-w-[200px] text-[10px] text-slate-400">Drag any component from the left panel, or click &quot;Add Field&quot;.</p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {canvasFields.map((f, idx) => {
                          const isSelected = editingField?.FieldId === f.FieldId;
                          const shown = isSelected && livePreviewField ? livePreviewField : f;
                          const showStepDivider = activeStep === 'all' && (idx === 0 || Number(canvasFields[idx - 1].StepNumber) !== Number(f.StepNumber));
                          return (
                            <div key={f.FieldId} className={cn('contents')}>
                              {showStepDivider && (
                                <div className="basis-full pt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">— Step {f.StepNumber ?? 1} —</div>
                              )}
                              {dropIndex === idx && <div className="basis-full h-1 rounded-full bg-primary" />}
                              <div
                                onClick={() => openEdit(f)}
                                onDragOver={e => {
                                  e.preventDefault(); e.stopPropagation();
                                  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                  setDropIndex(e.clientY < r.top + r.height / 2 ? idx : idx + 1);
                                }}
                                className={cn(
                                  'group relative cursor-pointer rounded-xl p-2 transition-all',
                                  WIDTH_CLASS[shown.FieldWidth || 'full'] || 'basis-full',
                                  isSelected ? 'bg-primary/[0.07] ring-2 ring-primary' : 'hover:bg-white hover:ring-1 hover:ring-slate-300 dark:hover:bg-slate-900 dark:hover:ring-slate-700',
                                  truthy(shown.IsHidden) && 'opacity-50'
                                )}
                              >
                                <FieldPreview f={shown} />
                                <div className={cn('absolute -top-2.5 right-1 flex items-center gap-0.5 rounded-lg border border-border bg-background px-1 py-0.5 shadow-sm transition-opacity', isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
                                  <span className="px-1 font-mono text-[9px] text-muted-foreground">{f.FieldKey}</span>
                                  <button type="button" title="Duplicate" onClick={e => { e.stopPropagation(); openDuplicate(f); }} className="rounded p-0.5 hover:bg-muted"><Copy className="h-3 w-3" /></button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <button type="button" title="Delete" onClick={e => e.stopPropagation()} className="rounded p-0.5 text-rose-500 hover:bg-rose-500/10"><Trash2 className="h-3 w-3" /></button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent onClick={e => e.stopPropagation()}>
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
                                <GripVertical className="absolute -left-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300 opacity-0 group-hover:opacity-100" />
                              </div>
                            </div>
                          );
                        })}
                        {dropIndex === canvasFields.length && canvasFields.length > 0 && <div className="basis-full h-1 rounded-full bg-primary" />}

                        {/* New (unsaved) field live preview */}
                        {livePreviewField && !editingField && (
                          <div className={cn('relative rounded-xl border-2 border-dashed border-primary/60 bg-primary/[0.05] p-2', WIDTH_CLASS[livePreviewField.FieldWidth] || 'basis-full')}>
                            <span className="absolute -top-2.5 left-2 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">NEW · unsaved</span>
                            <FieldPreview f={livePreviewField} />
                          </div>
                        )}
                      </div>
                    )}

                    {canvasFields.length > 0 && (
                      <div className="mt-5 rounded-xl bg-gradient-to-r from-[hsl(347,78%,46%)] to-[hsl(335,70%,38%)] py-2.5 text-center text-xs font-bold text-white shadow">
                        Continue
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
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
                ) : filtered.map((f, idx) => {
                  const Icon = TYPE_ICONS[f.FieldType] || Type;
                  return (
                    <TableRow key={f.FieldId} className={cn('cursor-pointer', editingField?.FieldId === f.FieldId && 'bg-primary/[0.06]')} onClick={() => openEdit(f)}>
                      <TableCell className="text-muted-foreground text-xs">{f.FieldOrder ?? idx}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-primary">{f.FieldKey}</span>
                          <span className="text-sm text-muted-foreground">{f.Label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                          <span className={cn('flex h-6 w-6 items-center justify-center rounded-md', typeAccent(f.FieldType))}><Icon className="h-3 w-3" /></span>
                          {typeLabel(f.FieldType)}
                        </span>
                      </TableCell>
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
                          {truthy(f.IsRequired) && <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] dark:bg-red-500/10 dark:text-red-300">Required</Badge>}
                          {truthy(f.IsReadOnly) && <Badge variant="outline" className="text-[10px]">ReadOnly</Badge>}
                          {truthy(f.IsHidden) && <Badge variant="outline" className="text-[10px]"><EyeOff className="h-3 w-3 mr-1" />Hidden</Badge>}
                          {truthy(f.TriggerLookup) && <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] dark:bg-blue-500/10 dark:text-blue-300">Lookup</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
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
                  );
                })}
              </TableBody>
            </Table>
          </section>
        )}

        {/* ═══ RIGHT: PROPERTY INSPECTOR ═══ */}
        <aside className="flex flex-col rounded-2xl border border-border/70 bg-card shadow-sm xl:sticky xl:top-4 xl:max-h-[calc(100vh-7rem)]">
          {!isDialogOpen ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Sparkles className="h-6 w-6" /></div>
              <p className="text-sm font-bold text-foreground">No field selected</p>
              <p className="max-w-[260px] text-xs text-muted-foreground">Click a field on the phone to edit its properties, or drag a component from the palette to create a new one.</p>
              <Button size="sm" variant="outline" className="rounded-xl" onClick={() => openAdd()}><PlusCircle className="mr-1.5 h-4 w-4" /> New Text Field</Button>
            </div>
          ) : (
            <>
              {/* Inspector header */}
              <div className="flex items-start justify-between gap-3 border-b border-border/60 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  {(() => { const Icon = TYPE_ICONS[ft] || Type; return (
                    <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', typeAccent(ft))}><Icon className="h-5 w-5" /></span>
                  ); })()}
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{editingField ? 'Edit field' : 'New field'}</p>
                    <p className="truncate text-sm font-bold text-foreground">{formData.Label || 'Untitled field'}</p>
                    <p className="truncate font-mono text-[11px] text-primary">{formData.FieldKey || 'field_key'}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={closeInspector} title="Close"><X className="h-4 w-4" /></Button>
              </div>

              <Tabs defaultValue="general" className="flex min-h-0 flex-1 flex-col">
                <TabsList className="mx-4 mt-3 grid grid-cols-5">
                  <TabsTrigger value="general" className="text-[11px]">General</TabsTrigger>
                  <TabsTrigger value="type" className="text-[11px]">Type</TabsTrigger>
                  <TabsTrigger value="rules" className="text-[11px]">Rules</TabsTrigger>
                  <TabsTrigger value="logic" className="text-[11px]">Logic</TabsTrigger>
                  <TabsTrigger value="advanced" className="text-[11px]">More</TabsTrigger>
                </TabsList>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
                  {/* ── GENERAL ── */}
                  <TabsContent value="general" className="mt-3 space-y-4">
                    <Prop label="Component type">
                      <Select value={formData.FieldType} onValueChange={v => set('FieldType', v)}>
                        <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-80">
                          {PALETTE_GROUPS.map(g => (
                            <div key={g.title}>
                              <p className="px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{g.title}</p>
                              {g.types.map(t => {
                                const Icon = TYPE_ICONS[t] || Type;
                                return <SelectItem key={t} value={t}><span className="flex items-center gap-2"><Icon className="h-3.5 w-3.5" />{typeLabel(t)}</span></SelectItem>;
                              })}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </Prop>

                    <Prop label="Display label" required hint="What the customer sees above the input.">
                      <Input
                        value={formData.Label}
                        onChange={e => {
                          const v = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            Label: v,
                            FieldKey: keyTouched ? prev.FieldKey : v.trim().replace(/[^a-zA-Z0-9\s_]/g, '').replace(/\s+/g, '_').toLowerCase(),
                          }));
                        }}
                        placeholder="e.g. Account Number"
                      />
                    </Prop>

                    <Prop label="Field key" required hint={keyTouched ? 'Used in API payloads. Lowercase, no spaces.' : 'Auto-generated from the label — edit to override.'}>
                      <div className="relative">
                        <Braces className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={formData.FieldKey}
                          onChange={e => { setKeyTouched(true); set('FieldKey', e.target.value.replace(/\s/g, '_').toLowerCase()); }}
                          placeholder="e.g. account_number"
                          className="pl-8 font-mono"
                        />
                      </div>
                    </Prop>

                    <div className="grid grid-cols-2 gap-3">
                      <Prop label="Placeholder"><Input value={formData.Placeholder} onChange={e => set('Placeholder', e.target.value)} placeholder="Hint inside field" /></Prop>
                      <Prop label="Default value"><Input value={formData.DefaultValue} onChange={e => set('DefaultValue', e.target.value)} /></Prop>
                    </div>
                    <Prop label="Helper text"><Input value={formData.HelperText} onChange={e => set('HelperText', e.target.value)} placeholder="Small text shown under the input" /></Prop>

                    <SectionTitle>Layout & position</SectionTitle>
                    <Prop label="Width on screen"><Segmented value={formData.FieldWidth} options={FIELD_WIDTHS} onChange={v => set('FieldWidth', v)} /></Prop>
                    <div className="grid grid-cols-2 gap-3">
                      <Prop label="Step">
                        <div className="flex items-center gap-1">
                          <Button type="button" variant="outline" size="icon" className="h-10 w-9 shrink-0 rounded-xl" onClick={() => set('StepNumber', String(Math.max(1, (Number(formData.StepNumber) || 1) - 1)))}><ChevronDown className="h-3.5 w-3.5" /></Button>
                          <Input type="number" min={1} value={formData.StepNumber} onChange={e => set('StepNumber', e.target.value)} className="text-center" />
                          <Button type="button" variant="outline" size="icon" className="h-10 w-9 shrink-0 rounded-xl" onClick={() => set('StepNumber', String((Number(formData.StepNumber) || 1) + 1))}><ChevronUp className="h-3.5 w-3.5" /></Button>
                        </div>
                      </Prop>
                      <Prop label="Display order">
                        <div className="flex items-center gap-1">
                          <Button type="button" variant="outline" size="icon" className="h-10 w-9 shrink-0 rounded-xl" onClick={() => set('FieldOrder', String(Math.max(0, (Number(formData.FieldOrder) || 0) - 1)))}><ChevronUp className="h-3.5 w-3.5" /></Button>
                          <Input type="number" value={formData.FieldOrder} onChange={e => set('FieldOrder', e.target.value)} className="text-center" />
                          <Button type="button" variant="outline" size="icon" className="h-10 w-9 shrink-0 rounded-xl" onClick={() => set('FieldOrder', String((Number(formData.FieldOrder) || 0) + 1))}><ChevronDown className="h-3.5 w-3.5" /></Button>
                        </div>
                      </Prop>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Prop label="Field group"><Input value={formData.FieldGroup} onChange={e => set('FieldGroup', e.target.value)} placeholder="Section name" /></Prop>
                      <Prop label="Icon name"><Input value={formData.IconName} onChange={e => set('IconName', e.target.value)} placeholder="e.g. phone, mail" /></Prop>
                    </div>

                    <SectionTitle>Behaviour</SectionTitle>
                    <div className="grid grid-cols-2 gap-2">
                      <ToggleCard label="Required" desc="Must be filled" checked={formData.IsRequired} onChange={v => set('IsRequired', v)} />
                      <ToggleCard label="Read only" desc="Not editable" checked={formData.IsReadOnly} onChange={v => set('IsReadOnly', v)} />
                      <ToggleCard label="Hidden" desc="Not displayed" checked={formData.IsHidden} onChange={v => set('IsHidden', v)} />
                      <ToggleCard label="Masked" desc="Hide characters" checked={formData.IsMasked} onChange={v => set('IsMasked', v)} />
                    </div>
                  </TabsContent>

                  {/* ── TYPE-SPECIFIC ── */}
                  <TabsContent value="type" className="mt-3 space-y-4">
                    <div className={cn('flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold', typeAccent(ft))}>
                      {(() => { const Icon = TYPE_ICONS[ft] || Type; return <Icon className="h-4 w-4" />; })()}
                      {typeLabel(ft)} settings
                    </div>

                    <Prop label="Keyboard type" hint="Which keyboard the phone opens.">
                      <Segmented value={formData.KeyboardType} options={KEYBOARD_TYPES} onChange={v => set('KeyboardType', v)} />
                    </Prop>

                    {showTextProps && (
                      <div className="grid grid-cols-2 gap-3">
                        <Prop label="Min length"><Input type="number" value={formData.MinLength} onChange={e => set('MinLength', e.target.value)} /></Prop>
                        <Prop label="Max length"><Input type="number" value={formData.MaxLength} onChange={e => set('MaxLength', e.target.value)} /></Prop>
                        <Prop label="Input mask" className="col-span-2" hint="# = digit. Example: +251 ## ### ####"><Input value={formData.InputMask} onChange={e => set('InputMask', e.target.value)} placeholder="e.g. +251 ## ### ####" className="font-mono" /></Prop>
                      </div>
                    )}
                    {ft === 'textarea' && (
                      <Prop label="Visible lines"><Input type="number" value={formData.TextAreaLines} onChange={e => set('TextAreaLines', e.target.value)} className="w-32" /></Prop>
                    )}
                    {(showNumberProps || showAmountProps) && (
                      <div className="grid grid-cols-3 gap-3">
                        <Prop label="Min value"><Input type="number" value={formData.MinValue} onChange={e => set('MinValue', e.target.value)} /></Prop>
                        <Prop label="Max value"><Input type="number" value={formData.MaxValue} onChange={e => set('MaxValue', e.target.value)} /></Prop>
                        <Prop label="Step"><Input type="number" value={formData.StepValue} onChange={e => set('StepValue', e.target.value)} /></Prop>
                      </div>
                    )}
                    {showAmountProps && (
                      <div className="grid grid-cols-3 gap-3">
                        <Prop label="Currency"><Input value={formData.CurrencyCode} onChange={e => set('CurrencyCode', e.target.value)} /></Prop>
                        <Prop label="Decimals"><Input type="number" value={formData.DecimalPlaces} onChange={e => set('DecimalPlaces', e.target.value)} /></Prop>
                        <Prop label="Prefix"><Input value={formData.Prefix} onChange={e => set('Prefix', e.target.value)} placeholder="ETB" /></Prop>
                      </div>
                    )}

                    {showOptionProps && (
                      <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/15 p-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold">Options</Label>
                          <button type="button" onClick={() => setRawOptions(r => !r)} className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                            <Braces className="h-3 w-3" /> {rawOptions || optionRows === null ? 'Visual editor' : 'Edit JSON'}
                          </button>
                        </div>
                        {rawOptions || optionRows === null ? (
                          <>
                            <Textarea rows={5} className="font-mono text-xs" value={formData.Options} onChange={e => set('Options', e.target.value)}
                              placeholder={'[\n  {"value": "opt1", "label": "Option 1"},\n  {"value": "opt2", "label": "Option 2"}\n]'} />
                            {optionRows === null && formData.Options.trim() && <p className="text-[11px] text-amber-600">Custom JSON format — edit as raw JSON.</p>}
                          </>
                        ) : (
                          <div className="space-y-1.5">
                            {optionRows.map((row, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <span className="w-4 text-center text-[10px] text-muted-foreground">{i + 1}</span>
                                <Input className="h-9 text-xs" placeholder="Label" value={row.label}
                                  onChange={e => { const r = [...optionRows]; const wasAuto = !r[i].value || r[i].value === r[i].label.toLowerCase().replace(/\s+/g, '_'); r[i] = { label: e.target.value, value: wasAuto ? e.target.value.toLowerCase().replace(/\s+/g, '_') : r[i].value }; updateOptionRows(r); }} />
                                <Input className="h-9 font-mono text-xs" placeholder="value" value={row.value}
                                  onChange={e => { const r = [...optionRows]; r[i] = { ...r[i], value: e.target.value }; updateOptionRows(r); }} />
                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-rose-500" onClick={() => updateOptionRows(optionRows.filter((_, j) => j !== i))}><X className="h-3.5 w-3.5" /></Button>
                              </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" className="w-full rounded-xl border-dashed text-xs"
                              onClick={() => updateOptionRows([...optionRows, { label: `Option ${optionRows.length + 1}`, value: `opt${optionRows.length + 1}` }])}>
                              <Plus className="mr-1 h-3.5 w-3.5" /> Add option
                            </Button>
                          </div>
                        )}
                        <Prop label="Layout"><Segmented value={formData.OptionsLayout} options={OPTIONS_LAYOUTS} onChange={v => set('OptionsLayout', v)} /></Prop>
                        <div className="grid grid-cols-3 gap-2">
                          <Prop label="Grid cols"><Input type="number" value={formData.GridColumns} onChange={e => set('GridColumns', e.target.value)} /></Prop>
                          {ft === 'checkbox_group' && (
                            <>
                              <Prop label="Min sel."><Input type="number" value={formData.MinSelections} onChange={e => set('MinSelections', e.target.value)} /></Prop>
                              <Prop label="Max sel."><Input type="number" value={formData.MaxSelections} onChange={e => set('MaxSelections', e.target.value)} /></Prop>
                            </>
                          )}
                        </div>
                        <SectionTitle>Or load options from an API</SectionTitle>
                        <Prop label="Options API endpoint"><Input value={formData.OptionsApiEndpoint} onChange={e => set('OptionsApiEndpoint', e.target.value)} placeholder="Remote endpoint for options" /></Prop>
                        <Prop label="Options JSON path"><Input value={formData.OptionsApiPath} onChange={e => set('OptionsApiPath', e.target.value)} placeholder="$.data.items" className="font-mono" /></Prop>
                      </div>
                    )}

                    {showDigitCount && (
                      <Prop label="Number of digits">
                        <Segmented value={formData.DigitCount || ''} options={['4', '5', '6', '8']} onChange={v => set('DigitCount', v)} />
                      </Prop>
                    )}
                    {showDateProps && (
                      <div className="grid grid-cols-2 gap-3">
                        <Prop label="Earliest date"><Input value={formData.MinDate} onChange={e => set('MinDate', e.target.value)} placeholder="YYYY-MM-DD or today" /></Prop>
                        <Prop label="Latest date"><Input value={formData.MaxDate} onChange={e => set('MaxDate', e.target.value)} /></Prop>
                        <Prop label="Date format" className="col-span-2"><Input value={formData.DateFormat} onChange={e => set('DateFormat', e.target.value)} placeholder="yyyy-MM-dd" className="font-mono" /></Prop>
                      </div>
                    )}
                    {showTimeProps && (
                      <Prop label="Time format"><Input value={formData.TimeFormat} onChange={e => set('TimeFormat', e.target.value)} placeholder="HH:mm" className="font-mono" /></Prop>
                    )}
                    {showFileProps && (
                      <div className="grid grid-cols-2 gap-3">
                        <Prop label="Allowed types"><Input value={formData.AllowedFileTypes} onChange={e => set('AllowedFileTypes', e.target.value)} placeholder="pdf,jpg,png" /></Prop>
                        <Prop label="Max size (bytes)"><Input type="number" value={formData.MaxFileSize} onChange={e => set('MaxFileSize', e.target.value)} /></Prop>
                      </div>
                    )}
                    {ft === 'image' && (
                      <div className="grid grid-cols-2 gap-2">
                        <ToggleCard label="Camera" desc="Allow taking photo" checked={formData.AllowCamera} onChange={v => set('AllowCamera', v)} />
                        <ToggleCard label="Gallery" desc="Allow picking photo" checked={formData.AllowGallery} onChange={v => set('AllowGallery', v)} />
                      </div>
                    )}
                    {showRatingProps && (
                      <div className="grid grid-cols-2 gap-3">
                        <Prop label="Max stars"><Input type="number" value={formData.MaxRating} onChange={e => set('MaxRating', e.target.value)} /></Prop>
                        <ToggleCard label="Half stars" checked={formData.AllowHalfRating} onChange={v => set('AllowHalfRating', v)} />
                      </div>
                    )}
                    {showToggleProps && (
                      <div className="grid grid-cols-2 gap-3">
                        <Prop label="On text"><Input value={formData.OnText} onChange={e => set('OnText', e.target.value)} placeholder="Yes / Enabled" /></Prop>
                        <Prop label="Off text"><Input value={formData.OffText} onChange={e => set('OffText', e.target.value)} placeholder="No / Disabled" /></Prop>
                      </div>
                    )}
                    <ToggleCard label="Auto format input" desc="Format value while the customer types" checked={formData.AutoFormat} onChange={v => set('AutoFormat', v)} />
                  </TabsContent>

                  {/* ── VALIDATION ── */}
                  <TabsContent value="rules" className="mt-3 space-y-4">
                    <Prop label="Quick patterns" hint="Click to fill a common validation rule.">
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { l: 'Digits only', p: '^[0-9]+$', m: 'Only numbers are allowed' },
                          { l: 'ET phone', p: '^(\\+251|0)?9[0-9]{8}$', m: 'Enter a valid Ethiopian phone number' },
                          { l: '10 digits', p: '^[0-9]{10}$', m: 'Must be exactly 10 digits' },
                          { l: 'Email', p: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', m: 'Enter a valid email address' },
                          { l: 'Letters', p: '^[A-Za-z\\s]+$', m: 'Only letters are allowed' },
                        ].map(q => (
                          <button key={q.l} type="button" onClick={() => setFormData(prev => ({ ...prev, ValidationPattern: q.p, ValidationMessage: prev.ValidationMessage || q.m }))}
                            className={cn('rounded-lg border px-2.5 py-1 text-[11px] font-medium transition', formData.ValidationPattern === q.p ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 bg-muted/30 text-muted-foreground hover:text-foreground')}>
                            {q.l}
                          </button>
                        ))}
                      </div>
                    </Prop>
                    <Prop label="Regex pattern"><Input className="font-mono" value={formData.ValidationPattern} onChange={e => set('ValidationPattern', e.target.value)} placeholder="^[0-9]{10}$" /></Prop>
                    <Prop label="Error message"><Input value={formData.ValidationMessage} onChange={e => set('ValidationMessage', e.target.value)} placeholder="Custom error message" /></Prop>
                    {formData.ValidationPattern && (() => {
                      let ok = true; try { new RegExp(formData.ValidationPattern); } catch { ok = false; }
                      return <p className={cn('text-[11px] font-medium', ok ? 'text-emerald-600' : 'text-rose-600')}>{ok ? '✓ Valid regular expression' : '✕ Invalid regular expression'}</p>;
                    })()}
                  </TabsContent>

                  {/* ── LOGIC ── */}
                  <TabsContent value="logic" className="mt-3 space-y-4">
                    <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/15 p-3">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-1.5 text-xs font-semibold"><Eye className="h-3.5 w-3.5" /> Show this field only when…</Label>
                        <button type="button" onClick={() => setRawVisibility(r => !r)} className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                          <Braces className="h-3 w-3" /> {rawVisibility || visibility === null ? 'Visual' : 'JSON'}
                        </button>
                      </div>
                      {rawVisibility || visibility === null ? (
                        <Textarea rows={3} className="font-mono text-xs" value={formData.VisibilityCondition} onChange={e => set('VisibilityCondition', e.target.value)} placeholder='{"field": "type", "operator": "==", "value": "business"}' />
                      ) : (
                        <div className="grid grid-cols-[1fr_70px_1fr] gap-1.5">
                          <Select value={visibility.field || '__none'} onValueChange={v => updateVisibility({ ...visibility, field: v === '__none' ? '' : v })}>
                            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Field" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none">Always show</SelectItem>
                              {otherFieldKeys.map(k => <SelectItem key={k} value={k}><span className="font-mono text-xs">{k}</span></SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Select value={visibility.operator} onValueChange={v => updateVisibility({ ...visibility, operator: v })} disabled={!visibility.field}>
                            <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>{['==', '!=', '>', '<'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                          </Select>
                          <Input className="h-9 text-xs" placeholder="value" value={visibility.value} disabled={!visibility.field} onChange={e => updateVisibility({ ...visibility, value: e.target.value })} />
                        </div>
                      )}
                    </div>
                    <Prop label="Required condition (JSON)" hint="Make the field required only under a condition.">
                      <Textarea rows={2} className="font-mono text-xs" value={formData.RequiredCondition} onChange={e => set('RequiredCondition', e.target.value)} />
                    </Prop>

                    <SectionTitle>Lookup</SectionTitle>
                    <ToggleCard label="Trigger lookup on change" desc="Call an API when the value changes (e.g. fetch customer name)" checked={formData.TriggerLookup} onChange={v => set('TriggerLookup', v)} />
                    {formData.TriggerLookup && (
                      <div className="space-y-3 rounded-2xl border border-blue-500/25 bg-blue-500/[0.04] p-3">
                        <Prop label="Lookup endpoint"><Input value={formData.LookupEndpoint} onChange={e => set('LookupEndpoint', e.target.value)} placeholder="/api/lookup/..." className="font-mono" /></Prop>
                        <Prop label="Field mapping (JSON)"><Input className="font-mono text-xs" value={formData.LookupFieldMapping} onChange={e => set('LookupFieldMapping', e.target.value)} placeholder='{"name": "$.data.name"}' /></Prop>
                        <div className="grid grid-cols-2 gap-3">
                          <Prop label="Debounce (ms)"><Input type="number" value={formData.LookupDebounceMs} onChange={e => set('LookupDebounceMs', e.target.value)} /></Prop>
                          <Prop label="Min input length"><Input type="number" value={formData.LookupMinLength} onChange={e => set('LookupMinLength', e.target.value)} /></Prop>
                        </div>
                      </div>
                    )}

                    <SectionTitle>Dependencies</SectionTitle>
                    <ToggleCard label="Clear dependent fields on change" desc="Reset other fields when this one changes" checked={formData.ClearDependentsOnChange} onChange={v => set('ClearDependentsOnChange', v)} />
                    {formData.ClearDependentsOnChange && (
                      <Prop label="Dependent fields" hint="Click to toggle, or type comma-separated keys.">
                        <div className="mb-1.5 flex flex-wrap gap-1">
                          {otherFieldKeys.map(k => {
                            const list = formData.DependentFields.split(',').map(s => s.trim()).filter(Boolean);
                            const on = list.includes(k);
                            return (
                              <button key={k} type="button"
                                onClick={() => set('DependentFields', (on ? list.filter(x => x !== k) : [...list, k]).join(', '))}
                                className={cn('rounded-md border px-2 py-0.5 font-mono text-[10.5px]', on ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-muted-foreground')}>
                                {k}
                              </button>
                            );
                          })}
                        </div>
                        <Input value={formData.DependentFields} onChange={e => set('DependentFields', e.target.value)} placeholder="customer_name, balance" />
                      </Prop>
                    )}
                  </TabsContent>

                  {/* ── ADVANCED ── */}
                  <TabsContent value="advanced" className="mt-3 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Prop label="Prefix"><Input value={formData.Prefix} onChange={e => set('Prefix', e.target.value)} placeholder="Prefix" /></Prop>
                      <Prop label="Suffix"><Input value={formData.Suffix} onChange={e => set('Suffix', e.target.value)} placeholder="Suffix" /></Prop>
                    </div>
                    <Prop label="CSS class"><Input value={formData.CssClass} onChange={e => set('CssClass', e.target.value)} className="font-mono" /></Prop>
                    <Prop label="Extra config (JSON)"><Textarea rows={4} className="font-mono text-xs" value={formData.ExtraConfig} onChange={e => set('ExtraConfig', e.target.value)} placeholder='{"customProp": "value"}' /></Prop>
                  </TabsContent>
                </div>
              </Tabs>

              {/* Sticky footer */}
              <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-muted/20 p-3">
                <Button variant="ghost" size="sm" onClick={closeInspector}>Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving} className="rounded-xl px-5">
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingField ? 'Update Field' : 'Create Field'}
                </Button>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
