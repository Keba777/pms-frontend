"use client";

import React from "react";
import { Users, Plus, Edit2, Trash2, Key } from "lucide-react";
import { GuideCard } from "./GuideCard";

export const UsersSection: React.FC = () => {
    return (
        <GuideCard title="User Management" icon={Users}>
            <p>
                Admins can add and manage team members via <strong>Settings {">"} Users</strong>.
            </p>

            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900">Adding a User</h4>
                <p>To register someone in the system, click <strong>Add New User</strong> and enter:</p>
                <ul className="list-disc list-inside space-y-2 ml-2 text-sm">
                    <li><strong>Email:</strong> Required for them to login.</li>
                    <li><strong>Name & Phone:</strong> Contact information.</li>
                    <li><strong>Role:</strong> Assign their job permissions.</li>
                    <li><strong>Site & Department:</strong> Link them to their working location.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900">Managing Access</h4>
                <div className="space-y-3">
                    <div className="p-4 bg-gray-50 border rounded-lg flex items-center gap-3">
                        <Edit2 className="w-5 h-5 text-blue-500" />
                        <p className="text-sm"><strong>Update User:</strong> Change a person's role or move them to a different site if they are transferred.</p>
                    </div>
                    <div className="p-4 bg-gray-50 border rounded-lg flex items-center gap-3">
                        <Key className="w-5 h-5 text-amber-500" />
                        <p className="text-sm"><strong>Reset Password:</strong> Use the change password option in the user list if a worker forgets their login details.</p>
                    </div>
                    <div className="p-4 bg-gray-50 border rounded-lg flex items-center gap-3">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        <p className="text-sm"><strong>Remove User:</strong> Permanently block access for someone who has left the company.</p>
                    </div>
                </div>
            </section>
        </GuideCard>
    );
};
