
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
  ChevronRight,
  ExternalLink 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BillCategory {
  CategoryId: string;
  CategoryName: string;
  Description: string | null;
  LogoUrl: string | null;
  ColorHex: string | null;
  Status: string;
  Rank: number;
}

export function BillCategoryList({ initialCategories }: { initialCategories: BillCategory[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filtered = initialCategories.filter(c => 
    c.CategoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Existing Categories</CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              className="pl-8 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => {}}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((cat) => (
                  <TableRow 
                    key={cat.CategoryId} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/integrations/billers/${cat.CategoryId}`)}
                  >
                    <TableCell className="font-medium">{cat.Rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: cat.ColorHex || '#ccc' }} 
                        />
                        <span className="font-semibold">{cat.CategoryName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {cat.Description || "No description"}
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{cat.ColorHex || "Default"}</code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cat.Status === 'Active' ? 'secondary' : 'outline'} className={cn(cat.Status === 'Active' && "bg-green-100 text-green-800")}>
                        {cat.Status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Edit">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No bill categories found.
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
