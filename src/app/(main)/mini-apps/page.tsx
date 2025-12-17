
import { db } from "@/lib/db";
import { MiniAppManagementClient } from "@/components/mini-apps/MiniAppManagementClient";
import type { MiniApp } from "@/components/mini-apps/MiniAppManagementClient";

function getMiniApps() {
  try {
    return db.prepare("SELECT * FROM mini_apps ORDER BY name ASC").all() as MiniApp[];
  } catch (e) {
    console.error("Failed to fetch mini apps:", e);
    return [];
  }
}

export default function MiniAppsPage() {
  const miniApps = getMiniApps();

  return (
    <div className="w-full h-full">
      <MiniAppManagementClient initialMiniApps={miniApps} />
    </div>
  );
}
