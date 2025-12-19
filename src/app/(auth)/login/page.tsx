
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";


const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "admin@zemen.com",
      password: "zemen2025",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }
      
      if (result?.ok) {
        toast({ title: "Login successful!" });
        // Use window.location to force a full page reload to ensure session is picked up
        window.location.href = callbackUrl;
      } else {
        // This case might be hit if there's an error that doesn't set result.error
         toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: "An unexpected error occurred. Please try again.",
        });
      }
      
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: "Invalid credentials. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="items-center text-center">
        <CardTitle className="font-headline text-2xl font-bold">
          Zemen Admin Login
        </CardTitle>
        <CardDescription>Enter your credentials to access the dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
            <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>
                    {error === 'CredentialsSignin'
                    ? 'Invalid email or password. Please try again.'
                    : 'An unexpected error occurred. Please try again.'}
                </AlertDescription>
            </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@zemen.com" {...field} />
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full font-medium" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground text-center w-full">
          © {new Date().getFullYear()} Zemen Bank. All rights reserved.
        </p>
      </CardFooter>
    </Card>
  );
}
