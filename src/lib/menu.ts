
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
  LockOpen,
  CreditCard,
  Layers,
  LayoutGrid,
  Smartphone,
  Wallet,
  DollarSign,
  ScrollText,
  Megaphone,
  MapPin,
  MonitorCog,
  ClipboardList,
  LayoutList,
  FileCheck2,
  XCircle,
  ScanFace,
  CheckCircle2,
  ClockIcon,
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
    label: "Overview",
    icon: LayoutList,
    children: [
      { icon: ClipboardList, label: "Maker Dashboard", href: "/overview/maker" },
      { icon: FileCheck2,    label: "Checker Dashboard", href: "/overview/checker" },
    ],
  },
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
          { icon: Ban, label: "Suspend Customer", href: "/customers/suspend-customer" },
          { icon: UserCheck, label: "Unsuspend Customer", href: "/customers/unsuspend-customer" },
          { icon: LockOpen, label: "Unlock Customer", href: "/customers/unlock-customer" },
          { icon: Smartphone, label: "Resend Activation Code", href: "/customers/resend-activation" },
          { icon: KeyRound, label: "Pin Reset", href: "/customers/request-pin-reset" },
        ],
      },
    ]
  },
  {
    label: "Administration",
    icon: UserCog,
    children: [
      {
        label: "Bill Management",
        icon: Receipt,
        children: [
          { icon: LayoutGrid, label: "Categories", href: "/integrations/billers/categories" },
          { icon: Layers, label: "Subcategories", href: "/integrations/billers/subcategories" },
          { icon: Building2, label: "Providers", href: "/integrations/billers/providers" },
          {
            label: "Configuration",
            icon: Settings,
            children: [
              { icon: Plug, label: "System Config", href: "/integrations/config" },
            ]
          }
        ]
      },
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
        label: "Schools",
        icon: Building,
        href: "/administration/schools",
        children: [
          { icon: Building, label: "School List", href: "/administration/schools" },
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
          { icon: ShieldAlert, label: "Exceptional Limits", href: "/limits/exceptional-limits" },
          { icon: DatabaseZap, label: "Limit Usage", href: "/limits/usages" },
        ]
      },
    ]
  },
  {
    label: "App Control",
    icon: MonitorCog,
    href: "/app-control",
    children: [
      {
        label: "Mini Apps",
        icon: Smartphone,
        children: [
          { icon: LayoutGrid, label: "Categories", href: "/app-control/mini-app-categories" },
          { icon: AppWindow, label: "Apps", href: "/app-control/mini-apps" },
          { icon: ArrowRightLeft, label: "Transactions", href: "/app-control/mini-app-transactions" },
        ],
      },
      {
        label: "IPS Management",
        icon: Network,
        children: [
          { icon: Building, label: "IPS Banks", href: "/app-control/ips-banks" },
          { icon: Wallet, label: "IPS Wallets", href: "/app-control/ips-wallets" },
        ],
      },
      {
        label: "Ethio Telecom",
        icon: Layers,
        children: [
          { icon: LayoutGrid, label: "Categories", href: "/app-control/ethio-telecom-categories" },
          { icon: List, label: "Tags", href: "/app-control/ethio-telecom-tags" },
          { icon: Smartphone, label: "Packages", href: "/app-control/ethio-telecom-packages" },
        ],
      },
      { icon: Plug, label: "FlexCube Integrations", href: "/app-control/flexcube-integrations" },
      {
        label: "Fees & Charges",
        icon: DollarSign,
        children: [
          { icon: LayoutGrid, label: "Fee Categories", href: "/app-control/fee-categories" },
          { icon: CreditCard, label: "Fee Charges", href: "/app-control/fee-charges" },
        ],
      },
      {
        label: "Content & Legal",
        icon: ScrollText,
        children: [
          { icon: Shield, label: "Privacy Policies", href: "/app-control/privacy-policies" },
          { icon: FileText, label: "Terms & Conditions", href: "/app-control/terms-conditions" },
          { icon: Megaphone, label: "Promo Ads", href: "/app-control/promo-ads" },
        ],
      },
      { icon: DownloadCloud, label: "App Updates", href: "/app-control/app-updates" },
      { icon: MapPin, label: "Bank Locations", href: "/app-control/bank-locations" },
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
          { icon: Users, label: "New Customer", href: "/customers/approve-new" },
          { icon: Users, label: "Update Customer", href: "/customers/approve-updated" },
          { icon: Link, label: "Link Account", href: "/customers/approve-accounts" },
          { icon: Unlink, label: "Unlink Account", href: "/customers/approve-unlink" },
          { icon: UserX, label: "Suspend Customer", href: "/customers/approve-suspension" },
          { icon: UserCheck, label: "Unsuspend Customer", href: "/customers/approve-unblocked" },
          { icon: LockOpen, label: "Unlock Customer", href: "/customers/approve-unlock" },
          { icon: Smartphone, label: "Resend Activation Code", href: "/customers/approve-resend-activation" },
          { icon: KeyRound, label: "Pin Reset", href: "/customers/approve-pin-reset" },
          { icon: ShieldCheck, label: "Security Reset", href: "/customers/approve-security" },
        ]
      },
      {
        label: "Risk & Compliance",
        icon: ShieldAlert,
        href: "/risk/fraud-monitoring",
        children: [
          { icon: Siren, label: "Fraud Monitoring", href: "/risk/fraud-monitoring" },
          { icon: AlertTriangle, label: "Suspicious Activity", href: "/risk/suspicious-activity" },
          { icon: FileWarning, label: "AML/KYC Flags", href: "/risk/aml-kyc" },
          { icon: FileText, label: "NBE Reporting", href: "/risk/nbe-reporting" },
          { icon: MessagesSquare, label: "Dispute Resolution", href: "/risk/dispute-resolution" },
          { icon: Gauge, label: "Risk Scoring", href: "/risk/risk-scoring" },
        ],
      },
       {
        label: "Audit Trails",
        icon: History,
        href: "/users/audit",
        children: [
          { icon: Users, label: "Customers", href: "/customers/audit" },
          { icon: UserCog, label: "System Users", href: "/users/audit" },
          { icon: Mail, label: "Authentications", href: "/otp" },
        ],
      },
      {
        label: "Online Linking",
        icon: ScanFace,
        children: [
          { icon: LayoutDashboard, label: "Overview",       href: "/online-linking" },
          { icon: ClockIcon,       label: "Review Queue",   href: "/online-linking/review" },
          { icon: CheckCircle2,    label: "Approval Queue", href: "/online-linking/approve" },
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
      { icon: Bell, label: "Alerts", href: "/monitoring/alerts" },
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
      { icon: Building, label: "IPS Bank Management", href: "/integrations/ips-bank-management" },
      { icon: Activity, label: "API Monitoring", href: "/integrations/api-monitoring" },
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
      { icon: Shield, label: "Security Policies", href: "/security/mfa-policies" },
    ]
  },
  {
    label: "WSO2 Integration",
    icon: Waypoints,
    children: [
      { icon: LayoutDashboard, label: "Overview", href: "/wso2/dashboard" },
      { icon: Settings, label: "Configurations", href: "/wso2/configurations" },
      { icon: MonitorCog, label: "Third-Party Services", href: "/wso2/third-party-services" },
      { icon: KeyRound, label: "OAuth Credentials", href: "/wso2/oauth-credentials" },
      { icon: Activity, label: "Request Logs", href: "/wso2/request-logs" },
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
