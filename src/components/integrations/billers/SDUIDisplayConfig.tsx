
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, GripVertical } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function SDUIDisplayConfig({ providerId, initialFields }: { providerId: string, initialFields: any[] }) {
  const groupedFields = initialFields.reduce((acc: any, field: any) => {
    const type = field.ScreenType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(field);
    return acc;
  }, { confirmation: [], receipt: [] });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Display Mapping</CardTitle>
          <CardDescription>Control how data appears on the final review and success screens.</CardDescription>
        </div>
        <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Mapping</Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="confirmation">
          <TabsList className="mb-4">
            <TabsTrigger value="confirmation">Confirmation Screen</TabsTrigger>
            <TabsTrigger value="receipt">Receipt Screen</TabsTrigger>
          </TabsList>
          
          {['confirmation', 'receipt'].map((screen) => (
            <TabsContent key={screen} value={screen}>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead>Source Key</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedFields[screen].length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="h-24 text-center">No display fields configured for this screen.</TableCell></TableRow>
                    ) : groupedFields[screen].map((f: any) => (
                      <TableRow key={f.DisplayFieldId}>
                        <TableCell><GripVertical className="h-4 w-4 text-muted-foreground" /></TableCell>
                        <TableCell className="font-semibold">{f.Label}</TableCell>
                        <TableCell className="font-mono text-xs">{f.SourceField}</TableCell>
                        <TableCell><Badge variant="outline">{f.ValueFormat}</Badge></TableCell>
                        <TableCell className="text-sm">{f.DisplayOrder}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
