'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';

const settingsFormSchema = z.object({
  theme: z.enum(['light', 'dark']),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: session, update } = useSession();
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(true);
  const [mfaChannel, setMfaChannel] = useState<string>('Email OTP');
  const [isLoadingMfa, setIsLoadingMfa] = useState<boolean>(true);
  const [isTogglingMfa, setIsTogglingMfa] = useState<boolean>(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      theme: 'light',
    },
  });

  useEffect(() => {
    const saved = localStorage.getItem('zemen-theme');
    const initialTheme =
      saved === 'dark' || document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light';
    form.setValue('theme', initialTheme);
  }, [form]);

  useEffect(() => {
    async function loadUserMfa() {
      if (!session?.user?.email) {
        setIsLoadingMfa(false);
        return;
      }
      setIsLoadingMfa(true);
      try {
        const res = await fetch(
          `/api/users/by-email/${encodeURIComponent(session.user.email)}`
        );
        if (res.ok) {
          const userData = await res.json();
          setMfaEnabled(Boolean(userData.mfaEnabled));
          setMfaChannel(userData.mfaEnabled ? 'Email OTP / Authenticator App' : 'None');
        }
      } catch {
        // Ignore non-critical error
      } finally {
        setIsLoadingMfa(false);
      }
    }
    loadUserMfa();
  }, [session?.user?.email]);

  const handleMfaToggle = async (checked: boolean) => {
    setIsTogglingMfa(true);
    try {
      const res = await fetch('/api/users/toggle-mfa', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaEnabled: checked }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to update MFA status');
      }
      setMfaEnabled(checked);
      setMfaChannel(checked ? 'Email OTP / Authenticator App' : 'None');
      await update({ mfaEnabled: checked });
      toast({
        title: 'MFA Setting Updated',
        description: `Multi-Factor Authentication has been ${
          checked ? 'enabled' : 'disabled'
        }.`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'MFA Update Failed',
        description: error.message || 'Unable to update MFA status.',
      });
    } finally {
      setIsTogglingMfa(false);
    }
  };

  function onSubmit(data: SettingsFormValues) {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(data.theme);
    localStorage.setItem('zemen-theme', data.theme);
    toast({
      title: 'Settings saved',
      description: `Appearance theme set to ${data.theme} mode.`,
    });
  }

  return (
    <div className="w-full space-y-6">
      <div
        className="relative mb-6 overflow-hidden rounded-2xl p-6 animate-fade-up"
        style={{
          background:
            'linear-gradient(135deg, hsl(220, 80%, 40%) 0%, hsl(220, 80%, 20%) 100%)',
        }}
      >
        <h1 className="relative z-10 text-3xl font-bold text-white">
          General &amp; Security Settings
        </h1>
        <p className="relative z-10 mt-2 text-white/80">
          Manage application appearance and Multi-Factor Authentication settings.
        </p>
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="glass-card animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle>Appearance &amp; Authentication</CardTitle>
              <CardDescription>
                Configure your workspace theme and Multi-Factor Authentication (MFA) enforcement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Theme</FormLabel>
                    <FormDescription>
                      Select the application color scheme.
                    </FormDescription>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(val: 'light' | 'dark') => {
                          field.onChange(val);
                          document.documentElement.classList.remove('light', 'dark');
                          document.documentElement.classList.add(val);
                          localStorage.setItem('zemen-theme', val);
                        }}
                        value={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="light" />
                          </FormControl>
                          <FormLabel className="font-normal">Light</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="dark" />
                          </FormControl>
                          <FormLabel className="font-normal">Dark</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* 5.1 MFA Diagnostics & Toggle (Session Timeout Minutes removed) */}
              <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-muted/20 p-4 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">
                      Multi-Factor Authentication (MFA Enabled)
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        mfaEnabled
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }
                    >
                      {mfaEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Require a second verification step on sign-in.
                  </p>
                  <div className="flex items-center gap-2 pt-1 text-xs">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-muted-foreground">Active MFA Channel:</span>
                    <span className="font-semibold text-foreground">{mfaChannel}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {(isLoadingMfa || isTogglingMfa) && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  <Switch
                    checked={mfaEnabled}
                    onCheckedChange={handleMfaToggle}
                    disabled={isLoadingMfa || isTogglingMfa}
                    aria-label="Toggle MFA Enabled"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
