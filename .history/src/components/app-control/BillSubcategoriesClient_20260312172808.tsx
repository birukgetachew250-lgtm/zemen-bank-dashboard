"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function BillSubcategoriesClient() {
  return (
    <CrudTable
      title="Bill Subcategories"
      apiUrl="/api/app-control/bill-subcategories"
      idField="SubcategoryId"
      searchKeys={["SubcategoryName", "CategoryName", "HoldingAccountId"]}
      columns={[
        { key: "SubcategoryName", label: "Name" },
        { key: "CategoryName", label: "Category" },
        { key: "HoldingAccountId", label: "Holding Account" },
        { key: "IsMiniApp", label: "Mini App", render: (v: number) => v === 1 ? <Badge>Yes</Badge> : <Badge variant="secondary">No</Badge> },
        { key: "IsBillable", label: "Billable", render: (v: number) => v === 1 ? <Badge>Yes</Badge> : <Badge variant="secondary">No</Badge> },
        { key: "Status", label: "Status", render: (v: string) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v}</Badge> },
      ]}
      formFields={[
        { key: "CategoryId", label: "Category ID", required: true, placeholder: "UUID of parent category" },
        { key: "SubcategoryName", label: "Subcategory Name", required: true },
        { key: "HoldingAccountId", label: "Holding Account", required: true },
        { key: "Description", label: "Description", type: "textarea" },
        { key: "WebUrl", label: "Web URL" },
        { key: "ApiEndpoint", label: "API Endpoint" },
        { key: "LogoUrl", label: "Logo URL" },
        { key: "IconUrl", label: "Icon URL" },
        { key: "PageTemplate", label: "Page Template", type: "number" },
        { key: "Rank", label: "Rank", type: "number" },
        { key: "IsMiniApp", label: "Is Mini App", type: "checkbox" },
        { key: "IsBillable", label: "Is Billable", type: "checkbox" },
        { key: "Status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
      ]}
      defaultValues={{ Status: "Active", Rank: 0, IsMiniApp: false, IsBillable: false }}
    />
  );
}
