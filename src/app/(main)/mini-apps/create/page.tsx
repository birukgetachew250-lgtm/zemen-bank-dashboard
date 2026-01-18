
import { Suspense } from "react";
import { MiniAppForm } from "@/components/mini-apps/MiniAppForm";
import { Loader2 } from "lucide-react";
import type { MiniApp } from "@/components/mini-apps/MiniAppManagementClient";
import { executeQuery } from "@/lib/oracle-db";

async function getMiniApp(id: string | undefined): Promise<MiniApp | null> {
    if (!id) return null;
    try {
        const query = `SELECT "Id", "Name", "Url", "LogoUrl", "Username" FROM "APP_CONTROL_MODULE"."MiniApp" WHERE "Id" = :id`;
        const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query, { id });

        if (!result.rows || result.rows.length === 0) return null;

        const app = result.rows[0];

        return {
            id: app.Id,
            name: app.Name,
            url: app.Url,
            logo_url: app.LogoUrl,
            username: app.Username
            // password and encryption_key are not fetched for edit view
        };
    } catch(e) {
        console.error(`Failed to fetch mini-app with id ${id}:`, e);
        return null;
    }
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
    const initialData = miniApp ? {
        ...miniApp,
        password: "", // Never pre-fill password
        encryption_key: "" // Never pre-fill key
    } : null;
    return <MiniAppForm miniApp={initialData} />;
}
