"use client";

import CrudTable, { ColumnDef, FieldDef } from "@/components/app-control/CrudTable";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef[] = [
  { key: "CREDENTIAL_NAME", label: "Credential Name" },
  { key: "AUTH_URL", label: "Auth URL" },
  { key: "CLIENT_ID", label: "Client ID" },
  { key: "CLIENT_SECRET", label: "Client Secret", render: () => <span className="text-muted-foreground">••••••••</span> },
  { key: "GRANT_TYPE", label: "Grant Type", render: (v: any) => <Badge variant="outline">{v}</Badge> },
  { key: "SCOPE", label: "Scope" },
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
  { key: "CREDENTIAL_NAME", label: "Credential Name", required: true, placeholder: "e.g. ZemenBankOAuth" },
  { key: "AUTH_URL", label: "Auth URL", required: true, placeholder: "https://auth.example.com/token" },
  { key: "CLIENT_ID", label: "Client ID", required: true },
  { key: "CLIENT_SECRET", label: "Client Secret", required: true, placeholder: "Leave unchanged to keep current secret" },
  {
    key: "GRANT_TYPE", label: "Grant Type", type: "select", options: [
      { value: "client_credentials", label: "Client Credentials" },
      { value: "password", label: "Password" },
      { value: "authorization_code", label: "Authorization Code" },
      { value: "refresh_token", label: "Refresh Token" },
    ],
  },
  { key: "SCOPE", label: "Scope", placeholder: "e.g. openid profile" },
  { key: "IS_ACTIVE", label: "Active", type: "checkbox" },
  { key: "DESCRIPTION", label: "Description", type: "textarea", placeholder: "Optional description" },
  { key: "INSERT_USER", label: "Insert User", placeholder: "system" },
  { key: "UPDATE_USER", label: "Update User", placeholder: "system" },
];

export default function Wso2OauthCredentialsClient() {
  return (
    <CrudTable
      title="WSO2 OAuth Credentials"
      apiUrl="/api/wso2/oauth-credentials"
      idField="ID"
      columns={columns}
      formFields={formFields}
      searchKeys={["CREDENTIAL_NAME", "AUTH_URL", "CLIENT_ID"]}
      defaultValues={{
        GRANT_TYPE: "client_credentials",
        IS_ACTIVE: true,
        INSERT_USER: "system",
        UPDATE_USER: "system",
      }}
    />
  );
}
