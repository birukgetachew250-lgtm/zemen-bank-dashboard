"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function FeeCategoriesClient() {
  return (
    <CrudTable
      title="Fee Categories"
      apiUrl="/api/app-control/fee-categories"
      idField="CategoryId"
      searchKeys={["CategoryName", "CategoryCode", "Description"]}
      columns={[
        { key: "CategoryName", label: "Name" },
        { key: "CategoryCode", label: "Code", render: (v: string) => <code className="text-xs bg-muted px-1 rounded">{v}</code> },
        { key: "Description", label: "Description", render: (v: string) => v ? (v.length > 50 ? v.slice(0, 50) + "..." : v) : "-" },
        { key: "ColorHex", label: "Color", render: (v: string) => v ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border" style={{ backgroundColor: v }} />
            {v}
          </div>
        ) : "-" },
        { key: "Rank", label: "Rank" },
        { key: "Status", label: "Status", render: (v: string) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v}</Badge> },
      ]}
      formFields={[
        { key: "CategoryName", label: "Category Name", required: true },
        { key: "CategoryCode", label: "Category Code", required: true },
        { key: "Description", label: "Description", type: "textarea" },
        { key: "IconUrl", label: "Icon URL" },
        { key: "ColorHex", label: "Color (Hex)" },
        { key: "Rank", label: "Rank", type: "number" },
        { key: "Status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
      ]}
      defaultValues={{ Status: "Active", Rank: 0 }}
    />
  );
}
