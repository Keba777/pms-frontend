"use client";

import React from "react";
import { CheckSquare, Plus, Edit2, Trash2, FilePlus, Search, Filter, Settings2, Users } from "lucide-react";
import { GuideCard } from "./GuideCard";

export const TodosSection: React.FC = () => {
    return (
        <GuideCard title="Todos" icon={CheckSquare}>
            <p>
                <strong>Todos</strong> are personal or shared reminders. They are separate from official project tasks and are perfect for small, quick items.
            </p>

            {/* 1. Create & Edit */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900">How to Create & Edit</h4>
                <ul className="list-disc list-inside space-y-2 ml-2">
                    <li><strong>Creating:</strong> Type your task in the input field on the Todos page and click the <strong>Add</strong> button.</li>
                    <li><strong>Editing:</strong> Click the <strong>Edit</strong> icon next to any item to change the description or the person it is assigned to.</li>
                    <li><strong>Deleting:</strong> Use the <strong>Delete</strong> (trash) icon to remove a reminder permanently.</li>
                </ul>
            </section>

            {/* 2. Attachments */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FilePlus className="w-5 h-5 text-primary" /> Adding Files to Todos
                </h4>
                <p className="text-sm">Even for small todos, you can use the <strong>Attachment</strong> button to upload a document or a photo related to that reminder.</p>
            </section>

            {/* 3. Manage & Progress */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-primary" /> Status Management
                </h4>
                <p className="text-sm">Manage the progress by clicking the <strong>Checkbox</strong> to mark a task as "Done". You can also add more details to the todo description to record what was done.</p>
            </section>

            {/* 4. Shared vs Personal */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" /> Shared Reminders
                </h4>
                <p className="text-sm">When creating or editing a todo, you can select another user to assign it to. This creates a <strong>Shared Todo</strong> that both you and the teammate can track.</p>
            </section>

            {/* 5. Customization, Search & Filter */}
            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-primary" /> Search & Filter
                </h4>
                <p className="text-sm">Use the top bar to filter between <strong>My Todos</strong>, <strong>Assigned to Others</strong>, or <strong>Completed Items</strong>. You can also search for keywords to find an old reminder quickly.</p>
            </section>
        </GuideCard>
    );
};
