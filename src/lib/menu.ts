import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  LineChart,
  Shield,
  SlidersHorizontal,
  Settings,
  AppWindow,
  CheckSquare,
  type LucideIcon,
  Users2,
  History,
  Building,
  UserCog,
  UserX,
  List,
  ShieldCheck,
  AlertTriangle,
  ArrowRightLeft,
  Network,
  Receipt,
  Globe,
  ShieldAlert,
  BookCheck,
  Siren,
  FileWarning,
  FileText,
  MessagesSquare,
  Gauge,
  PieChart,
  Target,
  Wrench,
  Mail,
  DownloadCloud,
  Briefcase,
  Activity,
  Eye,
  KeyRound,
  Table,
  HeartPulse,
  GaugeCircle,
  Waypoints,
  Bell,
  UserCheck,
  Ban,
  Plug,
  DatabaseZap,
  Lock,
  Link,
  Unlink,
} from 'lucide-react';

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  open?: boolean;
  children?: MenuItem[];
}

export const menu: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  {
    label: "Banking Users",
    icon: Briefcase,
    children: [
       {
        label: "Customers",
        icon: Users,
        href: "/customers",
        children: [
          { icon: Users, label: "Create Customer", href: "/customers/create" },
          { icon: Users, label: "Existing Customers", href: "/customers" },
          { icon: Link, label: "Link Account", href: "/customers/link-account" },
          { icon: Unlink, label: "Unlink Account", href: "/customers/unlink-account" },
          { icon: Ban, label: "Suspend Customer", href: "/customers/block" },
          { icon: UserCheck, label: "Unsuspend Customer", href: "/customers/unblock" },
          { icon: KeyRound, label: "Pin Reset", href: "/customers/request-pin-reset" },
        ],
      },
      {
        label: "Corporates",
        icon: Building2,
        href: "/corporates",
        children: [
          { icon: Building2, label: "Create Corporate", href: "/corporates/create" },
          { icon: Building2, label: "Existing Corporates", href: "/corporates" },
          { icon: SlidersHorizontal, label: "Exceptional Limits", href: "/corporates/exceptional-limits" },
        ],
      },
    ]
  },
  {
    label: "Transactions",
    icon: ArrowRightLeft,
    href: "/transactions/all-transactions",
    children: [
        { icon: List, label: "All Transactions", href: "/transactions/all-transactions" },
        { icon: Users2, label: "P2P & Wallet Transfers", href: "/transactions/p2p-wallet" },
        { icon: Network, label: "Interoperability", href: "/transactions/interoperability" },
        { icon: Receipt, label: "Bill Payments", href: "/transactions/bills-utilities" },
        { icon: Globe, label: "Remittances", href: "/transactions/remittances" },
        { icon: SlidersHorizontal, label: "Transaction Limits & Overrides", href: "/transactions/limits-overrides" },
        { icon: BookCheck, label: "Settlements", href: "/transactions/settlements" },
    ]
  },
   {
    label: "Mini Apps",
    icon: AppWindow,
    href: "/mini-apps",
    children: [
      { icon: AppWindow, label: "Existing Mini Apps", href: "/mini-apps" },
      { icon: AppWindow, label: "Add New Mini App", href: "/mini-apps/create" },
    ]
  },
  {
    label: "Oversight",
    icon: Eye,
    children: [
      {
        label: "Approvals",
        icon: CheckSquare,
        href: "/customers/approve-new",
        children: [
          { icon: Users, label: "Create Customer", href: "/customers/approve-new" },
          { icon: Users, label: "Updated Customers", href: "/customers/approve-updated" },
          { icon: Link, label: "Link Account Requests", href: "/customers/approve-accounts" },
          { icon: Unlink, label: "Unlink Account Requests", href: "/customers/approve-unlink" },
          { icon: UserX, label: "Suspended Customers", href: "/customers/approve-suspension" },
          { icon: UserCheck, label: "Unsuspended Customers", href: "/customers/approve-unblocked" },
          { icon: KeyRound, label: "Pin Resets", href: "/customers/approve-pin-reset" },
          { icon: ShieldCheck, label: "Security Resets", href: "/customers/approve-security" },
        ]
      },
      {
        label: "Risk & Compliance",
        icon: ShieldAlert,
        href: "/risk/fraud-monitoring",
        children: [
          { icon: Siren, label: "Fraud Monitoring", href: "/risk/fraud-monitoring" },
          { icon: AlertTriangle, label: "Suspicious Activity", href: "/risk/suspicious-activity" },
          { icon: FileWarning, label: "AML / KYC Flags", href: "/risk/aml-kyc" },
          { icon: FileText, label: "NBE Reporting", href: "/risk/nbe-reporting" },
          { icon: MessagesSquare, label: "Dispute Resolution", href: "/risk/dispute-resolution" },
          { icon: Gauge, label: "Risk Scoring", href: "/risk/risk-scoring" },
        ],
      },
       {
        label: "Audit Trails",
        icon: History,
        href: "/customers/audit",
        children: [
          { icon: Users, label: "Customers Audit", href: "/customers/audit" },
          { icon: UserCog, label: "System Users Audit", href: "/users/audit" },
          { icon: Mail, label: "Authentications Logs", href: "/otp" },
        ],
      },
    ]
  },
  {
    label: "System Monitoring",
    icon: Activity,
    children: [
      { icon: HeartPulse, label: "Microservices Health", href: "/monitoring/health" },
      { icon: GaugeCircle, label: "Performance Metrics", href: "/monitoring/performance" },
      { icon: Waypoints, label: "Transaction Tracing", href: "/monitoring/tracing" },
      { icon: Bell, label: "Alerts & Notifications", href: "/monitoring/alerts" },
    ]
  },
  {
    label: "Reporting",
    icon: BarChart3,
    href: "/reports/analytics/overview",
    children: [
        { icon: Target, label: "Overview Metrics", href: "/reports/analytics/overview" },
        { icon: PieChart, label: "Transaction Reports", href: "/reports/transactions"},
        { icon: Users, label: "Financial Inclusion", href: "/reports/analytics/financial-inclusion" },
        { icon: Wrench, label: "Custom Builder", href: "/reports/analytics/custom-builder" },
        { icon: Mail, label: "Scheduled Reports", href: "/reports/analytics/scheduled" },
        { icon: DownloadCloud, label: "Export Center", href: "/reports/analytics/export-center" },
    ]
  },
   {
    label: "Integrations",
    icon: Network,
    children: [
      { icon: Plug, label: "Integration Config", href: "/integrations/config" },
      { icon: Building2, label: "Partner Management", href: "/integrations/partner-management" },
      { icon: Activity, label: "API Monitoring", href: "/integrations/api-monitoring" },
      { icon: Globe, label: "Third-Party Integrations", href: "/integrations/third-party" },
      { icon: History, label: "Webhook & Callback Logs", href: "/integrations/webhooks" },
    ],
  },
  {
    label: "Security & Access",
    icon: ShieldCheck,
    children: [
      { 
        label: "Users & Roles",
        icon: UserCog, 
        href: "/roles",
        children: [
            { icon: ShieldCheck, label: "Manage Roles", href: "/roles" },
            { icon: Users, label: "Manage Users", href: "/users" },
        ]
      },
      { icon: Table, label: "Permissions Matrix", href: "/security/permission-matrix" },
      { icon: KeyRound, label: "Login & Activity Logs", href: "/security/sessions" },
      { icon: Shield, label: "MFA / Security Policies", href: "/security/mfa-policies" },
    ]
  },
  {
    label: "Administration",
    icon: UserCog,
    children: [
      {
        label: "Structure",
        icon: Building,
        href: "/branches",
        children: [
          { icon: Building, label: "Branches", href: "/branches" },
          { icon: Building2, label: "Departments", href: "/departments" },
        ],
      },
       { 
        label: "Limits & Charges",
        icon: SlidersHorizontal, 
        href: "/limits",
        children: [
          { icon: SlidersHorizontal, label: "Transaction Limits", href: "/limits" },
          { icon: SlidersHorizontal, label: "Transaction Charges", href: "/charges" },
          { icon: List, label: "Transaction Types", href: "/limits/types" },
          { icon: Users, label: "Customer Categories", href: "/limits/categories" },
          { icon: History, label: "Intervals", href: "/limits/intervals" },
        ]
      },
    ]
  },
  { 
    icon: Settings, 
    label: "Settings", 
    href: "/settings",
    children: [
        { icon: Settings, label: "General", href: "/settings" },
        { icon: Lock, label: "Change Password", href: "/settings/change-password" },
        { icon: Bell, label: "Notifications", href: "/settings/notifications" },
        { icon: DatabaseZap, label: "Backup & Restore", href: "/settings/backup" },
    ]
  },
];
