"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function EthioTelecomTagsClient() {
  return (
    <CrudTable
      title="Ethio Telecom Tags"
      apiUrl="/api/app-control/ethio-telecom-tags"
      idField="Id"
      searchKeys={["TagName", "Description", "Status"]}
      columns={[
        { key: "TagName", label: "Tag Name" },
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
        { key: "TagName", label: "Tag Name", required: true },
        { key: "Description", label: "Description", type: "textarea" },
        { key: "ColorHex", label: "Color", type: "color" },
        { key: "IconName", label: "Icon Name" },
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
