"use client";

import CrudTable, { ColumnDef, FieldDef } from "@/components/app-control/CrudTable";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef[] = [
  { key: "SERVICE_NAME", label: "Service Name" },
  { key: "ENDPOINT_URL", label: "Endpoint URL" },
  {
    key: "IS_ACTIVE", label: "Active",
    render: (v: any) => (
      <Badge variant={v === 1 || v === true ? "default" : "secondary"}>
        {v === 1 || v === true ? "Active" : "Inactive"}
      </Badge>
    ),
  },
];

const formFields: FieldDef[] = [
  { key: "SERVICE_NAME", label: "Service Name", required: true, placeholder: "e.g. PaymentService" },
  { key: "ENDPOINT_URL", label: "Endpoint URL", required: true, placeholder: "https://api.example.com/endpoint" },
  {
    key: "HTTP_METHOD", label: "HTTP Method", type: "select", options: [
      { value: "POST", label: "POST" },
      { value: "GET", label: "GET" },
      { value: "PUT", label: "PUT" },
      { value: "DELETE", label: "DELETE" },
      { value: "PATCH", label: "PATCH" },
    ],
  },
  { key: "CONTENT_TYPE", label: "Content Type", placeholder: "application/json" },
  { key: "TIMEOUT_SECONDS", label: "Timeout (seconds)", type: "number" },
  { key: "IS_ACTIVE", label: "Active", type: "checkbox" },
  { key: "DESCRIPTION", label: "Description", type: "textarea", placeholder: "Optional description" },
  { key: "INSERT_USER", label: "Insert User", placeholder: "system" },
  { key: "UPDATE_USER", label: "Update User", placeholder: "system" },
];

export default function Wso2ConfigurationsClient() {
  return (
    <CrudTable
      title="WSO2 Configurations"
      apiUrl="/api/wso2/configurations"
      idField="ID"
      columns={columns}
      formFields={formFields}
      searchKeys={["SERVICE_NAME", "ENDPOINT_URL", "DESCRIPTION"]}
      defaultValues={{
        HTTP_METHOD: "POST",
        CONTENT_TYPE: "application/json",
        TIMEOUT_SECONDS: 30,
        IS_ACTIVE: true,
        INSERT_USER: "system",
        UPDATE_USER: "system",
      }}
    />
  );
}
