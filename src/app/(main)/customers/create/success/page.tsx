
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function CreateCustomerSuccessPage() {
  const router = useRouter();

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="items-center">
            <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          <CardTitle className="font-headline text-2xl font-bold mt-4">
            Submission Successful
          </CardTitle>
          <CardDescription>
            The new customer has been successfully submitted for approval. The approvals team will review the request shortly.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex-col gap-4">
          <Button className="w-full" onClick={() => router.push('/')}>
            Back to Dashboard
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push('/customers/create')}>
            Create Another Customer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
