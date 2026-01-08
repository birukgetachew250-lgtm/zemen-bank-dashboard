
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  LineChart,
  Shield,
  MessageSquare,
  SlidersHorizontal,
  UserCheck,
  Landmark,
  Settings,
  AppWindow,
  CheckSquare,
  type LucideIcon,
  Users2,
  UserPlus,
  History,
  Building,
  UserCog,
  UserX,
  List,
  Tags,
  Clock,
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
  GanttChartSquare,
  MessagesSquare,
  Gauge,
  PieChart,
  Target,
  Wrench,
  Mail,
  DownloadCloud,
} from 'lucide-react';

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  open?: boolean;
  children?: Omit<MenuItem, 'children' | 'icon'> & { icon?: LucideIcon, href: string }[];
}

export const menu: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  {
    label: "Corporates Management",
    icon: Building2,
    children: [
      { label: "Create Corporate", href: "/corporates/create" },
      { label: "Existing Corporates", href: "/corporates" },
      { label: "Exceptional Limits", href: "/corporates/exceptional-limits", icon: AlertTriangle },
    ],
  },
  {
    label: "Customer Management",
    icon: Users,
    children: [
      { label: "Create Customer", href: "/customers/create" },
      { label: "Existing Customers", href: "/customers" },
      { label: "Block Customer", href: "/customers/block" },
      { label: "Unblock Customer", href: "/customers/unblock" },
    ],
  },
  {
    label: "Transactions",
    icon: ArrowRightLeft,
    children: [
        { label: "All Transactions", href: "/transactions/all-transactions", icon: List },
        { label: "P2P & Wallet Transfers", href: "/transactions/p2p-wallet", icon: Users2 },
        { label: "Interoperability Transfers", href: "/transactions/interoperability", icon: Network },
        { label: "Bill Payments & Utilities", href: "/transactions/bills-utilities", icon: Receipt },
        { label: "Remittances", href: "/transactions/remittances", icon: Globe },
        { label: "Transaction Limits & Overrides", href: "/transactions/limits-overrides", icon: ShieldAlert },
        { label: "Settlements & Reconciliation", href: "/transactions/settlements", icon: BookCheck },
    ]
  },
  {
    label: "Risk & Compliance",
    icon: ShieldAlert,
    children: [
      { label: "Fraud Monitoring", href: "/risk/fraud-monitoring", icon: Siren },
      { label: "Suspicious Activity Alerts", href: "/risk/suspicious-activity", icon: AlertTriangle },
      { label: "AML / KYC Flags", href: "/risk/aml-kyc", icon: FileWarning },
      { label: "Audit Logs", href: "/users/audit", icon: History },
      { label: "NBE Reporting", href: "/risk/nbe-reporting", icon: FileText },
      { label: "Dispute Resolution", href: "/risk/dispute-resolution", icon: MessagesSquare },
      { label: "Risk Scoring Dashboard", href: "/risk/risk-scoring", icon: Gauge },
    ],
  },
  {
    label: "Mini Apps",
    icon: AppWindow,
    children: [
      { label: "Existing Mini Apps", href: "/mini-apps" },
      { label: "Add New Mini App", href: "/mini-apps/create" },
    ]
  },
  {
    label: "Approvals",
    icon: CheckSquare,
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
    label: "System Reports",
    icon: LineChart,
    children: [
      { label: "Active Customers", href: "/reports/system/active" },
      { label: "Inactive Customers", href: "/reports/system/inactive" },
    ],
  },
  {
    label: "Analytics & Reports",
    icon: BarChart3,
    children: [
      { label: "Overview Metrics", href: "/reports/analytics/overview", icon: PieChart },
      { label: "Financial Inclusion", href: "/reports/analytics/financial-inclusion", icon: Target },
      { label: "Custom Reports Builder", href: "/reports/analytics/custom-builder", icon: Wrench },
      { label: "Scheduled Reports", href: "/reports/analytics/scheduled", icon: Mail },
      { label: "Export Center", href: "/reports/analytics/export-center", icon: DownloadCloud },
    ],
  },
  {
    label: "Audit Trails",
    icon: History,
    children: [
      { label: "Customers Audit Trail", href: "/customers/audit" },
      { label: "System Users Audit Trail", href: "/users/audit" },
    ],
  },
  {
    label: "System Users",
    icon: Shield,
    children: [
      { label: "Manage Users", href: "/users" },
      { label: "Add New User", href: "/users/create" },
    ],
  },
  { 
    icon: MessageSquare, 
    label: "Authentications Logs",
    children: [
        { label: "OTP SMS", href: "/otp" },
    ]
  },
  { 
    icon: SlidersHorizontal, 
    label: "Limits & Charges",
    children: [
      { label: "Transaction Limits", href: "/limits" },
      { label: "Transaction Charges", href: "/charges" },
      { label: "Transaction Types", href: "/limits/types" },
      { label: "Customer Categories", href: "/limits/categories" },
      { label: "Intervals", href: "/limits/intervals" },
    ]
  },
  { 
    icon: ShieldCheck, 
    label: "Roles & Permissions",
    children: [
        { label: "Manage Roles", href: "/roles" },
        { label: "Add New Role", href: "/roles/create" },
    ]
  },
  {
    icon: Building,
    label: "Branches & Departments",
    children: [
      { label: "Branches", href: "/branches", icon: Landmark },
      { label: "Departments", href: "/departments", icon: Building2 },
    ],
  },
  { icon: Settings, label: "Settings", href: "/settings" },
];
