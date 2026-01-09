
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function UnblockCustomerSuccessPage() {
  const router = useRouter();

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="items-center">
            <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          <CardTitle className="font-headline text-2xl font-bold mt-4">
            Request Submitted
          </CardTitle>
          <CardDescription>
            The request to unsuspend the customer has been sent for approval.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex-col gap-4">
          <Button className="w-full" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push('/customers/unblock')}>
            Unsuspend Another Customer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
