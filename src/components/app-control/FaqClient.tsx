"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function FaqClient() {
  return (
    <CrudTable
      title="Frequently Asked Questions"
      apiUrl="/api/app-control/faq"
      idField="FaqId"
      searchKeys={["QuestionCode", "Category", "Question", "Answer"]}
      dialogClassName="max-w-3xl max-h-[85vh] overflow-y-auto"
      columns={[
        { key: "QuestionCode", label: "Code", render: (v: string) => <code className="text-xs bg-muted px-1 rounded">{v}</code> },
        { key: "Category", label: "Category" },
        { key: "Question", label: "Question", render: (v: string) => v ? (v.length > 50 ? v.slice(0, 50) + "..." : v) : "-" },
        { key: "DisplayOrder", label: "Order" },
        { key: "Status", label: "Status", render: (v: string) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v}</Badge> },
      ]}
      formFields={[
        { key: "QuestionCode", label: "Question Code", required: true },
        { key: "Category", label: "Category" },
        { key: "Question", label: "Question", type: "textarea", required: true },
        { key: "Answer", label: "Answer", type: "textarea", required: true },
        { key: "IconName", label: "Icon Name" },
        { key: "DisplayOrder", label: "Display Order", type: "number" },
        { key: "Status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }, { value: "Draft", label: "Draft" }] },
      ]}
      defaultValues={{ Status: "Active", DisplayOrder: 0 }}
    />
  );
}
