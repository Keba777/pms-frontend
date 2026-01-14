"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface GuideCardProps {
    title: string;
    icon?: LucideIcon;
    children: React.ReactNode;
}

export const GuideCard: React.FC<GuideCardProps> = ({ title, icon: Icon, children }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-12">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                {Icon && <Icon className="w-5 h-5 text-gray-500" />}
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            </div>
            <div className="p-6 space-y-6 text-gray-700 leading-relaxed">
                {children}
            </div>
        </div>
    );
};
