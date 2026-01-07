import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Menu, ChevronLeft, ChevronRight, Bell, Search } from "lucide-react";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
      />

      {/* Collapse Toggle Button - Desktop Only */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={`hidden lg:flex fixed top-6 z-50 w-7 h-7 rounded-full bg-white shadow-lg border border-slate-200 items-center justify-center text-slate-600 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all duration-300 ${
          sidebarCollapsed ? "left-[76px]" : "left-[252px]"
        }`}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      <main
        className={`flex-1 min-w-0 overflow-x-hidden transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            {/* Left - Mobile Menu & Search */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search Bar */}
              <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-xl w-48 md:w-64 lg:w-80">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="border-none bg-transparent text-sm w-full focus:outline-none text-slate-700 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Right - Notifications & Profile */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <button className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center relative hover:bg-slate-200 transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  8
                </span>
              </button>

              <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-3 border-l border-slate-200">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-semibold text-slate-800">Admin</p>
                  <p className="text-xs text-slate-500">Super Admin</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/30">
                  A
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
