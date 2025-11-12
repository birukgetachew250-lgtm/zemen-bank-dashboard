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
  type LucideIcon,
} from 'lucide-react';

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  open?: boolean;
  children?: Omit<MenuItem, 'icon' | 'children'>[];
}

export const menu: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  {
    label: "Corporates Management",
    icon: Building2,
    open: false,
    children: [
      { label: "Existing Corporates", href: "/corporates" },
      { label: "Corporate Details", href: "/corporates/details" },
      { label: "Corporate Transactions", href: "/corporates/transactions" },
    ],
  },
  {
    label: "Customer Management",
    icon: Users,
    open: true,
    children: [
      { label: "Customer Details", href: "/customers/details" },
      { label: "Existing Customers", href: "/customers" },
      { label: "Approve New Customers", href: "/customers/approve-new" },
      { label: "Approve Updated Customers", href: "/customers/approve-updated" },
      { label: "Approve Customer Accounts", href: "/customers/approve-accounts" },
      { label: "Approve Unblocked", href: "/customers/approve-unblocked" },
      { label: "Approve Pin Reset", href: "/customers/approve-pin-reset" },
      { label: "Approve Reset Security", href: "/customers/approve-security" },
      { label: "Approve Transaction Pin", href: "/customers/approve-transaction-pin" },
      { label: "Approve New Devices", href: "/customers/approve-devices" },
      { label: "Approve Disabled", href: "/customers/approve-disabled" },
    ],
  },
  { icon: BarChart3, label: "Transaction Reports", href: "/reports/transactions" },
  {
    label: "System Reports",
    icon: LineChart,
    children: [
      { label: "Registered Customers", href: "/reports/system/registered" },
      { label: "Active Customers", href: "/reports/system/active" },
      { label: "Inactive Customers", href: "/reports/system/inactive" },
      { label: "Incomplete Registrations", href: "/reports/system/incomplete" },
      { label: "Failed New Customers", href: "/reports/system/failed" },
      { label: "Dormant Customers", href: "/reports/system/dormant" },
    ],
  },
  {
    label: "System Users",
    icon: Shield,
    children: [
      { label: "Users Audit Trail", href: "/users/audit" },
      { label: "Customers Audit Trail", href: "/customers/audit" },
    ],
  },
  { icon: MessageSquare, label: "OTP Sms", href: "/otp" },
  { icon: SlidersHorizontal, label: "Limits & Charges", href: "/limits" },
  { icon: UserCheck, label: "Roles & Permissions", href: "/roles" },
  { icon: Landmark, label: "Branches & Departments", href: "/branches" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: AppWindow, label: "Mini Apps", href: "/mini-apps" },
];
