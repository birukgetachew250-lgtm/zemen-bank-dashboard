export const dynamic = 'force-dynamic';

import { TransactionTypeFormClient } from '@/components/limits/TransactionTypeFormClient';

export default function NewTransactionTypePage() {
  return (
    <div className="w-full h-full">
      <TransactionTypeFormClient mode="create" />
    </div>
  );
}
