"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function FlexCubeIntegrationsClient() {
  return (
    <CrudTable
      title="FlexCube Integrations"
      apiUrl="/api/app-control/flexcube-integrations"
      idField="Id"
      searchKeys={["UniqueKey", "IntegrationName", "BaseUrl"]}
      dialogClassName="max-w-3xl max-h-[85vh] overflow-y-auto"
      columns={[
        { key: "IntegrationName", label: "Name" },
        { key: "UniqueKey", label: "Key", render: (v: string) => <code className="text-xs bg-muted px-1 rounded">{v}</code> },
        { key: "BaseUrl", label: "Base URL", render: (v: string) => v ? (v.length > 35 ? v.slice(0, 35) + "..." : v) : "-" },
        { key: "IntegrationType", label: "Type", render: (v: string) => v ? <Badge variant="outline">{v}</Badge> : "-" },
        { key: "IsProduction", label: "Prod", render: (v: number) => v === 1 ? <Badge>Prod</Badge> : <Badge variant="secondary">Dev</Badge> },
        { key: "UseSSL", label: "SSL", render: (v: number) => v === 1 ? "Yes" : "No" },
        { key: "Status", label: "Status", render: (v: string) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v}</Badge> },
      ]}
      formFields={[
        { key: "UniqueKey", label: "Unique Key", required: true },
        { key: "IntegrationName", label: "Integration Name", required: true },
        { key: "BaseUrl", label: "Base URL", required: true },
        { key: "Username", label: "Username" },
        { key: "Password", label: "Password" },
        { key: "ApiKey", label: "API Key" },
        { key: "IntegrationType", label: "Integration Type", type: "select", options: [
          { value: "REST", label: "REST" }, { value: "SOAP", label: "SOAP" }, { value: "gRPC", label: "gRPC" },
        ]},
        { key: "TimeoutSeconds", label: "Timeout (s)", type: "number" },
        { key: "MaxRetryAttempts", label: "Max Retries", type: "number" },
        { key: "UseSSL", label: "Use SSL", type: "checkbox" },
        { key: "IsProduction", label: "Is Production", type: "checkbox" },
        { key: "Description", label: "Description", type: "textarea" },
        { key: "Status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
      ]}
      defaultValues={{ Status: "Active", IntegrationType: "REST", TimeoutSeconds: 30, MaxRetryAttempts: 3, UseSSL: true, IsProduction: false }}
    />
  );
}
