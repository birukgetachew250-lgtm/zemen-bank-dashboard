
import { Suspense } from "react";
import { MiniAppForm } from "@/components/mini-apps/MiniAppForm";
import { Loader2 } from "lucide-react";
import type { MiniApp } from "@/components/mini-apps/MiniAppManagementClient";
import { db } from "@/lib/db";
import config from "@/lib/config";

async function getMiniApp(id: string | undefined): Promise<MiniApp | null> {
    if (!id) return null;
    try {
        let app;
        if (config.db.isProduction) {
            app = await db.prepare('SELECT * FROM "USER_MODULE"."mini_apps" WHERE "id" = :1').get(id);
        } else {
            app = db.prepare('SELECT * FROM mini_apps WHERE id = ?').get(id);
        }
        return app as MiniApp | null;
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
    // The password and key might be undefined in the type, but the form expects strings.
    // We ensure they are strings here. The form component can handle showing/hiding them.
    const initialData = miniApp ? {
        ...miniApp,
        password: miniApp.password || "",
        encryption_key: miniApp.encryption_key || ""
    } : null;
    return <MiniAppForm miniApp={initialData} />;
}
