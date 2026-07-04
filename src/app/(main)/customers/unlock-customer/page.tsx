
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { LockOpen, Search, Loader2, User, Phone, Mail, Building, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { FileUpload, type UploadedFile } from '@/components/ui/FileUpload';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  cif_number: z.string().min(1, 'CIF Number is required'),
  reason: z.string().min(10, 'Please provide a reason (min 10 characters)'),
});

type FormValues = z.infer<typeof schema>;

interface CustomerInfo {
  cif: string;
  full_name: string;
  mobile_number: string;
  email_id: string;
  branch: string;
  status: string;
}

export default function UnlockCustomerPage() {
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [searchError, setSearchError] = useState('');
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { cif_number: '', reason: '' },
  });

  const cifNumber = form.watch('cif_number');

  const handleSearch = async () => {
    if (!cifNumber.trim()) {
      setSearchError('Please enter a CIF Number');
      return;
    }
    setSearchError('');
    setSearching(true);
    setCustomer(null);
    try {
      // TODO: replace with real API call
      await new Promise(r => setTimeout(r, 800));
      // Mock result
      setCustomer({
        cif: '1007890',
        full_name: 'Yonas Girma',
        mobile_number: '+251 91 234 5678',
        email_id: 'yonas.girma@example.com',
        branch: 'Bole Branch (302)',
        status: 'Locked',
      });
    } catch {
      setSearchError('Customer not found for this CIF Number');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    if (!customer) {
      toast({ variant: 'destructive', title: 'No customer selected', description: 'Please search for a customer first.' });
      return;
    }
    if (documents.length === 0) {
      toast({ variant: 'destructive', title: 'Documents required', description: 'Please upload at least one supporting document.' });
      return;
    }

    setSubmitting(true);
    try {
      // TODO: call POST /api/customers/unlock-request
      // Body: { cif: customer.cif, account_number: values.account_number, reason: values.reason, documents }
      await new Promise(r => setTimeout(r, 1200));
      setSubmitted(true);
      toast({ title: 'Request submitted', description: `Unlock request for ${customer.full_name} has been submitted for approval.` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Submission failed', description: err?.message || 'Please try again' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6 text-center animate-fade-up">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <LockOpen className="h-10 w-10 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Request Submitted</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            The unlock request for <strong>{customer?.full_name}</strong> has been submitted and is awaiting checker approval.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => { setSubmitted(false); setCustomer(null); form.reset(); setDocuments([]); }}
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up max-w-3xl">
      <div className="relative overflow-hidden rounded-2xl p-6 mb-6" style={{ background: 'linear-gradient(135deg, hsl(200, 90%, 40%) 0%, hsl(200, 90%, 25%) 100%)' }}>
        <h1 className="text-3xl font-bold text-white relative z-10">Unlock Customer</h1>
        <p className="text-white/80 mt-2 relative z-10">
          Submit an unlock request for a locked customer account. Checker approval is required.
        </p>
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
      </div>

      <Card className="glass-card rounded-2xl border-slate-200/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Step 1: Find Customer by CIF Number</CardTitle>
          <CardDescription>Enter the CIF Number to locate the customer</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Account number search */}
              <div className="flex gap-3 items-end">
                <FormField
                  control={form.control}
                  name="cif_number"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>CIF Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter CIF Number"
                          {...field}
                          className="rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl gap-2 mb-[1px]"
                  onClick={handleSearch}
                  disabled={searching}
                >
                  {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Search
                </Button>
              </div>

              {searchError && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{searchError}</AlertDescription>
                </Alert>
              )}

              {/* Customer details */}
              {customer && (
                <div className="animate-fade-up space-y-4">
                  <Separator />
                  <h3 className="text-sm font-semibold text-foreground">Customer Details</h3>
                  <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/20 p-4">
                    <InfoRow icon={<User className="h-4 w-4" />} label="Full Name" value={customer.full_name} />
                    <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={customer.mobile_number} />
                    <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={customer.email_id} />
                    <InfoRow icon={<Building className="h-4 w-4" />} label="Branch" value={customer.branch} />
                    <InfoRow
                      label="CIF"
                      value={customer.cif}
                      icon={<span className="h-4 w-4 text-xs font-bold text-muted-foreground">#</span>}
                    />
                    <InfoRow
                      label="Account Status"
                      value={customer.status}
                      valueClassName="text-red-600 font-semibold"
                      icon={<span className="h-4 w-4 text-xs">🔒</span>}
                    />
                  </div>

                  <Separator />
                  <h3 className="text-sm font-semibold text-foreground">Step 2: Reason for Unlock</h3>
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide a clear reason for this unlock request..."
                            className="rounded-xl min-h-24 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />
                  <h3 className="text-sm font-semibold text-foreground">Step 3: Upload Supporting Documents</h3>
                  <FileUpload
                    value={documents}
                    onChange={setDocuments}
                    required
                    label="Supporting Documents"
                    maxFiles={5}
                    maxSizeMB={10}
                  />

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      className="rounded-xl gap-2 px-6"
                      disabled={submitting}
                    >
                      {submitting
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                        : <><LockOpen className="h-4 w-4" /> Submit Unlock Request</>
                      }
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      {icon && <div className="mt-0.5 text-muted-foreground flex-shrink-0">{icon}</div>}
      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className={`text-sm font-semibold mt-0.5 ${valueClassName || ''}`}>{value}</p>
      </div>
    </div>
  );
}
