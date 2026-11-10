
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
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const settingsFormSchema = z.object({
  notifications: z.object({
    newUserApproval: z.boolean(),
    failedLoginAttempts: z.boolean(),
  }),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const defaultValues: Partial<SettingsFormValues> = {
  notifications: {
    newUserApproval: true,
    failedLoginAttempts: false,
  },
};


export default function NotificationsSettingsPage() {
  const { toast } = useToast();
  
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  });

  function onSubmit(data: SettingsFormValues) {
    toast({
      title: 'Notification settings saved',
      description: 'Your new notification preferences have been applied.',
    });
  }

  return (
    <div className="space-y-6">
      <div
        className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 mb-6 shadow-lg animate-fade-up"
        style={{
          background:
            'radial-gradient(85% 140% at 100% 0%, hsl(220 80% 45% / 0.45), transparent 60%), radial-gradient(70% 120% at 0% 100%, hsl(347 77% 40% / 0.35), transparent 60%), linear-gradient(135deg, hsl(222 47% 11%), hsl(224 55% 7%))',
        }}
      >
        <h1 className="text-3xl font-bold text-white relative z-10">Notification Settings</h1>
        <p className="text-white/80 mt-2 relative z-10">Manage your email and system notification preferences.</p>
      </div>

    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="glass-card animate-fade-up">
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Manage your notification preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="notifications.newUserApproval"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                        <FormLabel className="text-base">New User Approvals</FormLabel>
                        <FormDescription>
                            Receive email notifications for new customers awaiting approval.
                        </FormDescription>
                        </div>
                        <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                        </FormControl>
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="notifications.failedLoginAttempts"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                        <FormLabel className="text-base">Failed Login Attempts</FormLabel>
                        <FormDescription>
                            Receive email notifications for excessive failed login attempts.
                        </FormDescription>
                        </div>
                        <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                        </FormControl>
                    </FormItem>
                    )}
                />
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
