'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MakerMiniHistory } from '@/components/customers/MakerMiniHistory';
import {
  OnboardingWizardLayout,
  type WizardStepNumber,
} from '@/components/customers/OnboardingWizardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  User,
  Fingerprint,
  Building2,
  Globe2,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUpload, type UploadedFile } from '@/components/ui/FileUpload';

const mainAuthMethods = [
  { value: 'SMSOTP', label: 'SMS OTP' },
  { value: 'EMAILOTP', label: 'Email OTP' },
];

const twoFactorMethods = [
  { value: 'SMSOTP', label: 'SMS OTP' },
  { value: 'GAUTH', label: 'Google Authenticator' },
  { value: 'SQ', label: 'Security Question' },
  { value: 'EMAILOTP', label: 'Email OTP' },
  { value: 'None', label: 'None' },
];

const channelOptions = [
  { value: 'Mobile App', label: 'Mobile App' },
  { value: 'USSD', label: 'USSD' },
  { value: 'Both', label: 'Both' },
];

const editProfileSchema = z
  .object({
    email: z.string().email().or(z.literal('')).optional().nullable(),
    phoneNumber: z.string().min(1, 'Phone number is required.'),
    signUpMainAuth: z.string().min(1, 'Primary authentication method is required.'),
    signUp2FA: z.string(),
    channel: z.string().min(1, 'Channel is required.'),
  })
  .refine((data) => data.signUp2FA === 'None' || data.signUpMainAuth !== data.signUp2FA, {
    message: 'Main auth and 2FA method cannot be the same.',
    path: ['signUp2FA'],
  })
  .refine(
    (data) => {
      const hasEmail = data.email && data.email.trim() !== '';
      const needsEmail =
        ['EMAILOTP', 'GAUTH'].includes(data.signUpMainAuth) ||
        ['EMAILOTP', 'GAUTH'].includes(data.signUp2FA);
      return !needsEmail || hasEmail;
    },
    {
      message: 'An email address is required for Email OTP or Google Authenticator.',
      path: ['email'],
    }
  );

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export default function EditCustomerPage({ params }: { params: { customerId: string } }) {
  const customerId = params.customerId;
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);
  const [wizardStep, setWizardStep] = useState<WizardStepNumber>(1);

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
  });

  const emailValue = form.watch('email');
  const hasEmail = !!emailValue && emailValue.trim() !== '';
  const phoneValue = form.watch('phoneNumber');
  const hasPhone = !!phoneValue && phoneValue.trim() !== '';

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const customerRes = await fetch(`/api/customers/${customerId}`);
        if (!customerRes.ok) throw new Error('Customer not found');
        const customerData = await customerRes.json();
        setCustomer(customerData);
        form.reset({
          email: customerData.email || '',
          phoneNumber: customerData.phoneNumber || '',
          signUpMainAuth: customerData.signUpMainAuth || 'SMSOTP',
          signUp2FA: customerData.signUp2FA || 'None',
          channel: customerData.channel || 'Both',
        });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      } finally {
        setLoading(false);
      }
    }
    if (customerId) {
      fetchData();
    }
  }, [customerId, toast, form]);

  const onEditSubmit = async (values: EditProfileFormValues) => {
    if (!customer) return;

    setIsSubmitting(true);
    const changes = {
      email: { old: customer.email, new: values.email },
      phoneNumber: { old: customer.phoneNumber, new: values.phoneNumber },
      signUpMainAuth: { old: customer.signUpMainAuth, new: values.signUpMainAuth },
      signUp2FA: { old: customer.signUp2FA, new: values.signUp2FA },
      channel: { old: customer.channel, new: values.channel },
    };

    try {
      const response = await fetch('/api/approvals/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cif: customer.cifNumber,
          type: 'updated-customer',
          customerName: customer.name,
          customerPhone: customer.phoneNumber,
          details: {
            changes,
            documents: documents.map((d) => ({
              name: d.name,
              url: d.url,
              type: d.type,
              size: d.size,
              category: d.category || 'Customer Application Form',
            })),
          },
          attachmentUrl: documents.length > 0 ? documents[0].url : undefined,
        }),
      });
      if (!response.ok) {
        throw new Error(
          (await response.json()).message || 'Failed to submit update for approval.'
        );
      }
      toast({
        title: 'Update Request Submitted',
        description: 'The requested changes have been sent for Checker approval.',
      });
      router.push(`/customers/${customerId}`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return <div className="p-8 text-center">Customer not found.</div>;
  }

  return (
    <OnboardingWizardLayout
      currentStep={wizardStep}
      maxReachableStep={4}
      onStepClick={(s) => setWizardStep(s)}
      title={`Update Customer Profile — ${customer.name}`}
      description={`Modify contact, channel, and authentication settings for CIF ${customer.cifNumber}.`}
      headerExtra={
        <Button variant="outline" size="sm" onClick={() => router.back()} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Button>
      }
    >
      <MakerMiniHistory approvalType="updated-customer" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-6">
          {wizardStep === 1 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Step 1: Identity &amp; Demographics</CardTitle>
                <CardDescription>
                  Review core banking demographic attributes synced from FlexCube.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
                  <User className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="text-sm font-semibold text-foreground">{customer.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
                  <Fingerprint className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">CIF Number</p>
                    <p className="font-mono text-sm font-semibold text-foreground">
                      {customer.cifNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
                  <Building2 className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Registered Branch</p>
                    <p className="text-sm font-semibold text-foreground">
                      {customer.branchName || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
                  <Globe2 className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nationality</p>
                    <p className="text-sm font-semibold text-foreground">
                      {customer.nationality || 'Ethiopian'}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-border pt-4">
                <Button type="button" onClick={() => setWizardStep(2)} className="gap-2">
                  Next: Contact &amp; Address
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {wizardStep === 2 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Step 2: Contact &amp; Address</CardTitle>
                <CardDescription>
                  Update customer mobile phone number and email address.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Phone Number <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address (Optional)</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Registered Address</p>
                    <p className="text-sm font-semibold text-foreground">
                      {customer.address || '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setWizardStep(1)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button type="button" onClick={() => setWizardStep(3)} className="gap-2">
                  Next: Accounts &amp; Channels
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {wizardStep === 3 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Step 3: Accounts &amp; Channels</CardTitle>
                <CardDescription>
                  Configure digital banking channels and primary / secondary authentication methods.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Channel Access</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a channel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {channelOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="signUpMainAuth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Authentication Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mainAuthMethods
                            .filter(
                              (m) =>
                                hasEmail ||
                                (m.value !== 'EMAILOTP' && m.value !== 'GAUTH')
                            )
                            .map((method) => (
                              <SelectItem
                                key={method.value}
                                value={method.value}
                                disabled={method.value === 'SMSOTP' && !hasPhone}
                              >
                                {method.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="signUp2FA"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Two-Factor Authentication (2FA)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a 2FA method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {twoFactorMethods
                            .filter(
                              (m) =>
                                hasEmail ||
                                (m.value !== 'EMAILOTP' && m.value !== 'GAUTH')
                            )
                            .map((method) => (
                              <SelectItem
                                key={method.value}
                                value={method.value}
                                disabled={method.value === 'SMSOTP' && !hasPhone}
                              >
                                {method.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setWizardStep(2)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button type="button" onClick={() => setWizardStep(4)} className="gap-2">
                  Next: Review &amp; Submit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}

          {wizardStep === 4 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Step 4: Review &amp; Submit</CardTitle>
                <CardDescription>
                  Verify your modifications, attach customer authorization documents, and submit for Checker approval.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Phone Number</p>
                    <p className="text-sm font-semibold text-foreground">
                      {form.watch('phoneNumber')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email Address</p>
                    <p className="text-sm font-semibold text-foreground">
                      {form.watch('email') || 'None'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Channel</p>
                    <Badge variant="outline">{form.watch('channel')}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Auth / 2FA</p>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary">{form.watch('signUpMainAuth')}</Badge>
                      <Badge variant="outline">{form.watch('signUp2FA')}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <FileUpload
                  label="Supporting KYC / Modification Request Documents"
                  value={documents}
                  onChange={setDocuments}
                  maxFiles={5}
                  maxSizeMB={5}
                  strictKycFormats={true}
                  enableCategory={true}
                  defaultCategory="Customer Application Form"
                />
              </CardContent>
              <CardFooter className="flex justify-between border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setWizardStep(3)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Submit Update for Approval
                </Button>
              </CardFooter>
            </Card>
          )}
        </form>
      </Form>
    </OnboardingWizardLayout>
  );
}
