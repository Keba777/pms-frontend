import { useState } from "react";
import { Folder, CheckSquare } from "lucide-react";
import ProjectSection from "./ProjectSection";
import TaskSection from "./TaskSection";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const TabNavigation = () => {
  const [activeTab, setActiveTab] = useState("projects");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="bg-white border-b flex justify-start space-x-0">
        <TabsTrigger
          value="projects"
          className="flex items-center space-x-2 py-3 px-6 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
        >
          <Folder className="w-5 h-5" />
          <span>Projects</span>
        </TabsTrigger>
        <TabsTrigger
          value="tasks"
          className="flex items-center space-x-2 py-3 px-6 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600"
        >
          <CheckSquare className="w-5 h-5" />
          <span>Tasks</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="projects" className="mt-6">
        <ProjectSection />
      </TabsContent>
      <TabsContent value="tasks" className="mt-6">
        <TaskSection />
      </TabsContent>
    </Tabs>
  );
};

export default TabNavigation;
