
'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MailCheck } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { getSession } from 'next-auth/react';

const otpSchema = z.object({
  otp: z.string().length(6, 'Please enter a 6-digit code.'),
});

type OtpFormValues = z.infer<typeof otpSchema>;

function VerifyOtpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { update } = useSession(); // Use the update function from next-auth
  const [isLoading, setIsLoading] = useState(false);

  const email = searchParams.get('email');

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const onSubmit = async (values: OtpFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: values.otp }),
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Verification failed.');
      }
      
      // Update the session to mark MFA as completed
      await update({ mfaValidated: true });

      const session = await getSession();

      toast({
        title: 'Login Successful',
        description: 'You have been successfully authenticated.',
      });
      
      // Redirect to the originally intended page or dashboard
      if ((session as any)?.mustChangePassword) {
        router.push('/settings/change-password');
      } else {
        const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
        router.push(callbackUrl);
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Card className="p-8 text-center">
                <CardTitle className="mb-2">Error</CardTitle>
                <CardDescription>Email not found. Please try logging in again.</CardDescription>
                <Button onClick={() => router.push('/login')} className="mt-4">Go to Login</Button>
            </Card>
        </div>
    )
  }

  return (
    <AuthShell title="Two-factor verification" subtitle="Enter the 6-digit code we sent to confirm it's you.">
      <div className="mb-5 flex items-center gap-3 rounded-2xl bg-emerald-50 p-3 ring-1 ring-emerald-200/70">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <MailCheck className="h-4 w-4" />
        </div>
        <p className="min-w-0 text-xs text-emerald-900">
          Code sent to <span className="font-semibold break-all">{email}</span>
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Verification Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123456"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    className="h-14 text-center text-2xl font-semibold tracking-[0.6em] md:text-2xl"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="h-12 w-full text-[15px] font-semibold" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Verifying…' : 'Verify & Sign In'}
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}
export default function VerifyOtpPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <VerifyOtpPageContent />
        </Suspense>
    )
}
