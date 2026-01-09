
import { MiniAppManagementClient } from "@/components/mini-apps/MiniAppManagementClient";
import type { MiniApp } from "@/components/mini-apps/MiniAppManagementClient";
import crypto from 'crypto';
import { db } from "@/lib/db";
import config from "@/lib/config";

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

async function getMiniApps(): Promise<MiniApp[]> {
  try {
    let data;
    if (config.db.isProduction) {
        data = await db.prepare('SELECT * FROM "USER_MODULE"."mini_apps" ORDER BY "name" ASC').all();
    } else {
        data = db.prepare("SELECT * FROM mini_apps ORDER BY name ASC").all();
    }
    return data as MiniApp[];
  } catch (e) {
    console.error("Failed to fetch mini-apps from DB:", e);
    return [];
  }
}

export default async function MiniAppsPage() {
  const miniAppsData = await getMiniApps();
  const miniApps = miniAppsData.length > 0 ? miniAppsData : mockMiniApps;

  return (
    <div className="w-full h-full">
      <MiniAppManagementClient initialMiniApps={miniApps} />
    </div>
  );
}
