
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const corporateSchema = z.object({
  name: z.string().min(1, 'Corporate name is required'),
  industry: z.string().min(1, 'Industry is required'),
  logo_url: z.string().url('Please enter a valid URL for the logo').optional().or(z.literal('')),
});

type CorporateFormValues = z.infer<typeof corporateSchema>;

export default function CreateCorporatePage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CorporateFormValues>({
    resolver: zodResolver(corporateSchema),
    defaultValues: {
      name: '',
      industry: '',
      logo_url: '',
    },
  });

  async function onSubmit(values: CorporateFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/corporates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create corporate customer');
      }

      toast({
        title: 'Corporate Created',
        description: `Successfully created ${values.name}.`,
      });
      router.push('/corporates');
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message || 'Could not create corporate customer.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full h-full flex flex-col">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
          <Card className="flex-grow flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline text-2xl font-bold">
                Create New Corporate Customer
              </CardTitle>
              <CardDescription>
                Fill in the details for the new corporate customer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-grow">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Corporate Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Dangote Cement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Manufacturing" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Corporate
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
