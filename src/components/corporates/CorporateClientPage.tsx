
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
import { Button } from "../ui/button";
import { Edit, Trash2 } from "lucide-react";

interface Corporate {
  id: string;
  name: string;
  industry: string;
  status: string;
  internet_banking_status: string;
  logo_url: string;
}

interface CorporateClientPageProps {
    corporates: Corporate[];
}

const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active': return 'secondary';
        case 'inactive': return 'destructive';
        case 'pending': return 'default';
        default: return 'outline';
    }
}

export function CorporateClientPage({ corporates }: CorporateClientPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredCorporates = useMemo(() => {
    if (!searchTerm) return corporates;
    return corporates.filter(
      (corporate) =>
        corporate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        corporate.industry.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, corporates]);

  return (
    <Card className="w-full">
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
                <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
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
