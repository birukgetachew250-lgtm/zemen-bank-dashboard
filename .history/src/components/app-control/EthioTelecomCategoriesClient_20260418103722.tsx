"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function EthioTelecomCategoriesClient() {
  return (
    <CrudTable
      title="Ethio Telecom Categories"
      apiUrl="/api/app-control/ethio-telecom-categories"
      idField="Id"
      searchKeys={["CategoryName", "Description", "Status"]}
      columns={[
        { key: "CategoryName", label: "Category Name" },
        {
          key: "Description",
          label: "Description",
          render: (v: string) => (v ? (v.length > 60 ? `${v.slice(0, 60)}...` : v) : "-"),
        },
        {
          key: "ColorHex",
          label: "Color",
          render: (v: string) =>
            v ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border" style={{ backgroundColor: v }} />
                {v}
              </div>
            ) : (
              "-"
            ),
        },
        { key: "Rank", label: "Rank" },
        {
          key: "Status",
          label: "Status",
          render: (v: string) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v}</Badge>,
        },
      ]}
      formFields={[
        { key: "CategoryName", label: "Category Name", required: true },
        { key: "Description", label: "Description", type: "textarea" },
        { key: "IconUrl", label: "Icon URL" },
        { key: "ColorHex", label: "Color", type: "color" },
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
      defaultValues={{ Status: "Active", Rank: 0 }}
    />
  );
}
