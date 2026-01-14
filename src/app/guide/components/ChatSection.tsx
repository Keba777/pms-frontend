"use client";

import React from "react";
import { MessageSquare, MessagesSquare, Search, Plus } from "lucide-react";
import { GuideCard } from "./GuideCard";

export const ChatSection: React.FC = () => {
    return (
        <div className="space-y-12">
            <GuideCard title="Individual Chat" icon={MessageSquare}>
                <p>Private messages between you and any other team member.</p>
                <div className="bg-gray-50 p-6 rounded-xl border space-y-3">
                    <p className="font-bold flex items-center gap-2"><Search className="w-4 h-4" /> How to Chat:</p>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                        <li>Go to the <strong>Chat</strong> page.</li>
                        <li>Search for a coworker's name in the sidebar.</li>
                        <li>Send text, images, or documents safely without using Telegram or WhatsApp.</li>
                    </ul>
                </div>
            </GuideCard>

            <GuideCard title="Group Team Chats" icon={MessagesSquare}>
                <p>Stay organized by creating groups for specific projects or offices.</p>
                <div className="space-y-4">
                    <div className="p-4 border rounded-xl">
                        <h6 className="font-bold mb-2">Create a Group</h6>
                        <p className="text-sm">Click <strong>New Group</strong>, give it a name like "Site Alpha Engineers", and select the team members to invite.</p>
                    </div>
                    <div className="p-4 border rounded-xl bg-gray-50 border-gray-200">
                        <h6 className="font-bold mb-2">Group Admin Control</h6>
                        <p className="text-sm">If you created the group, you can add or remove members anytime by clicking the group name and going to settings.</p>
                    </div>
                </div>
            </GuideCard>
        </div>
    );
};
