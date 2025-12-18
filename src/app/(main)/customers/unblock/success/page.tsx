
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function UnblockCustomerSuccessPage() {
  const router = useRouter();

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="items-center">
            <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          <CardTitle className="font-headline text-2xl font-bold mt-4">
            Customer Unblocked
          </CardTitle>
          <CardDescription>
            The customer's access has been successfully restored.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex-col gap-4">
          <Button className="w-full" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push('/customers/unblock')}>
            Unblock Another Customer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
