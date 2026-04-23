'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface CustomerCategoryFormClientProps {
  mode: 'create' | 'edit';
  initialItem?: {
    id: string;
    code: string;
    name: string;
    description: string;
  };
}

export function CustomerCategoryFormClient({ mode, initialItem }: CustomerCategoryFormClientProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: initialItem?.code || '',
    name: initialItem?.name || '',
    description: initialItem?.description || '',
  });
  const { toast } = useToast();
  const router = useRouter();

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Code and name are required.',
      });
      return;
    }

    setIsSaving(true);

    try {
      const payload = mode === 'edit' ? { id: initialItem?.id, ...formData } : formData;
      const method = mode === 'edit' ? 'PUT' : 'POST';
      const res = await fetch('/api/limits/customer-categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to save category');
      }

      toast({ title: mode === 'edit' ? 'Category updated' : 'Category created' });
      router.push('/limits/categories');
      router.refresh();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Save failed' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{mode === 'edit' ? 'Edit Customer Category' : 'Add Customer Category'}</CardTitle>
          <CardDescription>Manage customer category details on a dedicated page.</CardDescription>
        </div>
        <Button variant="outline" asChild>
          <Link href="/limits/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Input
          placeholder="Category Code"
          value={formData.code}
          onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
        />
        <Input
          placeholder="Category Name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
        />
        <Input
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" asChild>
            <Link href="/limits/categories">Cancel</Link>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'edit' ? 'Update' : 'Create'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
