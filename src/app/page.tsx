import Card from "@/components/ui/Card";
import { Briefcase, ListChecks, Users, UserCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-wrap -mx-2 mt-4">
      <Card
        title="Total Projects"
        count={6}
        link="/projects"
        Icon={Briefcase}
        color="green-500"
      />
      <Card
        title="Total Tasks"
        count={45}
        link="/tasks"
        Icon={ListChecks}
        color="blue-500"
      />
      <Card
        title="Total Users"
        count={12}
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
  );
}
