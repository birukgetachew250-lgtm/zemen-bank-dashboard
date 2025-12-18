
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Ban } from 'lucide-react';

export default function BlockCustomerSuccessPage() {
  const router = useRouter();

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="items-center">
            <div className="p-4 bg-red-100 rounded-full">
                <Ban className="h-12 w-12 text-red-600" />
            </div>
          <CardTitle className="font-headline text-2xl font-bold mt-4">
            Customer Blocked
          </CardTitle>
          <CardDescription>
            The customer's access has been successfully blocked.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex-col gap-4">
          <Button className="w-full" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push('/customers/block')}>
            Block Another Customer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
