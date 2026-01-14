"use client";

import React from "react";
import { Building, Settings, Plus, Upload, AlertCircle } from "lucide-react";
import { GuideCard } from "./GuideCard";

export const OrganizationsSection: React.FC = () => {
    return (
        <GuideCard title="Organizations & Branding" icon={Building}>
            <p>Manage company-wide settings and visual identity here.</p>

            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900 border-b pb-2">Organization Access</h4>
                <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded text-rose-900 text-sm">
                    <strong>Important:</strong> Only <strong>System Administrators</strong> can create new Organizations. Company users do not have this permission.
                </div>
            </section>

            <section className="space-y-4">
                <h4 className="text-lg font-bold text-gray-900">Branding (Logos & Colors)</h4>
                <p>If you are a SuperAdmin, go to <strong>Settings {">"} Organizations</strong> and click <strong>Edit</strong> on your company.</p>
                <div className="space-y-4">
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                        <Plus className="w-5 h-5 text-primary mt-1" />
                        <div>
                            <strong>Primary Color:</strong> Choose a color for your company. This will change the color of every button and header in the software for all your workers.
                        </div>
                    </div>
                    <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                        <Upload className="w-5 h-5 text-primary mt-1" />
                        <div>
                            <strong>Company Logo:</strong> Upload your logo to have it show at the top of the sidebar and on all your PDF reports.
                        </div>
                    </div>
                </div>
            </section>
        </GuideCard>
    );
};
