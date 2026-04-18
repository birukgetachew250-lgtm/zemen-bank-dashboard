"use client";

import CrudTable, { ColumnDef, FieldDef } from "@/components/app-control/CrudTable";
import { Badge } from "@/components/ui/badge";

const columns: ColumnDef[] = [
  { key: "ServiceName", label: "Service Name" },
  { key: "DisplayName", label: "Display Name" },
  { key: "GLAccount", label: "GL Account" },
  { key: "BranchCode", label: "Branch" },
  { key: "Currency", label: "Currency" },
  { key: "ServiceCategory", label: "Category" },
  {
    key: "IsEnabled",
    label: "Enabled",
    render: (v: any) => (
      <Badge variant={v === 1 || v === true ? "default" : "secondary"}>
        {v === 1 || v === true ? "Enabled" : "Disabled"}
      </Badge>
    ),
  },
  {
    key: "Status",
    label: "Status",
    render: (v: any) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v || "-"}</Badge>,
  },
  { key: "Description", label: "Description" },
];

const formFields: FieldDef[] = [
  { key: "ServiceName", label: "Service Name", required: true, placeholder: "e.g. UtilityPayment" },
  { key: "DisplayName", label: "Display Name", required: true, placeholder: "e.g. Utility Payment Service" },
  { key: "GLAccount", label: "GL Account", required: true },
  { key: "BranchCode", label: "Branch Code", required: true },
  { key: "Currency", label: "Currency", required: true, placeholder: "ETB" },
  { key: "ServiceCategory", label: "Service Category", required: true, placeholder: "Payments" },
  { key: "IsEnabled", label: "Enabled", type: "checkbox" },
  {
    key: "Status",
    label: "Status",
    type: "select",
    options: [
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
      { value: "Pending", label: "Pending" },
      { value: "Blocked", label: "Blocked" },
    ],
  },
  { key: "ConfigParams", label: "Config Params", type: "textarea", placeholder: "JSON or key/value config" },
  { key: "Description", label: "Description", type: "textarea" },
  { key: "CreatedBy", label: "Created By", placeholder: "system" },
  { key: "UpdatedBy", label: "Updated By", placeholder: "system" },
];

export default function Wso2ThirdPartyServiceConfigClient() {
  return (
    <CrudTable
      title="Third-Party Service Configurations"
      apiUrl="/api/app-control/third-party-service-configs"
      idField="Id"
      columns={columns}
      formFields={formFields}
      searchKeys={["ServiceName", "DisplayName", "GLAccount", "BranchCode", "ServiceCategory"]}
      defaultValues={{
        IsEnabled: true,
        Status: "Active",
        CreatedBy: "system",
        UpdatedBy: "system",
      }}
      dialogClassName="max-w-3xl max-h-[85vh] overflow-y-auto"
    />
  );
}
