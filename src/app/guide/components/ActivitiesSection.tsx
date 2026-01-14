"use client";

import React from "react";
import { Activity, Plus, Edit2, Trash2, Eye, FilePlus, Clock, Search, Filter, Settings2, Table } from "lucide-react";
import { GuideCard } from "./GuideCard";

export const ActivitiesSection: React.FC = () => {
    return (
        <GuideCard title="Daily Activities" icon={Activity}>
            <p>
                Activities are the daily reports of work done on site. They allow you to record day-to-day progress for every task.
            </p>

            {/* 1. Create & Edit */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900">How to Create & Edit</h4>
                <p>Go to any <strong>Task</strong> details and click the <strong>Add Activity</strong> button.</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                    <li><strong>Creating:</strong> Select the date, enter the hours worked, and describe the work done (e.g., "Poured first floor concrete").</li>
                    <li><strong>Editing:</strong> Click <strong>Edit</strong> on an activity log to correct hours or update the description.</li>
                </ul>
            </section>

            {/* 2. Attachments */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FilePlus className="w-5 h-5 text-primary" /> Attachments (Site Photos)
                </h4>
                <p>Site supervisors should use the <strong>Attachment</strong> button to upload photos of the work finished today. This provides visual proof of progress for the main office.</p>
            </section>

            {/* 3. Manage Progress & Timesheets */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> Managing Progress & Timesheets
                </h4>
                <p>The <strong>Manage</strong> form for Activities includes the <strong>Timesheet</strong> section. Here you can add specific details about which materials were used and which site workers (Labor) were present.</p>
                <div className="bg-gray-50 p-4 border rounded-xl">
                    <p className="text-sm font-bold">Labor Hours:</p>
                    <p className="text-xs text-gray-600">Enter the Clock-in and Clock-out times for workers to ensure accurate payroll calculation.</p>
                </div>
            </section>

            {/* 4. Customization, Search & Filter */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-primary" /> Control Your List
                </h4>
                <p className="text-sm font-medium">Use the toolbar at the top of the Activities table to:</p>
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <li className="p-2 border rounded bg-white font-bold text-center">SEARCH LOGS</li>
                    <li className="p-2 border rounded bg-white font-bold text-center">FILTER BY DATE</li>
                    <li className="p-2 border rounded bg-white font-bold text-center">CUSTOMIZE FIELDS</li>
                </ul>
            </section>

            {/* 5. Actual Tables */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Table className="w-5 h-5 text-primary" /> The Actuals Table
                </h4>
                <p className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 text-sm">
                    Activities feed directly into the **Actual Progress** of a project. When you enter the actual amount of material used or hours worked, the system automatically compares this with the project's original plan.
                </p>
            </section>
        </GuideCard>
    );
};
