"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function BillDisplayFieldsClient() {
  return (
    <CrudTable
      title="Bill Display Fields"
      apiUrl="/api/app-control/bill-display-fields"
      idField="DisplayFieldId"
      searchKeys={["ProviderName", "ScreenType", "SourceField", "Label"]}
      columns={[
        { key: "ProviderName", label: "Provider", render: (v: string) => v || "-" },
        { key: "ScreenType", label: "Screen Type", render: (v: string) => <Badge variant="outline">{v}</Badge> },
        { key: "SourceField", label: "Source Field" },
        { key: "Label", label: "Label" },
        { key: "ValueFormat", label: "Format", render: (v: string) => v || "-" },
        { key: "DisplayOrder", label: "Order" },
        { key: "IsHighlighted", label: "Highlighted", render: (v: number) => v === 1 ? "Yes" : "No" },
        { key: "Copyable", label: "Copyable", render: (v: number) => v === 1 ? "Yes" : "No" },
        { key: "Status", label: "Status", render: (v: string) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v}</Badge> },
      ]}
      formFields={[
        { key: "ProviderId", label: "Provider ID", required: true },
        { key: "ScreenType", label: "Screen Type", type: "select", required: true, options: [
          { value: "confirmation", label: "Confirmation" }, { value: "receipt", label: "Receipt" }, { value: "summary", label: "Summary" },
          { value: "detail", label: "Detail" }, { value: "list", label: "List" },
        ]},
        { key: "SourceField", label: "Source Field", required: true },
        { key: "Label", label: "Label", required: true },
        { key: "ValueFormat", label: "Value Format", type: "select", options: [
          { value: "text", label: "Text" }, { value: "currency", label: "Currency" }, { value: "date", label: "Date" },
          { value: "datetime", label: "DateTime" }, { value: "number", label: "Number" }, { value: "phone", label: "Phone" },
          { value: "masked_account", label: "Masked Account" },
        ]},
        { key: "FormatString", label: "Format String" },
        { key: "DisplayOrder", label: "Display Order", type: "number", required: true },
        { key: "GroupName", label: "Group Name" },
        { key: "TextStyle", label: "Text Style", type: "select", options: [
          { value: "normal", label: "Normal" }, { value: "bold", label: "Bold" }, { value: "italic", label: "Italic" },
          { value: "muted", label: "Muted" }, { value: "accent", label: "Accent" },
        ]},
        { key: "TextSize", label: "Text Size", type: "select", options: [
          { value: "xs", label: "XS" }, { value: "sm", label: "SM" }, { value: "md", label: "MD" },
          { value: "lg", label: "LG" }, { value: "xl", label: "XL" },
        ]},
        { key: "TextColor", label: "Text Color" },
        { key: "IconName", label: "Icon Name" },
        { key: "Prefix", label: "Prefix" },
        { key: "Suffix", label: "Suffix" },
        { key: "DefaultValue", label: "Default Value" },
        { key: "VisibilityCondition", label: "Visibility Condition" },
        { key: "IsHighlighted", label: "Highlighted", type: "checkbox" },
        { key: "Copyable", label: "Copyable", type: "checkbox" },
        { key: "Status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
      ]}
      defaultValues={{ Status: "Active", DisplayOrder: 0, ValueFormat: "text", TextStyle: "normal", TextSize: "md", IsHighlighted: false, Copyable: false }}
    />
  );
}
