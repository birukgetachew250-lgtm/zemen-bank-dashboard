
'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Lock, ShieldCheck, KeyRound } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// ── Password complexity rules (must mirror server-side validatePasswordComplexity) ──
const complexityRules = [
  { label: 'At least 12 characters',             test: (p: string) => p.length >= 12 },
  { label: 'At least one uppercase letter (A–Z)', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'At least one lowercase letter (a–z)', test: (p: string) => /[a-z]/.test(p) },
  { label: 'At least one digit (0–9)',            test: (p: string) => /[0-9]/.test(p) },
  { label: 'At least one special character',      test: (p: string) => /[!@#$%^&*()\-_=+\[\]{}|;':",.<>?/\\`~]/.test(p) },
];

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string()
    .min(12, 'Password must be at least 12 characters.')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter.')
    .regex(/[0-9]/, 'Must contain at least one digit.')
    .regex(/[!@#$%^&*()\-_=+\[\]{}|;':",.<>?/\\`~]/, 'Must contain at least one special character.'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match.",
  path: ['confirmPassword'],
}).refine(data => data.newPassword !== data.currentPassword, {
  message: 'New password must differ from your current password.',
  path: ['newPassword'],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

function PasswordStrengthChecklist({ password }: { password: string }) {
  if (!password) return null;
  return (
    <ul className="mt-2 space-y-1">
      {complexityRules.map((rule) => {
        const passes = rule.test(password);
        return (
          <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${passes ? 'text-green-600' : 'text-muted-foreground'}`}>
            {passes
              ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
              : <XCircle className="h-3.5 w-3.5 shrink-0 text-destructive/70" />}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

export default function ChangePasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const { update } = useSession();
  const router = useRouter();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPasswordValue = useWatch({ control: form.control, name: 'newPassword' });

  async function onSubmit(data: PasswordFormValues) {
    setIsLoading(true);
    setApiErrors([]);
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Surface server-side complexity errors if present
        if (result.errors && Array.isArray(result.errors)) {
          setApiErrors(result.errors);
        }
        throw new Error(result.message || 'Failed to change password');
      }

      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully.',
      });
      await update({ passwordChanged: true });
      form.reset();
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Password Change Failed',
        description: error.message || 'Could not change password.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8"
        style={{ background: 'linear-gradient(135deg, hsl(233,55%,52%) 0%, hsl(233,55%,32%) 100%)' }}>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center ring-1 ring-white/20">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Change Password</h1>
            <p className="text-white/70 text-sm mt-1">Update your account credentials to maintain strict security.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Form */}
        <div className="lg:col-span-2">
          <Card className="glass-card h-full">
            <CardHeader className="pb-4 border-b">
              <CardTitle>Update Credentials</CardTitle>
              <CardDescription>
                Ensure your new password meets all the strict security policies of Zemen Bank.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input id="current-password" type="password" autoComplete="current-password" {...field} className="rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input id="new-password" type="password" autoComplete="new-password" {...field} className="rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input id="confirm-password" type="password" autoComplete="new-password" {...field} className="rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {apiErrors.length > 0 && (
                    <ul className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 space-y-2">
                      {apiErrors.map((err, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-destructive">
                          <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          {err}
                        </li>
                      ))}
                    </ul>
                  )}

                  <Button id="change-password-submit" type="submit" disabled={isLoading} className="rounded-xl w-full sm:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save New Password
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Security Checklist */}
        <div>
          <Card className="glass-card bg-slate-50/50 h-full">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                Security Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground mb-4">
                To protect your Zemen Bank administrative access, your password must meet the following complexity rules:
              </p>
              <PasswordStrengthChecklist password={newPasswordValue} />
              
              <div className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3">
                <div className="bg-blue-100 rounded-full p-2 h-fit flex-shrink-0">
                  <KeyRound className="h-4 w-4 text-blue-700" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Security Tip</h4>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    Avoid using easily guessable words. A phrase made of multiple unrelated words with numbers and symbols is highly secure.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

