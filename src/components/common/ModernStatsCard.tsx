"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModernStatsCardProps {
    label: string;
    count: string | number;
    icon: LucideIcon;
    description?: string;
    color?: "primary" | "emerald" | "blue" | "amber" | "red" | "purple" | "cyan";
    className?: string;
}


const iconColorMap = {
    primary: "bg-primary text-primary-foreground",
    emerald: "bg-emerald-500 text-white",
    blue: "bg-blue-500 text-white",
    amber: "bg-amber-500 text-white",
    red: "bg-red-500 text-white",
    purple: "bg-purple-500 text-white",
    cyan: "bg-cyan-500 text-white",
};

const ModernStatsCard: React.FC<ModernStatsCardProps> = ({
    label,
    count,
    icon: Icon,
    description,
    color = "primary",
    className,
}) => {
    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md",
                className
            )}
        >
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {label}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold tracking-tight text-foreground">
                            {count}
                        </h3>
                    </div>
                    {description && (
                        <p className="text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>

                <div
                    className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                        iconColorMap[color] || iconColorMap.primary
                    )}
                >
                    <Icon className="h-6 w-6" />
                </div>
            </div>

            {/* Decorative background element */}
            <div className={cn(
                "absolute -bottom-2 -right-2 h-20 w-20 rounded-full opacity-[0.03] transition-transform group-hover:scale-110",
                color === "primary" ? "bg-primary" : `bg-${color}-500`
            )} />
        </div>
    );
};

export default ModernStatsCard;
