"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function IPSWalletsClient() {
  return (
    <CrudTable
      title="IPS Wallets"
      apiUrl="/api/app-control/ips-wallets"
      idField="WalletId"
      searchKeys={["WalletName", "WalletCode"]}
      columns={[
        { key: "WalletName", label: "Wallet Name" },
        { key: "WalletCode", label: "Code" },
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
        { key: "WalletName", label: "Wallet Name", required: true },
        { key: "WalletCode", label: "Wallet Code", required: true },
        { key: "ReconciliationAccount", label: "Reconciliation Account" },
        { key: "WalletLogo", label: "Wallet Logo URL" },
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
