"use client";

import CrudTable from "./CrudTable";
import { Badge } from "@/components/ui/badge";

export default function PromoAdsClient() {
  return (
    <CrudTable
      title="Promo Ads"
      apiUrl="/api/app-control/promo-ads"
      idField="Id"
      searchKeys={["Title", "Subtitle", "AdType"]}
      dialogClassName="max-w-3xl max-h-[85vh] overflow-y-auto"
      columns={[
        { key: "Title", label: "Title" },
        { key: "ImageUrl", label: "Image", render: (v: string) => v ? <img src={v} alt="Promo" className="h-10 w-20 object-cover rounded shadow-sm" /> : "-" },
        { key: "Subtitle", label: "Subtitle", render: (v: string) => v ? (v.length > 30 ? v.slice(0, 30) + "..." : v) : "-" },
        { key: "AdType", label: "Type", render: (v: string) => v ? <Badge variant="outline">{v}</Badge> : "-" },
        { key: "PageNumber", label: "Page" },
        { key: "IsIFB", label: "Is IFB", render: (v: number) => v === 1 ? <Badge variant="default">Yes</Badge> : <Badge variant="secondary">No</Badge> },
        { key: "DisplayOrder", label: "Order" },
        { key: "StartDate", label: "Start", render: (v: string) => v ? new Date(v).toLocaleDateString() : "-" },
        { key: "EndDate", label: "End", render: (v: string) => v ? new Date(v).toLocaleDateString() : "-" },
        { key: "Status", label: "Status", render: (v: string) => <Badge variant={v === "Active" ? "default" : "secondary"}>{v}</Badge> },
      ]}
      formFields={[
        { key: "Title", label: "Title", required: true },
        { key: "Subtitle", label: "Subtitle" },
        { key: "PageNumber", label: "Page Number", type: "number" },
        { key: "Description", label: "Description", type: "textarea" },
        { key: "TargetUrl", label: "Target URL" },
        { key: "ImageUrl", label: "Image URL" },
        { key: "ThumbnailUrl", label: "Thumbnail URL" },
        { key: "DisplayOrder", label: "Display Order", type: "number" },
        { key: "AdType", label: "Ad Type", type: "select", options: [
          { value: "Banner", label: "Banner" }, { value: "Popup", label: "Popup" }, { value: "Interstitial", label: "Interstitial" },
          { value: "Card", label: "Card" }, { value: "Splash", label: "Splash" },
        ]},
        { key: "IsIFB", label: "Is IFB Promo", type: "checkbox" },
        { key: "StartDate", label: "Start Date" },
        { key: "EndDate", label: "End Date" },
        { key: "Status", label: "Status", type: "select", options: [{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }, { value: "Scheduled", label: "Scheduled" }] },
      ]}
      defaultValues={{ Status: "Active", DisplayOrder: 0, PageNumber: 1, AdType: "Banner", IsIFB: false }}
    />
  );
}
