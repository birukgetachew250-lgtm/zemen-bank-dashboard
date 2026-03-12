"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function TermsConditionsClient() {
  return (
    <CrudTable
      title="Terms & Conditions"
      apiUrl="/api/app-control/terms-conditions"
      idField="TermId"
      searchKeys={["SectionCode", "SectionHeader", "SectionSummary"]}
      dialogClassName="max-w-3xl max-h-[85vh] overflow-y-auto"
      columns={[
        { key: "SectionCode", label: "Code", render: (v: string) => <code className="text-xs bg-muted px-1 rounded">{v}</code> },
        { key: "SectionHeader", label: "Header" },
        { key: "SectionSummary", label: "Summary", render: (v: string) => v ? (v.length > 60 ? v.slice(0, 60) + "..." : v) : "-" },
        { key: "Version", label: "Version" },
        { key: "RequiresAcceptance", label: "Requires Accept", render: (v: number) => v === 1 ? "Yes" : "No" },
        { key: "DisplayOrder", label: "Order" },
        { key: "Status", label: "Status", render: (v: string) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v}</Badge> },
      ]}
      formFields={[
        { key: "SectionCode", label: "Section Code", required: true },
        { key: "SectionHeader", label: "Section Header", required: true },
        { key: "SectionSummary", label: "Section Summary", type: "textarea" },
        { key: "SectionContent", label: "Section Content", type: "textarea" },
        { key: "IconName", label: "Icon Name" },
        { key: "DisplayOrder", label: "Display Order", type: "number" },
        { key: "Version", label: "Version" },
        { key: "RequiresAcceptance", label: "Requires Acceptance", type: "checkbox" },
        { key: "EffectiveDate", label: "Effective Date" },
        { key: "Status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }, { value: "Draft", label: "Draft" }] },
      ]}
      defaultValues={{ Status: "Active", DisplayOrder: 0, Version: "1.0", RequiresAcceptance: true }}
    />
  );
}
