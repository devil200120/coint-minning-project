import { TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor,
}) => {
  const colorClasses = {
    orange: "from-orange-100 to-amber-100 text-orange-500",
    green: "from-emerald-100 to-teal-100 text-emerald-500",
    blue: "from-blue-100 to-cyan-100 text-blue-500",
    red: "from-red-100 to-pink-100 text-red-500",
    purple: "from-purple-100 to-violet-100 text-purple-500",
  };

  return (
    <div className="card p-3 md:p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-xs md:text-sm font-medium text-slate-500 mb-1 md:mb-2 truncate">
            {title}
          </h3>
          <p className="text-lg md:text-3xl font-bold text-slate-800 mb-1 md:mb-2">
            {value}
          </p>
          {change && (
            <div
              className={`flex items-center gap-1 text-[10px] md:text-sm ${
                changeType === "positive" ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {changeType === "positive" ? (
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
              ) : (
                <TrendingDown className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
              )}
              <span className="truncate hidden sm:block">{change}</span>
            </div>
          )}
        </div>
        <div
          className={`w-8 h-8 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gradient-to-br ${colorClasses[iconColor]} flex items-center justify-center shrink-0`}
        >
          <Icon className="w-4 h-4 md:w-7 md:h-7" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
