
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
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const settingsFormSchema = z.object({
  theme: z.enum(['light', 'dark']),
  sessionTimeout: z.coerce
    .number()
    .min(5, { message: 'Must be at least 5 minutes' })
    .max(120, { message: 'Must be 120 minutes or less' }),
  notifications: z.object({
    newUserApproval: z.boolean(),
    transactionAnomaly: z.boolean(),
  }),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

// This can be fetched from a database or config file
const defaultValues: Partial<SettingsFormValues> = {
  theme: 'light',
  sessionTimeout: 30,
  notifications: {
    newUserApproval: true,
    transactionAnomaly: false,
  },
};

export default function SettingsPage() {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  });

  function onSubmit(data: SettingsFormValues) {
    console.log(data);
    toast({
      title: 'Settings saved',
      description: 'Your new settings have been applied.',
    });
  }

  return (
    <div className="w-full">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-headline font-semibold">Settings</h2>
                        <p className="text-muted-foreground">Manage your application settings and set preferences.</p>
                    </div>
                    <Button type="submit">Save Changes</Button>
                </div>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 max-w-lg">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="general" className="mt-6">
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
                                        <FormItem>
                                            <FormLabel>Theme</FormLabel>
                                            <FormDescription>Select the application theme.</FormDescription>
                                            {/* In a real app, this would be more sophisticated */}
                                            <p className="font-medium text-sm pt-2">Currently: {field.value}</p>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security" className="mt-6">
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
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-6">
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
                                    name="notifications.transactionAnomaly"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Anomalous Transactions</FormLabel>
                                            <FormDescription>
                                                Receive email notifications when a potentially anomalous transaction is detected.
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
                    </TabsContent>
                </Tabs>
            </form>
        </Form>
    </div>
  );
}
