"use client";

import React from "react";
import { AlertTriangle, Plus, CheckCircle, Clock } from "lucide-react";
import { GuideCard } from "./GuideCard";

export const IssuesSection: React.FC = () => {
    return (
        <GuideCard title="Issues Tracking" icon={AlertTriangle}>
            <p>
                Use the <strong>Issues</strong> menu to report and track problems on site, such as machine breakdowns or material delays.
            </p>

            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-rose-500" /> Reporting a Problem
                </h4>
                <p>Go to the <strong>Issues</strong> page and click <strong>Add New Issue</strong>.</p>
                <ul className="list-disc list-inside space-y-2 text-sm ml-2">
                    <li><strong>Title:</strong> Briefly describe the problem.</li>
                    <li><strong>Project:</strong> Select the project where the issue is happening.</li>
                    <li><strong>Severity:</strong> Choose if it is <strong>Low</strong>, <strong>Medium</strong>, <strong>High</strong>, or <strong>Critical</strong>.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" /> Resolving Issues
                </h4>
                <p className="text-sm">
                    Admins can update the status of an issue once it is fixed. Click <strong>Edit</strong> on an issue and change the status to <strong>Resolved</strong>. This helps the whole team know that the problem is cleared.
                </p>
            </section>
        </GuideCard>
    );
};
