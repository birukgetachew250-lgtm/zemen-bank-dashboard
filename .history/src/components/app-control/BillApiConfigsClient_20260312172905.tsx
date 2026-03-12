"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function BillApiConfigsClient() {
  return (
    <CrudTable
      title="Bill API Configs"
      apiUrl="/api/app-control/bill-api-configs"
      idField="ConfigId"
      searchKeys={["ProviderName", "ApiType", "Endpoint"]}
      dialogClassName="max-w-3xl max-h-[85vh] overflow-y-auto"
      columns={[
        { key: "ProviderName", label: "Provider", render: (v: string) => v || "-" },
        { key: "ApiType", label: "API Type", render: (v: string) => <Badge variant="outline">{v}</Badge> },
        { key: "DisplayName", label: "Name", render: (v: string) => v || "-" },
        { key: "HttpMethod", label: "Method", render: (v: string) => { const colors: Record<string,string> = { GET:"bg-blue-100 text-blue-800",POST:"bg-green-100 text-green-800",PUT:"bg-yellow-100 text-yellow-800",DELETE:"bg-red-100 text-red-800" }; return <Badge className={colors[v] || ""}>{v}</Badge>; }},
        { key: "Endpoint", label: "Endpoint", render: (v: string) => v ? (v.length > 40 ? v.slice(0, 40) + "..." : v) : "-" },
        { key: "TimeoutSeconds", label: "Timeout" },
        { key: "MockEnabled", label: "Mock", render: (v: number) => v === 1 ? <Badge variant="outline">Mock</Badge> : null },
        { key: "Status", label: "Status", render: (v: string) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v}</Badge> },
      ]}
      formFields={[
        { key: "ProviderId", label: "Provider ID", required: true },
        { key: "ApiType", label: "API Type", type: "select", required: true, options: [
          { value: "lookup", label: "Lookup" }, { value: "validate", label: "Validate" }, { value: "calculate_fee", label: "Calculate Fee" },
          { value: "payment", label: "Payment" }, { value: "status", label: "Status" }, { value: "cancel", label: "Cancel" }, { value: "refund", label: "Refund" },
        ]},
        { key: "DisplayName", label: "Display Name" },
        { key: "Endpoint", label: "Endpoint URL", required: true },
        { key: "HttpMethod", label: "HTTP Method", type: "select", required: true, options: [
          { value: "GET", label: "GET" }, { value: "POST", label: "POST" }, { value: "PUT", label: "PUT" }, { value: "DELETE", label: "DELETE" },
        ]},
        { key: "ContentType", label: "Content Type" },
        { key: "RequestHeaders", label: "Request Headers (JSON)", type: "textarea" },
        { key: "RequestBodyTemplate", label: "Request Body Template (JSON)", type: "textarea" },
        { key: "QueryParameters", label: "Query Parameters (JSON)", type: "textarea" },
        { key: "ResponseMapping", label: "Response Mapping (JSON)", type: "textarea" },
        { key: "SuccessStatusPath", label: "Success Status Path" },
        { key: "SuccessStatusValues", label: "Success Status Values" },
        { key: "ErrorMessagePath", label: "Error Message Path" },
        { key: "DefaultErrorMessage", label: "Default Error Message" },
        { key: "TimeoutSeconds", label: "Timeout (seconds)", type: "number" },
        { key: "RetryCount", label: "Retry Count", type: "number" },
        { key: "RetryDelayMs", label: "Retry Delay (ms)", type: "number" },
        { key: "ExecutionOrder", label: "Execution Order", type: "number" },
        { key: "MockResponse", label: "Mock Response (JSON)", type: "textarea" },
        { key: "CacheResponse", label: "Cache Response", type: "checkbox" },
        { key: "CacheDurationSeconds", label: "Cache Duration (s)", type: "number" },
        { key: "UseProxy", label: "Use Proxy", type: "checkbox" },
        { key: "EnableLogging", label: "Enable Logging", type: "checkbox" },
        { key: "MaskSensitiveData", label: "Mask Sensitive Data", type: "checkbox" },
        { key: "MockEnabled", label: "Mock Enabled", type: "checkbox" },
        { key: "Status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
      ]}
      defaultValues={{ Status: "Active", HttpMethod: "POST", ContentType: "application/json", TimeoutSeconds: 30, RetryCount: 0, RetryDelayMs: 1000, ExecutionOrder: 0, CacheResponse: false, UseProxy: false, EnableLogging: true, MaskSensitiveData: true, MockEnabled: false }}
    />
  );
}
