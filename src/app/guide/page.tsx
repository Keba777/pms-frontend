"use client";

import React, { useState } from "react";
import {
    Building,
    Users,
    Lock,
    Briefcase,
    CheckSquare,
    ClipboardList,
    MessageSquare,
    BookOpen,
    ChevronRight,
    Menu,
    X,
    Activity,
    Box,
    Truck,
    Download,
    Printer,
    Database,
    Settings,
    AlertTriangle,
    MessagesSquare
} from "lucide-react";
import Image from "next/image";
import logo from "@/../public/images/logo.svg";
import { Button } from "@/components/ui/button";

// Import modular sections
import { WelcomeSection, LogisticsSection, ImportsExportsSection } from "./components/MiscSections";
import { OrganizationsSection } from "./components/OrganizationsSection";
import { RolesSection } from "./components/RolesSection";
import { UsersSection } from "./components/UsersSection";
import { ProjectsSection } from "./components/ProjectsSection";
import { TasksSection } from "./components/TasksSection";
import { ActivitiesSection } from "./components/ActivitiesSection";
import { TodosSection } from "./components/TodosSection";
import { ChatSection } from "./components/ChatSection";
import { IssuesSection } from "./components/IssuesSection";
import { MasterDataSection } from "./components/MasterDataSection";
import { ResourcesSection } from "./components/ResourcesSection";
import { SettingsSection } from "./components/SettingsSection";

const sections = [
    { id: "welcome", title: "1. Welcome & Access", icon: BookOpen, component: WelcomeSection },
    { id: "organizations", title: "2. Organizations & Branding", icon: Building, component: OrganizationsSection },
    { id: "roles", title: "3. Roles & Permissions", icon: Lock, component: RolesSection },
    { id: "users", title: "4. User Management", icon: Users, component: UsersSection },
    { id: "projects", title: "5. Projects", icon: Briefcase, component: ProjectsSection },
    { id: "tasks", title: "6. Tasks", icon: ClipboardList, component: TasksSection },
    { id: "activities", title: "7. Activities", icon: Activity, component: ActivitiesSection },
    { id: "todos", title: "8. Todos", icon: CheckSquare, component: TodosSection },
    { id: "chat", title: "9. Individual Chat", icon: MessageSquare, component: ChatSection },
    { id: "issues", title: "10. Issues Tracking", icon: AlertTriangle, component: IssuesSection },
    { id: "master-data", title: "11. Master Data", icon: Database, component: MasterDataSection },
    { id: "resources", title: "12. Resources", icon: Box, component: ResourcesSection },
    { id: "logistics", title: "13. Logistics Flow", icon: Truck, component: LogisticsSection },
    { id: "imports-exports", title: "14. Imports & Exports", icon: Download, component: ImportsExportsSection },
    { id: "settings", title: "15. General Settings", icon: Settings, component: SettingsSection },
];

const UserGuidePage = () => {
    const [activeSection, setActiveSection] = useState(sections[0].id);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleSectionClick = (id: string) => {
        setActiveSection(id);
        setIsSidebarOpen(false);
    };

    const activeContent = sections.find((s) => s.id === activeSection);
    const SectionComponent = activeContent?.component || (() => null);

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900 antialiased">
            {/* Simple Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 lg:hidden text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-100"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => (window.location.href = "/")}>
                        <Image src={logo} alt="Nilepms Logo" width={28} height={28} className="w-7 h-7" />
                        <h1 className="text-lg font-bold tracking-tight text-gray-800 uppercase">User Guide</h1>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => window.print()} className="font-bold h-9 gap-2 uppercase text-[10px] border-primary text-primary hover:bg-primary/5 shadow-sm transition-all">
                        <Download className="w-3.5 h-3.5" /> Download Full PDF
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden print:overflow-visible">
                {/* Simple Sidebar */}
                <aside
                    className={`
            fixed inset-y-0 left-0 z-40 w-72 bg-gray-50 border-r border-gray-200 transition-all duration-300 lg:relative lg:translate-x-0 print:hidden
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
                >
                    <div className="h-full overflow-y-auto p-4 space-y-1">
                        <div className="mb-4 px-2 py-2 border-b border-gray-200/50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Documentation Chapters</span>
                        </div>
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => handleSectionClick(section.id)}
                                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group
                  ${activeSection === section.id
                                        ? "bg-white text-primary shadow-sm border border-gray-200 font-bold"
                                        : "text-gray-500 hover:bg-white hover:text-gray-800 font-medium"}
                `}
                            >
                                <section.icon className={`w-4 h-4 transition-colors ${activeSection === section.id ? "text-primary" : "text-gray-400 group-hover:text-primary"}`} />
                                <span className="flex-1 text-left line-clamp-1">{section.title}</span>
                                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeSection === section.id ? "rotate-90 text-primary" : "opacity-0 group-hover:opacity-50"}`} />
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Backdrop */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/5 z-30 lg:hidden backdrop-blur-[2px] print:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Interactive Content Area (Hidden during print) */}
                <main className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-16 bg-white selection:bg-primary/10 print:hidden">
                    <div className="max-w-4xl mx-auto">
                        {activeContent && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <header className="mb-10 pb-6 border-b border-gray-100 mt-2">
                                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none mb-1">
                                        {activeContent.title}
                                    </h1>
                                </header>

                                <section className="min-h-[60vh]">
                                    <SectionComponent />
                                </section>

                                <footer className="mt-20 pt-8 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                    <p>© 2026 Nilepms Software</p>
                                    <div className="flex gap-4">
                                        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-gray-900 transition-colors">Top ↑</button>
                                        <a href="mailto:support@nilepms.com" className="hover:text-gray-900 transition-colors">Support</a>
                                    </div>
                                </footer>
                            </div>
                        )}
                    </div>
                </main>

                {/* Print-All Content Area (Only visible during print) */}
                <div className="hidden print:block w-full p-8 bg-white">
                    <header className="mb-12 border-b-2 border-gray-900 pb-6 text-center">
                        <div className="flex justify-center mb-4">
                            <Image src={logo} alt="Logo" width={60} height={60} />
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">Nilepms User Manual</h1>
                        <p className="text-sm font-bold text-gray-500 mt-2">Full Enterprise documentation • 2026 Edition</p>
                    </header>

                    <div className="space-y-12">
                        {sections.map((section) => {
                            const Comp = section.component;
                            return (
                                <div key={section.id} className="break-after-page">
                                    <h2 className="text-3xl font-black mb-6 border-b pb-4 text-gray-900">{section.title}</h2>
                                    <Comp />
                                    <div className="mt-8 pt-4 border-t border-gray-100 text-[8px] font-bold text-gray-400 uppercase tracking-widest flex justify-between">
                                        <span>Nilepms Software Manual</span>
                                        <span>Page Section: {section.id}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        body {
           font-family: 'Plus Jakarta Sans', sans-serif;
           background-color: white;
        }

        @media print {
           @page {
             margin: 20mm;
           }
           .break-after-page {
             break-after: page;
             padding-bottom: 20px;
           }
           aside, header, footer, button, .print\\:hidden { display: none !important; }
           .print\\:block { display: block !important; }
           main { display: none !important; }
           .flex { display: block !important; }
           .max-w-4xl { max-width: none !important; }
           .bg-white { background-color: white !important; }
        }
      `}</style>
        </div>
    );
};

export default UserGuidePage;
