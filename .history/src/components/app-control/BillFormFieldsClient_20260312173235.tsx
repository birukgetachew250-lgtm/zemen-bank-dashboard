"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function BillFormFieldsClient() {
  return (
    <CrudTable
      title="Bill Form Fields (SDUI)"
      apiUrl="/api/app-control/bill-form-fields"
      idField="FieldId"
      searchKeys={["FieldKey", "Label", "ProviderName"]}
      dialogClassName="max-w-3xl max-h-[85vh] overflow-y-auto"
      columns={[
        { key: "ProviderName", label: "Provider", render: (v: string) => v || "-" },
        { key: "FieldKey", label: "Field Key" },
        { key: "Label", label: "Label" },
        { key: "FieldType", label: "Type", render: (v: string) => <Badge variant="outline">{v}</Badge> },
        { key: "StepNumber", label: "Step" },
        { key: "FieldOrder", label: "Order" },
        { key: "IsRequired", label: "Required", render: (v: number) => v === 1 ? <Badge>Yes</Badge> : <Badge variant="secondary">No</Badge> },
        { key: "Status", label: "Status", render: (v: string) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v}</Badge> },
      ]}
      formFields={[
        { key: "ProviderId", label: "Provider ID", required: true },
        { key: "FieldKey", label: "Field Key", required: true, placeholder: "e.g. account_number" },
        { key: "Label", label: "Label", required: true },
        { key: "FieldType", label: "Field Type", type: "select", options: [
          { value: "text", label: "Text" }, { value: "number", label: "Number" }, { value: "phone", label: "Phone" },
          { value: "email", label: "Email" }, { value: "select", label: "Select" }, { value: "radio", label: "Radio" },
          { value: "checkbox", label: "Checkbox" }, { value: "date", label: "Date" }, { value: "textarea", label: "Textarea" },
          { value: "amount", label: "Amount" }, { value: "pin", label: "PIN" }, { value: "otp", label: "OTP" },
          { value: "file", label: "File" }, { value: "toggle", label: "Toggle" },
        ]},
        { key: "Placeholder", label: "Placeholder" },
        { key: "HelperText", label: "Helper Text" },
        { key: "KeyboardType", label: "Keyboard Type", type: "select", options: [
          { value: "default", label: "Default" }, { value: "numeric", label: "Numeric" }, { value: "phone-pad", label: "Phone Pad" }, { value: "email-address", label: "Email" },
        ]},
        { key: "IconName", label: "Icon Name" },
        { key: "StepNumber", label: "Step Number", type: "number" },
        { key: "FieldOrder", label: "Field Order", type: "number" },
        { key: "FieldGroup", label: "Field Group" },
        { key: "DefaultValue", label: "Default Value" },
        { key: "ValidationPattern", label: "Validation Pattern (Regex)" },
        { key: "ValidationMessage", label: "Validation Message" },
        { key: "MinLength", label: "Min Length", type: "number" },
        { key: "MaxLength", label: "Max Length", type: "number" },
        { key: "MinValue", label: "Min Value", type: "number" },
        { key: "MaxValue", label: "Max Value", type: "number" },
        { key: "Options", label: "Options (JSON)", type: "textarea", placeholder: '[{"value":"a","label":"Option A"}]' },
        { key: "VisibilityCondition", label: "Visibility Condition (JSON)", type: "textarea" },
        { key: "LookupEndpoint", label: "Lookup Endpoint" },
        { key: "IsRequired", label: "Required", type: "checkbox" },
        { key: "IsReadOnly", label: "Read Only", type: "checkbox" },
        { key: "IsHidden", label: "Hidden", type: "checkbox" },
        { key: "IsMasked", label: "Masked", type: "checkbox" },
        { key: "TriggerLookup", label: "Trigger Lookup", type: "checkbox" },
        { key: "Status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
      ]}
      defaultValues={{ Status: "Active", FieldType: "text", StepNumber: 1, FieldOrder: 0, IsRequired: false, IsReadOnly: false, IsHidden: false, IsMasked: false, TriggerLookup: false }}
    />
  );
}
