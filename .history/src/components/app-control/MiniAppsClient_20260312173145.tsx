"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function MiniAppsClient() {
  return (
    <CrudTable
      title="Mini Apps"
      apiUrl="/api/app-control/mini-apps"
      idField="Id"
      searchKeys={["Name", "UniqueName", "CategoryName", "Url"]}
      dialogClassName="max-w-3xl max-h-[85vh] overflow-y-auto"
      columns={[
        { key: "Name", label: "Name" },
        { key: "UniqueName", label: "Unique Name" },
        { key: "CategoryName", label: "Category", render: (v: string) => v || "-" },
        { key: "Url", label: "URL", render: (v: string) => v ? (v.length > 40 ? v.slice(0, 40) + "..." : v) : "-" },
        { key: "ThemeColor", label: "Theme", render: (v: string) => v ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border" style={{ backgroundColor: v }} />
            {v}
          </div>
        ) : "-" },
        { key: "Rank", label: "Rank" },
        { key: "Status", label: "Status", render: (v: string) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v}</Badge> },
      ]}
      formFields={[
        { key: "Name", label: "App Name", required: true },
        { key: "UniqueName", label: "Unique Name", required: true },
        { key: "Url", label: "URL", required: true },
        { key: "LogoUrl", label: "Logo URL" },
        { key: "CategoryId", label: "Category ID" },
        { key: "Username", label: "Username" },
        { key: "Password", label: "Password" },
        { key: "EncryptionKey", label: "Encryption Key" },
        { key: "HoldingAccount", label: "Holding Account" },
        { key: "ThemeColor", label: "Theme Color" },
        { key: "Description", label: "Description", type: "textarea" },
        { key: "RequiresCamera", label: "Requires Camera", type: "checkbox" },
        { key: "RequiresLocation", label: "Requires Location", type: "checkbox" },
        { key: "RequiresFileAccess", label: "Requires File Access", type: "checkbox" },
        { key: "Rank", label: "Rank", type: "number" },
        { key: "Status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
      ]}
      defaultValues={{ Status: "Active", Rank: 0, RequiresCamera: false, RequiresLocation: false, RequiresFileAccess: false }}
    />
  );
}
