'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Edit, Trash2, Loader2, Play } from 'lucide-react';
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
import { cn } from '@/lib/utils';

const API_TYPES = ['lookup', 'validate', 'calculate_fee', 'payment', 'status', 'refund', 'receipt'];
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const CONTENT_TYPES = ['application/json', 'application/x-www-form-urlencoded', 'multipart/form-data', 'text/xml'];

const defaultFormData = {
  ApiType: 'lookup', DisplayName: '', Endpoint: '', HttpMethod: 'POST',
  ContentType: 'application/json', RequestHeaders: '', RequestBodyTemplate: '',
  QueryParameters: '', ResponseMapping: '', SuccessStatusPath: '',
  SuccessStatusValues: '', ErrorMessagePath: '', DefaultErrorMessage: '',
  TimeoutSeconds: '30', RetryCount: '0', RetryDelayMs: '1000',
  CacheResponse: false, CacheDurationSeconds: '0',
  UseProxy: false, ProxyConfigId: '',
  EnableLogging: true, MaskSensitiveData: false, SensitiveFields: '',
  PreRequestValidation: '', PostResponseTransform: '',
  MockResponse: '', MockEnabled: false,
  ExecutionOrder: '0',
};

export function SDUIApiConfig({ providerId, initialConfigs }: { providerId: string, initialConfigs: any[] }) {
  const [configs, setConfigs] = useState(initialConfigs);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [formData, setFormData] = useState({ ...defaultFormData });
  const { toast } = useToast();

  const openAdd = () => {
    setEditingConfig(null);
    setFormData({ ...defaultFormData, ExecutionOrder: String(configs.length) });
    setDialogOpen(true);
  };

  const openEdit = (config: any) => {
    setEditingConfig(config);
    setFormData({
      ApiType: config.ApiType || 'lookup',
      DisplayName: config.DisplayName || '',
      Endpoint: config.Endpoint || '',
      HttpMethod: config.HttpMethod || 'POST',
      ContentType: config.ContentType || 'application/json',
      RequestHeaders: config.RequestHeaders || '',
      RequestBodyTemplate: config.RequestBodyTemplate || '',
      QueryParameters: config.QueryParameters || '',
      ResponseMapping: config.ResponseMapping || '',
      SuccessStatusPath: config.SuccessStatusPath || '',
      SuccessStatusValues: config.SuccessStatusValues || '',
      ErrorMessagePath: config.ErrorMessagePath || '',
      DefaultErrorMessage: config.DefaultErrorMessage || '',
      TimeoutSeconds: config.TimeoutSeconds != null ? String(config.TimeoutSeconds) : '30',
      RetryCount: config.RetryCount != null ? String(config.RetryCount) : '0',
      RetryDelayMs: config.RetryDelayMs != null ? String(config.RetryDelayMs) : '1000',
      CacheResponse: config.CacheResponse === 1 || config.CacheResponse === true,
      CacheDurationSeconds: config.CacheDurationSeconds != null ? String(config.CacheDurationSeconds) : '0',
      UseProxy: config.UseProxy === 1 || config.UseProxy === true,
      ProxyConfigId: config.ProxyConfigId || '',
      EnableLogging: config.EnableLogging === 1 || config.EnableLogging === true,
      MaskSensitiveData: config.MaskSensitiveData === 1 || config.MaskSensitiveData === true,
      SensitiveFields: config.SensitiveFields || '',
      PreRequestValidation: config.PreRequestValidation || '',
      PostResponseTransform: config.PostResponseTransform || '',
      MockResponse: config.MockResponse || '',
      MockEnabled: config.MockEnabled === 1 || config.MockEnabled === true,
      ExecutionOrder: config.ExecutionOrder != null ? String(config.ExecutionOrder) : '0',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.Endpoint) {
      toast({ variant: 'destructive', title: 'Error', description: 'Endpoint is required.' });
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = { ...formData };
      if (editingConfig) payload.ConfigId = editingConfig.ConfigId;

      const res = await fetch(`/api/bill-management/providers/${providerId}/api-config`, {
        method: editingConfig ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text() || 'Failed to save API config');
      const result = await res.json();
      toast({ title: 'Success', description: `API config ${editingConfig ? 'updated' : 'created'}.` });
      setDialogOpen(false);
      // Refetch configs from API instead of full page reload
      const refreshed = await fetch(`/api/bill-management/providers/${providerId}/api-config`);
      if (refreshed.ok) setConfigs(await refreshed.json());
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (configId: string) => {
    try {
      const res = await fetch(`/api/bill-management/providers/${providerId}/api-config`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: configId }),
      });
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete');
      toast({ title: 'Deleted', description: 'API config removed.' });
      setConfigs(prev => prev.filter(c => c.ConfigId !== configId));
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const getMethodColor = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>API Integrations</CardTitle>
            <CardDescription>Backend endpoints for lookup, validation, and payment execution. {configs.length} config(s).</CardDescription>
          </div>
          <Button size="sm" onClick={openAdd}><PlusCircle className="mr-2 h-4 w-4" /> Add API</Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Type / Name</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Timeout</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No API configurations found.</TableCell></TableRow>
                ) : configs.map((api) => (
                  <TableRow key={api.ConfigId}>
                    <TableCell className="text-muted-foreground text-xs">{api.ExecutionOrder}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Badge variant="outline" className="capitalize w-fit mb-0.5">{api.ApiType}</Badge>
                        {api.DisplayName && <span className="text-xs text-muted-foreground">{api.DisplayName}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs max-w-[300px] truncate">{api.Endpoint}</TableCell>
                    <TableCell><Badge className={cn('text-[10px]', getMethodColor(api.HttpMethod))}>{api.HttpMethod}</Badge></TableCell>
                    <TableCell className="text-sm">{api.TimeoutSeconds}s</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(api.CacheResponse === 1 || api.CacheResponse === true) && <Badge variant="outline" className="text-[10px]">Cached</Badge>}
                        {(api.MockEnabled === 1 || api.MockEnabled === true) && <Badge className="bg-yellow-50 text-yellow-800 text-[10px]">Mock</Badge>}
                        {(api.EnableLogging === 1 || api.EnableLogging === true) && <Badge variant="outline" className="text-[10px]">Log</Badge>}
                        <Badge className={cn(api.Status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800', 'text-[10px]')}>
                          {api.Status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(api)} title="Edit"><Edit className="h-4 w-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" title="Delete"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete API Config?</AlertDialogTitle>
                              <AlertDialogDescription>Remove &quot;{api.DisplayName || api.ApiType}&quot; configuration?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(api.ConfigId)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
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
            <DialogTitle>{editingConfig ? 'Edit' : 'Add'} API Configuration</DialogTitle>
            <DialogDescription>Configure how the mobile app communicates with backend services.</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[65vh] px-1 space-y-1">
            <Accordion type="multiple" defaultValue={['basic', 'request']} className="w-full">
              <AccordionItem value="basic">
                <AccordionTrigger className="text-sm font-semibold">Basic Settings</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 py-2">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>API Type</Label>
                        <Select value={formData.ApiType} onValueChange={v => setFormData({ ...formData, ApiType: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{API_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Display Name</Label>
                        <Input value={formData.DisplayName} onChange={e => setFormData({ ...formData, DisplayName: e.target.value })} placeholder="Account Lookup" />
                      </div>
                      <div className="space-y-2">
                        <Label>Execution Order</Label>
                        <Input type="number" value={formData.ExecutionOrder} onChange={e => setFormData({ ...formData, ExecutionOrder: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label>Endpoint <span className="text-red-500">*</span></Label>
                        <Input value={formData.Endpoint} onChange={e => setFormData({ ...formData, Endpoint: e.target.value })} placeholder="https://api.provider.com/lookup" className="font-mono text-xs" />
                      </div>
                      <div className="space-y-2">
                        <Label>HTTP Method</Label>
                        <Select value={formData.HttpMethod} onValueChange={v => setFormData({ ...formData, HttpMethod: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{HTTP_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Content Type</Label>
                        <Select value={formData.ContentType} onValueChange={v => setFormData({ ...formData, ContentType: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{CONTENT_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2"><Label>Timeout (sec)</Label><Input type="number" value={formData.TimeoutSeconds} onChange={e => setFormData({ ...formData, TimeoutSeconds: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Retry Count</Label><Input type="number" value={formData.RetryCount} onChange={e => setFormData({ ...formData, RetryCount: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Retry Delay (ms)</Label><Input type="number" value={formData.RetryDelayMs} onChange={e => setFormData({ ...formData, RetryDelayMs: e.target.value })} /></div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="request">
                <AccordionTrigger className="text-sm font-semibold">Request & Response</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 py-2">
                    <div className="space-y-2">
                      <Label>Request Headers (JSON)</Label>
                      <Textarea rows={2} className="font-mono text-xs" value={formData.RequestHeaders} onChange={e => setFormData({ ...formData, RequestHeaders: e.target.value })}
                        placeholder={'{"Authorization": "Bearer {{token}}"}'} />
                    </div>
                    <div className="space-y-2">
                      <Label>Request Body Template (JSON with placeholders)</Label>
                      <Textarea rows={4} className="font-mono text-xs" value={formData.RequestBodyTemplate} onChange={e => setFormData({ ...formData, RequestBodyTemplate: e.target.value })}
                        placeholder={'{"phoneNumber": "{{phone_number}}", "amount": "{{amount}}"}'} />
                    </div>
                    <div className="space-y-2">
                      <Label>Query Parameters</Label>
                      <Input className="font-mono text-xs" value={formData.QueryParameters} onChange={e => setFormData({ ...formData, QueryParameters: e.target.value })} placeholder="key1={{value1}}&key2={{value2}}" />
                    </div>
                    <div className="space-y-2">
                      <Label>Response Mapping (JSON Paths)</Label>
                      <Textarea rows={3} className="font-mono text-xs" value={formData.ResponseMapping} onChange={e => setFormData({ ...formData, ResponseMapping: e.target.value })}
                        placeholder={'{"customer_name": "$.data.customerName", "balance": "$.data.balance"}'} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Success Status Path</Label><Input className="font-mono text-xs" value={formData.SuccessStatusPath} onChange={e => setFormData({ ...formData, SuccessStatusPath: e.target.value })} placeholder="$.status" /></div>
                      <div className="space-y-2"><Label>Success Status Values</Label><Input value={formData.SuccessStatusValues} onChange={e => setFormData({ ...formData, SuccessStatusValues: e.target.value })} placeholder="success, 200, OK" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Error Message Path</Label><Input className="font-mono text-xs" value={formData.ErrorMessagePath} onChange={e => setFormData({ ...formData, ErrorMessagePath: e.target.value })} placeholder="$.message" /></div>
                      <div className="space-y-2"><Label>Default Error Message</Label><Input value={formData.DefaultErrorMessage} onChange={e => setFormData({ ...formData, DefaultErrorMessage: e.target.value })} placeholder="An error occurred" /></div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="advanced">
                <AccordionTrigger className="text-sm font-semibold">Advanced / Security</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 py-2">
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center space-x-2"><Switch checked={formData.CacheResponse} onCheckedChange={v => setFormData({ ...formData, CacheResponse: v })} /><Label>Cache Response</Label></div>
                      <div className="flex items-center space-x-2"><Switch checked={formData.UseProxy} onCheckedChange={v => setFormData({ ...formData, UseProxy: v })} /><Label>Use Proxy</Label></div>
                      <div className="flex items-center space-x-2"><Switch checked={formData.EnableLogging} onCheckedChange={v => setFormData({ ...formData, EnableLogging: v })} /><Label>Enable Logging</Label></div>
                      <div className="flex items-center space-x-2"><Switch checked={formData.MaskSensitiveData} onCheckedChange={v => setFormData({ ...formData, MaskSensitiveData: v })} /><Label>Mask Sensitive Data</Label></div>
                      <div className="flex items-center space-x-2"><Switch checked={formData.MockEnabled} onCheckedChange={v => setFormData({ ...formData, MockEnabled: v })} /><Label>Enable Mock</Label></div>
                    </div>
                    {formData.CacheResponse && (
                      <div className="space-y-2 w-48"><Label>Cache Duration (sec)</Label><Input type="number" value={formData.CacheDurationSeconds} onChange={e => setFormData({ ...formData, CacheDurationSeconds: e.target.value })} /></div>
                    )}
                    {formData.UseProxy && (
                      <div className="space-y-2"><Label>Proxy Config ID</Label><Input value={formData.ProxyConfigId} onChange={e => setFormData({ ...formData, ProxyConfigId: e.target.value })} /></div>
                    )}
                    {formData.MaskSensitiveData && (
                      <div className="space-y-2"><Label>Sensitive Fields (comma-separated)</Label><Input value={formData.SensitiveFields} onChange={e => setFormData({ ...formData, SensitiveFields: e.target.value })} placeholder="pin, password, cardNumber" /></div>
                    )}
                    {formData.MockEnabled && (
                      <div className="space-y-2"><Label>Mock Response (JSON)</Label><Textarea rows={4} className="font-mono text-xs" value={formData.MockResponse} onChange={e => setFormData({ ...formData, MockResponse: e.target.value })} placeholder='{"status": "success", "data": {...}}' /></div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label>Pre-Request Validation</Label><Textarea rows={2} className="font-mono text-xs" value={formData.PreRequestValidation} onChange={e => setFormData({ ...formData, PreRequestValidation: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Post-Response Transform</Label><Textarea rows={2} className="font-mono text-xs" value={formData.PostResponseTransform} onChange={e => setFormData({ ...formData, PostResponseTransform: e.target.value })} /></div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingConfig ? 'Update Config' : 'Create Config'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
