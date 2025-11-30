
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Key, Link, User, Lock, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

const miniAppSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'App name is required'),
  url: z.string().url('Please enter a valid URL'),
  logo_url: z.string().url('Please enter a valid URL for the logo').optional().or(z.literal('')),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  encryption_key: z.string().min(1, 'Encryption key is required'),
});

type MiniAppFormValues = z.infer<typeof miniAppSchema>;

interface MiniAppFormProps {
  miniApp?: MiniAppFormValues | null;
}

export function MiniAppForm({ miniApp }: MiniAppFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<MiniAppFormValues>({
    resolver: zodResolver(miniAppSchema),
    defaultValues: miniApp || {
      name: '',
      url: '',
      logo_url: '',
      username: '',
      password: '',
      encryption_key: '',
    },
  });

  const isEditing = !!miniApp;

  const handleSubmit = async (values: MiniAppFormValues) => {
    setIsLoading(true);
    const method = isEditing ? 'PUT' : 'POST';
    const body = JSON.stringify(values);

    try {
      const res = await fetch('/api/mini-apps', { method, body, headers: { 'Content-Type': 'application/json' } });
      const result = await res.json();

      if (res.ok) {
        toast({ title: 'Success', description: `Mini App ${isEditing ? 'updated' : 'created'} successfully.` });
        router.push('/mini-apps');
        router.refresh();
      } else {
        throw new Error(result.message || 'An unknown error occurred.');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Mini App' : 'Add New Mini App'}</CardTitle>
            <CardDescription>Fill in the details for the mini app integration.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem><FormLabel>App Name</FormLabel><FormControl><Input placeholder="e.g. Cinema Tickets" {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem><FormLabel>App URL</FormLabel><FormControl><Input type="url" placeholder="https://example.com/app" {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo_url"
              render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Logo URL</FormLabel><FormControl><Input type="url" placeholder="https://example.com/logo.png" {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem><FormLabel>API Username</FormLabel><FormControl><Input placeholder="api_user" {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem><FormLabel>API Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="encryption_key"
              render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Encryption Key</FormLabel><FormControl><Textarea placeholder="Enter the 256-bit encryption key" {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/mini-apps')}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Create Mini App'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
