"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function IPSBanksClient() {
  return (
    <CrudTable
      title="IPS Banks"
      apiUrl="/api/app-control/ips-banks"
      idField="Id"
      searchKeys={["BankName", "BankCode", "BranchCode"]}
      columns={[
        { key: "BankName", label: "Bank Name" },
        { key: "BankCode", label: "Code" },
        { key: "BranchCode", label: "Branch Code" },
        { key: "ReconciliationAccount", label: "Recon Account" },
        { key: "PrimaryColor", label: "Color", render: (v: string) => v ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border" style={{ backgroundColor: v }} />
            {v}
          </div>
        ) : "-" },
        { key: "Rank", label: "Rank" },
        { key: "Status", label: "Status", render: (v: string) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v}</Badge> },
      ]}
      formFields={[
        { key: "BankName", label: "Bank Name", required: true },
        { key: "BankCode", label: "Bank Code", required: true },
        { key: "BranchCode", label: "Branch Code", required: true },
        { key: "ReconciliationAccount", label: "Reconciliation Account" },
        { key: "BankLogo", label: "Bank Logo URL" },
        { key: "PrimaryColor", label: "Primary Color", type: "color" },
        { key: "SecondaryColor", label: "Secondary Color", type: "color" },
        { key: "AccentColor", label: "Accent Color", type: "color" },
        { key: "Rank", label: "Rank", type: "number" },
        { key: "Status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }] },
      ]}
      defaultValues={{ Status: "Active", Rank: 0 }}
    />
  );
}
