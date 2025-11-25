"use client";

import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { useUsers } from "@/hooks/useUsers";
import { ProgressUpdateItem } from "@/types/activity";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate as format } from "@/utils/dateUtils";
import { useSettingsStore } from "@/store/settingsStore";

const LogTable = ({ updates }: { updates: ProgressUpdateItem[] }) => {
  const { useEthiopianDate } = useSettingsStore();
  const { data: users } = useUsers();

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-cyan-700 text-white hover:bg-cyan-600">
            <TableHead className="text-white">Date Time</TableHead>
            <TableHead className="text-white">From Progress</TableHead>
            <TableHead className="text-white">To Progress</TableHead>
            <TableHead className="text-white">Status</TableHead>
            <TableHead className="text-white">Checked By</TableHead>
            <TableHead className="text-white">Approved By</TableHead>
            <TableHead className="text-white">Approved Date</TableHead>
            <TableHead className="text-white">User Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {updates.map((update: ProgressUpdateItem, index: number) => (
            <TableRow
              key={update.id || index}
              className="even:bg-gray-100 hover:bg-gray-300"
            >
              <TableCell>{format(update.dateTime, useEthiopianDate)}</TableCell>
              <TableCell>
                {update.fromProgress !== undefined
                  ? `${update.fromProgress}%`
                  : "N/A"}
              </TableCell>
              <TableCell>{update.progress}%</TableCell>
              <TableCell>{update.status || "N/A"}</TableCell>
              <TableCell>{update.checkedBy || "N/A"}</TableCell>
              <TableCell>{update.approvedBy || "N/A"}</TableCell>
              <TableCell>{update.approvedDate ? format(update.approvedDate, useEthiopianDate) : "N/A"}</TableCell>
              <TableCell>
                {users?.find((u) => u.id === update.userId)?.first_name ||
                  update.userId ||
                  "Unknown"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const ActivityLogPage = () => {
  const { data: projects, isLoading, error } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null
  );

  const allTasks = projects?.flatMap((p) => p.tasks || []) || [];
  const allActivities = allTasks.flatMap((t) => t.activities || []) || [];

  const selectedProject =
    projects?.find((p) => p.id === selectedProjectId) || null;
  const selectedTask = allTasks.find((t) => t.id === selectedTaskId) || null;
  const selectedActivity =
    allActivities.find((a) => a.id === selectedActivityId) || null;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error loading projects: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <h1 className="text-2xl font-bold text-cyan-700">Activity Log</h1>

      {/* Project Section */}
      <Card className="border-cyan-700">
        <CardHeader>
          <CardTitle className="text-cyan-700">Project Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            onValueChange={(value) => setSelectedProjectId(value)}
            value={selectedProjectId || ""}
          >
            <SelectTrigger className="w-full max-w-[300px] border-cyan-700 focus:ring-cyan-700">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedProject ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                <span className="text-sm text-gray-700">
                  Current Progress: {selectedProject.progress}%
                </span>
                <Slider
                  value={[selectedProject.progress || 0]}
                  max={100}
                  step={1}
                  className="flex-1 [&>span>span]:bg-cyan-700"
                  disabled
                />
              </div>
              <p className="text-sm text-gray-700">
                Status: {selectedProject.status}
              </p>

              {selectedProject.progressUpdates &&
              selectedProject.progressUpdates.length > 0 ? (
                <LogTable updates={selectedProject.progressUpdates} />
              ) : (
                <p className="text-gray-500">
                  No progress updates available for this project.
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-500">Select a project to view its logs.</p>
          )}
        </CardContent>
      </Card>

      {/* Task Section */}
      <Card className="border-amber-700">
        <CardHeader>
          <CardTitle className="text-amber-700">Task Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            onValueChange={(value) => setSelectedTaskId(value)}
            value={selectedTaskId || ""}
          >
            <SelectTrigger className="w-full max-w-[300px] border-amber-700 focus:ring-amber-700">
              <SelectValue placeholder="Select a task" />
            </SelectTrigger>
            <SelectContent>
              {allTasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.task_name} (Project: {projects?.find((p) => p.id === task.project_id)?.title || 'Unknown'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTask ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                <span className="text-sm text-gray-700">
                  Current Progress: {selectedTask.progress}%
                </span>
                <Slider
                  value={[selectedTask.progress || 0]}
                  max={100}
                  step={1}
                  className="flex-1 [&>span>span]:bg-amber-700"
                  disabled
                />
              </div>
              <p className="text-sm text-gray-700">
                Status: {selectedTask.status}
              </p>

              {selectedTask.progressUpdates &&
              selectedTask.progressUpdates.length > 0 ? (
                <LogTable updates={selectedTask.progressUpdates} />
              ) : (
                <p className="text-gray-500">
                  No progress updates available for this task.
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-500">Select a task to view its logs.</p>
          )}
        </CardContent>
      </Card>

      {/* Activity Section */}
      <Card className="border-rose-700">
        <CardHeader>
          <CardTitle className="text-rose-700">Activity Logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            onValueChange={(value) => setSelectedActivityId(value)}
            value={selectedActivityId || ""}
          >
            <SelectTrigger className="w-full max-w-[300px] border-rose-700 focus:ring-rose-700">
              <SelectValue placeholder="Select an activity" />
            </SelectTrigger>
            <SelectContent>
              {allActivities.map((activity) => (
                <SelectItem key={activity.id} value={activity.id}>
                  {activity.activity_name} (Task: {allTasks.find((t) => t.id === activity.task_id)?.task_name || 'Unknown'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedActivity ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                <span className="text-sm text-gray-700">
                  Current Progress: {selectedActivity.progress}%
                </span>
                <Slider
                  value={[selectedActivity.progress || 0]}
                  max={100}
                  step={1}
                  className="flex-1 [&>span>span]:bg-rose-700"
                  disabled
                />
              </div>
              <p className="text-sm text-gray-700">
                Status: {selectedActivity.status}
              </p>

              {selectedActivity.progressUpdates &&
              selectedActivity.progressUpdates.length > 0 ? (
                <LogTable updates={selectedActivity.progressUpdates} />
              ) : (
                <p className="text-gray-500">
                  No progress updates available for this activity.
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-500">
              Select an activity to view its logs.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogPage;