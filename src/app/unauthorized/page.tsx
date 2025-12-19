
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
            <div className="p-4 bg-yellow-100 rounded-full">
                <ShieldAlert className="h-12 w-12 text-yellow-600" />
            </div>
          <CardTitle className="font-headline text-2xl font-bold mt-4">
            Access Denied
          </CardTitle>
          <CardDescription>
            You do not have the necessary permissions to view this page. Please contact your administrator if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex-col gap-4">
          <Button className="w-full" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
           <Button variant="outline" className="w-full" onClick={() => router.back()}>
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
