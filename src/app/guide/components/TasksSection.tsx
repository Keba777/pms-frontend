"use client";

import React from "react";
import { ClipboardList, Plus, Edit2, Trash2, Eye, FilePlus, Search, Filter, Settings2, Table, Activity } from "lucide-react";
import { GuideCard } from "./GuideCard";

export const TasksSection: React.FC = () => {
    return (
        <GuideCard title="Tasks" icon={ClipboardList}>
            <p>
                Tasks represent the specific work milestones within a project, such as "Foundation Work" or "Roofing".
            </p>

            {/* 1. Create & Edit */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900">How to Create & Edit</h4>
                <p>You can create tasks directly inside a Project's detail page.</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                    <li><strong>Creating:</strong> Go to the <strong>Tasks</strong> tab of a project and click <strong>Add New Task</strong>. Set the name, priority, and link it to a specific part of the project.</li>
                    <li><strong>Editing:</strong> Use the <strong>Edit</strong> icon on the task row to change the planned dates or the team member responsible for the milestone.</li>
                </ul>
            </section>

            {/* 2. Attachments */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FilePlus className="w-5 h-5 text-primary" /> Adding Photos & Files
                </h4>
                <p>Every task supports file uploads. You can attach technical drawings or site safety documents.</p>
                <p>Click the <strong>Attachment</strong> button within the task form to add files. You can also see all task-related files in the Project's main <strong>Files</strong> tab.</p>
            </section>

            {/* 3. Manage & Progress */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-primary" /> Updating Progress
                </h4>
                <p>The <strong>Manage Task</strong> form allows you to record how much work has been finished. You can update the completion percentage and write notes about what was achieved during this phase.</p>
            </section>

            {/* 4. Detail Pages & Activities */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" /> Task Details & Activity Creation
                </h4>
                <p>Click <strong>View Details</strong> on a task to see its history. From here, you can click <strong>Add Activity</strong> to log the specific daily work that was done to complete this task.</p>
            </section>

            {/* 5. Customization, Search & Filter */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-primary" /> Search, Filter & Customize
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-3 border rounded bg-gray-50 flex items-center gap-2">
                        <Search className="w-4 h-4" /> <strong>Search:</strong> Find specific tasks.
                    </div>
                    <div className="p-3 border rounded bg-gray-50 flex items-center gap-2">
                        <Filter className="w-4 h-4" /> <strong>Filter:</strong> Filter by Status (Done, Pending).
                    </div>
                    <div className="p-3 border rounded bg-gray-50 flex items-center gap-2">
                        <Settings2 className="w-4 h-4" /> <strong>Customize:</strong> Hide or show table columns.
                    </div>
                </div>
            </section>

            {/* 6. Actual Tables */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Table className="w-5 h-5 text-primary" /> Actual Progress Tables
                </h4>
                <p className="bg-primary/5 p-4 rounded-lg border border-primary/10 text-sm italic">
                    Tasks have a dedicated **Actual Table** that displays the real start and end dates vs the planned ones. This helps the project manager see if a milestone is running behind schedule.
                </p>
            </section>
        </GuideCard>
    );
};
