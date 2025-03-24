import { useState } from "react";
import { Folder, CheckSquare } from "lucide-react";
import ProjectSection from "./ProjectSection";
import TaskSection from "./TaskSection";

const TabNavigation = () => {
  const [activeTab, setActiveTab] = useState("projects");

  return (
    <div className="w-full">
      {/* Navigation Tabs */}
      <div className="bg-white flex space-x-4">
        {[
          {
            name: "projects",
            icon: <Folder className="w-5 h-5 text-blue-500" />,
          },
          {
            name: "tasks",
            icon: <CheckSquare className="w-5 h-5 text-green-500" />,
          },
        ].map(({ name, icon }) => (
          <button
            key={name}
            className={`flex items-center space-x-2 py-2 px-4 font-medium ${
              activeTab === name
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(name)}
          >
            {icon}
            <span>{name.charAt(0).toUpperCase() + name.slice(1)}</span>
          </button>
        ))}
      </div>

      {/* Content Based on Active Tab */}
      <div className="mt-4 text-center">
        {activeTab === "projects" && <ProjectSection />}
        {activeTab === "tasks" && <TaskSection />}
      </div>
    </div>
  );
};

export default TabNavigation;
