"use client";

import { useState, useEffect } from 'react';
import { CircleDollarSign, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { Skeleton } from '../ui/skeleton';

export function TransactionsSummary() {
  const [data, setData] = useState({ total: 0, successful: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');

  useEffect(() => {
    async function fetchTransactionData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/stats/transactions?range=${dateRange}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch transaction data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactionData();
  }, [dateRange]);

  return (
    <div className="space-y-4">
      <DateFilter value={dateRange} onChange={setDateRange} />
      <div className="grid gap-4 md:grid-cols-3">
        {loading ? (
          <>
            <TransactionCardSkeleton />
            <TransactionCardSkeleton />
            <TransactionCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <CircleDollarSign className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-headline">{data.total.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful Transactions</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-headline">{data.successful.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
                <XCircle className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-headline">{data.failed.toLocaleString()}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function TransactionCardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-5 w-5 rounded-full" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-2/5" />
            </CardContent>
        </Card>
    )
}
