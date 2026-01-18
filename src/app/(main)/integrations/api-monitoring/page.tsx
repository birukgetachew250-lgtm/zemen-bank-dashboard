
import { ApiMonitoringClient } from "@/components/integrations/ApiMonitoringClient";
import { db } from "@/lib/db";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import type { Integration } from "@/components/integrations/ApiMonitoringClient";

async function getIntegrations(): Promise<Integration[]> {
    try {
        const integrations = await db.integration.findMany({
            orderBy: { service: 'asc' }
        });
        
        // Map to the type expected by the client component, omitting sensitive data
        const integrationsForClient = integrations.map(int => ({
            id: int.id,
            name: int.name,
            service: int.service as 'WSO2' | 'Flexcube' | 'SMS',
            endpointUrl: int.endpointUrl,
            status: int.status as 'Connected' | 'Disconnected',
            isProduction: int.isProduction,
        }));
        return integrationsForClient;
    } catch (e) {
        console.error("Failed to fetch integrations for monitoring:", e);
        // Return a default set if the database fails, ensuring the page can still render.
        return [
            { id: 1, name: 'Main WSO2 Gateway', service: 'WSO2', endpointUrl: 'https://wso2.zemenbank.com:8243/services', status: 'Connected', isProduction: false },
            { id: 2, name: 'Flexcube Core Service', service: 'Flexcube', endpointUrl: '192.168.1.10:9090', status: 'Connected', isProduction: false },
            { id: 3, name: 'Primary SMS Provider', service: 'SMS', endpointUrl: 'https://sms.provider.com/api', status: 'Disconnected', isProduction: false },
        ];
    }
}


export default async function ApiMonitoringPage() {
  const integrations = await getIntegrations();
  return (
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin" /></div>}>
        <ApiMonitoringClient initialIntegrations={integrations} />
    </Suspense>
  );
}
