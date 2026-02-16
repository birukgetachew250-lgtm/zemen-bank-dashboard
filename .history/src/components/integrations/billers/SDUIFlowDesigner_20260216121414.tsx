'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, MoreHorizontal, ArrowRight, Edit, Trash2, Loader2 } from 'lucide-react';
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const STEP_TYPES = [
  { value: 'input', label: 'Input Form', color: 'bg-blue-100 text-blue-800' },
  { value: 'lookup', label: 'API Lookup', color: 'bg-purple-100 text-purple-800' },
  { value: 'validation', label: 'Validation', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirm', label: 'Confirmation', color: 'bg-orange-100 text-orange-800' },
  { value: 'payment', label: 'Payment', color: 'bg-green-100 text-green-800' },
  { value: 'otp', label: 'OTP Verification', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'pin', label: 'PIN Entry', color: 'bg-pink-100 text-pink-800' },
  { value: 'biometric', label: 'Biometric Auth', color: 'bg-teal-100 text-teal-800' },
  { value: 'success', label: 'Success Screen', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'error', label: 'Error Screen', color: 'bg-red-100 text-red-800' },
  { value: 'receipt', label: 'Receipt', color: 'bg-gray-100 text-gray-800' },
];

const AUTH_TYPES = ['pin', 'biometric', 'otp', 'password'];
const LAYOUTS = ['standard', 'compact', 'fullscreen', 'bottom_sheet', 'card'];
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH'];

const defaultFormData = {
  StepOrder: '1', StepType: 'input', Title: '', Subtitle: '',
  IconName: '', PrimaryButtonText: 'Continue', SecondaryButtonText: '',
  ApiEndpoint: '', ApiMethod: '', RequestTemplate: '', ResponseMapping: '',
  SuccessCondition: '', ErrorMessagePath: '',
  ShowLoading: true, LoadingMessage: '',
  RequiresAuth: false, AuthType: '',
  NextStepOnSuccess: '', NextStepOnError: '',
  CanGoBack: true, SkipCondition: '',
  Layout: 'standard', BackgroundColor: '', CustomComponent: '',
  ExtraConfig: '',
};

export function SDUIFlowDesigner({ providerId, initialSteps }: { providerId: string, initialSteps: any[] }) {
  const [steps, setSteps] = useState(initialSteps);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingStep, setEditingStep] = useState<any>(null);
  const [formData, setFormData] = useState({ ...defaultFormData });
  const { toast } = useToast();

  const getStepColor = (type: string) => STEP_TYPES.find(s => s.value === type)?.color || 'bg-gray-100 text-gray-800';

  const openAdd = () => {
    setEditingStep(null);
    setFormData({ ...defaultFormData, StepOrder: String(steps.length + 1) });
    setDialogOpen(true);
  };

  const openEdit = (step: any) => {
    setEditingStep(step);
    setFormData({
      StepOrder: step.StepOrder != null ? String(step.StepOrder) : '1',
      StepType: step.StepType || 'input',
      Title: step.Title || '',
      Subtitle: step.Subtitle || '',
      IconName: step.IconName || '',
      PrimaryButtonText: step.PrimaryButtonText || 'Continue',
      SecondaryButtonText: step.SecondaryButtonText || '',
      ApiEndpoint: step.ApiEndpoint || '',
      ApiMethod: step.ApiMethod || '',
      RequestTemplate: step.RequestTemplate || '',
      ResponseMapping: step.ResponseMapping || '',
      SuccessCondition: step.SuccessCondition || '',
      ErrorMessagePath: step.ErrorMessagePath || '',
      ShowLoading: step.ShowLoading === 1 || step.ShowLoading === true,
      LoadingMessage: step.LoadingMessage || '',
      RequiresAuth: step.RequiresAuth === 1 || step.RequiresAuth === true,
      AuthType: step.AuthType || '',
      NextStepOnSuccess: step.NextStepOnSuccess || '',
      NextStepOnError: step.NextStepOnError || '',
      CanGoBack: step.CanGoBack === 1 || step.CanGoBack === true,
      SkipCondition: step.SkipCondition || '',
      Layout: step.Layout || 'standard',
      BackgroundColor: step.BackgroundColor || '',
      CustomComponent: step.CustomComponent || '',
      ExtraConfig: step.ExtraConfig || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.Title) {
      toast({ variant: 'destructive', title: 'Error', description: 'Title is required.' });
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = { ...formData };
      if (editingStep) payload.StepId = editingStep.StepId;

      const res = await fetch(`/api/bill-management/providers/${providerId}/steps`, {
        method: editingStep ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text() || 'Failed to save step');
      toast({ title: 'Success', description: `Step ${editingStep ? 'updated' : 'created'}.` });
      setDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (stepId: string) => {
    try {
      const res = await fetch(`/api/bill-management/providers/${providerId}/steps`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: stepId }),
      });
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete');
      toast({ title: 'Deleted', description: 'Step removed.' });
      setSteps(prev => prev.filter(s => s.StepId !== stepId));
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Payment Journey</CardTitle>
            <CardDescription>Sequence of screens and actions for this provider. {steps.length} step(s) defined.</CardDescription>
          </div>
          <Button size="sm" onClick={openAdd}><PlusCircle className="mr-2 h-4 w-4" /> Add Step</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground">
              No steps defined. Click &quot;Add Step&quot; to begin building the flow.
            </div>
          ) : (
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent dark:before:via-slate-700">
              {steps.map((step) => (
                <div key={step.StepId} className="relative flex items-start justify-between p-4 bg-background border rounded-lg shadow-sm ml-10">
                  <div className="absolute -left-10 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold border-4 border-background z-10 text-xs">
                    {step.StepOrder}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn('uppercase text-[10px]', getStepColor(step.StepType))}>{step.StepType}</Badge>
                      <h4 className="font-bold">{step.Title}</h4>
                      {(step.RequiresAuth === 1 || step.RequiresAuth === true) && (
                        <Badge variant="outline" className="text-[10px]">Auth: {step.AuthType || 'required'}</Badge>
                      )}
                    </div>
                    {step.Subtitle && <p className="text-sm text-muted-foreground mb-2">{step.Subtitle}</p>}
                    <div className="flex flex-wrap gap-2">
                      {step.ApiEndpoint && (
                        <div className="flex items-center gap-1 text-xs font-mono bg-muted p-1 px-2 rounded">
                          <Badge variant="secondary" className="text-[9px]">{step.ApiMethod || 'POST'}</Badge>
                          <span className="truncate max-w-[300px]">{step.ApiEndpoint}</span>
                        </div>
                      )}
                      {step.NextStepOnSuccess && (
                        <div className="flex items-center text-xs text-green-600 bg-green-50 p-1 px-2 rounded border border-green-100">
                          Success <ArrowRight className="h-3 w-3 mx-1" /> Step {step.NextStepOnSuccess}
                        </div>
                      )}
                      {step.NextStepOnError && (
                        <div className="flex items-center text-xs text-red-600 bg-red-50 p-1 px-2 rounded border border-red-100">
                          Error <ArrowRight className="h-3 w-3 mx-1" /> Step {step.NextStepOnError}
                        </div>
                      )}
                      <Badge variant="outline" className="text-[10px]">{step.Layout || 'standard'}</Badge>
                      {step.PrimaryButtonText && <Badge variant="outline" className="text-[10px]">Btn: {step.PrimaryButtonText}</Badge>}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(step)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit Step
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-red-600" onSelect={e => e.preventDefault()}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Step
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Step?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Remove step &quot;{step.Title}&quot; (Order {step.StepOrder})? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(step.StepId)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingStep ? 'Edit' : 'Add'} Flow Step</DialogTitle>
            <DialogDescription>Define a step in the payment journey.</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[65vh] px-1 space-y-6">
            {/* Basic */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Step Order <span className="text-red-500">*</span></Label>
                  <Input type="number" value={formData.StepOrder} onChange={e => setFormData({ ...formData, StepOrder: e.target.value })} min={1} />
                </div>
                <div className="space-y-2">
                  <Label>Step Type</Label>
                  <Select value={formData.StepType} onValueChange={v => setFormData({ ...formData, StepType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STEP_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Layout</Label>
                  <Select value={formData.Layout} onValueChange={v => setFormData({ ...formData, Layout: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{LAYOUTS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title <span className="text-red-500">*</span></Label>
                  <Input value={formData.Title} onChange={e => setFormData({ ...formData, Title: e.target.value })} placeholder="Enter Details" />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input value={formData.Subtitle} onChange={e => setFormData({ ...formData, Subtitle: e.target.value })} placeholder="Fill in payment information" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Primary Button</Label>
                  <Input value={formData.PrimaryButtonText} onChange={e => setFormData({ ...formData, PrimaryButtonText: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Secondary Button</Label>
                  <Input value={formData.SecondaryButtonText} onChange={e => setFormData({ ...formData, SecondaryButtonText: e.target.value })} placeholder="Cancel" />
                </div>
                <div className="space-y-2">
                  <Label>Icon Name</Label>
                  <Input value={formData.IconName} onChange={e => setFormData({ ...formData, IconName: e.target.value })} placeholder="check_circle" />
                </div>
              </div>
            </div>

            {/* API Configuration */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">API Configuration</h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2 col-span-3">
                  <Label>API Endpoint</Label>
                  <Input value={formData.ApiEndpoint} onChange={e => setFormData({ ...formData, ApiEndpoint: e.target.value })} placeholder="https://api.provider.com/lookup" className="font-mono text-xs" />
                </div>
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select value={formData.ApiMethod || 'POST'} onValueChange={v => setFormData({ ...formData, ApiMethod: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{HTTP_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Request Template (JSON)</Label>
                  <Textarea rows={3} className="font-mono text-xs" value={formData.RequestTemplate} onChange={e => setFormData({ ...formData, RequestTemplate: e.target.value })}
                    placeholder={'{"phoneNumber": "{{phone_number}}"}'} />
                </div>
                <div className="space-y-2">
                  <Label>Response Mapping (JSON)</Label>
                  <Textarea rows={3} className="font-mono text-xs" value={formData.ResponseMapping} onChange={e => setFormData({ ...formData, ResponseMapping: e.target.value })}
                    placeholder={'{"customer_name": "$.data.name"}'} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Success Condition</Label>
                  <Input className="font-mono text-xs" value={formData.SuccessCondition} onChange={e => setFormData({ ...formData, SuccessCondition: e.target.value })} placeholder="$.status == 'success'" />
                </div>
                <div className="space-y-2">
                  <Label>Error Message Path</Label>
                  <Input className="font-mono text-xs" value={formData.ErrorMessagePath} onChange={e => setFormData({ ...formData, ErrorMessagePath: e.target.value })} placeholder="$.message" />
                </div>
              </div>
            </div>

            {/* Navigation & Auth */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Navigation & Auth</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Next Step on Success</Label><Input value={formData.NextStepOnSuccess} onChange={e => setFormData({ ...formData, NextStepOnSuccess: e.target.value })} placeholder="Step order number" /></div>
                <div className="space-y-2"><Label>Next Step on Error</Label><Input value={formData.NextStepOnError} onChange={e => setFormData({ ...formData, NextStepOnError: e.target.value })} placeholder="Step order number" /></div>
              </div>
              <div className="flex flex-wrap gap-6 py-2">
                <div className="flex items-center space-x-2">
                  <Switch checked={formData.CanGoBack} onCheckedChange={v => setFormData({ ...formData, CanGoBack: v })} />
                  <Label>Can Go Back</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={formData.ShowLoading} onCheckedChange={v => setFormData({ ...formData, ShowLoading: v })} />
                  <Label>Show Loading</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch checked={formData.RequiresAuth} onCheckedChange={v => setFormData({ ...formData, RequiresAuth: v })} />
                  <Label>Requires Authentication</Label>
                </div>
              </div>
              {formData.RequiresAuth && (
                <div className="space-y-2 w-48">
                  <Label>Auth Type</Label>
                  <Select value={formData.AuthType || 'pin'} onValueChange={v => setFormData({ ...formData, AuthType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{AUTH_TYPES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {formData.ShowLoading && (
                <div className="space-y-2"><Label>Loading Message</Label><Input value={formData.LoadingMessage} onChange={e => setFormData({ ...formData, LoadingMessage: e.target.value })} placeholder="Processing payment..." /></div>
              )}
              <div className="space-y-2"><Label>Skip Condition (JSON)</Label><Input className="font-mono text-xs" value={formData.SkipCondition} onChange={e => setFormData({ ...formData, SkipCondition: e.target.value })} placeholder='{"field": "amount", "condition": "filled"}' /></div>
            </div>

            {/* Appearance */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Appearance</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Background Color</Label><Input value={formData.BackgroundColor} onChange={e => setFormData({ ...formData, BackgroundColor: e.target.value })} placeholder="#FFFFFF" /></div>
                <div className="space-y-2"><Label>Custom Component</Label><Input value={formData.CustomComponent} onChange={e => setFormData({ ...formData, CustomComponent: e.target.value })} placeholder="CustomConfirmWidget" /></div>
              </div>
              <div className="space-y-2"><Label>Extra Config (JSON)</Label><Textarea rows={2} className="font-mono text-xs" value={formData.ExtraConfig} onChange={e => setFormData({ ...formData, ExtraConfig: e.target.value })} placeholder='{"animation": "slide"}' /></div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingStep ? 'Update Step' : 'Create Step'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
