
import { MiniAppManagementClient } from "@/components/mini-apps/MiniAppManagementClient";
import type { MiniApp } from "@/components/mini-apps/MiniAppManagementClient";
import { executeQuery } from "@/lib/oracle-db";

async function getMiniApps(): Promise<MiniApp[]> {
  try {
    const query = `SELECT "Id", "Name", "Url", "LogoUrl", "Username" FROM "APP_CONTROL_MODULE"."MiniApp" ORDER BY "Name" ASC`;
    const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query);

    if (!result.rows) {
      return [];
    }

    return result.rows.map((row: any) => ({
      id: row.Id,
      name: row.Name,
      url: row.Url,
      logo_url: row.LogoUrl,
      username: row.Username
      // password and encryption_key are intentionally omitted for security
    }));
  } catch (e) {
    console.error("Failed to fetch mini-apps from DB:", e);
    return [];
  }
}

export default async function MiniAppsPage() {
  const miniApps = await getMiniApps();

  return (
    <div className="w-full h-full">
      <MiniAppManagementClient initialMiniApps={miniApps} />
    </div>
  );
}
