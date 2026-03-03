"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { RouteGuard } from "@/lib/route-guard";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto bg-background p-6">
            {children}
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
