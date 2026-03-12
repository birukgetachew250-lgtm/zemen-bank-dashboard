"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AppControlClient() {
  const sections = [
    { title: "Mini Apps", items: [
      { label: "App Categories", href: "/app-control/mini-app-categories", desc: "Mini app category management" },
      { label: "Mini Apps", href: "/app-control/mini-apps", desc: "Manage mini app integrations" },
      { label: "Transactions", href: "/app-control/mini-app-transactions", desc: "View mini app transactions" },
    ]},
    { title: "IPS Management", items: [
      { label: "IPS Banks", href: "/app-control/ips-banks", desc: "Interoperability bank management" },
      { label: "IPS Wallets", href: "/app-control/ips-wallets", desc: "Interoperability wallet management" },
    ]},
    { title: "Integrations", items: [
      { label: "FlexCube Integrations", href: "/app-control/flexcube-integrations", desc: "Core banking integration settings" },
    ]},
    { title: "Fees & Charges", items: [
      { label: "Fee Categories", href: "/app-control/fee-categories", desc: "Fee category management" },
      { label: "Fee Charges", href: "/app-control/fee-charges", desc: "Individual fee and charge rules" },
    ]},
    { title: "Content & Legal", items: [
      { label: "Privacy Policies", href: "/app-control/privacy-policies", desc: "Privacy policy sections" },
      { label: "Terms & Conditions", href: "/app-control/terms-conditions", desc: "Terms and conditions sections" },
      { label: "Promo Ads", href: "/app-control/promo-ads", desc: "Promotional advertisements" },
    ]},
    { title: "Locations", items: [
      { label: "Bank Locations", href: "/app-control/bank-locations", desc: "Branch, ATM & kiosk locations" },
    ]},
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">App Control Module</h1>
      <p className="text-muted-foreground">Comprehensive administration for application interface controls, bill payments, mini apps, integrations, fees, and content.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader><CardTitle className="text-lg">{section.title}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {section.items.map((item) => (
                <Link key={item.href} href={item.href} className="block p-3 rounded-lg border hover:bg-accent transition-colors">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
