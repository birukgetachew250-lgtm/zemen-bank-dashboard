"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function AppUpdatesClient() {
  return (
    <CrudTable
      title="App Updates"
      apiUrl="/api/app-control/app-updates"
      idField="Id"
      searchKeys={["VersionCode", "VersionName", "Platform", "InsertUser", "UpdateUser"]}
      columns={[
        { key: "VersionCode", label: "Version Code" },
        { key: "VersionName", label: "Version Name" },
        { key: "Platform", label: "Platform" },
        {
          key: "IsForcedUpdate",
          label: "Forced Update",
          render: (v: number) => (
            <Badge variant={Number(v) === 1 ? "destructive" : "secondary"}>
              {Number(v) === 1 ? "Yes" : "No"}
            </Badge>
          ),
        },
        {
          key: "IsNewVersionAvailable",
          label: "New Version",
          render: (v: number) => (
            <Badge variant={Number(v) === 1 ? "default" : "secondary"}>
              {Number(v) === 1 ? "Available" : "No"}
            </Badge>
          ),
        },
        { key: "UpdateDate", label: "Updated At" },
      ]}
      formFields={[
        { key: "VersionCode", label: "Version Code", required: true, placeholder: "e.g. 2.0.1-20260418" },
        { key: "VersionName", label: "Version Name", required: true, placeholder: "e.g. 2.0.1" },
        {
          key: "Platform",
          label: "Platform",
          type: "select",
          required: true,
          options: [
            { value: "Android", label: "Android" },
            { value: "iOS", label: "iOS" },
            { value: "Web", label: "Web" },
            { value: "All", label: "All" },
          ],
        },
        { key: "IsForcedUpdate", label: "Force Update", type: "checkbox", placeholder: "Require users to update" },
        { key: "IsNewVersionAvailable", label: "Mark New Version Available", type: "checkbox", placeholder: "Expose new version to users" },
        { key: "InsertUser", label: "Insert User", placeholder: "dmin@zemen.com" },
        { key: "UpdateUser", label: "Update User", placeholder: "dmin@zemen.com" },
      ]}
      defaultValues={{
        Platform: "Android",
        IsForcedUpdate: false,
        IsNewVersionAvailable: true,
        InsertUser: "dmin@zemen.com",
        UpdateUser: "dmin@zemen.com",
      }}
    />
  );
}
