"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function FeeChargesClient() {
  return (
    <CrudTable
      title="Fee Charges"
      apiUrl="/api/app-control/fee-charges"
      idField="ChargeId"
      searchKeys={["ChargeName", "ChargeCode", "CategoryName", "Currency"]}
      dialogClassName="max-w-3xl max-h-[85vh] overflow-y-auto"
      columns={[
        { key: "ChargeName", label: "Name" },
        { key: "ChargeCode", label: "Code" },
        { key: "CategoryName", label: "Category", render: (v: string) => v || "-" },
        { key: "FeeAmount", label: "Amount", render: (v: number) => v != null ? v.toFixed(2) : "-" },
        { key: "FeePercentage", label: "%", render: (v: number) => v != null ? `${v}%` : "-" },
        { key: "Currency", label: "Curr" },
        { key: "IsFree", label: "Free", render: (v: number) => v === 1 ? <Badge variant="outline">Free</Badge> : null },
        { key: "Status", label: "Status", render: (v: string) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v}</Badge> },
      ]}
      formFields={[
        { key: "ChargeName", label: "Charge Name", required: true },
        { key: "ChargeCode", label: "Charge Code", required: true },
        { key: "CategoryId", label: "Category ID" },
        { key: "Description", label: "Description", type: "textarea" },
        { key: "FeeAmount", label: "Fee Amount", type: "number" },
        { key: "FeePercentage", label: "Fee Percentage", type: "number" },
        { key: "MinFee", label: "Min Fee", type: "number" },
        { key: "MaxFee", label: "Max Fee", type: "number" },
        { key: "MinTransactionAmount", label: "Min Transaction Amount", type: "number" },
        { key: "MaxTransactionAmount", label: "Max Transaction Amount", type: "number" },
        { key: "Currency", label: "Currency" },
        { key: "FeeFrequency", label: "Fee Frequency", type: "select", options: [
          { value: "PerTransaction", label: "Per Transaction" }, { value: "Daily", label: "Daily" },
          { value: "Monthly", label: "Monthly" }, { value: "Annual", label: "Annual" },
        ]},
        { key: "IsFree", label: "Is Free", type: "checkbox" },
        { key: "IsVATApplicable", label: "VAT Applicable", type: "checkbox" },
        { key: "VATPercentage", label: "VAT Percentage", type: "number" },
        { key: "IsWaivedForPremium", label: "Waived for Premium", type: "checkbox" },
        { key: "FreeTransactionsLimit", label: "Free Transactions Limit", type: "number" },
        { key: "FreeTransactionsPeriod", label: "Free Transactions Period", type: "select", options: [
          { value: "Daily", label: "Daily" }, { value: "Monthly", label: "Monthly" }, { value: "Annual", label: "Annual" },
        ]},
        { key: "EffectiveFrom", label: "Effective From" },
        { key: "EffectiveTo", label: "Effective To" },
        { key: "Rank", label: "Rank", type: "number" },
        { key: "Status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
      ]}
      defaultValues={{ Status: "Active", Rank: 0, Currency: "ETB", FeeFrequency: "PerTransaction", IsFree: false, IsVATApplicable: false, IsWaivedForPremium: false, FeeAmount: 0, FeePercentage: 0, VATPercentage: 0 }}
    />
  );
}
