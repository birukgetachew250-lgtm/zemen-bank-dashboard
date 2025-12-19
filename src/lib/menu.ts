
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
  children?: Omit<MenuItem, 'children' | 'icon'> & { icon?: LucideIcon, href: string }[];
}

export const menu: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  {
    label: "Corporates Management",
    icon: Building2,
    children: [
      { label: "Existing Corporates", href: "/corporates" },
      { label: "Corporate Transactions", href: "/corporates/transactions" },
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
  {
    label: "System Users",
    icon: Shield,
    children: [
      { label: "Manage Users", href: "/users" },
      { label: "Add New User", href: "/users/create" },
    ],
  },
  { icon: MessageSquare, label: "OTP Sms", href: "/otp" },
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
    icon: UserCheck, 
    label: "Roles & Permissions",
    children: [
        { label: "Manage Roles", href: "/roles" },
    ]
  },
  { icon: Landmark, label: "Branches", href: "/branches" },
  { icon: Building, label: "Departments", href: "/departments" },
  { icon: Settings, label: "Settings", href: "/settings" },
];
