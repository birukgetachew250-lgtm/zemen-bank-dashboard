
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
    label: "Banking Customers",
    icon: Briefcase,
    children: [
       {
        label: "Customers",
        icon: Users,
        href: "/customers",
        children: [
          { icon: Users, label: "Create Customer", href: "/customers/create" },
          { icon: Users, label: "Existing Customers", href: "/customers" },
          { icon: UserX, label: "Block Customer", href: "/customers/block" },
          { icon: UserCheck, label: "Unblock Customer", href: "/customers/unblock" },
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
          { icon: Users, label: "New Customers", href: "/customers/approve-new" },
          { icon: Users, label: "Updated Customers", href: "/customers/approve-updated" },
          { icon: Users, label: "Customer Accounts", href: "/customers/approve-accounts" },
          { icon: UserCheck, label: "Unblocked Customers", href: "/customers/approve-unblocked" },
          { icon: ShieldCheck, label: "Pin Resets", href: "/customers/approve-pin-reset" },
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
    children: [
      {
        label: "System Reports",
        icon: LineChart,
        href: "/reports/system/active",
        children: [
          { icon: UserCheck, label: "Active Customers", href: "/reports/system/active" },
          { icon: UserX, label: "Inactive Customers", href: "/reports/system/inactive" },
        ],
      },
      {
        label: "Analytics & Reports",
        icon: PieChart,
        href: "/reports/analytics/overview",
        children: [
          { icon: Target, label: "Overview Metrics", href: "/reports/analytics/overview" },
          { icon: Users, label: "Financial Inclusion", href: "/reports/analytics/financial-inclusion" },
          { icon: Wrench, label: "Custom Builder", href: "/reports/analytics/custom-builder" },
          { icon: Mail, label: "Scheduled Reports", href: "/reports/analytics/scheduled" },
          { icon: DownloadCloud, label: "Export Center", href: "/reports/analytics/export-center" },
        ],
      },
    ]
  },
   {
    label: "Integrations",
    icon: Network,
    children: [
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
        label: "Admin Users & Roles",
        icon: UserCog, 
        href: "/roles",
        children: [
            { icon: ShieldCheck, label: "Manage Roles", href: "/roles" },
            { icon: ShieldCheck, label: "Add New Role", href: "/roles/create" },
            { icon: Users, label: "Manage Users", href: "/users" },
            { icon: Users, label: "Add New User", href: "/users/create" },
        ]
      },
      { icon: Table, label: "Permissions Matrix", href: "/security/permission-matrix" },
      { icon: KeyRound, label: "Login Audit & Sessions", href: "/security/sessions" },
      { icon: Shield, label: "MFA / Security Policies", href: "/security/mfa-policies" },
      { icon: Network, label: "IP Whitelisting", href: "/security/ip-whitelisting" },
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
  { icon: Settings, label: "Settings", href: "/settings" },
];
