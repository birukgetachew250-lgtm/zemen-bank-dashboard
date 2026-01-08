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
    label: "Core Banking",
    icon: Briefcase,
    children: [
       {
        label: "Customers",
        icon: Users,
        href: "/customers",
        children: [
          { label: "Create Customer", href: "/customers/create" },
          { label: "Existing Customers", href: "/customers" },
          { label: "Block Customer", href: "/customers/block" },
          { label: "Unblock Customer", href: "/customers/unblock" },
        ],
      },
      {
        label: "Corporates",
        icon: Building2,
        href: "/corporates",
        children: [
          { label: "Create Corporate", href: "/corporates/create" },
          { label: "Existing Corporates", href: "/corporates" },
          { label: "Exceptional Limits", href: "/corporates/exceptional-limits" },
        ],
      },
      {
        label: "Transactions",
        icon: ArrowRightLeft,
        href: "/transactions",
        children: [
            { label: "All Transactions", href: "/transactions/all-transactions" },
            { label: "P2P & Wallet Transfers", href: "/transactions/p2p-wallet" },
            { label: "Interoperability", href: "/transactions/interoperability" },
            { label: "Bill Payments", href: "/transactions/bills-utilities" },
            { label: "Remittances", href: "/transactions/remittances" },
            { label: "Settlements", href: "/transactions/settlements" },
        ]
      },
       {
        label: "Mini Apps",
        icon: AppWindow,
        href: "/mini-apps",
        children: [
          { label: "Existing Mini Apps", href: "/mini-apps" },
          { label: "Add New Mini App", href: "/mini-apps/create" },
        ]
      },
    ]
  },
  {
    label: "Oversight",
    icon: Activity,
    children: [
      {
        label: "Approvals",
        icon: CheckSquare,
        href: "/customers/approve-new",
        children: [
          { label: "New Customers", href: "/customers/approve-new" },
          { label: "Updated Customers", href: "/customers/approve-updated" },
          { label: "Customer Accounts", href: "/customers/approve-accounts" },
          { label: "Unblocked Customers", href: "/customers/approve-unblocked" },
          { label: "Pin Resets", href: "/customers/approve-pin-reset" },
          { label: "Security Resets", href: "/customers/approve-security" },
        ]
      },
      {
        label: "Risk & Compliance",
        icon: ShieldAlert,
        href: "/risk/fraud-monitoring",
        children: [
          { label: "Fraud Monitoring", href: "/risk/fraud-monitoring" },
          { label: "Suspicious Activity", href: "/risk/suspicious-activity" },
          { label: "AML / KYC Flags", href: "/risk/aml-kyc" },
          { label: "NBE Reporting", href: "/risk/nbe-reporting" },
          { label: "Dispute Resolution", href: "/risk/dispute-resolution" },
          { label: "Risk Scoring", href: "/risk/risk-scoring" },
        ],
      },
       {
        label: "Audit Trails",
        icon: History,
        href: "/customers/audit",
        children: [
          { label: "Customers Audit", href: "/customers/audit" },
          { label: "System Users Audit", href: "/users/audit" },
          { label: "Authentications Logs", href: "/otp" },
        ],
      },
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
          { label: "Active Customers", href: "/reports/system/active" },
          { label: "Inactive Customers", href: "/reports/system/inactive" },
        ],
      },
      {
        label: "Analytics",
        icon: PieChart,
        href: "/reports/analytics/overview",
        children: [
          { label: "Overview Metrics", href: "/reports/analytics/overview" },
          { label: "Financial Inclusion", href: "/reports/analytics/financial-inclusion" },
          { label: "Custom Builder", href: "/reports/analytics/custom-builder" },
          { label: "Scheduled Reports", href: "/reports/analytics/scheduled" },
          { label: "Export Center", href: "/reports/analytics/export-center" },
        ],
      },
    ]
  },
  {
    label: "Administration",
    icon: UserCog,
    children: [
      { 
        label: "Users & Roles",
        icon: ShieldCheck, 
        href: "/roles",
        children: [
            { label: "Manage Roles", href: "/roles" },
            { label: "Add New Role", href: "/roles/create" },
            { label: "Manage Users", href: "/users" },
            { label: "Add New User", href: "/users/create" },
        ]
      },
      {
        label: "Structure",
        icon: Building,
        href: "/branches",
        children: [
          { label: "Branches", href: "/branches" },
          { label: "Departments", href: "/departments" },
        ],
      },
       { 
        label: "Limits & Charges",
        icon: SlidersHorizontal, 
        href: "/limits",
        children: [
          { label: "Transaction Limits", href: "/limits" },
          { label: "Transaction Charges", href: "/charges" },
          { label: "Transaction Types", href: "/limits/types" },
          { label: "Customer Categories", href: "/limits/categories" },
          { label: "Intervals", href: "/limits/intervals" },
        ]
      },
    ]
  },
  { icon: Settings, label: "Settings", href: "/settings" },
];
