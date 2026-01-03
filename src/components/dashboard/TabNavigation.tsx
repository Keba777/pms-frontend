import { useState } from "react";
import { Folder, CheckSquare } from "lucide-react";
import ProjectSection from "./ProjectSection";
import TaskSection from "./TaskSection";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const TabNavigation = () => {
  const [activeTab, setActiveTab] = useState("projects");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex justify-center w-full mb-6">
        <TabsList className="bg-muted p-1 rounded-full inline-flex h-auto">
          <TabsTrigger
            value="projects"
            className="flex items-center space-x-2 py-2 px-6 text-sm font-medium rounded-full transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground"
          >
            <Folder className="w-5 h-5" />
            <span>Projects</span>
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            className="flex items-center space-x-2 py-2 px-6 text-sm font-medium rounded-full transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground"
          >
            <CheckSquare className="w-5 h-5" />
            <span>Tasks</span>
          </TabsTrigger>
        </TabsList>
      </div>
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
