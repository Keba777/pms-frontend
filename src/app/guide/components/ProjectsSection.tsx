"use client";

import React from "react";
import { Briefcase, Plus, Edit2, Trash2, Eye, FilePlus, Search, Filter, Settings2, Table } from "lucide-react";
import { GuideCard } from "./GuideCard";

export const ProjectsSection: React.FC = () => {
    return (
        <GuideCard title="Projects" icon={Briefcase}>
            <p>
                Projects are the foundation of your construction management. Everything from tasks to material logistics revolves around a project.
            </p>

            {/* 1. Create & Edit */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900">How to Create & Edit</h4>
                <p>To start, go to <strong>Projects {">"} Manage Projects</strong>.</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                    <li><strong>Creating:</strong> Click the <strong>Add New Project</strong> button. Fill in the title, client, budget, and site. (Tip: Use the <strong>(+)</strong> icon to add clients or sites instantly).</li>
                    <li><strong>Editing:</strong> Click the <strong>Edit</strong> icon on any project row to change its basic details like manager or deadline.</li>
                </ul>
            </section>

            {/* 2. Attachments */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FilePlus className="w-5 h-5 text-primary" /> Adding Photos & Files
                </h4>
                <p>You can store project contracts, blueprints, or site photos directly in the system.</p>
                <p>Inside the Project form or the Details page, use the <strong>Attachment</strong> button to upload files. These are saved in the <strong>Files</strong> tab for everyone on the team to see.</p>
            </section>

            {/* 3. Manage & Progress */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-primary" /> Managing Progress
                </h4>
                <p>The <strong>Manage</strong> form is where you update the status of the project. You can record exactly what percentage of the work is done and add specific notes about the current stage of construction.</p>
            </section>

            {/* 4. Detail Pages & Navigation */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" /> Detail Pages & Task Creation
                </h4>
                <p>Click the <strong>View Details</strong> (Eye icon) to enter the project dashboard. This page contains:</p>
                <ul className="list-disc list-inside space-y-2 ml-2 text-sm">
                    <li><strong>Discussion:</strong> Team chat specific to this project.</li>
                    <li><strong>Tasks:</strong> You can create and assign project milestones directly from this tab.</li>
                    <li><strong>Issues & Files:</strong> Track problems and browse all uploaded documents.</li>
                </ul>
            </section>

            {/* 5. Customization, Search & Filter */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-primary" /> Search, Filter & Customize
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 border rounded bg-gray-50 flex items-center gap-2">
                        <Search className="w-4 h-4" /> <strong>Search:</strong> Find projects by name.
                    </div>
                    <div className="p-3 border rounded bg-gray-50 flex items-center gap-2">
                        <Filter className="w-4 h-4" /> <strong>Filter:</strong> Filter by Status or Site.
                    </div>
                    <div className="p-3 border rounded bg-gray-50 flex items-center gap-2">
                        <Settings2 className="w-4 h-4" /> <strong>Fields:</strong> Customize which columns you see.
                    </div>
                </div>
            </section>

            {/* 6. Actual Tables */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Table className="w-5 h-5 text-primary" /> Actual Progress Tables
                </h4>
                <p className="bg-primary/5 p-4 rounded-lg border border-primary/10 text-sm">
                    Unlike "Planned" data, the **Actual Table** tracks what is happening in reality. Go to the project list to compare your Budget vs Actual spend and Timeline vs Actual progress. You can manually enter final data into these tables to close out phases.
                </p>
            </section>
        </GuideCard>
    );
};
