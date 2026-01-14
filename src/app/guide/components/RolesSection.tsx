"use client";

import React from "react";
import { ShieldCheck, Plus, Edit2, Trash2 } from "lucide-react";
import { GuideCard } from "./GuideCard";

export const RolesSection: React.FC = () => {
    return (
        <GuideCard title="Roles & Permissions" icon={ShieldCheck}>
            <p>
                Roles determine what each person can see and do in the system. You manage them in
                <strong> Settings {">"} Roles</strong>.
            </p>

            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900">Creating a New Role</h4>
                <p>Follow these steps to add a new job role:</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                    <li>Click the <strong>Add New Role</strong> button.</li>
                    <li>Give the role a name like <strong>Project Manager</strong> or <strong>Site Auditor</strong>.</li>
                    <li>The system will show you a list of every module (Projects, Tasks, Users, etc.).</li>
                    <li>Check the boxes for <strong>View</strong>, <strong>Create</strong>, <strong>Edit</strong>, or <strong>Delete</strong> to give that role specific powers.</li>
                    <li>Click <strong>Save</strong>.</li>
                </ol>
            </section>

            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900">Updating & Managing Roles</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <h5 className="font-bold flex items-center gap-2 mb-2">
                            <Edit2 className="w-4 h-4 text-primary" /> Edit Permissions
                        </h5>
                        <p className="text-sm">Click the <strong>Edit</strong> icon to change what an existing role can do.</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <h5 className="font-bold flex items-center gap-2 mb-2">
                            <Trash2 className="w-4 h-4 text-red-500" /> Delete Role
                        </h5>
                        <p className="text-sm">Click the <strong>Delete</strong> icon to remove a role. Note: Users with this role will lose their access until you give them a new role.</p>
                    </div>
                </div>
            </section>
        </GuideCard>
    );
};
