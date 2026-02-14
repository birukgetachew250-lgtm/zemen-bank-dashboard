
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2, Play, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SDUIApiConfig({ providerId, initialConfigs }: { providerId: string, initialConfigs: any[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>API Integrations</CardTitle>
          <CardDescription>Backend endpoints for lookup, validation, and payment execution.</CardDescription>
        </div>
        <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add API</Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Timeout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialConfigs.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">No API configurations found.</TableCell></TableRow>
              ) : initialConfigs.map((api) => (
                <TableRow key={api.ConfigId}>
                  <TableCell className="font-semibold capitalize">{api.ApiType}</TableCell>
                  <TableCell className="font-mono text-xs max-w-sm truncate">{api.Endpoint}</TableCell>
                  <TableCell><Badge variant="secondary">{api.HttpMethod}</Badge></TableCell>
                  <TableCell className="text-sm">{api.TimeoutSeconds}s</TableCell>
                  <TableCell>
                    <Badge className={cn(api.Status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                      {api.Status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="Test API"><Play className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
