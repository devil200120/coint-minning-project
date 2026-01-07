import { useState } from "react";
import Header from "../components/Header";
import {
  Users,
  Coins,
  UserPlus,
  Shield,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  Target,
  Eye,
  MoreHorizontal,
  ChevronRight,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Wallet,
  Globe,
  Server,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const chartData = [
    { name: "Mon", users: 120, mining: 450, revenue: 2400 },
    { name: "Tue", users: 150, mining: 520, revenue: 2800 },
    { name: "Wed", users: 180, mining: 610, revenue: 3200 },
    { name: "Thu", users: 220, mining: 780, revenue: 3800 },
    { name: "Fri", users: 280, mining: 890, revenue: 4200 },
    { name: "Sat", users: 350, mining: 1020, revenue: 4800 },
    { name: "Sun", users: 420, mining: 1150, revenue: 5200 },
  ];

  const pieData = [
    { name: "Active", value: 65, color: "#10b981" },
    { name: "Idle", value: 20, color: "#f59e0b" },
    { name: "Offline", value: 15, color: "#ef4444" },
  ];

  const recentUsers = [
    {
      id: 1,
      name: "Rajesh Vaishnav",
      email: "rajesh@gmail.com",
      status: "active",
      mining: "0.25",
      joined: "2 hours ago",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
    },
    {
      id: 2,
      name: "Amit Kumar",
      email: "amit@gmail.com",
      status: "active",
      mining: "1.50",
      joined: "5 hours ago",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
    },
    {
      id: 3,
      name: "Priya Singh",
      email: "priya@gmail.com",
      status: "inactive",
      mining: "0.00",
      joined: "1 day ago",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    },
    {
      id: 4,
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      status: "pending",
      mining: "0.75",
      joined: "2 days ago",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    },
    {
      id: 5,
      name: "Sneha Patel",
      email: "sneha@gmail.com",
      status: "active",
      mining: "2.30",
      joined: "3 days ago",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
    },
  ];

  const pendingActions = [
    {
      type: "kyc",
      title: "KYC Verification",
      desc: "12 pending verifications",
      count: 12,
      icon: Shield,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      type: "utr",
      title: "UTR Approvals",
      desc: "5 awaiting review",
      count: 5,
      icon: Clock,
      gradient: "from-orange-500 to-amber-500",
      bgGradient: "from-orange-50 to-amber-50",
    },
    {
      type: "withdrawal",
      title: "Withdrawals",
      desc: "8 pending requests",
      count: 8,
      icon: Wallet,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
    },
    {
      type: "support",
      title: "Support Tickets",
      desc: "3 unresolved issues",
      count: 3,
      icon: AlertCircle,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
  ];

  const topMiners = [
    { name: "Rajesh V.", coins: 1250.45, rank: 1, change: 12.5 },
    { name: "Amit K.", coins: 980.32, rank: 2, change: 8.2 },
    { name: "Priya S.", coins: 756.89, rank: 3, change: -2.1 },
    { name: "Rahul S.", coins: 654.21, rank: 4, change: 5.8 },
    { name: "Sneha P.", coins: 542.67, rank: 5, change: 15.3 },
  ];

  const systemStats = [
    { label: "Server Uptime", value: "99.9%", icon: Server, color: "text-emerald-500" },
    { label: "Active Regions", value: "12", icon: Globe, color: "text-blue-500" },
    { label: "API Requests", value: "2.4M", icon: Zap, color: "text-amber-500" },
    { label: "Success Rate", value: "98.5%", icon: Target, color: "text-purple-500" },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 md:p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium text-white/80">Dashboard Overview</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
            <p className="text-white/80 text-sm md:text-base">Here's what's happening with your mining platform today.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
              <Calendar className="w-4 h-4" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
              >
                <option value="today" className="text-slate-800">Today</option>
                <option value="week" className="text-slate-800">This Week</option>
                <option value="month" className="text-slate-800">This Month</option>
                <option value="year" className="text-slate-800">This Year</option>
              </select>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid - Enhanced Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Users Card */}
        <div className="group relative bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                12.5%
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Total Users</h3>
            <p className="text-2xl md:text-3xl font-bold text-slate-800">12,845</p>
            <p className="text-xs text-slate-400 mt-2">+1,234 this week</p>
          </div>
        </div>

        {/* Active Miners Card */}
        <div className="group relative bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                8.2%
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Active Miners</h3>
            <p className="text-2xl md:text-3xl font-bold text-slate-800">8,234</p>
            <p className="text-xs text-slate-400 mt-2">64% of total users</p>
          </div>
        </div>

        {/* Total Coins Card */}
        <div className="group relative bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-amber-200 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                15.3%
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Total Coins Mined</h3>
            <p className="text-2xl md:text-3xl font-bold text-slate-800">1.2M</p>
            <p className="text-xs text-slate-400 mt-2">+156K this week</p>
          </div>
        </div>

        {/* Total Referrals Card */}
        <div className="group relative bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                5.8%
              </span>
            </div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Total Referrals</h3>
            <p className="text-2xl md:text-3xl font-bold text-slate-800">4,521</p>
            <p className="text-xs text-slate-400 mt-2">+312 this week</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart - User Growth & Mining */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 md:p-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Analytics Overview</h2>
                <p className="text-sm text-slate-500">User growth and mining activity</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
                  <span className="text-slate-600">Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                  <span className="text-slate-600">Mining</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 md:p-6 h-72 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsersNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMiningNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#f59e0b"
                  fill="url(#colorUsersNew)"
                  strokeWidth={3}
                  name="Users"
                />
                <Area
                  type="monotone"
                  dataKey="mining"
                  stroke="#10b981"
                  fill="url(#colorMiningNew)"
                  strokeWidth={3}
                  name="Mining"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Miner Status Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 md:p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Miner Status</h2>
            <p className="text-sm text-slate-500">Current distribution</p>
          </div>
          <div className="p-4 md:p-6">
            <div className="h-48 md:h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Actions & Top Miners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions - Enhanced */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Pending Actions</h2>
              <p className="text-sm text-slate-500">Items requiring your attention</p>
            </div>
            <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded-full">
              {pendingActions.reduce((acc, curr) => acc + curr.count, 0)} total
            </span>
          </div>
          <div className="p-4 md:p-5 space-y-3">
            {pendingActions.map((action, idx) => (
              <div
                key={idx}
                className={`group flex items-center gap-4 p-4 bg-gradient-to-r ${action.bgGradient} rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-800">{action.title}</h4>
                  <p className="text-xs text-slate-500">{action.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-white text-slate-800 text-sm font-bold rounded-full flex items-center justify-center shadow-sm">
                    {action.count}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Miners Leaderboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Top Miners</h2>
              <p className="text-sm text-slate-500">This week's leaderboard</p>
            </div>
            <button className="text-sm text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 md:p-5 space-y-3">
            {topMiners.map((miner, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
                  idx === 0 ? "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200" :
                  idx === 1 ? "bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200" :
                  idx === 2 ? "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200" :
                  "hover:bg-slate-50"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  idx === 0 ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white" :
                  idx === 1 ? "bg-gradient-to-br from-slate-300 to-gray-400 text-white" :
                  idx === 2 ? "bg-gradient-to-br from-orange-400 to-amber-500 text-white" :
                  "bg-slate-100 text-slate-600"
                }`}>
                  {miner.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-800">{miner.name}</h4>
                  <p className="text-xs text-slate-500">{miner.coins.toLocaleString()} coins</p>
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold ${miner.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {miner.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(miner.change)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Stats & Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 md:p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">System Health</h2>
            <p className="text-sm text-slate-500">Platform performance metrics</p>
          </div>
          <div className="p-4 md:p-5 grid grid-cols-2 gap-4">
            {systemStats.map((stat, idx) => (
              <div key={idx} className="text-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users - Enhanced */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Recent Users</h2>
              <p className="text-sm text-slate-500">Latest registered users</p>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    User
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Mining
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Joined
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user, idx) => (
                  <tr
                    key={user.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                            user.status === "active" ? "bg-emerald-500" : user.status === "inactive" ? "bg-slate-400" : "bg-amber-500"
                          }`}></span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                        user.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : user.status === "inactive"
                          ? "bg-slate-100 text-slate-600"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {user.status === "active" && <CheckCircle className="w-3 h-3" />}
                        {user.status === "inactive" && <XCircle className="w-3 h-3" />}
                        {user.status === "pending" && <Clock className="w-3 h-3" />}
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold text-slate-800">{user.mining}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">{user.joined}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
