"use client";

import Card from "@/components/ui/Card";
import StatsCard from "@/components/dashboard/StatsCard";
import {
  Briefcase,
  ListChecks,
  Users,
  UserCheck,
  Activity as ActivityIcon,
} from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useUsers } from "@/hooks/useUsers";
import { useActivities } from "@/hooks/useActivities";

export default function Home() {
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  const { data: tasks, isLoading: isLoadingTasks } = useTasks();
  const { data: users, isLoading: isLoadingUsers } = useUsers();
  const { data: activities, isLoading: isLoadingActivities } = useActivities();

  // Function to count projects by status
  const getProjectCountByStatus = (status: string) => {
    return projects?.filter((project) => project.status === status).length || 0;
  };

  // Calculate total projects separately
  const totalProjects = projects?.length || 0;

  // Project statistics array
  const projectStats = [
    {
      label: "Not Started",
      value: getProjectCountByStatus("Not Started"),
      icon: <Briefcase size={18} />,
      iconColor: "#f87171",
      link: "/projects",
    },
    {
      label: "Started",
      value: getProjectCountByStatus("Started"),
      icon: <Briefcase size={18} />,
      iconColor: "#facc15",
      link: "/projects",
    },
    {
      label: "In Progress",
      value: getProjectCountByStatus("InProgress"),
      icon: <Briefcase size={18} />,
      iconColor: "#3b82f6",
      link: "/projects",
    },
    {
      label: "On Hold",
      value: getProjectCountByStatus("Onhold"),
      icon: <Briefcase size={18} />,
      iconColor: "#f59e0b",
      link: "/projects",
    },
    {
      label: "Canceled",
      value: getProjectCountByStatus("Canceled"),
      icon: <Briefcase size={18} />,
      iconColor: "#ef4444",
      link: "/projects",
    },
    {
      label: "Completed",
      value: getProjectCountByStatus("Completed"),
      icon: <Briefcase size={18} />,
      iconColor: "#10b981",
      link: "/projects",
    },
  ];

  // Helper to count tasks by status (using Task statuses)
  const getTaskCountByStatus = (status: string) => {
    return tasks?.filter((task) => task.status === status).length || 0;
  };

  // Tasks statistics array
  const tasksStats = [
    {
      label: "Not Started",
      value: getTaskCountByStatus("Not Started"),
      icon: <ListChecks size={18} />,
      iconColor: "#f87171",
      link: "/tasks",
    },
    {
      label: "Started",
      value: getTaskCountByStatus("Started"),
      icon: <ListChecks size={18} />,
      iconColor: "#facc15",
      link: "/tasks",
    },
    {
      label: "In Progress",
      value: getTaskCountByStatus("InProgress"),
      icon: <ListChecks size={18} />,
      iconColor: "#3b82f6",
      link: "/tasks",
    },
    {
      label: "On Hold",
      value: getTaskCountByStatus("Onhold"),
      icon: <ListChecks size={18} />,
      iconColor: "#f59e0b",
      link: "/tasks",
    },
    {
      label: "Canceled",
      value: getTaskCountByStatus("Canceled"),
      icon: <ListChecks size={18} />,
      iconColor: "#ef4444",
      link: "/tasks",
    },
    {
      label: "Completed",
      value: getTaskCountByStatus("Completed"),
      icon: <ListChecks size={18} />,
      iconColor: "#10b981",
      link: "/tasks",
    },
  ];

  // Helper to count activities by status (using Activity statuses)
  const getActivityCountByStatus = (status: string) => {
    return (
      activities?.filter((activity) => activity.status === status).length || 0
    );
  };

  // Activities statistics array
  const activitiesStats = [
    {
      label: "Not Started",
      value: getActivityCountByStatus("Not Started"),
      icon: <ActivityIcon size={18} />,
      iconColor: "#f87171",
      link: "/activities",
    },
    {
      label: "Started",
      value: getActivityCountByStatus("Started"),
      icon: <ActivityIcon size={18} />,
      iconColor: "#facc15",
      link: "/activities",
    },
    {
      label: "In Progress",
      value: getActivityCountByStatus("InProgress"),
      icon: <ActivityIcon size={18} />,
      iconColor: "#3b82f6",
      link: "/activities",
    },
    {
      label: "On Hold",
      value: getActivityCountByStatus("Onhold"),
      icon: <ActivityIcon size={18} />,
      iconColor: "#f59e0b",
      link: "/activities",
    },
    {
      label: "Canceled",
      value: getActivityCountByStatus("Canceled"),
      icon: <ActivityIcon size={18} />,
      iconColor: "#ef4444",
      link: "/activities",
    },
    {
      label: "Completed",
      value: getActivityCountByStatus("Completed"),
      icon: <ActivityIcon size={18} />,
      iconColor: "#10b981",
      link: "/activities",
    },
  ];

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
          count={isLoadingTasks ? 0 : tasks?.length || 0}
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
          title="Total Clients"
          count={1}
          link="/clients"
          Icon={UserCheck}
          color="cyan-500"
        />
      </div>

      <div className="mb-4 mt-6">
        <h2 className="text-4xl text-center font-bold text-cyan-800">
          Project Statistics
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <StatsCard
          title="Project Statistics"
          items={projectStats}
          total={totalProjects}
        />
        <StatsCard
          title="Task Statistics"
          items={tasksStats}
          total={isLoadingTasks ? 0 : tasks?.length || 0}
        />
        <StatsCard
          title="Activity Statistics"
          items={activitiesStats}
          total={isLoadingActivities ? 0 : activities?.length || 0}
        />
      </div>
    </div>
  );
}
