"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function MiniAppCategoriesClient() {
  return (
    <CrudTable
      title="Mini App Categories"
      apiUrl="/api/app-control/mini-app-categories"
      idField="Id"
      searchKeys={["Name", "Description"]}
      columns={[
        { key: "Name", label: "Name" },
        { key: "IconName", label: "Icon" },
        { key: "ColorHex", label: "Color", render: (v: string) => v ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border" style={{ backgroundColor: v }} />
            {v}
          </div>
        ) : "-" },
        { key: "Description", label: "Description", render: (v: string) => v ? (v.length > 50 ? v.slice(0, 50) + "..." : v) : "-" },
        { key: "Rank", label: "Rank" },
        { key: "Status", label: "Status", render: (v: string) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v}</Badge> },
      ]}
      formFields={[
        { key: "Name", label: "Category Name", required: true },
        { key: "IconName", label: "Icon Name" },
        { key: "ColorHex", label: "Color (Hex)", type: "color" },
        { key: "Description", label: "Description", type: "textarea" },
        { key: "Rank", label: "Rank", type: "number" },
        { key: "Status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
      ]}
      defaultValues={{ Status: "Active", Rank: 0 }}
    />
  );
}
