
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  Settings2,
  ExternalLink 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BillProvider {
  ProviderId: string;
  ProviderName: string;
  ProviderCode: string;
  Status: string;
  Rank: number;
  HoldingAccountId: string;
}

export function BillProviderList({ initialProviders, categoryId }: { initialProviders: BillProvider[], categoryId: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filtered = initialProviders.filter(p => 
    p.ProviderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ProviderCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Biller Providers</CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search providers..."
              className="pl-8 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => {}}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Provider Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Holding Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <TableRow 
                    key={p.ProviderId} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/integrations/billers/config/${p.ProviderId}`)}
                  >
                    <TableCell className="font-medium">{p.Rank}</TableCell>
                    <TableCell className="font-bold">{p.ProviderName}</TableCell>
                    <TableCell className="font-mono text-xs">{p.ProviderCode}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.HoldingAccountId}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.Status === 'Active' ? 'secondary' : 'outline'} className={cn(p.Status === 'Active' && "bg-green-100 text-green-800")}>
                        {p.Status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Edit General Info">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Configure Flow & API">
                          <Settings2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No providers found in this category.
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
