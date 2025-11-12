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
  ListTodo,
  DollarSign,
  Wallet,
  CreditCard,
  Receipt,
  Star,
  Inbox,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", link: "/", icon: Home, iconColor: "text-rose-500" },

  {
    title: "HR Dashboard",
    link: "/hrm",
    icon: Users,
    iconColor: "text-cyan-700",
  },
  {
    title: "Projects",
    icon: Briefcase,
    iconColor: "text-emerald-600",
    submenu: [
      { title: "Manage Projects", link: "/projects", active: true, icon: Grid, iconColor: "text-sky-600" },
      { title: "Favorite Projects", link: "/projects/favorite", icon: Star, iconColor: "text-yellow-500" },
      { title: "Project Phase", link: "/projects/phase", icon: CalendarRange, iconColor: "text-indigo-500" },
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
      { title: "Incoming Requests", link: "/requests-incoming", icon: Inbox, iconColor: "text-indigo-500" },
      { title: "Request Materials", link: "/requests/materials", icon: BoxIcon, iconColor: "text-cyan-600" },
      { title: "Request Equipment", link: "/requests/equipments", icon: PenTool, iconColor: "text-zinc-600" },
      { title: "Request Labor", link: "/requests/labors", icon: Users, iconColor: "text-gray-600" },
    ],
  },

  {
    title: "Allocation",
    icon: CheckSquare,
    iconColor: "text-lime-600",
    submenu: [
      { title: "Request Allocation", link: "/allocation", icon: ArrowRight, iconColor: "text-purple-600" },
      { title: "Approvals", link: "/request-approval", icon: ClipboardList, iconColor: "text-amber-600" },
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
    title: "Todos",
    link: "/todos",
    icon: ListTodo,
    iconColor: "text-cyan-600",
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
  // {
  //   title: "Team Chats",
  //   link: "/group-chat",
  //   icon: Users,
  //   iconColor: "text-purple-600",
  //   badge: 0,
  // },

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
    title: "Finance Management",
    icon: DollarSign,
    iconColor: "text-green-500",
    submenu: [
      {
        title: "Invoices",
        link: "/finance/invoices",
        icon: Receipt,
        iconColor: "text-emerald-600",
      },
      {
        title: "Payments",
        link: "/finance/payments",
        icon: CreditCard,
        iconColor: "text-indigo-600",
      },
      {
        title: "Budgets",
        link: "/finance/budgets",
        icon: Wallet,
        iconColor: "text-purple-600",
      },
      {
        title: "Payrolls",
        link: "/finance/payrolls",
        icon: DollarSign,
        iconColor: "text-orange-600",
      },
    ],
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
    ],
  },

  {
    title: "",
  },
  {
    title: "",
  },
];

export default menuItems;
