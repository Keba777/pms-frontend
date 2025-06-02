import {
  Home,
  Briefcase,
  CheckSquare,
  ClipboardList,
  Grid,
  ListCheck,
  MessageSquare,
  Users,
  Clipboard,
  PenTool,
  Settings,
  Settings2,
  FileText,
  Box as BoxIcon,
  ArrowRight,
  LineChart,
  ArrowUp,
  Hexagon,
  Lock,
  Languages
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", link: "/", icon: Home, iconColor: "text-red-500" },
  {
    title: "Projects",
    icon: Briefcase,
    iconColor: "text-green-500",
    submenu: [
      { title: "Manage Projects", link: "/projects", active: true },
      { title: "Favorite Projects", link: "/projects/favorite" },
      { title: "Project Phase", link: "/projects/phase" },
      { title: "Tags", link: "/tags/manage" },
    ],
  },
  {
    title: "Tasks",
    link: "/tasks",
    icon: ClipboardList,
    iconColor: "text-blue-500",
  },
  {
    title: "Activities",
    link: "/activities",
    icon: ClipboardList,
    iconColor: "text-blue-500",
  },
  {
    title: "Schedule",
    link: "/schedule",
    icon: ClipboardList,
    iconColor: "text-blue-500",
  },
  {
    title: "Master-schedule",
    link: "/master-schedule",
    icon: ClipboardList,
    iconColor: "text-blue-500",
  },
  {
    title: "Daily Task Report",
    link: "/dailyreports",
    icon: ListCheck,
    iconColor: "text-red-500",
  },
  // {
  //   title: "Statuses",
  //   link: "/status/manage",
  //   icon: Grid,
  //   iconColor: "text-gray-500",
  // },
  // {
  //   title: "Resources",
  //   link: "/resources",
  //   icon: Grid,
  //   iconColor: "text-blue-500",
  // },
  {
    title: "Issues",
    link: "/issues",
    icon: ArrowUp,
    iconColor: "text-red-500",
  },
  {
    title: "Manage Resources",
    icon: Clipboard,
    iconColor: "text-yellow-500",
    submenu: [
      {
        title: "Manage Materials",
        link: "/resources/materials",
        icon: BoxIcon,
        iconColor: "text-blue-500",
      },
      {
        title: "Manage Equipment",
        link: "/resources/equipments",
        icon: PenTool,
        iconColor: "text-gray-500",
      },
      {
        title: "Manage Labors",
        link: "/resources/labors",
        icon: Users,
        iconColor: "text-gray-500",
      },
    ],
  },

  {
    title: "Requests",

    icon: ListCheck,
    iconColor: "text-blue-500",
    submenu: [
      { title: "Incoming Requests", link: "/requests-incoming", },
      { title: "View Requests", link: "/requests" },
      { title: "Requests Resource", link: "/resource-requests" },
    ]
  },
  {
    title: " Allocation",
    icon: CheckSquare,
    iconColor: "text-blue-500",
    submenu: [
      { title: "Request Allocation", link: "/allocation" },
      { title: "Approvals", link: "/request-approval" },
      { title: "Delivery Report", link: "/deliveries" },
    ]
  },
  {
    title: "My Warehouse",
    link: "/mywarehouse",
    icon: ListCheck,
    iconColor: "text-blue-500",
  },
  {
    title: "My Materials",
    link: "/site-materials",
    icon: BoxIcon,
    iconColor: "text-blue-500",
  },
  {
    title: "My Equipment",
    link: "/site-equipments",
    icon: PenTool,
    iconColor: "text-gray-500",
  },
  {
    title: "My Labors",
    link: "/site-labors",
    icon: Users,
    iconColor: "text-gray-500",
  },
  // {
  //   title: "Warehouse Balance",
  //   link: "/mywarehouse",
  //   icon: ListCheck,
  //   iconColor: "text-blue-500",
  // },
  // { title: "Users", link: "/users", icon: Users, iconColor: "text-blue-500" },
  // {
  //   title: "Department",
  //   link: "/departments",
  //   icon: Home,
  //   iconColor: "text-red-500",
  // },
  // {
  //   title: "Priorities",
  //   link: "/priority/manage",
  //   icon: ArrowUp,
  //   iconColor: "text-green-500",
  // },
  // {
  //   title: "Workspaces",
  //   link: "/workspaces",
  //   icon: CheckSquare,
  //   iconColor: "text-red-500",
  // },
  {
    title: "Chat",
    link: "/chat",
    icon: MessageSquare,
    iconColor: "text-yellow-500",
    badge: 0,
  },
  {
    title: "Todos",
    link: "/todos",
    icon: ListCheck,
    iconColor: "text-gray-800",
    badge: 0,
  },
  {
    title: "Meetings",
    link: "/meetings",
    icon: Hexagon,
    iconColor: "text-green-500",
    badge: 0,
  },
  {
    title: "Announcements",
    link: "/announcements",
    icon: MessageSquare,
    iconColor: "text-yellow-500",
  },

  // { title: "Sites", link: "/sites", icon: Users, iconColor: "text-yellow-500" },
  // {
  //   title: "Contracts",
  //   icon: FileText,
  //   iconColor: "text-green-500",
  //   submenu: [
  //     { title: "Manage Contracts", link: "/contracts" },
  //     { title: "Contract Types", link: "/contracts/contract-types" },
  //   ],
  // },
  // {
  //   title: "Budget",
  //   link: "/budget/allocate",
  //   icon: DollarSign,
  //   iconColor: "text-yellow-500",
  // },
  // {
  //   title: "Budget Overview",
  //   link: "/budgets/overview",
  //   icon: DollarSign,
  //   iconColor: "text-yellow-500",
  // },

  // {
  //   title: "Inventories",
  //   icon: BoxIcon,
  //   iconColor: "text-green-500",
  //   submenu: [
  //     {
  //       title: "Manage Warehouses",
  //       link: "/warehouses",
  //       icon: Building,
  //       iconColor: "text-blue-500",
  //     },

  //     {
  //       title: "Transfers",
  //       link: "/transfer",
  //       icon: ArrowRightLeft, // replaced Transfer with ArrowsRightLeft
  //       iconColor: "text-gray-500",
  //     },
  //     {
  //       title: "Incoming Transfer",
  //       link: "/incoming/transfer",
  //       badge: 3,
  //     },
  //     {
  //       title: "Dispatch",
  //       link: "/dispatch",
  //       icon: ArrowRightLeft,
  //       iconColor: "text-gray-500",
  //     },
  //     { title: "Delivery (GRN)", link: "/delivery" },
  //     { title: "Purchase Requisition", link: "/transfer" },
  //     {
  //       title: "Damages & Return",
  //       link: "/damages",
  //       icon: ListCheck,
  //       iconColor: "text-gray-800",
  //     },
  //     {
  //       title: "Inventory History",
  //       link: "/inventory-history",
  //       icon: History,
  //       iconColor: "text-gray-800",
  //     },
  //     {
  //       title: "Report",
  //       link: "/inventory-report",
  //       icon: FileText,
  //       iconColor: "text-gray-400",
  //     },
  //   ],
  // },
  {
    title: "Hr Dashboard",
    link: "/hrm",
    icon: Users,
    iconColor: "text-yellow-500",
  },
  // {
  //   title: "Job Position",
  //   link: "/employee_possition",
  //   icon: Users,
  //   iconColor: "text-yellow-500",
  // },
  // {
  //   title: "Labor",
  //   link: "/labors",
  //   icon: Users,
  //   iconColor: "text-yellow-500",
  // },
  // {
  //   title: "Payslips",
  //   icon: BoxIcon,
  //   iconColor: "text-yellow-500",
  //   submenu: [
  //     { title: "Manage Payslips", link: "/payslips" },
  //     { title: "Allowances", link: "/allowances" },
  //     { title: "Deductions", link: "/deductions" },
  //   ],
  // },
  // {
  //   title: "Finance",
  //   icon: CreditCard,
  //   iconColor: "text-green-500",
  //   submenu: [
  //     { title: "Expenses", link: "/expenses" },
  //     { title: "Estimates/Invoices", link: "/estimates-invoices" },
  //     { title: "Payments", link: "/payments" },
  //     { title: "Payment Methods", link: "/payment-methods" },
  //     { title: "Taxes", link: "/taxes" },
  //     { title: "Units", link: "/units" },
  //     { title: "Items", link: "/items" },
  //   ],
  // },
  // {
  //   title: "Notes",
  //   link: "/notes",
  //   icon: BookOpen, // replaced Note with BookOpen
  //   iconColor: "text-blue-500",
  // },
  {
    title: "Leave Requests",
    link: "/leave-requests",
    icon: ArrowRight,
    iconColor: "text-red-500",
    badge: 3,
  },
  {
    title: "Activity Log",
    link: "/activity-log",
    icon: LineChart,
    iconColor: "text-yellow-500",
  },
  {
    title: "Settings",
    icon: Settings,
    iconColor: "text-green-500",
    submenu: [
      { title: "General", link: "/settings", icon: Settings2, iconColor: "text-blue-500" },
      { title: "Permissions", link: "/settings/permission", icon: Lock, iconColor: "text-green-500" },

      { title: "Users", link: "/users", icon: Users, iconColor: "text-blue-500" },
      {
        title: "Department",
        link: "/departments",
        icon: Home,
        iconColor: "text-red-500",
      },
      {
        title: "Priorities",
        link: "/priority/manage",
        icon: ArrowUp,
        iconColor: "text-green-500",
      },
      {
        title: "Statuses",
        link: "/status/manage",
        icon: Grid,
        iconColor: "text-gray-500",
      },
      {
        title: "Clients",
        link: "/clients",
        icon: Users,
        iconColor: "text-yellow-500",
      },
      { title: "Sites", link: "/sites", icon: Users, iconColor: "text-yellow-500" },
      { title: "Languages", link: "/settings/languages", icon: Languages, iconColor: "text-cyan-600" },
      // { title: "E-mail", link: "/settings/email" },
      // { title: "SMS Gateway", link: "/settings/sms-gateway" },
      // { title: "Pusher", link: "/settings/pusher" },
      // { title: "Media Storage", link: "/settings/media-storage" },
      // { title: "Templates", link: "/settings/templates" },
      // { title: "System Updater", link: "/settings/system-updater" },
    ],
  },
  {
    title: "Report",
    icon: FileText,
    iconColor: "text-green-500",
    submenu: [
      { title: "Project", link: "/project/report" },
      { title: "Tasks", link: "/task/report" },
    ],
  },
];

export default menuItems;
