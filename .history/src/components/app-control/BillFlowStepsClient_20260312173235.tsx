"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function BillFlowStepsClient() {
  return (
    <CrudTable
      title="Bill Flow Steps (SDUI)"
      apiUrl="/api/app-control/bill-flow-steps"
      idField="StepId"
      searchKeys={["Title", "ProviderName", "StepType"]}
      dialogClassName="max-w-3xl max-h-[85vh] overflow-y-auto"
      columns={[
        { key: "ProviderName", label: "Provider", render: (v: string) => v || "-" },
        { key: "StepOrder", label: "Order" },
        { key: "StepType", label: "Type", render: (v: string) => <Badge variant="outline">{v}</Badge> },
        { key: "Title", label: "Title" },
        { key: "PrimaryButtonText", label: "Button" },
        { key: "RequiresAuth", label: "Auth", render: (v: number) => v === 1 ? <Badge>Yes</Badge> : <Badge variant="secondary">No</Badge> },
        { key: "Layout", label: "Layout" },
        { key: "Status", label: "Status", render: (v: string) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v}</Badge> },
      ]}
      formFields={[
        { key: "ProviderId", label: "Provider ID", required: true },
        { key: "StepOrder", label: "Step Order", type: "number", required: true },
        { key: "StepType", label: "Step Type", type: "select", required: true, options: [
          { value: "input", label: "Input" }, { value: "lookup", label: "Lookup" }, { value: "confirm", label: "Confirm" },
          { value: "payment", label: "Payment" }, { value: "success", label: "Success" }, { value: "error", label: "Error" },
        ]},
        { key: "Title", label: "Title", required: true },
        { key: "Subtitle", label: "Subtitle" },
        { key: "IconName", label: "Icon Name" },
        { key: "PrimaryButtonText", label: "Primary Button Text" },
        { key: "SecondaryButtonText", label: "Secondary Button Text" },
        { key: "ApiEndpoint", label: "API Endpoint" },
        { key: "ApiMethod", label: "API Method", type: "select", options: [
          { value: "GET", label: "GET" }, { value: "POST", label: "POST" }, { value: "PUT", label: "PUT" },
        ]},
        { key: "RequestTemplate", label: "Request Template (JSON)", type: "textarea" },
        { key: "ResponseMapping", label: "Response Mapping (JSON)", type: "textarea" },
        { key: "SuccessCondition", label: "Success Condition (JSON)", type: "textarea" },
        { key: "ErrorMessagePath", label: "Error Message Path" },
        { key: "LoadingMessage", label: "Loading Message" },
        { key: "AuthType", label: "Auth Type", type: "select", options: [
          { value: "pin", label: "PIN" }, { value: "biometric", label: "Biometric" }, { value: "both", label: "Both" },
        ]},
        { key: "Layout", label: "Layout", type: "select", options: [
          { value: "standard", label: "Standard" }, { value: "compact", label: "Compact" }, { value: "card", label: "Card" }, { value: "full", label: "Full" },
        ]},
        { key: "BackgroundColor", label: "Background Color" },
        { key: "ShowLoading", label: "Show Loading", type: "checkbox" },
        { key: "RequiresAuth", label: "Requires Auth", type: "checkbox" },
        { key: "CanGoBack", label: "Can Go Back", type: "checkbox" },
        { key: "Status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
      ]}
      defaultValues={{ Status: "Active", StepOrder: 1, StepType: "input", PrimaryButtonText: "Continue", Layout: "standard", ShowLoading: true, CanGoBack: true, RequiresAuth: false }}
    />
  );
}
