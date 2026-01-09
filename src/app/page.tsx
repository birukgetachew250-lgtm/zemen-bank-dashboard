
import { redirect } from 'next/navigation';

export default function RootPage() {
  // The root page should redirect to the main dashboard.
  // The layout for the dashboard will handle authentication.
  redirect('/dashboard');
}
