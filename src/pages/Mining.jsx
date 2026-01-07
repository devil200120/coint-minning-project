import { useState } from "react";
import Header from "../components/Header";
import {
  Coins,
  Clock,
  Activity,
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Zap,
  Save,
  CheckCircle,
  X,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Mining = () => {
  // Mining Configuration State
  const [config, setConfig] = useState({
    cycleDuration: 24,
    baseRate: 0.25,
    boostRate: 20,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Active Mining Users State
  const [miningUsers, setMiningUsers] = useState([
    {
      id: 1,
      name: "Rajesh Vaishnav",
      progress: 75,
      rate: "0.25/hr",
      timeRemaining: "6:00:00",
      status: "mining",
    },
    {
      id: 2,
      name: "Amit Kumar",
      progress: 45,
      rate: "0.35/hr",
      timeRemaining: "13:15:00",
      status: "mining",
    },
    {
      id: 3,
      name: "Priya Singh",
      progress: 92,
      rate: "0.25/hr",
      timeRemaining: "2:00:00",
      status: "mining",
    },
    {
      id: 4,
      name: "Rahul Sharma",
      progress: 100,
      rate: "0.50/hr",
      timeRemaining: "0:00:00",
      status: "completed",
    },
    {
      id: 5,
      name: "Sneha Patel",
      progress: 30,
      rate: "0.25/hr",
      timeRemaining: "16:48:00",
      status: "mining",
    },
  ]);

  // Save Configuration Handler
  const handleSaveConfig = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  // Toggle Mining Status
  const toggleMiningStatus = (userId) => {
    setMiningUsers(users =>
      users.map(user =>
        user.id === userId
          ? { ...user, status: user.status === "mining" ? "paused" : "mining" }
          : user
      )
    );
  };

  // Reset User Mining
  const resetUserMining = (userId) => {
    setMiningUsers(users =>
      users.map(user =>
        user.id === userId
          ? { ...user, progress: 0, timeRemaining: `${config.cycleDuration}:00:00`, status: "mining" }
          : user
      )
    );
  };

  // Refresh All Sessions
  const refreshSessions = () => {
    // Simulate refresh - in real app, this would fetch from API
    setMiningUsers(users => [...users]);
  };

  const miningData = [
    { hour: "00:00", coins: 120 },
    { hour: "04:00", coins: 150 },
    { hour: "08:00", coins: 280 },
    { hour: "12:00", coins: 420 },
    { hour: "16:00", coins: 380 },
    { hour: "20:00", coins: 520 },
    { hour: "24:00", coins: 450 },
  ];

  const levelDistribution = [
    { name: "Base Level", value: 60, color: "#ef4444" },
    { name: "Referral Level", value: 25, color: "#fbbf24" },
    { name: "Boost Level", value: 15, color: "#22c55e" },
  ];

  return (
    <div className="space-y-4 md:space-y-6 overflow-x-hidden">
      <Header
        title="Mining Status"
        subtitle="Monitor 24-hour mining cycles and activity"
      />

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Configuration saved successfully!</span>
          <button onClick={() => setShowSuccess(false)} className="ml-2 hover:bg-white/20 rounded p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="card p-3 md:p-5 bg-gradient-to-br from-amber-500 to-orange-500 text-white col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm opacity-80 mb-1">
                Active Sessions
              </p>
              <p className="text-xl md:text-3xl font-bold">8,234</p>
            </div>
            <Activity className="w-8 h-8 md:w-10 md:h-10 opacity-80" />
          </div>
        </div>
        <div className="card p-3 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-500 mb-1">
                Coins Today
              </p>
              <p className="text-lg md:text-2xl font-bold text-slate-800">
                45,678
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="card p-3 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-500 mb-1">Avg Rate</p>
              <p className="text-lg md:text-2xl font-bold text-slate-800">
                0.30/hr
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="card p-3 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-500 mb-1">Cycle</p>
              <p className="text-lg md:text-2xl font-bold text-slate-800">
                1hr/rate
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Mining Activity Chart */}
        <div className="card lg:col-span-2">
          <div className="p-4 md:p-5 border-b border-slate-100">
            <h2 className="text-base md:text-lg font-semibold text-slate-800">
              Mining Activity (24 Hours)
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Coins mined per 4-hour interval
            </p>
          </div>
          <div className="p-3 md:p-5 h-56 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={miningData}>
                <defs>
                  <linearGradient id="colorCoins" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="coins"
                  stroke="#f59e0b"
                  fill="url(#colorCoins)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Level Distribution */}
        <div className="card">
          <div className="p-4 md:p-5 border-b border-slate-100">
            <h2 className="text-base md:text-lg font-semibold text-slate-800">
              Level Distribution
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Mining rate breakdown
            </p>
          </div>
          <div className="p-3 md:p-5 h-48 md:h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={levelDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {levelDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="p-5 pt-0 space-y-2">
            {levelDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-800">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mining Settings */}
      <div className="card mb-4 md:mb-6">
        <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-slate-800">
              Mining Configuration
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Configure mining cycle and rates
            </p>
          </div>
          <Settings className="w-5 h-5 text-slate-400" />
        </div>
        <div className="p-4 md:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Cycle Duration (hours)
              </label>
              <input 
                type="number" 
                value={config.cycleDuration}
                onChange={(e) => setConfig({ ...config, cycleDuration: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10" 
              />
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Base Rate (coins/hr)
              </label>
              <input
                type="number"
                value={config.baseRate}
                onChange={(e) => setConfig({ ...config, baseRate: Number(e.target.value) })}
                step={0.01}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10"
              />
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Boost Rate (%)
              </label>
              <input 
                type="number" 
                value={config.boostRate}
                onChange={(e) => setConfig({ ...config, boostRate: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10" 
              />
            </div>
            <div className="p-4 bg-slate-50 rounded-xl flex items-end">
              <button 
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg text-sm font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Configuration
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Mining Sessions */}
      <div className="card">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Active Mining Sessions
            </h2>
            <p className="text-sm text-slate-500">Real-time mining progress</p>
          </div>
          <button 
            onClick={refreshSessions}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-4">
                  User
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-4">
                  Progress
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-4">
                  Rate
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-4">
                  Time Remaining
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-4">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {miningUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-800">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            user.progress === 100
                              ? "bg-emerald-500"
                              : user.status === "paused"
                              ? "bg-slate-400"
                              : "bg-gradient-to-r from-amber-500 to-orange-500"
                          }`}
                          style={{ width: `${user.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-600">
                        {user.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg">
                      {user.rate}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-800">
                        {user.timeRemaining}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                        user.status === "mining"
                          ? "bg-emerald-100 text-emerald-700"
                          : user.status === "completed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.status === "mining" ? (
                        <Activity className="w-3 h-3" />
                      ) : user.status === "completed" ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Pause className="w-3 h-3" />
                      )}
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {user.status !== "completed" && (
                        <button 
                          onClick={() => toggleMiningStatus(user.id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${
                            user.status === "mining"
                              ? "bg-red-100 text-red-600 hover:bg-red-200"
                              : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                          }`}
                          title={user.status === "mining" ? "Pause Mining" : "Resume Mining"}
                        >
                          {user.status === "mining" ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <button 
                        onClick={() => resetUserMining(user.id)}
                        className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-all hover:scale-110"
                        title="Reset Mining Cycle"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Mining;
