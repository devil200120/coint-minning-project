import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Coins,
  Shield,
  CreditCard,
  Bell,
  Image,
  Link2,
  Settings,
  LogOut,
  Pickaxe,
  X,
  ChevronRight,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose, isCollapsed }) => {
  const menuItems = [
    {
      title: "Main",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/" },
        { name: "Users", icon: Users, path: "/users" },
        { name: "Referrals", icon: UserPlus, path: "/referrals" },
      ],
    },
    {
      title: "Mining",
      items: [
        { name: "Mining Status", icon: Coins, path: "/mining" },
        { name: "Coin Management", icon: Pickaxe, path: "/coins" },
      ],
    },
    {
      title: "Verification",
      items: [
        { name: "KYC Requests", icon: Shield, path: "/kyc", badge: 12 },
        { name: "Payments/UTR", icon: CreditCard, path: "/payments", badge: 5 },
      ],
    },
    {
      title: "Content",
      items: [
        { name: "Notifications", icon: Bell, path: "/notifications" },
        { name: "Home Banners", icon: Image, path: "/banners" },
        { name: "Social Links", icon: Link2, path: "/social-links" },
      ],
    },
    {
      title: "System",
      items: [{ name: "Settings", icon: Settings, path: "/settings" }],
    },
  ];

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen z-50 flex flex-col
        bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 text-white
        transform transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "lg:w-20" : "lg:w-64"} w-64
        shadow-2xl shadow-black/20
      `}
    >
      {/* Logo Header */}
      <div className={`shrink-0 p-4 border-b border-white/10 ${isCollapsed ? "lg:p-3" : ""}`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isCollapsed ? "lg:justify-center lg:w-full" : ""}`}>
            <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <Pickaxe className="w-6 h-6 text-white" />
            </div>
            <div className={`${isCollapsed ? "lg:hidden" : ""}`}>
              <h1 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Mining Admin</h1>
              <span className="text-[11px] text-slate-500">Control Panel</span>
            </div>
          </div>

          {/* Close Button - Mobile Only */}
          <button
            onClick={onClose}
            className="lg:hidden w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:rotate-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation - Scrollable Area */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar ${isCollapsed ? "lg:p-2" : ""}`}>
        {menuItems.map((section, idx) => (
          <div key={idx} className="mb-4">
            {/* Section Title */}
            <div className={`flex items-center gap-2 px-3 mb-2 ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}>
              <h3 className={`text-[10px] font-bold uppercase tracking-widest text-slate-500 ${isCollapsed ? "lg:hidden" : ""}`}>
                {section.title}
              </h3>
              {!isCollapsed && <div className="flex-1 h-px bg-gradient-to-r from-slate-700/50 to-transparent" />}
            </div>
            
            {/* Menu Items */}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${isActive
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
                      : "text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1"
                    }
                    ${isCollapsed ? "lg:justify-center lg:px-0 lg:mx-1" : ""}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Indicator */}
                      {isActive && !isCollapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                      )}
                      
                      <item.icon className="w-5 h-5 shrink-0" />
                      
                      <span className={`flex-1 text-sm font-medium truncate ${isCollapsed ? "lg:hidden" : ""}`}>
                        {item.name}
                      </span>
                      
                      {/* Badge - Expanded */}
                      {item.badge && !isCollapsed && (
                        <span className="bg-red-500 text-white text-[10px] min-w-[20px] h-5 px-1.5 rounded-full font-bold flex items-center justify-center animate-pulse">
                          {item.badge}
                        </span>
                      )}
                      
                      {/* Badge - Collapsed */}
                      {item.badge && isCollapsed && (
                        <span className="hidden lg:flex absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] rounded-full items-center justify-center font-bold animate-pulse">
                          {item.badge}
                        </span>
                      )}
                      
                      {/* Arrow for active item */}
                      {isActive && !isCollapsed && (
                        <ChevronRight className="w-4 h-4 opacity-70" />
                      )}
                      
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="hidden lg:block absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[60] shadow-xl border border-slate-700">
                          {item.name}
                          {item.badge && (
                            <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                              {item.badge}
                            </span>
                          )}
                          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700" />
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout Button - Fixed at Bottom */}
      <div className={`shrink-0 p-3 border-t border-white/10 bg-slate-900/95 backdrop-blur-sm ${isCollapsed ? "lg:p-2" : ""}`}>
        <button
          className={`group relative w-full flex items-center gap-3 px-3 py-3 text-slate-400 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
        >
          <LogOut className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform" />
          <span className={`text-sm font-medium ${isCollapsed ? "lg:hidden" : ""}`}>
            Logout
          </span>
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="hidden lg:block absolute left-full ml-3 px-3 py-2 bg-slate-800 text-white text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[60] shadow-xl border border-slate-700">
              Logout
              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700" />
            </div>
          )}
        </button>
      </div>
      
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
