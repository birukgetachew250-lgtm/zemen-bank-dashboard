"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function BillProvidersClient() {
  return (
    <CrudTable
      title="Bill Providers"
      apiUrl="/api/app-control/bill-providers"
      idField="ProviderId"
      searchKeys={["ProviderName", "ProviderCode", "CategoryName", "SubcategoryName"]}
      columns={[
        { key: "ProviderName", label: "Provider" },
        { key: "ProviderCode", label: "Code" },
        { key: "CategoryName", label: "Category" },
        { key: "SubcategoryName", label: "Subcategory", render: (v: string) => v || "-" },
        { key: "HoldingAccountId", label: "Holding Acct" },
        { key: "PageTemplate", label: "Template" },
        { key: "Status", label: "Status", render: (v: string) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v}</Badge> },
      ]}
      formFields={[
        { key: "ProviderName", label: "Provider Name", required: true },
        { key: "ProviderCode", label: "Provider Code", required: true },
        { key: "CategoryId", label: "Category ID", required: true },
        { key: "SubcategoryId", label: "Subcategory ID" },
        { key: "HoldingAccountId", label: "Holding Account", required: true },
        { key: "ApiEndpoint", label: "API Endpoint" },
        { key: "Description", label: "Description", type: "textarea" },
        { key: "LogoUrl", label: "Logo URL" },
        { key: "IconUrl", label: "Icon URL" },
        { key: "PrimaryColor", label: "Primary Color", placeholder: "#FF5733" },
        { key: "SecondaryColor", label: "Secondary Color", placeholder: "#C70039" },
        { key: "PageTemplate", label: "Page Template", type: "number" },
        { key: "MinAmount", label: "Min Amount", type: "number" },
        { key: "MaxAmount", label: "Max Amount", type: "number" },
        { key: "ServiceChargePercent", label: "Service Charge %", type: "number" },
        { key: "ServiceChargeFixed", label: "Service Charge Fixed", type: "number" },
        { key: "Rank", label: "Rank", type: "number" },
        { key: "Status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
      ]}
      defaultValues={{ Status: "Active", Rank: 0, PageTemplate: 1 }}
    />
  );
}
