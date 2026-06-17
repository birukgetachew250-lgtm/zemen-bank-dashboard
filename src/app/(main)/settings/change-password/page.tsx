
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
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
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
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Your new password must be at least 12 characters and include uppercase, lowercase, a digit, and a special character.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input id="current-password" type="password" autoComplete="current-password" {...field} />
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
                    <Input id="new-password" type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                  <PasswordStrengthChecklist password={newPasswordValue} />
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
                    <Input id="confirm-password" type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {apiErrors.length > 0 && (
              <ul className="rounded-md border border-destructive/40 bg-destructive/5 p-3 space-y-1">
                {apiErrors.map((err, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-destructive">
                    <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {err}
                  </li>
                ))}
              </ul>
            )}

            <Button id="change-password-submit" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Change Password
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

