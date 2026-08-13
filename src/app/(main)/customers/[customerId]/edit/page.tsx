'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload, type UploadedFile } from "@/components/ui/FileUpload";

const authMethods = [
  { value: 'SMSOTP', label: 'SMS OTP' },
  { value: 'GAUTH', label: 'Google Authenticator' },
  { value: 'SQ', label: 'Security Question' },
  { value: 'EMAILOTP', label: 'Email OTP' },
];

const twoFactorMethods = [
    ...authMethods,
    { value: 'None', label: 'None'},
];

const channelOptions = [
    { value: 'Mobile App', label: 'Mobile App' },
    { value: 'USSD', label: 'USSD' },
    { value: 'Both', label: 'Both' },
];

const editProfileSchema = z.object({
  email: z.string().email(),
  phoneNumber: z.string().min(1, 'Phone number is required.'),
  signUpMainAuth: z.string().min(1, 'Primary authentication method is required.'),
  signUp2FA: z.string(),
  channel: z.string().min(1, 'Channel is required.'),
}).refine(data => data.signUp2FA === 'None' || data.signUpMainAuth !== data.signUp2FA, {
    message: "Main auth and 2FA method cannot be the same.",
    path: ["signUp2FA"],
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

export default function EditCustomerPage({ params }: { params: { customerId: string } }) {
    const customerId = params.customerId;
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [documents, setDocuments] = useState<UploadedFile[]>([]);
    
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<EditProfileFormValues>({
      resolver: zodResolver(editProfileSchema),
    });

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const customerRes = await fetch(`/api/customers/${customerId}`);
                if (!customerRes.ok) throw new Error("Customer not found");
                const customerData = await customerRes.json();
                setCustomer(customerData);
                form.reset({
                    email: customerData.email,
                    phoneNumber: customerData.phoneNumber,
                    signUpMainAuth: customerData.signUpMainAuth,
                    signUp2FA: customerData.signUp2FA,
                    channel: customerData.channel,
                });
            } catch (error: any) {
                toast({ variant: 'destructive', title: "Error", description: error.message });
            } finally {
                setLoading(false);
            }
        }
        if (customerId) {
            fetchData();
        }
    }, [customerId, toast, form]);

    const onEditSubmit = async (values: EditProfileFormValues) => {
        if (!customer) return;
        
        setIsSubmitting(true);
        const changes = {
          email: { old: customer.email, new: values.email },
          phoneNumber: { old: customer.phoneNumber, new: values.phoneNumber },
          signUpMainAuth: { old: customer.signUpMainAuth, new: values.signUpMainAuth },
          signUp2FA: { old: customer.signUp2FA, new: values.signUp2FA },
          channel: { old: customer.channel, new: values.channel },
        };
        
        try {
            const response = await fetch('/api/approvals/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cif: customer.cifNumber,
                    type: 'updated-customer',
                    customerName: customer.name,
                    customerPhone: customer.phoneNumber,
                    details: { 
                      changes,
                      documents: documents.map(d => ({ name: d.name, url: d.url, type: d.type, size: d.size })),
                    },
                    attachmentUrl: documents.length > 0 ? documents[0].url : undefined,
                }),
            });
            if (!response.ok) {
                throw new Error((await response.json()).message || 'Failed to submit update for approval.');
            }
            toast({
                title: "Update Request Submitted",
                description: "The requested changes have been sent for approval."
            });
            router.push(`/customers/${customerId}`);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Submission Failed", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (loading) {
        return <div className="flex h-full w-full items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (!customer) {
        return <div className="text-center p-8">Customer not found.</div>;
    }

    return (
        <div className="w-full max-w-4xl space-y-6 animate-fade-up">
            <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
                <div className="relative z-10 flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Edit Customer Profile</h1>
                        <p className="text-white/80 mt-1">
                            {customer.name} (CIF: {customer.cifNumber})
                        </p>
                    </div>
                </div>
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
            </div>

            <Card className="glass-card shadow-sm border-slate-200/80 rounded-2xl">
                <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Update customer information and security settings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl>
                                                    <Input type="email" {...field} className="rounded-xl" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="rounded-xl" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="channel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Channel Access</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                    <SelectTrigger className="rounded-xl">
                                                        <SelectValue placeholder="Select a channel" />
                                                    </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                    {channelOptions.map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                        </SelectItem>
                                                    ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold border-b pb-2">Security Settings</h3>
                                    <FormField
                                        control={form.control}
                                        name="signUpMainAuth"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Primary Authentication Method</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                    <SelectTrigger className="rounded-xl">
                                                        <SelectValue placeholder="Select a method" />
                                                    </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                    {authMethods.map(method => (
                                                        <SelectItem key={method.value} value={method.value}>
                                                        {method.label}
                                                        </SelectItem>
                                                    ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                     <FormField
                                        control={form.control}
                                        name="signUp2FA"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Two-Factor (2FA) Method</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                    <SelectTrigger className="rounded-xl">
                                                        <SelectValue placeholder="Select a 2FA method" />
                                                    </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                      {twoFactorMethods.map(method => (
                                                        <SelectItem key={method.value} value={method.value}>
                                                          {method.label}
                                                        </SelectItem>
                                                      ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            
                            <Separator />
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Supporting Documents</h3>
                                <FileUpload
                                    value={documents}
                                    onChange={setDocuments}
                                    label="Maker Attachment (Optional)"
                                    maxFiles={5}
                                    maxSizeMB={10}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-6">
                                <Button type="button" variant="outline" className="rounded-xl" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" className="rounded-xl gap-2" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
                                    Submit for Approval
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
