import { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminApi from "../services/api";
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
  Loader2,
  Users,
  XCircle,
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
  // Loading states
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: "", message: "" });

  // Data states
  const [stats, setStats] = useState({
    activeSessions: 0,
    coinsToday: 0,
    avgRate: 0.25,
    totalMined: 0,
  });
  const [miningSessions, setMiningSessions] = useState([]);
  const [config, setConfig] = useState({
    cycleDuration: 24,
    baseRate: 0.25,
    boostRate: 20,
    maxCoinsPerCycle: 6,
  });
  const [miningData, setMiningData] = useState([
    { hour: "00:00", coins: 0 },
    { hour: "04:00", coins: 0 },
    { hour: "08:00", coins: 0 },
    { hour: "12:00", coins: 0 },
    { hour: "16:00", coins: 0 },
    { hour: "20:00", coins: 0 },
    { hour: "24:00", coins: 0 },
  ]);
  const [levelDistribution, setLevelDistribution] = useState([
    { name: "Base Level", value: 60, color: "#ef4444" },
    { name: "Referral Level", value: 25, color: "#fbbf24" },
    { name: "Boost Level", value: 15, color: "#22c55e" },
  ]);

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchSettings(), fetchSessions()]);
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const response = await AdminApi.getMiningStats();
      if (response.success && response.stats) {
        setStats({
          activeSessions: response.stats.active || 0,
          coinsToday: response.stats.todayMinedCoins || 0,
          avgRate: 0.25,
          totalMined: response.stats.totalMinedCoins || 0,
        });

        // Update hourly chart data
        if (response.stats.hourlyData && response.stats.hourlyData.length > 0) {
          setMiningData(response.stats.hourlyData);
        }

        // Update level distribution pie chart
        if (
          response.stats.levelDistribution &&
          response.stats.levelDistribution.length > 0
        ) {
          setLevelDistribution(response.stats.levelDistribution);
        }
      }
    } catch (error) {
      console.error("Error fetching mining stats:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await AdminApi.getMiningSettings();
      if (response.success && response.settings) {
        setConfig({
          cycleDuration: response.settings.miningCycleDuration || 24,
          baseRate: response.settings.miningRate || 0.25,
          boostRate: response.settings.referralBoostPercent || 20,
          maxCoinsPerCycle: response.settings.maxCoinsPerCycle || 6,
        });
      }
    } catch (error) {
      console.error("Error fetching mining settings:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      setSessionsLoading(true);
      const response = await AdminApi.getMiningSessions({
        limit: 20,
        status: "active",
      });
      if (response.success) {
        const sessions = response.sessions || [];
        const formattedSessions = sessions.map((session) => {
          const startTime = new Date(session.startTime);
          const now = new Date();
          const elapsedHours = (now - startTime) / (1000 * 60 * 60);
          const cycleDuration = config.cycleDuration || 24;
          const progress = Math.min(
            100,
            Math.round((elapsedHours / cycleDuration) * 100),
          );

          const remainingHours = Math.max(0, cycleDuration - elapsedHours);
          const hours = Math.floor(remainingHours);
          const minutes = Math.floor((remainingHours - hours) * 60);
          const seconds = Math.floor(
            ((remainingHours - hours) * 60 - minutes) * 60,
          );
          const timeRemaining = `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

          return {
            id: session._id,
            name: session.user?.name || "Unknown User",
            email: session.user?.email || "",
            progress: progress,
            rate: `${session.rate || config.baseRate}/hr`,
            timeRemaining: timeRemaining,
            status: session.status || "active",
            earnedCoins: session.earnedCoins || 0,
          };
        });
        setMiningSessions(formattedSessions);
      }
    } catch (error) {
      console.error("Error fetching mining sessions:", error);
    } finally {
      setSessionsLoading(false);
    }
  };

  const showMessage = (type, message) => {
    setActionMessage({ type, message });
    setTimeout(() => setActionMessage({ type: "", message: "" }), 3000);
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const response = await AdminApi.updateMiningSettings({
        miningCycleDuration: config.cycleDuration,
        miningRate: config.baseRate,
        referralBoostPercent: config.boostRate,
        maxCoinsPerCycle: config.maxCoinsPerCycle,
      });
      if (response.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error saving config:", error);
      showMessage("error", "Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to cancel this mining session?"))
      return;

    try {
      const response = await AdminApi.cancelMiningSession(
        sessionId,
        "Cancelled by admin",
      );
      if (response.success) {
        showMessage("success", "Mining session cancelled");
        fetchSessions();
        fetchStats();
      }
    } catch (error) {
      console.error("Error cancelling session:", error);
      showMessage("error", "Failed to cancel session");
    }
  };

  const refreshSessions = () => {
    fetchSessions();
    fetchStats();
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 overflow-x-hidden">
      <Header
        title="Mining Status"
        subtitle="Monitor 24-hour mining cycles and activity"
      />

      {/* Action Message Toast */}
      {actionMessage.message && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 ${actionMessage.type === "error" ? "bg-red-500" : "bg-emerald-500"} text-white rounded-xl shadow-lg animate-in slide-in-from-top-2`}
        >
          {actionMessage.type === "error" ? (
            <XCircle className="w-5 h-5" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{actionMessage.message}</span>
          <button
            onClick={() => setActionMessage({ type: "", message: "" })}
            className="ml-2 hover:bg-white/20 rounded p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Configuration saved successfully!</span>
          <button
            onClick={() => setShowSuccess(false)}
            className="ml-2 hover:bg-white/20 rounded p-1"
          >
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
              <p className="text-xl md:text-3xl font-bold">
                {formatNumber(stats.activeSessions)}
              </p>
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
                {formatNumber(stats.coinsToday)}
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
                {config.baseRate}/hr
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
              <p className="text-xs md:text-sm text-slate-500 mb-1">
                Total Mined
              </p>
              <p className="text-lg md:text-2xl font-bold text-slate-800">
                {formatNumber(stats.totalMined)}
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
                onChange={(e) =>
                  setConfig({
                    ...config,
                    cycleDuration: Number(e.target.value),
                  })
                }
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
                onChange={(e) =>
                  setConfig({ ...config, baseRate: Number(e.target.value) })
                }
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
                onChange={(e) =>
                  setConfig({ ...config, boostRate: Number(e.target.value) })
                }
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
            <p className="text-sm text-slate-500">
              Real-time mining progress ({miningSessions.length} active)
            </p>
          </div>
          <button
            onClick={refreshSessions}
            disabled={sessionsLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          >
            {sessionsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          {sessionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
          ) : miningSessions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No active mining sessions</p>
            </div>
          ) : (
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
                {miningSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {session.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {session.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {session.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              session.progress === 100
                                ? "bg-emerald-500"
                                : session.status === "paused"
                                  ? "bg-slate-400"
                                  : "bg-gradient-to-r from-amber-500 to-orange-500"
                            }`}
                            style={{ width: `${session.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                          {session.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-lg">
                        {config.baseRate}/hr
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-800">
                          {session.timeRemaining}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          session.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : session.status === "completed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {session.status === "active" ? (
                          <Activity className="w-3 h-3" />
                        ) : session.status === "completed" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Pause className="w-3 h-3" />
                        )}
                        {session.status.charAt(0).toUpperCase() +
                          session.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {session.status === "active" && (
                          <button
                            onClick={() => handleCancelSession(session.id)}
                            className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-all hover:scale-110"
                            title="Cancel Mining Session"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mining;
