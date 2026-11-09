'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MakerMiniHistory } from '@/components/customers/MakerMiniHistory';
import {
  OnboardingWizardLayout,
  type WizardStepNumber,
} from '@/components/customers/OnboardingWizardLayout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Loader2,
  User,
  Building,
  Phone,
  Mail,
  Fingerprint,
  MapPin,
  Globe,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  Lock,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const cifSchema = z.object({
  branch_code: z.string().min(1, 'Branch code is required'),
  customer_id: z.string().min(1, 'Customer ID/CIF is required'),
});

const customerDetailsSchema = z.object({
  full_name: z.string(),
  cif_creation_date: z.string(),
  customer_number: z.string(),
  date_of_birth: z.string(),
  gender: z.string(),
  email_id: z.string().email(),
  mobile_number: z.string(),
  address_line_1: z.string(),
  address_line_2: z.string().optional(),
  address_line_3: z.string().optional(),
  address_line_4: z.string().optional(),
  country: z.string(),
  branch: z.string(),
});

type CustomerDetails = z.infer<typeof customerDetailsSchema>;

export default function CreateCustomerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [phoneConflictError, setPhoneConflictError] = useState<string | null>(null);
  const [phoneVerifiedUnique, setPhoneVerifiedUnique] = useState(false);
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [wizardStep, setWizardStep] = useState<WizardStepNumber>(1);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof cifSchema>>({
    resolver: zodResolver(cifSchema),
    defaultValues: {
      branch_code: '',
      customer_id: '',
    },
  });

  const verifyPhoneUniqueness = async (
    phoneNumber: string,
    cif: string
  ): Promise<boolean> => {
    setIsCheckingPhone(true);
    setPhoneConflictError(null);
    setPhoneVerifiedUnique(false);
    try {
      const res = await fetch('/api/customers/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, cif }),
      });
      const data = await res.json();
      if (data.exists) {
        setPhoneConflictError(
          data.message || 'This phone number or CIF is already registered.'
        );
        toast({
          variant: 'destructive',
          title: 'Duplicate Phone / CIF Detected',
          description: data.message,
        });
        return false;
      }
      setPhoneVerifiedUnique(true);
      return true;
    } catch {
      return true;
    } finally {
      setIsCheckingPhone(false);
    }
  };

  async function onCifSubmit(values: z.infer<typeof cifSchema>) {
    setIsLoading(true);
    setCustomer(null);
    setPhoneConflictError(null);
    setPhoneVerifiedUnique(false);
    try {
      const response = await fetch('/api/online-linking/find-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        result = await response.json();
      } else {
        const rawText = await response.text();
        throw new Error(
          `Server returned non-JSON response (${response.status}): ${rawText.slice(0, 100)}`
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message || `Failed to fetch customer details (${response.status})`
        );
      }

      if (result) {
        setCustomer(result);
        toast({
          title: 'Customer Found',
          description: `Displaying identity details for ${result.full_name}.`,
        });

        if (result.mobile_number) {
          await verifyPhoneUniqueness(result.mobile_number, result.customer_number);
        }
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Could Not Fetch Customer',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleProceedToAccounts = async () => {
    if (!customer) return;
    if (!customer.mobile_number || customer.mobile_number.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Phone Number Required',
        description:
          'This customer does not have a phone number configured in FlexCube Core Banking.',
      });
      return;
    }

    const isUnique = await verifyPhoneUniqueness(
      customer.mobile_number,
      customer.customer_number
    );
    if (!isUnique) return;

    const params = new URLSearchParams({
      customer: JSON.stringify(customer),
    });
    router.push(`/customers/create/select-accounts?${params.toString()}`);
  };

  return (
    <OnboardingWizardLayout
      currentStep={wizardStep}
      maxReachableStep={customer && !phoneConflictError ? 2 : 1}
      onStepClick={(s) => {
        if (s === 1) setWizardStep(1);
        if (s === 2 && customer && !phoneConflictError) setWizardStep(2);
      }}
      title="Register Customer (Maker)"
      description="Onboard a core banking customer to Zemen SuperApp & USSD banking."
    >
      <MakerMiniHistory approvalType="new-customer" />

      {wizardStep === 1 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Step 1: Identity &amp; Demographics
            </CardTitle>
            <CardDescription>
              Enter the Branch Code and Customer CIF number to retrieve core banking identity records from FlexCube.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onCifSubmit)}
                className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end"
              >
                <FormField
                  control={form.control}
                  name="branch_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 103" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer ID (CIF)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 0048533" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="h-11 font-semibold" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Fetch Core Identity
                </Button>
              </form>
            </Form>

            {customer && (
              <div className="animate-in fade-in-50 space-y-6">
                <Separator />

                {phoneConflictError && (
                  <Alert variant="destructive" className="rounded-xl">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Registration Blocked — Duplicate Phone or CIF</AlertTitle>
                    <AlertDescription>{phoneConflictError}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Verified Core Banking Identity
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Confirm demographic attributes below before continuing to Contact &amp; Address verification.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-xl border border-border/80 bg-muted/20 p-5 sm:grid-cols-2">
                  <InfoItem
                    icon={<User className="h-4 w-4" />}
                    label="Full Legal Name"
                    value={customer.full_name}
                  />
                  <InfoItem
                    icon={<Fingerprint className="h-4 w-4" />}
                    label="CIF Number"
                    value={customer.customer_number}
                  />
                  <InfoItem
                    icon={<Phone className="h-4 w-4" />}
                    label="Core Banking Phone (Read-Only)"
                    value={customer.mobile_number || 'Not Set'}
                  />
                  <InfoItem
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="Date of Birth"
                    value={
                      customer.date_of_birth
                        ? new Date(customer.date_of_birth).toLocaleDateString()
                        : 'N/A'
                    }
                  />
                  <InfoItem
                    icon={<Building className="h-4 w-4" />}
                    label="Home Branch"
                    value={customer.branch}
                  />
                  <InfoItem
                    icon={<Globe className="h-4 w-4" />}
                    label="Nationality / Country"
                    value={customer.country || 'Ethiopia'}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setWizardStep(2)}
                    disabled={Boolean(phoneConflictError) || isCheckingPhone}
                    className="gap-2"
                  >
                    {isCheckingPhone && <Loader2 className="h-4 w-4 animate-spin" />}
                    Continue to Contact &amp; Address
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {wizardStep === 2 && customer && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Step 2: Contact &amp; Address Verification
            </CardTitle>
            <CardDescription>
              Review the customer&apos;s locked core banking mobile phone number, email address, and residential address for{' '}
              <span className="font-semibold text-foreground">{customer.full_name}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {phoneConflictError && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Duplicate Phone Number Detected</AlertTitle>
                <AlertDescription>{phoneConflictError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Phone className="h-4 w-4 text-primary" />
                    Mobile Phone Number <span className="text-destructive">*</span>
                  </label>
                  <Badge variant="outline" className="gap-1 text-[10px]">
                    <Lock className="h-2.5 w-2.5" />
                    Locked (Core Banking)
                  </Badge>
                </div>
                <Input
                  value={customer.mobile_number || ''}
                  readOnly
                  disabled
                  className="bg-muted/60 font-mono cursor-not-allowed opacity-90"
                  placeholder="+251911223344"
                />
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Synced from FlexCube (editing is disabled).</span>
                  {phoneVerifiedUnique && !phoneConflictError && (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Unique Phone Verified
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  Email Address (Optional)
                </label>
                <Input
                  type="email"
                  value={customer.email_id || ''}
                  onChange={(e) => setCustomer({ ...customer, email_id: e.target.value })}
                  placeholder="customer@example.com"
                />
                <p className="text-[11px] text-muted-foreground">
                  Required if Email OTP or Google Authenticator will be enabled.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-muted/20 p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoItem
                  icon={<MapPin className="h-4 w-4" />}
                  label="Residential Address"
                  value={
                    [
                      customer.address_line_1,
                      customer.address_line_2,
                      customer.address_line_3,
                      customer.address_line_4,
                    ]
                      .filter(Boolean)
                      .join(', ') || 'Not specified in CBS'
                  }
                />
                <InfoItem
                  icon={<Globe className="h-4 w-4" />}
                  label="Country"
                  value={customer.country || 'Ethiopia'}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => setWizardStep(1)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Identity
              </Button>
              <Button
                onClick={handleProceedToAccounts}
                disabled={Boolean(phoneConflictError) || isCheckingPhone}
                className="gap-2"
              >
                {isCheckingPhone && <Loader2 className="h-4 w-4 animate-spin" />}
                Next: Accounts &amp; Channels
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </OnboardingWizardLayout>
  );
}

function InfoItem({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
