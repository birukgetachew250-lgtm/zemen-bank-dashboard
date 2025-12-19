import { MiniAppManagementClient } from "@/components/mini-apps/MiniAppManagementClient";
import type { MiniApp } from "@/components/mini-apps/MiniAppManagementClient";
import crypto from 'crypto';

const mockMiniApps: MiniApp[] = [
    { 
        id: `mapp_${crypto.randomUUID()}`, 
        name: "Cinema Ticket", 
        url: "https://cinema.example.com", 
        logo_url: "https://picsum.photos/seed/cinema/100/100", 
        username: "cinema_api", 
        password: "secure_password_1", 
        encryption_key: crypto.randomBytes(32).toString('hex') 
    },
    { 
        id: `mapp_${crypto.randomUUID()}`, 
        name: "Event Booking", 
        url: "https://events.example.com", 
        logo_url: "https://picsum.photos/seed/events/100/100", 
        username: "event_api_user", 
        password: "secure_password_2", 
        encryption_key: crypto.randomBytes(32).toString('hex') 
    }
];

function getMiniApps(): MiniApp[] {
  // Returning mock data directly
  return mockMiniApps;
}

export default function MiniAppsPage() {
  const miniApps = getMiniApps();

  return (
    <div className="w-full h-full">
      <MiniAppManagementClient initialMiniApps={miniApps} />
    </div>
  );
}
