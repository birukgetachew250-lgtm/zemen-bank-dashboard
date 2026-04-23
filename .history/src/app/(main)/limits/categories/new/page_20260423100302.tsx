export const dynamic = 'force-dynamic';

import { CustomerCategoryFormClient } from '@/components/limits/CustomerCategoryFormClient';

export default function NewCustomerCategoryPage() {
  return (
    <div className="w-full h-full">
      <CustomerCategoryFormClient mode="create" />
    </div>
  );
}
