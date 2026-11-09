'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Loader2,
  User,
  Phone,
  Mail,
  Fingerprint,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FileUpload, type UploadedFile } from '@/components/ui/FileUpload';
import { OnboardingWizardLayout } from '@/components/customers/OnboardingWizardLayout';

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

const deliveryChannelOptions = [
  { value: 'SMS', label: 'SMS Only' },
  { value: 'Email', label: 'Email Only' },
];

const overviewFormSchema = z
  .object({
    mainAuthMethod: z.string().min(1, 'Main authentication method is required.'),
    twoFactorAuthMethod: z.string(),
    channel: z.string().min(1, 'You need to select a channel.'),
    deliveryChannel: z.string().min(1, 'Delivery channel is required.'),
  })
  .refine(
    (data) =>
      data.twoFactorAuthMethod === 'None' ||
      data.mainAuthMethod !== data.twoFactorAuthMethod,
    {
      message: 'Main auth and 2FA method cannot be the same.',
      path: ['twoFactorAuthMethod'],
    }
  );

type OverviewFormValues = z.infer<typeof overviewFormSchema>;

function OverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);

  const customerString = searchParams.get('customer');
  const accountsString = searchParams.get('accounts');

  const { customer, accounts } = useMemo(() => {
    if (!customerString || !accountsString) {
      return { customer: null, accounts: [] };
    }
    try {
      return {
        customer: JSON.parse(customerString),
        accounts: JSON.parse(accountsString),
      };
    } catch (error) {
      console.error('Failed to parse search params:', error);
      return { customer: null, accounts: [] };
    }
  }, [customerString, accountsString]);

  const hasEmail = customer?.email_id && customer.email_id.trim() !== '';
  const hasPhone = customer?.mobile_number && customer.mobile_number.trim() !== '';

  const form = useForm<OverviewFormValues>({
    resolver: zodResolver(overviewFormSchema),
    defaultValues: {
      mainAuthMethod: 'SMSOTP',
      twoFactorAuthMethod: 'None',
      channel: 'Mobile App',
      deliveryChannel: 'SMS',
    },
  });

  useEffect(() => {
    if (customer) {
      form.reset({
        mainAuthMethod: 'SMSOTP',
        twoFactorAuthMethod: 'None',
        channel: 'Mobile App',
        deliveryChannel: 'SMS',
      });
    }
  }, [customer, form]);

  if (!customer || accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            Could not retrieve customer or account data. Please start over.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="link" onClick={() => router.push('/customers/create')}>
            Start Over
          </Button>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async (data: OverviewFormValues) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/customers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          accounts,
          onboardingData: {
            mainAuthMethod: data.mainAuthMethod,
            twoFactorAuthMethod: data.twoFactorAuthMethod,
            channel: data.channel,
            deliveryChannel: data.deliveryChannel,
            documents: attachments.map((doc) => ({
              name: doc.name,
              url: doc.url,
              type: doc.type,
              size: doc.size,
              category: doc.category || 'National ID',
            })),
          },
          documents: attachments.map((doc) => ({
            name: doc.name,
            url: doc.url,
            type: doc.type,
            size: doc.size,
            category: doc.category || 'National ID',
          })),
          attachmentUrl: attachments.length > 0 ? attachments[0].url : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      router.push('/customers/create/success');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description:
          error.message ||
          'An error occurred while submitting the request for approval.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OnboardingWizardLayout
      currentStep={4}
      maxReachableStep={4}
      onStepClick={(s) => {
        if (s < 4) router.back();
      }}
      title="Register Customer (Maker)"
      description="Step 4: Configure channels & MFA, attach categorized KYC documents, and submit for Checker approval."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-grow flex-col">
          <Card className="glass-card flex flex-grow flex-col">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Step 4: Review, KYC Documents &amp; Submit
              </CardTitle>
              <CardDescription>
                Review customer identity, linked accounts, security configuration, and attach supporting KYC records.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-6">
              <div>
                <h3 className="mb-2 text-base font-bold text-foreground">
                  Customer Identity &amp; Contact Summary
                </h3>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-xl border border-border bg-muted/30 p-4 md:grid-cols-2">
                  <InfoItem icon={<User />} label="Full Name" value={customer.full_name} />
                  <InfoItem
                    icon={<Fingerprint />}
                    label="CIF Number"
                    value={customer.customer_number}
                  />
                  <InfoItem icon={<Phone />} label="Phone" value={customer.mobile_number} />
                  <InfoItem
                    icon={<Mail />}
                    label="Email"
                    value={customer.email_id || 'Not provided'}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-base font-bold text-foreground">
                  Accounts to be Linked ({accounts.length})
                </h3>
                <div className="rounded-xl border border-border">
                  <ul className="divide-y divide-border">
                    {accounts.map((acc: any) => (
                      <li
                        key={acc.CUSTACNO}
                        className="flex items-center justify-between px-4 py-3 text-sm"
                      >
                        <div>
                          <p className="font-mono font-semibold text-foreground">
                            {acc.CUSTACNO}
                          </p>
                          <p className="text-xs text-muted-foreground">{acc.ACCLASSDESC}</p>
                        </div>
                        <Badge variant="outline">{acc.CCY}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 text-base font-bold text-foreground">
                  Channel &amp; Authentication Configuration
                </h3>
                <div className="grid grid-cols-1 gap-6 rounded-xl border border-border p-4 md:grid-cols-2">
                  <div className="space-y-5">
                    <FormField
                      control={form.control}
                      name="channel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Digital Banking Channel</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      name="deliveryChannel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temporary Password Delivery</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a delivery channel" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {deliveryChannelOptions
                                .filter((m) => hasEmail || m.value === 'SMS')
                                .map((option) => (
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
                  </div>

                  <div className="space-y-5">
                    <FormField
                      control={form.control}
                      name="mainAuthMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Authentication Method</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a main auth method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mainAuthMethods
                                .filter(
                                  (m) =>
                                    hasEmail ||
                                    (m.value !== 'EMAILOTP' && m.value !== 'GAUTH')
                                )
                                .map((method) => {
                                  const isSms = method.value === 'SMSOTP';
                                  const isDisabled = isSms && !hasPhone;
                                  return (
                                    <SelectItem
                                      key={method.value}
                                      value={method.value}
                                      disabled={isDisabled}
                                    >
                                      {method.label}
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="twoFactorAuthMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Two-Factor Authentication (2FA) Method</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
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
                                .map((method) => {
                                  const isSms = method.value === 'SMSOTP';
                                  const isDisabled = isSms && !hasPhone;
                                  return (
                                    <SelectItem
                                      key={method.value}
                                      value={method.value}
                                      disabled={isDisabled}
                                    >
                                      {method.label}
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 text-base font-bold text-foreground">
                  KYC &amp; Customer Authorization Attachments
                </h3>
                <FileUpload
                  label="Upload KYC & Authorization Records"
                  value={attachments}
                  onChange={setAttachments}
                  maxFiles={5}
                  maxSizeMB={5}
                  strictKycFormats={true}
                  enableCategory={true}
                  defaultCategory="National ID"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Accounts
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Submit for Checker Approval
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </OnboardingWizardLayout>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 h-5 w-5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <OverviewContent />
    </Suspense>
  );
}
