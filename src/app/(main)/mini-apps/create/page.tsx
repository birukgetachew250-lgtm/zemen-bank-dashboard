
import { Suspense } from "react";
import { MiniAppForm } from "@/components/mini-apps/MiniAppForm";
import { Loader2 } from "lucide-react";
import type { MiniApp } from "@/components/mini-apps/MiniAppManagementClient";
import crypto from 'crypto';

const mockMiniApps: MiniApp[] = [
    { 
        id: "mapp_mock_1", 
        name: "Cinema Ticket", 
        url: "https://cinema.example.com", 
        logo_url: "https://picsum.photos/seed/cinema/100/100", 
        username: "cinema_api", 
        password: "secure_password_1", 
        encryption_key: crypto.randomBytes(32).toString('hex') 
    },
    { 
        id: "mapp_mock_2", 
        name: "Event Booking", 
        url: "https://events.example.com", 
        logo_url: "https://picsum.photos/seed/events/100/100", 
        username: "event_api_user", 
        password: "secure_password_2", 
        encryption_key: crypto.randomBytes(32).toString('hex') 
    }
];

async function getMiniApp(id: string | undefined): Promise<MiniApp | null> {
    if (!id) return null;
    // Simulating an async operation and finding the app from mock data
    await new Promise(resolve => setTimeout(resolve, 100));
    const miniApp = mockMiniApps.find(app => app.id === id) || null;
    return miniApp;
}

export default function CreateMiniAppPage({ searchParams }: { searchParams: { id?: string }}) {
  return (
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <div className="w-full h-full">
        <MiniAppFormLoader id={searchParams.id} />
      </div>
    </Suspense>
  )
}

async function MiniAppFormLoader({ id }: { id?: string}) {
    const miniApp = await getMiniApp(id);
    // The password and key might be undefined in the type, but the form expects strings.
    // We ensure they are strings here. The form component can handle showing/hiding them.
    const initialData = miniApp ? {
        ...miniApp,
        password: miniApp.password || "",
        encryption_key: miniApp.encryption_key || ""
    } : null;
    return <MiniAppForm miniApp={initialData} />;
}
