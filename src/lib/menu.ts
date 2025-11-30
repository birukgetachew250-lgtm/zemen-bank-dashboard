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
      { label: "Corporate Transactions", href: "/corporates/transactions" },
    ],
  },
  {
    label: "Customer Management",
    icon: Users,
    open: true,
    children: [
      { label: "Create Customer", href: "/customers/create" },
      { label: "Existing Customers", href: "/customers" },
    ],
  },
  { icon: AppWindow, label: "Mini Apps", href: "/mini-apps" },
  {
    label: "Approvals",
    icon: CheckSquare,
    open: false,
    children: [
      { label: "New Customers", href: "/customers/approve-new" },
      { label: "Updated Customers", href: "/customers/approve-updated" },
      { label: "Customer Accounts", href: "/customers/approve-accounts" },
      { label: "Unblocked Customers", href: "/customers/approve-unblocked" },
      { label: "Pin Resets", href: "/customers/approve-pin-reset" },
      { label: "Security Resets", href: "/customers/approve-security" },
      { label: "Transaction Pins", href: "/customers/approve-transaction-pin" },
      { label: "New Devices", href: "/customers/approve-devices" },
      { label: "Disabled Customers", href: "/customers/approve-disabled" },
    ]
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
    label: "Audit Trails",
    icon: History,
    children: [
      { label: "Customers Audit Trail", href: "/customers/audit" },
      { label: "System Users Audit Trail", href: "/users/audit" },
    ],
  },
  { icon: Shield, label: "System Users", href: "/users"},
  { icon: MessageSquare, label: "OTP Sms", href: "/otp" },
  { icon: SlidersHorizontal, label: "Limits & Charges", href: "/limits" },
  { icon: UserCheck, label: "Roles & Permissions", href: "/roles" },
  { icon: Landmark, label: "Branches", href: "/branches" },
  { icon: Building, label: "Departments", href: "/departments" },
  { icon: Settings, label: "Settings", href: "/settings" },
];
