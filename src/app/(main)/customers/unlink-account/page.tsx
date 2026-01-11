
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Unlink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CustomerDetails } from '@/components/customers/CustomerDetailsCard';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function UnlinkAccountPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cifNumber, setCifNumber] = useState('');
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!cifNumber) {
      toast({ variant: 'destructive', title: 'CIF number required' });
      return;
    }
    setIsLoading(true);
    setCustomer(null);
    setAccounts([]);
    setSelectedAccount(null);
    try {
      const custRes = await fetch(`/api/customers/${cifNumber}`);
      if (!custRes.ok) throw new Error('Customer not found');
      const custData = await custRes.json();
      setCustomer(custData);

      const accRes = await fetch(`/api/customers/${custData.id}/accounts`);
      if (!accRes.ok) throw new Error('Could not fetch accounts');
      const accData = await accRes.json();
      setAccounts(accData);

    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Search Failed', description: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUnlinkRequest = async () => {
    if (!customer || !selectedAccount) return;
    setIsSubmitting(true);
    try {
        const response = await fetch('/api/approvals/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                cif: customer.cifNumber,
                type: 'unlink-account',
                customerName: customer.name, 
                customerPhone: customer.phoneNumber,
                details: { accountNumber: selectedAccount }
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Submission failed');
        }
        
        toast({
            title: 'Request Submitted',
            description: `Request to unlink account ${selectedAccount} has been sent for approval.`
        });
        
        setCustomer(null);
        setAccounts([]);
        setSelectedAccount(null);
        setCifNumber('');

    } catch (error: any) {
       toast({ variant: 'destructive', title: 'Submission Failed', description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Unlink Customer Account</CardTitle>
          <CardDescription>Search for a customer by CIF, then select an account to request unlinking.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full max-w-lg items-center space-x-2">
            <Input
              type="text"
              placeholder="Enter CIF Number..."
              value={cifNumber}
              onChange={(e) => setCifNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      )}

      {customer && (
        <Card className="animate-in fade-in-50">
          <CardHeader>
            <CardTitle>Select Account to Unlink for {customer.name}</CardTitle>
            <CardDescription>Choose one of the currently linked accounts below to submit an unlink request.</CardDescription>
          </CardHeader>
            <CardContent className="space-y-4">
              {accounts.length > 0 ? (
                <RadioGroup value={selectedAccount || ''} onValueChange={setSelectedAccount}>
                  <div className="space-y-2 rounded-md border p-4">
                    {accounts.map(acc => (
                      <div key={acc.accountNumber} className="flex items-center space-x-2">
                        <RadioGroupItem value={acc.accountNumber} id={acc.accountNumber} />
                        <Label htmlFor={acc.accountNumber} className="flex flex-col">
                           <span className="font-semibold">{acc.accountNumber}</span>
                           <span className="text-sm text-muted-foreground">{acc.accountType} - {acc.currency}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>No Accounts Found</AlertTitle>
                  <AlertDescription>No linked accounts were found for this customer.</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleUnlinkRequest} disabled={!selectedAccount || isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlink className="mr-2 h-4 w-4" />}
                Request Unlink
              </Button>
            </CardFooter>
        </Card>
      )}
    </div>
  );
}

