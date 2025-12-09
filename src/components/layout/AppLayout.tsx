import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

const pageTitles: Record<string, string> = {
  "/": "لوحة التحكم",
  "/inbox": "صندوق الوارد",
  "/leads": "العملاء المحتملين",
  "/products": "قاعدة المعرفة",
  "/settings": "إعدادات البوت",
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || "لوحة التحكم";

  return (
    <div className="min-h-screen flex w-full bg-background" dir="rtl">
      {/* Sidebar */}
      <AppSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main content area - takes remaining space */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <AppHeader 
          onMenuClick={() => setSidebarOpen(true)} 
          title={title}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}