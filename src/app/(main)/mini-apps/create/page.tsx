
import { Suspense } from "react";
import { MiniAppForm } from "@/components/mini-apps/MiniAppForm";
import { Loader2 } from "lucide-react";
import { db } from "@/lib/db";

async function getMiniApp(id: string | undefined) {
    if (!id) return null;
    try {
        const miniApp = db.prepare("SELECT * FROM mini_apps WHERE id = ?").get(id);
        return miniApp;
    } catch (error) {
        console.error("Failed to fetch mini app:", error);
        return null;
    }
}

export default function CreateMiniAppPage({ searchParams }: { searchParams: { id?: string }}) {
  return (
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin" /></div>}>
        <MiniAppFormLoader id={searchParams.id} />
    </Suspense>
  )
}

async function MiniAppFormLoader({ id }: { id?: string}) {
    const miniApp = await getMiniApp(id);
    return <MiniAppForm miniApp={miniApp} />;
}
