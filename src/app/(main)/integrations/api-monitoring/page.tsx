
import { ApiMonitoringClient } from "@/components/integrations/ApiMonitoringClient";
import { executeQuery } from "@/lib/oracle-db";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import type { Integration } from "@/components/integrations/ApiMonitoringClient";

async function getIntegrations(): Promise<Integration[]> {
    try {
        const query = `SELECT "Id", "Name", "Service", "EndpointUrl", "Status", "IsProduction" FROM "APP_CONTROL_MODULE"."Integration" ORDER BY "Service" ASC`;
        const result: any = await executeQuery(process.env.APP_CONTROL_DB_CONNECTION_STRING, query);
        
        if (!result.rows) {
            return [
                { id: 1, name: 'Main WSO2 Gateway', service: 'WSO2', endpointUrl: 'https://wso2.zemenbank.com:8243/services', status: 'Connected', isProduction: false },
                { id: 2, name: 'Flexcube Core Service', service: 'Flexcube', endpointUrl: '192.168.1.10:9090', status: 'Connected', isProduction: false },
                { id: 3, name: 'Primary SMS Provider', service: 'SMS', endpointUrl: 'https://sms.provider.com/api', status: 'Disconnected', isProduction: false },
            ];
        }

        const integrationsForClient = result.rows.map((int: any) => ({
            id: int.Id,
            name: int.Name,
            service: int.Service,
            endpointUrl: int.EndpointUrl,
            status: int.Status,
            isProduction: int.IsProduction === 1,
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
