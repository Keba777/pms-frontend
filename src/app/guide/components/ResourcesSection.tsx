"use client";

import React from "react";
import { Box, HardHat, Hammer, Plus, Edit2, Trash2 } from "lucide-react";
import { GuideCard } from "./GuideCard";

export const ResourcesSection: React.FC = () => {
    return (
        <div className="space-y-12">
            <GuideCard title="Materials" icon={Box}>
                <p>Manage all construction materials like cement, sand, or pipes.</p>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                    <h5 className="font-bold text-gray-900 underline decoration-primary decoration-4">Resource Management</h5>
                    <p className="text-sm">Go to <strong>Resources {">"} Materials</strong> to Add, Update, or Delete entries. You can track quantities, units (bags, m3), and base prices.</p>
                    <div className="flex gap-4">
                        <span className="text-xs font-bold uppercase py-1 px-3 bg-white border rounded shadow-sm">Add New</span>
                        <span className="text-xs font-bold uppercase py-1 px-3 bg-white border rounded shadow-sm">Edit Item</span>
                        <span className="text-xs font-bold uppercase py-1 px-3 bg-white border rounded shadow-sm text-red-500">Delete</span>
                    </div>
                </div>
            </GuideCard>

            <GuideCard title="Labor & Workforce" icon={HardHat}>
                <p>Maintain a list of site workers and their information.</p>
                <div className="border p-5 rounded-xl space-y-3">
                    <h6 className="font-bold">Updating Site Labor</h6>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                        <li>Go to <strong>Resources {">"} Labors</strong>.</li>
                        <li>Click <strong>Add Labor</strong> to register a new worker for your company.</li>
                        <li>Edit any labor profile to change their daily target or skill level.</li>
                    </ul>
                </div>
            </GuideCard>

            <GuideCard title="Equipment & Machines" icon={Hammer}>
                <p>Track machines such as cement mixers, excavators, and generators.</p>
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 flex items-start gap-4">
                    <Hammer className="w-8 h-8 text-amber-600 mt-1" />
                    <div>
                        <h6 className="font-bold text-amber-900">Machine Status</h6>
                        <p className="text-sm text-amber-800 leading-relaxed">Update equipment details to show if a machine is <strong>Operational</strong>, <strong>Maintenance Required</strong>, or <strong>Out of Order</strong>.</p>
                    </div>
                </div>
            </GuideCard>
        </div>
    );
};
