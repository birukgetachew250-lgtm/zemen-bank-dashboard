
'use client';

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export interface CustomerDetails {
    id: string;
    cifNumber: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    nationality: string;
    branchName: string;
    status: string;
    insertDate: string;
}

interface CustomerDetailsCardProps {
  customer: CustomerDetails;
}

export function CustomerDetailsCard({ customer }: CustomerDetailsCardProps) {
    const router = useRouter();
  
    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="/images/avatar.png" alt={customer.name} />
                      <AvatarFallback>{customer.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-3xl font-bold font-headline">{customer.name}</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground">CIF: {customer.cifNumber}</CardDescription>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push(`/customers/${customer.cifNumber}`)}><Edit className="mr-2 h-4 w-4" /> View Full Profile</Button>
                </div>
            </CardHeader>
            <CardContent className="grid gap-6 p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoItem label="Status" value={<Badge className="bg-green-100 text-green-800 border-green-200">{customer.status}</Badge>} />
                <InfoItem label="Email Address" value={customer.email} />
                <InfoItem label="Phone Number" value={customer.phoneNumber} />
                <InfoItem label="Nationality" value={customer.nationality} />
                <InfoItem label="Registered Branch" value={customer.branchName} />
                <InfoItem label="Registration Date" value={new Date(customer.insertDate).toLocaleDateString()} />
                <InfoItem label="Full Address" value={customer.address} className="lg:col-span-3" />
              </div>
            </CardContent>
        </Card>
    );
}

function InfoItem({ label, value, className }: { label: string, value: React.ReactNode, className?: string }) {
    return (
        <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className={className}>{value}</div>
        </div>
    )
}
