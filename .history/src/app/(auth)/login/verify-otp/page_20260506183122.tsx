
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
import { Loader2 } from 'lucide-react';
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
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
            <Image src="/images/logo.png" alt="Zemen Bank" width={64} height={64} />
          <h1 className="text-2xl font-bold mt-4">Two-Factor Authentication</h1>
          <p className="text-muted-foreground">Enter the code sent to your email address.</p>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Verify Your Identity</CardTitle>
                <CardDescription>A 6-digit verification code has been sent to {email}.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                            <Input
                            placeholder="123456"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify & Sign In
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
      </div>
    </div>
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
