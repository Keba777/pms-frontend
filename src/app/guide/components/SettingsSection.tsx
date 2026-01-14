"use client";

import React from "react";
import { Settings, Settings2, Languages, Globe } from "lucide-react";
import { GuideCard } from "./GuideCard";

export const SettingsSection: React.FC = () => {
    return (
        <GuideCard title="General Settings" icon={Settings}>
            <p>
                The final configuration options for the whole company can be found here.
            </p>

            <section className="space-y-6">
                <div className="flex gap-4 p-5 border rounded-2xl hover:bg-gray-50 transition-colors">
                    <Settings2 className="w-8 h-8 text-emerald-600 mt-1" />
                    <div>
                        <h5 className="font-bold">Common Settings</h5>
                        <p className="text-sm text-gray-600 leading-relaxed">Update default currency, company address, and system-wide email preferences.</p>
                    </div>
                </div>

                <div className="flex gap-4 p-5 border rounded-2xl hover:bg-gray-50 transition-colors">
                    <Globe className="w-8 h-8 text-cyan-600 mt-1" />
                    <div>
                        <h5 className="font-bold">Languages</h5>
                        <p className="text-sm text-gray-600 leading-relaxed">Configure which languages are available for your team to use the dashboard in (e.g., English, Amharic).</p>
                    </div>
                </div>
            </section>

            <div className="mt-8 p-4 bg-gray-50 rounded-xl border-2 border-dashed text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                System Final Config
            </div>
        </GuideCard>
    );
};
