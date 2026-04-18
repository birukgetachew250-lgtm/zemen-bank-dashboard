"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function EthioTelecomPackagesClient() {
  return (
    <CrudTable
      title="Ethio Telecom Packages"
      apiUrl="/api/app-control/ethio-telecom-packages"
      idField="Id"
      searchKeys={["PackageName", "PackageCode", "CategoryId", "Status"]}
      columns={[
        { key: "PackageName", label: "Package Name" },
        { key: "PackageCode", label: "Code" },
        { key: "CategoryId", label: "Category Id" },
        {
          key: "Price",
          label: "Price",
          render: (v: number) => (v !== null && v !== undefined ? Number(v).toFixed(2) : "0.00"),
        },
        {
          key: "IsFeatured",
          label: "Featured",
          render: (v: number) => <Badge variant={Number(v) === 1 ? "default" : "secondary"}>{Number(v) === 1 ? "Yes" : "No"}</Badge>,
        },
        {
          key: "IsAvailable",
          label: "Available",
          render: (v: number) => <Badge variant={Number(v) === 1 ? "default" : "secondary"}>{Number(v) === 1 ? "Yes" : "No"}</Badge>,
        },
        { key: "Rank", label: "Rank" },
        {
          key: "Status",
          label: "Status",
          render: (v: string) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v}</Badge>,
        },
      ]}
      formFields={[
        { key: "PackageCode", label: "Package Code", required: true },
        { key: "PackageName", label: "Package Name", required: true },
        { key: "Description", label: "Description", type: "textarea" },
        { key: "Price", label: "Price", type: "number", required: true },
        { key: "DataAmount", label: "Data Amount" },
        { key: "VoiceMinutes", label: "Voice Minutes" },
        { key: "SmsCount", label: "SMS Count" },
        { key: "Validity", label: "Validity" },
        { key: "Bonus", label: "Bonus" },
        { key: "UssdCode", label: "USSD Code" },
        { key: "CategoryId", label: "Category Id", required: true },
        { key: "TagId", label: "Tag Id" },
        { key: "IconUrl", label: "Icon URL" },
        { key: "IsFeatured", label: "Featured", type: "checkbox" },
        { key: "IsAvailable", label: "Available", type: "checkbox" },
        { key: "Rank", label: "Rank", type: "number" },
        {
          key: "Status",
          label: "Status",
          type: "select",
          options: [
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
          ],
        },
      ]}
      defaultValues={{ Status: "Active", Rank: 0, IsFeatured: false, IsAvailable: true }}
      dialogClassName="max-w-4xl max-h-[90vh] overflow-y-auto"
    />
  );
}
