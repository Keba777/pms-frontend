"use client";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { ToastContainer } from "react-toastify";
import Footer from "@/components/layout/Footer";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToastContainer />
      <div className="flex">
        <Sidebar />
        {/* For small screens, no left margin; for md and up, add left margin matching the sidebar width */}
        <main className="flex-1 p-4 ml-0 md:ml-64">
          <Header />
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
}
