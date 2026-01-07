import { Bell, Search, ChevronDown } from "lucide-react";

const Header = ({ title, subtitle }) => {
  return (
    <header className="hidden lg:flex justify-between items-center mb-4 md:mb-6 p-3 md:p-4 bg-white rounded-xl shadow-sm">
      <div>
        <h1 className="text-lg md:text-2xl font-bold text-slate-800">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs md:text-sm text-slate-500">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Search - hidden on mobile */}
        <div className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-slate-100 rounded-lg">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="border-none bg-transparent text-sm w-48 focus:outline-none"
          />
        </div>

        {/* Notifications */}
        <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center relative hover:bg-amber-100 transition-colors">
          <Bell className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
          <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-[9px] md:text-[10px] rounded-full flex items-center justify-center font-semibold">
            8
          </span>
        </button>

        {/* Admin Profile */}
        <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 bg-slate-100 rounded-full cursor-pointer hover:bg-slate-200 transition-colors">
          <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm">
            A
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-slate-800">Admin</p>
            <p className="text-xs text-slate-500">Super Admin</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
};

export default Header;
