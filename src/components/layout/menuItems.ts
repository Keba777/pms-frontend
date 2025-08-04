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
  Languages,
  Activity,
  CalendarRange,
  Store,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", link: "/", icon: Home, iconColor: "text-rose-500" },

  {
    title: "Projects",
    icon: Briefcase,
    iconColor: "text-emerald-600",
    submenu: [
      { title: "Manage Projects", link: "/projects", active: true },
      { title: "Favorite Projects", link: "/projects/favorite" },
      { title: "Project Phase", link: "/projects/phase" },
    ],
  },

  {
    title: "Tasks",
    link: "/tasks",
    icon: ClipboardList,
    iconColor: "text-sky-600",
  },
  {
    title: "Activities",
    link: "/activities",
    icon: Activity,
    iconColor: "text-orange-500",
  },
  {
    title: "Master-schedule",
    link: "/master-schedule",
    icon: CalendarRange,
    iconColor: "text-indigo-600",
  },

  {
    title: "Issues",
    link: "/issues",
    icon: ArrowUp,
    iconColor: "text-red-600",
  },

  {
    title: "Manage Resources",
    icon: Clipboard,
    iconColor: "text-yellow-600",
    submenu: [
      {
        title: "Manage Materials",
        link: "/resources/materials",
        icon: BoxIcon,
        iconColor: "text-cyan-600",
      },
      {
        title: "Manage Equipment",
        link: "/resources/equipments",
        icon: PenTool,
        iconColor: "text-zinc-600",
      },
      {
        title: "Manage Labors",
        link: "/resources/labors",
        icon: Users,
        iconColor: "text-gray-600",
      },
    ],
  },

  {
    title: "Requests",
    icon: ListCheck,
    iconColor: "text-blue-600",
    submenu: [
      { title: "Incoming Requests", link: "/requests-incoming" },
      { title: "Request Materials", link: "/requests/materials" },
      { title: "Request Equipment", link: "/requests/equipments" },
      { title: "Request Labor", link: "/requests/labors" },
    ],
  },

  {
    title: "Allocation",
    icon: CheckSquare,
    iconColor: "text-lime-600",
    submenu: [
      { title: "Request Allocation", link: "/allocation" },
      { title: "Approvals", link: "/request-approval" },
      { title: "Delivery Report", link: "/deliveries" },
    ],
  },
  {
    title: "Dispatch",
    link: "/dispatches",
    icon: ArrowRight,
    iconColor: "text-purple-600",
  },

  {
    title: "Request Delivery",
    link: "/request-delivery",
    icon: FileText,
    iconColor: "text-teal-600",
  },
  
  {
    title: "Store Requestion",
    link: "/store-requisition",
    icon: Store,
    iconColor: "text-blue-600",
  },

  {
    title: "KPI",
    link: "/kpis",
    icon: LineChart,
    iconColor: "text-pink-600",
  },

  {
    title: "My Warehouse",
    link: "/mywarehouse",
    icon: ListCheck,
    iconColor: "text-teal-600",
  },
  {
    title: "My Materials",
    link: "/site-materials",
    icon: BoxIcon,
    iconColor: "text-violet-600",
  },
  {
    title: "My Equipment",
    link: "/site-equipments",
    icon: PenTool,
    iconColor: "text-gray-600",
  },
  {
    title: "My Labors",
    link: "/site-labors",
    icon: Users,
    iconColor: "text-gray-600",
  },

  {
    title: "Chat",
    link: "/chat",
    icon: MessageSquare,
    iconColor: "text-yellow-500",
    badge: 0,
  },
  {
    title: "Team Chats",
    link: "/group-chat",
    icon: Users,
    iconColor: "text-purple-600",
    badge: 0,
  },

  {
    title: "Meetings",
    link: "/meetings",
    icon: Hexagon,
    iconColor: "text-green-600",
    badge: 0,
  },
  {
    title: "Announcements",
    link: "/announcements",
    icon: MessageSquare,
    iconColor: "text-orange-400",
  },

  {
    title: "Schedule",
    link: "/schedule",
    icon: ClipboardList,
    iconColor: "text-indigo-500",
  },

  {
    title: "Task Reports",
    link: "/taskreports",
    icon: FileText,
    iconColor: "text-rose-600",
  },

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
    iconColor: "text-amber-600",
  },
  {
    title: "Settings",
    icon: Settings,
    iconColor: "text-emerald-700",
    submenu: [
      {
        title: "General",
        link: "/settings",
        icon: Settings2,
        iconColor: "text-blue-600",
      },
      {
        title: "Permissions",
        link: "/settings/permission",
        icon: Lock,
        iconColor: "text-rose-600",
      },
      {
        title: "Users",
        link: "/users",
        icon: Users,
        iconColor: "text-indigo-600",
      },
      {
        title: "Department",
        link: "/departments",
        icon: Home,
        iconColor: "text-yellow-600",
      },
      {
        title: "Priorities",
        link: "/priority/manage",
        icon: ArrowUp,
        iconColor: "text-orange-600",
      },
      {
        title: "Statuses",
        link: "/status/manage",
        icon: Grid,
        iconColor: "text-gray-700",
      },
      {
        title: "Clients",
        link: "/clients",
        icon: Users,
        iconColor: "text-emerald-600",
      },
      {
        title: "Sites",
        link: "/sites",
        icon: Users,
        iconColor: "text-violet-600",
      },
      {
        title: "Languages",
        link: "/settings/languages",
        icon: Languages,
        iconColor: "text-cyan-600",
      },
    ]
  },

  {
    title: "",
  },
  {
    title: "",
  }
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
  // {
  //   title: "Hr Dashboard",
  //   link: "/hrm",
  //   icon: Users,
  //   iconColor: "text-yellow-500",
  // },
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
  // {
  //   title: "Report",
  //   icon: FileText,
  //   iconColor: "text-green-500",
  //   submenu: [
  //     { title: "Project", link: "/project/report" },
  //     { title: "Tasks", link: "/task/report" },
  //   ],
  // },
];

export default menuItems;
