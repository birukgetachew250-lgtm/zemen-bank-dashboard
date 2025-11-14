"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";

interface Corporate {
  id: string;
  name: string;
  industry: string;
  status: string;
  internet_banking_status: string;
  logo_url: string;
}

function getCorporates() {
  // In a real app, this would be an API call.
  // For this prototype, we're fetching directly from the client-side DB instance.
  // This is NOT recommended for production.
  try {
    const data = db.prepare("SELECT * FROM corporates ORDER BY name ASC").all();
    return data as Corporate[];
  } catch (e) {
    // This will likely fail in the browser, so we have fallback data
    console.error("Failed to fetch corporates from DB:", e);
    return [];
  }
}

const fallbackCorporates = [
    { id: "corp_1", name: "Dangote Cement", industry: "Manufacturing", status: "Active", internet_banking_status: "Active", logo_url: "https://picsum.photos/seed/dangote/40/40" },
    { id: "corp_2", name: "MTN Nigeria", industry: "Telecommunications", status: "Active", internet_banking_status: "Active", logo_url: "https://picsum.photos/seed/mtn/40/40" },
    { id: "corp_3", name: "Zenith Bank", industry: "Finance", status: "Inactive", internet_banking_status: "Disabled", logo_url: "https://picsum.photos/seed/zenith/40/40" },
    { id: "corp_4_new", name: "Jumia Group", industry: "E-commerce", status: "Active", internet_banking_status: "Pending", logo_url: "https://picsum.photos/seed/jumia/40/40" },
    { id: "corp_5", name: "Flutterwave", industry: "Fintech", status: "Active", internet_banking_status: "Active", logo_url: "https://picsum.photos/seed/flutterwave/40/40" },
    { id: "corp_6", name: "Andela", industry: "Technology", status: "Active", internet_banking_status: "Active", logo_url: "https://picsum.photos/seed/andela/40/40" },
    { id: "corp_7", name: "Oando Plc", industry: "Oil & Gas", status: "Inactive", internet_banking_status: "Disabled", logo_url: "https://picsum.photos/seed/oando/40/40" },
    { id: "corp_8", name: "Paystack", industry: "Fintech", status: "Active", internet_banking_status: "Active", logo_url: "https://picsum.photos/seed/paystack/40/40" },
];


const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active': return 'secondary';
        case 'inactive': return 'destructive';
        case 'pending': return 'default';
        default: return 'outline';
    }
}

export default function CorporatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Memoize fetching data to prevent re-fetching on every render.
  const corporates = useMemo(() => {
    const data = getCorporates();
    return data.length > 0 ? data : fallbackCorporates;
  }, []);

  const filteredCorporates = useMemo(() => {
    if (!searchTerm) return corporates;
    return corporates.filter(
      (corporate) =>
        corporate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        corporate.industry.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, corporates]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Existing Corporates</CardTitle>
        <Input 
            placeholder="Search by name or industry..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </CardHeader>
      <CardContent>
         <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Corporate Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Internet Banking</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCorporates.length > 0 ? filteredCorporates.map((corporate) => (
                <TableRow key={corporate.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Image 
                            src={corporate.logo_url} 
                            alt={`${corporate.name} logo`}
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                        {corporate.name}
                    </div>
                  </TableCell>
                  <TableCell>{corporate.industry}</TableCell>
                  <TableCell>
                     <Badge 
                        variant={corporate.status === 'Active' ? 'secondary' : 'destructive'}
                        className={cn({
                            'bg-green-100 text-green-800 border-green-200': corporate.status === 'Active',
                            'bg-red-100 text-red-800 border-red-200': corporate.status === 'Inactive',
                        })}
                     >
                        {corporate.status}
                     </Badge>
                  </TableCell>
                   <TableCell>
                     <Badge 
                        variant={getStatusVariant(corporate.internet_banking_status)}
                        className={cn({
                            'bg-green-100 text-green-800 border-green-200': corporate.internet_banking_status === 'Active',
                            'bg-red-100 text-red-800 border-red-200': corporate.internet_banking_status === 'Disabled',
                             'bg-yellow-100 text-yellow-800 border-yellow-200': corporate.internet_banking_status === 'Pending',
                        })}
                     >
                        {corporate.internet_banking_status}
                     </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No corporates found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
