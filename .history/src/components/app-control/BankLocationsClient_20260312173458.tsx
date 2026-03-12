"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function BankLocationsClient() {
  return (
    <CrudTable
      title="Bank Locations"
      apiUrl="/api/app-control/bank-locations"
      idField="Lid"
      searchKeys={["PlaceName", "Location", "Type"]}
      columns={[
        { key: "PlaceName", label: "Place Name" },
        { key: "Type", label: "Type", render: (v: string) => <Badge variant="outline">{v}</Badge> },
        { key: "Latitude", label: "Lat", render: (v: number) => v != null ? Number(v).toFixed(6) : "-" },
        { key: "Longitude", label: "Lng", render: (v: number) => v != null ? Number(v).toFixed(6) : "-" },
        { key: "Location", label: "Location", render: (v: string) => v ? (v.length > 40 ? v.slice(0, 40) + "..." : v) : "-" },
        { key: "Rank", label: "Rank" },
        { key: "Status", label: "Status", render: (v: number) => <Badge variant={v === 1 ? "default" : "secondary"}>{v === 1 ? "Active" : "Inactive"}</Badge> },
      ]}
      formFields={[
        { key: "PlaceName", label: "Place Name", required: true },
        { key: "Latitude", label: "Latitude", type: "number", required: true },
        { key: "Longitude", label: "Longitude", type: "number", required: true },
        { key: "Location", label: "Location / Address" },
        { key: "Description", label: "Description", type: "textarea" },
        { key: "Type", label: "Type", type: "select", required: true, options: [
          { value: "Branch", label: "Branch" }, { value: "Atm", label: "ATM" }, { value: "Kiosk", label: "Kiosk" },
        ]},
        { key: "Status", label: "Status", type: "select", options: [{ value: 1, label: "Active" }, { value: 0, label: "Inactive" }] },
        { key: "Rank", label: "Rank", type: "number" },
      ]}
      defaultValues={{ Status: 1, Rank: 0, Type: "Branch", Latitude: 0, Longitude: 0 }}
    />
  );
}
