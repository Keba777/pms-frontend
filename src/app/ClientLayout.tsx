"use client";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { ToastContainer } from "react-toastify";
import Footer from "@/components/layout/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a QueryClient instance
const queryClient = new QueryClient();

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 ml-0 lg:ml-64">
          <Header />
          {children}
        </main>
      </div>
      <Footer />
    </QueryClientProvider>
  );
}
