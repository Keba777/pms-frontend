"use client";

import React from "react";
import { MapPin, BriefcaseBusiness, Building2, Plus, Edit2, Trash2 } from "lucide-react";
import { GuideCard } from "./GuideCard";

export const MasterDataSection: React.FC = () => {
    return (
        <div className="space-y-12">
            <GuideCard title="Project Sites" icon={MapPin}>
                <p>Sites are the physical physical locations of your projects.</p>
                <div className="p-5 border-2 border-primary/5 rounded-2xl space-y-3">
                    <h6 className="font-bold text-primary">Creating Sites</h6>
                    <p className="text-sm">Go to <strong>Settings {">"} Sites</strong>. Click <strong>Add Site</strong>. A site must exist before you can assign a mission or project to that location.</p>
                    <div className="flex gap-2">
                        <span className="text-[10px] font-black uppercase text-gray-400 border px-2 py-1 rounded">Edit</span>
                        <span className="text-[10px] font-black uppercase text-gray-400 border px-2 py-1 rounded">Delete</span>
                    </div>
                </div>
            </GuideCard>

            <GuideCard title="Clients" icon={BriefcaseBusiness}>
                <p>Register all entities who fund or request projects.</p>
                <div className="space-y-4">
                    <p className="text-sm">Manage these in <strong>Settings {">"} Clients</strong>. You can Create profiles with contact details, Update addresses, or Delete outdated contacts.</p>
                </div>
            </GuideCard>

            <GuideCard title="Departments" icon={Building2}>
                <p>Internal company divisions like Finance, Operations, or Planning.</p>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <p className="text-sm leading-relaxed mb-4">Go to <strong>Settings {">"} Departments</strong> to add or organize your company's structure. You will link every user to one of these departments.</p>
                    <div className="grid grid-cols-2 gap-2">
                        {["Audit", "Logistics", "Procurement", "Engineering"].map(d => (
                            <div key={d} className="text-[10px] font-black text-gray-400 tracking-widest border border-dashed p-1 text-center">{d}</div>
                        ))}
                    </div>
                </div>
            </GuideCard>
        </div>
    );
};
