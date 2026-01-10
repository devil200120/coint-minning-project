import { useState } from "react";
import Header from "../components/Header";
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Coins,
  Shield,
  X,
  TrendingUp,
  Users as UsersIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Crown,
  Zap,
  Activity,
} from "lucide-react";

const Users = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active",
    kyc: "pending",
  });

  const users = [
    {
      id: 1,
      name: "Rajesh Vaishnav",
      email: "rajesh@gmail.com",
      phone: "+91 98765 43210",
      status: "active",
      kyc: "verified",
      totalMining: 125.5,
      baseLevel: 0.25,
      referralLevel: 0,
      boostLevel: 0,
      referrals: 1,
      joined: "2024-01-15",
      ownership: 45,
      avatar: "RV",
    },
    {
      id: 2,
      name: "Amit Kumar",
      email: "amit@gmail.com",
      phone: "+91 87654 32109",
      status: "active",
      kyc: "verified",
      totalMining: 450.75,
      baseLevel: 0.25,
      referralLevel: 0.1,
      boostLevel: 0.05,
      referrals: 5,
      joined: "2024-01-10",
      ownership: 78,
      avatar: "AK",
    },
    {
      id: 3,
      name: "Priya Singh",
      email: "priya@gmail.com",
      phone: "+91 76543 21098",
      status: "inactive",
      kyc: "pending",
      totalMining: 50.0,
      baseLevel: 0.25,
      referralLevel: 0,
      boostLevel: 0,
      referrals: 0,
      joined: "2024-01-20",
      ownership: 12,
      avatar: "PS",
    },
    {
      id: 4,
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "+91 65432 10987",
      status: "active",
      kyc: "verified",
      totalMining: 890.25,
      baseLevel: 0.25,
      referralLevel: 0.15,
      boostLevel: 0.1,
      referrals: 12,
      joined: "2024-01-05",
      ownership: 100,
      avatar: "RS",
    },
    {
      id: 5,
      name: "Sneha Patel",
      email: "sneha@gmail.com",
      phone: "+91 54321 09876",
      status: "pending",
      kyc: "rejected",
      totalMining: 0,
      baseLevel: 0,
      referralLevel: 0,
      boostLevel: 0,
      referrals: 0,
      joined: "2024-01-25",
      ownership: 0,
      avatar: "SP",
    },
    {
      id: 6,
      name: "Vikram Singh",
      email: "vikram@gmail.com",
      phone: "+91 43210 98765",
      status: "active",
      kyc: "verified",
      totalMining: 1250.0,
      baseLevel: 0.25,
      referralLevel: 0.2,
      boostLevel: 0.15,
      referrals: 25,
      joined: "2023-12-15",
      ownership: 100,
      avatar: "VS",
    },
  ];

  const filteredUsers = users.filter((u) => {
    const matchesStatus = filterStatus === "all" || u.status === filterStatus;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const config = {
      active: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-600",
        dot: "bg-emerald-500",
      },
      inactive: {
        bg: "bg-slate-500/10",
        text: "text-slate-600",
        dot: "bg-slate-400",
      },
      pending: {
        bg: "bg-amber-500/10",
        text: "text-amber-600",
        dot: "bg-amber-500",
      },
    };
    const { bg, text, dot } = config[status];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getKycBadge = (kyc) => {
    const config = {
      verified: {
        bg: "bg-gradient-to-r from-teal-500 to-emerald-500",
        text: "text-white",
      },
      pending: {
        bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
        text: "text-white",
      },
      rejected: {
        bg: "bg-gradient-to-r from-red-500 to-rose-500",
        text: "text-white",
      },
    };
    const { bg, text } = config[kyc];
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${bg} ${text} shadow-sm`}
      >
        {kyc === "verified" && <CheckCircle className="w-3 h-3" />}
        {kyc === "pending" && <AlertCircle className="w-3 h-3" />}
        {kyc === "rejected" && <XCircle className="w-3 h-3" />}
        {kyc.charAt(0).toUpperCase() + kyc.slice(1)}
      </span>
    );
  };

  const stats = [
    {
      label: "Total Users",
      value: "12,845",
      change: "+12.5%",
      icon: UsersIcon,
      gradient: "from-blue-600 to-indigo-600",
    },
    {
      label: "Active Users",
      value: "8,234",
      change: "+8.2%",
      icon: Activity,
      gradient: "from-emerald-600 to-teal-600",
    },
    {
      label: "Inactive",
      value: "3,421",
      change: "-2.4%",
      icon: AlertCircle,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      label: "KYC Pending",
      value: "1,190",
      change: "+5.1%",
      icon: Shield,
      gradient: "from-purple-600 to-pink-600",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6 overflow-x-hidden">
      <Header title="User Management" subtitle="Manage all registered users" />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="group relative bg-white rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100"
          >
            <div
              className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.gradient} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-500`}
            />
            <div className="relative flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs md:text-sm text-slate-500 font-medium">
                  {stat.label}
                </p>
                <p className="text-xl md:text-3xl font-bold text-slate-800">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp
                    className={`w-3 h-3 ${
                      stat.change.startsWith("+")
                        ? "text-emerald-500"
                        : "text-red-500"
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      stat.change.startsWith("+")
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
              >
                <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5 w-full">
        <div className="flex flex-col xl:flex-row gap-4 w-full">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full xl:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 xl:flex-none min-w-[120px] px-3 md:px-4 py-2.5 md:py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-amber-500 cursor-pointer hover:bg-slate-100 transition-all"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            <select className="flex-1 xl:flex-none min-w-[120px] px-3 md:px-4 py-2.5 md:py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-amber-500 cursor-pointer hover:bg-slate-100 transition-all">
              <option value="">KYC Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
              <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all">
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Export</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 md:py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden md:inline">Add User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table - Desktop */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                  User
                </th>
                <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                  KYC
                </th>
                <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                  Mining Speed
                </th>
                <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                  Balance
                </th>
                <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                  Progress
                </th>
                <th className="text-center text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="group hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/50 transition-all duration-200"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-500/20">
                          {user.avatar}
                        </div>
                        {user.status === "active" && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
                          {user.name}
                        </p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                  <td className="px-6 py-4">{getKycBadge(user.kyc)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-lg">
                        <Zap className="w-3 h-3 text-red-500" />
                        <span className="text-xs font-bold text-red-600">
                          {user.baseLevel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded-lg">
                        <UserPlus className="w-3 h-3 text-amber-500" />
                        <span className="text-xs font-bold text-amber-600">
                          {user.referralLevel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-lg">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600">
                          {user.boostLevel}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-amber-500" />
                      <span className="font-bold text-slate-800">
                        {user.totalMining.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Ownership</span>
                        <span className="font-bold text-amber-600">
                          {user.ownership}%
                        </span>
                      </div>
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${user.ownership}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all hover:scale-110 hover:shadow-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all hover:scale-110 hover:shadow-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all hover:scale-110 hover:shadow-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold">1-6</span> of{" "}
            <span className="font-semibold">12,845</span> users
          </p>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:bg-slate-100 hover:border-slate-300 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/25">
              1
            </button>
            <button className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:bg-slate-100 hover:border-slate-300 transition-all font-medium">
              2
            </button>
            <button className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:bg-slate-100 hover:border-slate-300 transition-all font-medium">
              3
            </button>
            <span className="px-2 text-slate-400">...</span>
            <button className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:bg-slate-100 hover:border-slate-300 transition-all font-medium">
              99
            </button>
            <button className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:bg-slate-100 hover:border-slate-300 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Users Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                    {user.avatar}
                  </div>
                  {user.status === "active" && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(user);
                  setShowModal(true);
                }}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"
              >
                <MoreVertical className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              {getStatusBadge(user.status)}
              {getKycBadge(user.kyc)}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-red-50 rounded-xl p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-xs font-bold text-red-600">Base</span>
                </div>
                <p className="text-lg font-bold text-red-700">
                  {user.baseLevel}h
                </p>
              </div>
              <div className="bg-amber-50 rounded-xl p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <UserPlus className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-bold text-amber-600">Ref</span>
                </div>
                <p className="text-lg font-bold text-amber-700">
                  {user.referralLevel}h
                </p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-2.5 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600">
                    Boost
                  </span>
                </div>
                <p className="text-lg font-bold text-emerald-700">
                  {user.boostLevel}h
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-xs text-slate-500">Balance</p>
                  <p className="font-bold text-slate-800">
                    {user.totalMining.toLocaleString()} coins
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Ownership</p>
                <p className="font-bold text-amber-600">{user.ownership}%</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  style={{ width: `${user.ownership}%` }}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setSelectedUser(user);
                  setShowModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-100 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-500 hover:text-white transition-all"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-100 text-amber-600 rounded-xl text-sm font-semibold hover:bg-amber-500 hover:text-white transition-all">
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all">
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          <span className="text-sm text-slate-600">
            Page <span className="font-bold">1</span> of{" "}
            <span className="font-bold">99</span>
          </span>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-6 pb-16">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <h3 className="text-xl font-bold text-white">User Details</h3>
              <p className="text-white/80 text-sm">
                Complete profile information
              </p>
            </div>

            {/* User Avatar Card - Overlapping */}
            <div className="relative -mt-12 px-6">
              <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {selectedUser.avatar}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-slate-800">
                    {selectedUser.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedUser.status)}
                    {getKycBadge(selectedUser.kyc)}
                  </div>
                </div>
                {selectedUser.ownership === 100 && (
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {selectedUser.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Joined</p>
                    <p className="text-sm font-medium text-slate-800">
                      {new Date(selectedUser.joined).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Referrals</p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedUser.referrals} users
                    </p>
                  </div>
                </div>
              </div>

              {/* Mining Levels */}
              <h5 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                Mining Speed Levels
              </h5>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="relative overflow-hidden p-4 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl text-white text-center shadow-lg">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <Zap className="w-6 h-6 mx-auto mb-2 opacity-90" />
                  <p className="text-2xl font-bold">
                    {selectedUser.baseLevel}h
                  </p>
                  <p className="text-sm opacity-90">Base</p>
                </div>
                <div className="relative overflow-hidden p-4 bg-gradient-to-br from-amber-400 to-yellow-400 rounded-2xl text-slate-800 text-center shadow-lg">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <UserPlus className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {selectedUser.referralLevel}h
                  </p>
                  <p className="text-sm">Referral</p>
                </div>
                <div className="relative overflow-hidden p-4 bg-gradient-to-br from-emerald-500 to-green-400 rounded-2xl text-white text-center shadow-lg">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-90" />
                  <p className="text-2xl font-bold">
                    {selectedUser.boostLevel}h
                  </p>
                  <p className="text-sm opacity-90">Boost</p>
                </div>
              </div>

              {/* Ownership Progress */}
              <h5 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                Ownership Progress
              </h5>
              <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-slate-600">
                    Day {selectedUser.ownership} of 100
                  </span>
                  <span className="text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    {selectedUser.ownership}%
                  </span>
                </div>
                <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500 relative"
                    style={{ width: `${selectedUser.ownership}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-pulse" />
                  </div>
                </div>
                {selectedUser.ownership === 100 && (
                  <div className="flex items-center gap-2 mt-3 text-emerald-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      Ownership Complete!
                    </span>
                  </div>
                )}
              </div>

              {/* Coin Management */}
              <h5 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                Coin Management
              </h5>
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-500">Current Balance</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {selectedUser.totalMining.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Coins className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Enter amount"
                    className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all"
                  />
                  <button className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg">
                    Add
                  </button>
                  <button className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg">
                    Deduct
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Add New User</h3>
                  <p className="text-white/80 text-sm">
                    Create a new user account
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Status & KYC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newUser.status}
                    onChange={(e) =>
                      setNewUser({ ...newUser, status: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-emerald-500 cursor-pointer transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    KYC Status
                  </label>
                  <select
                    value={newUser.kyc}
                    onChange={(e) =>
                      setNewUser({ ...newUser, kyc: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-emerald-500 cursor-pointer transition-all"
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Here you would typically save the user to your backend
                    console.log("New User:", newUser);
                    alert(`User "${newUser.name}" created successfully!`);
                    setShowAddModal(false);
                    setNewUser({
                      name: "",
                      email: "",
                      phone: "",
                      status: "active",
                      kyc: "pending",
                    });
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
