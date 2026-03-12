"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function BillCategoriesClient() {
  return (
    <CrudTable
      title="Bill Categories"
      apiUrl="/api/app-control/bill-categories"
      idField="CategoryId"
      searchKeys={["CategoryName", "Description"]}
      columns={[
        { key: "CategoryName", label: "Name" },
        { key: "Description", label: "Description", render: (v: string) => v ? (v.length > 60 ? v.slice(0, 60) + "..." : v) : "-" },
        { key: "ColorHex", label: "Color", render: (v: string) => v ? <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{ backgroundColor: v }} />{v}</div> : "-" },
        { key: "Rank", label: "Rank" },
        { key: "Status", label: "Status", render: (v: string) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v}</Badge> },
      ]}
      formFields={[
        { key: "CategoryName", label: "Category Name", required: true },
        { key: "Description", label: "Description", type: "textarea" },
        { key: "LogoUrl", label: "Logo URL", placeholder: "https://..." },
        { key: "IconUrl", label: "Icon URL", placeholder: "https://..." },
        { key: "ColorHex", label: "Color Hex", placeholder: "#FF5733" },
        { key: "Rank", label: "Rank", type: "number" },
        { key: "Status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
      ]}
      defaultValues={{ Status: "Active", Rank: 0 }}
    />
  );
}
