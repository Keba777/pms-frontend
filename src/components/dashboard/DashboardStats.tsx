"use client";

import Card from "@/components/common/ui/Card";
import StatsCard from "@/components/dashboard/StatsCard";
import {
  Briefcase,
  ListChecks,
  Users,
  Activity as ActivityIcon,
  ListTodo,
} from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useUsers } from "@/hooks/useUsers";
import { useActivities } from "@/hooks/useActivities";
import { JSX } from "react";
import { useTodos } from "@/hooks/useTodos";
import TodosStats from "./TodosStats";

// Define types for your items
type Status =
  | "Not Started"
  | "Started"
  | "InProgress"
  | "Onhold"
  | "Canceled"
  | "Completed";

interface ItemWithStatus {
  status: Status;
}

interface StatItem {
  label: string;
  value: number;
  icon: JSX.Element;
  iconColor: string;
  link: string;
}

export default function DashboardStats() {
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { data: tasks, isLoading: isLoadingTasks } = useTasks();
  const { data: users, isLoading: isLoadingUsers } = useUsers();
  const { data: activities } = useActivities();
  const { data: todos, isLoading: isLoadingTodos } = useTodos();

  // Helper function to count items by status
  const getCountByStatus = (
    items: ItemWithStatus[] | undefined,
    status: Status
  ): number => {
    return items?.filter((item) => item.status === status).length || 0;
  };

  const totalProjects = projects?.length || 0;
  const totalTasks = tasks?.length || 0;
  const totalActivities = activities?.length || 0;

  // Define statistics
  const generateStats = (
    items: ItemWithStatus[] | undefined,
    icon: JSX.Element,
    baseColor: string,
    link: string
  ): StatItem[] => [
    {
      label: "Not Started",
      value: getCountByStatus(items, "Not Started"),
      icon,
      iconColor: "#f87171",
      link,
    },
    {
      label: "Started",
      value: getCountByStatus(items, "Started"),
      icon,
      iconColor: "#facc15",
      link,
    },
    {
      label: "In Progress",
      value: getCountByStatus(items, "InProgress"),
      icon,
      iconColor: "#3b82f6",
      link,
    },
    {
      label: "On Hold",
      value: getCountByStatus(items, "Onhold"),
      icon,
      iconColor: "#f59e0b",
      link,
    },
    {
      label: "Canceled",
      value: getCountByStatus(items, "Canceled"),
      icon,
      iconColor: "#ef4444",
      link,
    },
    {
      label: "Completed",
      value: getCountByStatus(items, "Completed"),
      icon,
      iconColor: "#10b981",
      link,
    },
  ];

  const projectStats = generateStats(
    projects,
    <Briefcase size={18} />,
    "#3b82f6",
    "/projects"
  );
  const tasksStats = generateStats(
    tasks,
    <ListChecks size={18} />,
    "#f59e0b",
    "/tasks"
  );
  const activitiesStats = generateStats(
    activities,
    <ActivityIcon size={18} />,
    "#10b981",
    "/activities"
  );

  return (
    <div>
      {/* Summary Cards */}
      <div className="flex flex-wrap -mx-2 mt-4">
        <Card
          title="Total Projects"
          count={isLoadingProjects ? 0 : totalProjects}
          link="/projects"
          Icon={Briefcase}
          color="green-500"
        />
        <Card
          title="Total Tasks"
          count={isLoadingTasks ? 0 : totalTasks}
          link="/tasks"
          Icon={ListChecks}
          color="blue-500"
        />
        <Card
          title="Total Users"
          count={isLoadingUsers ? 0 : users?.length || 0}
          link="/users"
          Icon={Users}
          color="yellow-500"
        />
        <Card
          title="Total Todos"
          count={isLoadingTodos ? 0 : todos?.length || 0}
          link="/todos"
          Icon={ListTodo}
          color="cyan-500"
        />
      </div>

      <div className="mb-4 mt-6">
        <h2 className="text-4xl text-center font-bold text-cyan-800">
          Project Statistics
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-12">
        <StatsCard
          title="Project Statistics"
          items={projectStats}
          total={totalProjects}
        />
        <StatsCard
          title="Task Statistics"
          items={tasksStats}
          total={totalTasks}
        />
        <StatsCard
          title="Activity Statistics"
          items={activitiesStats}
          total={totalActivities}
        />
      </div>
      <div>
        <TodosStats />
      </div>
    </div>
  );
}
