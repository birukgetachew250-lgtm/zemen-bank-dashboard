import FaqClient from '@/components/app-control/FaqClient';
import { requirePermission } from '@/lib/auth-utils';
import { PERMISSIONS } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export default async function FaqPage() {
  const session = await requirePermission(PERMISSIONS.APP_CONTROL_VIEW);
  if (!session) redirect('/login');

  return (
    <div className="p-6 h-full flex flex-col">
      <FaqClient />
    </div>
  );
}
