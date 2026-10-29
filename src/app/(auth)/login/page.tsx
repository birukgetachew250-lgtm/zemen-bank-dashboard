
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn, getSession } from 'next-auth/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function getAuthErrorMessage(error: string | null): string | null {
  if (!error) {
    return null;
  }

  const normalized = error.trim();
  if (/locked/i.test(normalized) || /suspended/i.test(normalized) || /invalid email or password/i.test(normalized)) {
    return normalized;
  }

  const mappedErrors: Record<string, string> = {
    CredentialsSignin: 'Invalid email or password.',
    AccessDenied: 'Access denied. Please contact an administrator.',
    SessionRequired: 'Your session has expired. Please sign in again.',
    Verification: 'Unable to verify sign-in request. Please try again.',
    OAuthSignin: 'There was a problem signing in with the selected provider.',
    OAuthCallback: 'There was a problem signing in after authentication.',
    OAuthCreateAccount: 'Unable to create an account for this provider.',
    EmailCreateAccount: 'Unable to create an account with email sign-in.',
    Callback: 'There was a problem processing your authentication request.',
    OAuthAccountNotLinked: 'Please sign in with the same provider linked to your account.',
    EmailSignin: 'Email sign in failed. Please try again.',
  };

  return mappedErrors[normalized] ?? normalized;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const error = searchParams.get('error');
  const reason = searchParams.get('reason');
  const errorMessage = getAuthErrorMessage(error);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    const result = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    if (result?.error) {
      const message = getAuthErrorMessage(result.error) || 'Invalid email or password.';
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: message,
      });
      setIsLoading(false);
      return;
    } else if (result?.ok) {
      const session = await getSession();
      if ((session as any)?.mfaRequired) {
        router.push(`/login/verify-otp?email=${encodeURIComponent(values.email)}`);
      } else if ((session as any)?.mustChangePassword) {
        router.push('/settings/change-password');
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to the Zemen Bank Admin Center to continue.">
      {reason === 'session-timeout' && (
        <Alert variant="destructive" className="mb-4 rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Session Expired</AlertTitle>
          <AlertDescription>
            Your session expired due to inactivity. Please sign in again.
          </AlertDescription>
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="destructive" className="mb-4 rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Login Error</AlertTitle>
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="admin@zemenbank.com"
                      autoComplete="off"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="off"
                      className="pl-10 pr-11"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-lg text-slate-400 hover:text-slate-700"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="h-12 w-full text-[15px] font-semibold" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="order-last h-4 w-4" />}
            {isLoading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </Form>
    </AuthShell>
  );
}
// This is the default export which is a Server Component.
export default function LoginPage() {
    return (
        // The Suspense boundary is necessary because LoginPageContent uses useSearchParams.
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-[hsl(225,55%,6%)] px-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <LoginPageContent />
        </Suspense>
    )
}
