import { HelpCircle } from 'lucide-react';

export default function FaqPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">FAQ Management</h1>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">The FAQ management interface is currently under construction. Please check back later to manage your FAQ items.</p>
      </div>
    </div>
  );
}
