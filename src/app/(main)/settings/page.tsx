
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useEffect, useState } from 'react';
import { Loader2, User, Lock, Bell, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsFormSchema = z.object({
  theme: z.enum(['light', 'dark']),
  sessionTimeout: z.coerce
    .number()
    .min(5, { message: 'Must be at least 5 minutes' })
    .max(120, { message: 'Must be 120 minutes or less' }),
  notifications: z.object({
    newUserApproval: z.boolean(),
    failedLoginAttempts: z.boolean(),
  }),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match.",
  path: ["confirmPassword"],
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const defaultValues: Partial<SettingsFormValues> = {
  theme: 'light',
  sessionTimeout: 30,
  notifications: {
    newUserApproval: true,
    failedLoginAttempts: false,
  },
};

function ChangePasswordForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: PasswordFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to change password');
      }

      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully.',
      });
      form.reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not change password.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
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
                <Input type="password" {...field} />
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
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Change Password
        </Button>
      </form>
    </Form>
  );
}

const menuItems = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'security', label: 'Security', icon: User },
    { id: 'password', label: 'Change Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState('general');
  
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

  function onSubmit(data: SettingsFormValues) {
    console.log(data);
    toast({
      title: 'Settings saved',
      description: 'Your new settings have been applied.',
    });
  }

  return (
    <div className="w-full">
         <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-headline font-semibold">Settings</h2>
              <p className="text-muted-foreground">Manage your application settings and set preferences.</p>
            </div>
            <Button onClick={form.handleSubmit(onSubmit)}>Save Changes</Button>
          </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <nav className="md:col-span-1">
                <ul className="space-y-1">
                    {menuItems.map(item => (
                        <li key={item.id}>
                            <Button 
                                variant="ghost" 
                                className={cn(
                                    "w-full justify-start",
                                    activeView === item.id && "bg-accent text-accent-foreground"
                                )}
                                onClick={() => setActiveView(item.id)}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.label}
                            </Button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="md:col-span-3">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        {activeView === 'general' && (
                             <Card>
                                <CardHeader>
                                    <CardTitle>General</CardTitle>
                                    <CardDescription>Manage general application settings.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
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
                                </CardContent>
                            </Card>
                        )}
                        {activeView === 'security' && (
                             <Card>
                                <CardHeader>
                                <CardTitle>Security</CardTitle>
                                <CardDescription>Manage security-related settings.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="sessionTimeout"
                                    render={({ field }) => (
                                    <FormItem className="max-w-sm">
                                        <FormLabel>Session Timeout</FormLabel>
                                        <FormDescription>
                                        The time in minutes before a user is automatically logged out.
                                        </FormDescription>
                                        <FormControl>
                                        <Input type="number" placeholder="30" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                </CardContent>
                            </Card>
                        )}
                         {activeView === 'password' && (
                             <Card>
                                <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>Update your current password.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                <ChangePasswordForm />
                                </CardContent>
                            </Card>
                         )}
                         {activeView === 'notifications' && (
                             <Card>
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
                         )}
                    </form>
                 </Form>
            </div>
        </div>
    </div>
  );
}

    