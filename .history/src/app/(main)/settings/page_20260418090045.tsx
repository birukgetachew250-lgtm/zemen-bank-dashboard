
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
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from 'react';

const settingsFormSchema = z.object({
  theme: z.enum(['light', 'dark']),
  sessionTimeout: z.coerce
    .number()
    .min(5, { message: 'Must be at least 5 minutes' })
    .max(120, { message: 'Must be 120 minutes or less' }),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const defaultValues: Partial<SettingsFormValues> = {
  theme: 'light',
  sessionTimeout: 30,
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPolicy, setIsLoadingPolicy] = useState(true);
  const [securityPolicy, setSecurityPolicy] = useState<any>(null);
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  });

  const theme = form.watch('theme');

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    if (theme) {
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    const loadSecurityPolicy = async () => {
      setIsLoadingPolicy(true);
      try {
        const res = await fetch('/api/security/policies');
        if (!res.ok) throw new Error('Failed to load security policy');
        const policy = await res.json();
        setSecurityPolicy(policy);
        form.setValue('sessionTimeout', Number(policy.sessionTimeout || 30));
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Failed to load session timeout',
          description: error.message || 'Please try again later.',
        });
      } finally {
        setIsLoadingPolicy(false);
      }
    };

    loadSecurityPolicy();
  }, [form, toast]);

  async function onSubmit(data: SettingsFormValues) {
    if (!securityPolicy) {
      toast({ variant: 'destructive', title: 'Cannot save', description: 'Security policy is not loaded yet.' });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...securityPolicy,
        sessionTimeout: data.sessionTimeout,
      };

      const res = await fetch('/api/security/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save session timeout');
      }

      const updated = await res.json();
      setSecurityPolicy(updated);
      toast({
        title: 'Settings saved',
        description: 'Session timeout has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Save failed',
        description: error.message || 'Unable to save settings.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="w-full">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>Manage general application and appearance settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <FormField
                            control={form.control}
                            name="theme"
                            render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Theme</FormLabel>
                                <FormDescription>Select the application theme.</FormDescription>
                                <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="light" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        Light
                                    </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <RadioGroupItem value="dark" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        Dark
                                    </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="sessionTimeout"
                            render={({ field }) => (
                            <FormItem className="max-w-sm">
                                <FormLabel>Session Timeout (minutes)</FormLabel>
                                <FormDescription>
                                The time in minutes before a user is automatically logged out.
                                </FormDescription>
                                <FormControl>
                                <Input type="number" placeholder="30" disabled={isLoadingPolicy || isSaving} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
                <div className="flex justify-end">
                          <Button type="submit" disabled={isLoadingPolicy || isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                </div>
            </form>
        </Form>
    </div>
  );
}
