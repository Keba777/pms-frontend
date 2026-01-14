"use client";

import React from "react";
import { BookOpen, Truck, Upload, Download, FileText, Printer, ShieldCheck } from "lucide-react";
import { GuideCard } from "./GuideCard";

export const WelcomeSection: React.FC = () => (
    <GuideCard title="Welcome & Access" icon={BookOpen}>
        <p className="text-lg font-medium text-gray-700">Get started with Nilepms Project Management System.</p>
        <div className="space-y-4 mt-4">
            <p>Enter your <strong>Email</strong> and <strong>Password</strong> at the login screen. If you have any trouble, click <strong>Forgot Password</strong> to recover access via your email.</p>
            <div className="p-4 border rounded-xl bg-gray-50 border-l-4 border-l-primary">
                <h6 className="font-bold text-gray-900 mb-1">Your Profile</h6>
                <p className="text-sm">Click your name in the top-right to edit your phone number, name, or change your secret password.</p>
            </div>
        </div>
    </GuideCard>
);

export const LogisticsSection: React.FC = () => (
    <GuideCard title="Resource Flow (Logistics)" icon={Truck}>
        <p>Track materials and equipment as they move from the store to the site.</p>
        <div className="space-y-6 mt-4">
            <div className="flex gap-4 items-start border-b pb-4">
                <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold">1</div>
                <div>
                    <h6 className="font-bold">Allocation Request</h6>
                    <p className="text-sm text-gray-600 italic font-medium">"I need cement for Site A". Site managers submit the request in **Allocation**.</p>
                </div>
            </div>
            <div className="flex gap-4 items-start border-b pb-4">
                <div className="w-8 h-8 rounded bg-gray-400 text-white flex items-center justify-center font-bold">2</div>
                <div>
                    <h6 className="font-bold">Admin Approval</h6>
                    <p className="text-sm text-gray-600">Central managers Approve the request.</p>
                </div>
            </div>
            <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded bg-emerald-500 text-white flex items-center justify-center font-bold">3</div>
                <div>
                    <h6 className="font-bold">Confirm Delivery</h6>
                    <p className="text-sm text-gray-600 font-bold underline">Critical: When goods arrive at the site, go to **Dispatches** and click **Confirm Delivery** to update your site stock.</p>
                </div>
            </div>
        </div>
    </GuideCard>
);

export const ImportsExportsSection: React.FC = () => (
    <GuideCard title="Imports & Exports" icon={Download}>
        <div className="space-y-8">
            <section>
                <h6 className="font-bold mb-2 flex items-center gap-2 underline"><Upload className="w-4 h-4" /> Bulk Excel Import</h6>
                <p className="text-sm text-gray-600 mb-4">Add hundreds of users or materials at once. Click <strong>Import</strong> in any list, download the <strong>Excel Template</strong>, fill it out, and upload it back.</p>
            </section>
            <section>
                <h6 className="font-bold mb-4 flex items-center gap-2 underline"><Download className="w-4 h-4" /> Export Options</h6>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {["Download PDF", "Excel (.xlsx)", "Direct Print"].map(opt => (
                        <div key={opt} className="p-3 border rounded text-center text-[10px] font-black uppercase text-gray-400 bg-gray-50">{opt}</div>
                    ))}
                </div>
            </section>
        </div>
    </GuideCard>
);
