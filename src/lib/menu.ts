
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
} from 'lucide-react';

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  open?: boolean;
  permission?: string;
  children?: MenuItem[];
}

export const menu: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", permission: "view-dashboard" },
  {
    label: "Corporates Management",
    icon: Building2,
    permission: "manage-corporates",
    children: [
      { label: "Existing Corporates", href: "/corporates", permission: "manage-corporates" },
      { label: "Corporate Transactions", href: "/corporates/transactions", permission: "manage-corporates" },
    ],
  },
  {
    label: "Customer Management",
    icon: Users,
    permission: "manage-customers",
    children: [
      { label: "Create Customer", href: "/customers/create", permission: "create-customer" },
      { label: "Existing Customers", href: "/customers", permission: "view-customers" },
      { label: "Block Customer", href: "/customers/block", permission: "block-customer" },
      { label: "Unblock Customer", href: "/customers/unblock", permission: "unblock-customer" },
    ],
  },
  {
    label: "Mini Apps",
    icon: AppWindow,
    permission: "manage-mini-apps",
    children: [
      { label: "Existing Mini Apps", href: "/mini-apps", permission: "manage-mini-apps" },
      { label: "Add New Mini App", href: "/mini-apps/create", permission: "manage-mini-apps" },
    ]
  },
  {
    label: "Approvals",
    icon: CheckSquare,
    permission: "manage-approvals",
    children: [
      { label: "New Customers", href: "/customers/approve-new", permission: "approve-new-customer" },
      { label: "Updated Customers", href: "/customers/approve-updated", permission: "approve-updated-customer" },
      { label: "Customer Accounts", href: "/customers/approve-accounts", permission: "approve-customer-account" },
      { label: "Unblocked Customers", href: "/customers/approve-unblocked", permission: "approve-unblock" },
      { label: "Pin Resets", href: "/customers/approve-pin-reset", permission: "approve-pin-reset" },
      { label: "Security Resets", href: "/customers/approve-security", permission: "approve-security-reset" },
    ]
  },
  {
    label: "System Reports",
    icon: LineChart,
    permission: "view-reports",
    children: [
      { label: "Registered Customers", href: "/reports/system/registered", permission: "view-reports" },
      { label: "Active Customers", href: "/reports/system/active", permission: "view-reports" },
      { label: "Inactive Customers", href: "/reports/system/inactive", permission: "view-reports" },
      { label: "Incomplete Registrations", href: "/reports/system/incomplete", permission: "view-reports" },
      { label: "Failed New Customers", href: "/reports/system/failed", permission: "view-reports" },
      { label: "Dormant Customers", href: "/reports/system/dormant", permission: "view-reports" },
    ],
  },
  {
    label: "Audit Trails",
    icon: History,
    permission: "view-audit-trails",
    children: [
      { label: "Customers Audit Trail", href: "/customers/audit", permission: "view-audit-trails" },
      { label: "System Users Audit Trail", href: "/users/audit", permission: "view-audit-trails" },
    ],
  },
  {
    label: "System Users",
    icon: Shield,
    permission: "manage-users",
    children: [
      { label: "Manage Users", href: "/users", permission: "manage-users" },
      { label: "Add New User", href: "/users/create", permission: "manage-users" },
    ],
  },
  { icon: MessageSquare, label: "OTP Sms", href: "/otp", permission: "view-otp" },
  { 
    icon: SlidersHorizontal, 
    label: "Limits & Charges",
    permission: "manage-limits",
    children: [
      { label: "Transaction Limits", href: "/limits", permission: "manage-limits" },
      { label: "Transaction Charges", href: "/charges", permission: "manage-limits" },
      { label: "Transaction Types", href: "/limits/types", permission: "manage-limits" },
      { label: "Customer Categories", href: "/limits/categories", permission: "manage-limits" },
      { label: "Intervals", href: "/limits/intervals", permission: "manage-limits" },
    ]
  },
  { icon: UserCheck, label: "Roles & Permissions", href: "/roles", permission: "manage-roles" },
  { icon: Landmark, label: "Branches", href: "/branches", permission: "manage-branches" },
  { icon: Building, label: "Departments", href: "/departments", permission: "manage-departments" },
  { icon: Settings, label: "Settings", href: "/settings", permission: "manage-settings" },
];
