import { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminApi from "../services/api";
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
  Loader2,
} from "lucide-react";

const Users = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterKYC, setFilterKYC] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [coinAmount, setCoinAmount] = useState("");
  const [coinLoading, setCoinLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [actionMessage, setActionMessage] = useState({
    show: false,
    type: "",
    text: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "active",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    kycPending: 0,
  });
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "active",
  });
  const [addUserLoading, setAddUserLoading] = useState(false);

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      const response = await AdminApi.getUserStats();
      if (response.success && response.stats) {
        setStats({
          totalUsers: response.stats.total || 0,
          activeUsers: response.stats.active || 0,
          inactiveUsers: response.stats.suspended || 0,
          kycPending: response.stats.kycPending || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [filterStatus, filterKYC, searchQuery, pagination.currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
      };

      // Only add params if they have values
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (filterStatus && filterStatus !== "all") {
        params.status = filterStatus;
      }
      if (filterKYC && filterKYC !== "") {
        params.kycStatus = filterKYC;
      }

      const response = await AdminApi.getUsers(params);

      if (response.success) {
        // API returns response.users not response.data.users
        // Check all possible locations for users array
        let usersData = [];
        if (Array.isArray(response.users)) {
          usersData = response.users;
        } else if (Array.isArray(response.data?.users)) {
          usersData = response.data.users;
        } else if (Array.isArray(response.data)) {
          usersData = response.data;
        }

        const paginationData =
          response.pagination || response.data?.pagination || {};

        const formattedUsers = usersData.map((user) => {
          // Calculate ownership progress percentage from the ownershipProgress object
          const ownershipData = user.ownershipProgress || {};
          const daysActiveProgress = Math.min(
            100,
            ((ownershipData.daysActive || 0) / 30) * 100,
          );
          const miningSessionsProgress = Math.min(
            100,
            ((ownershipData.miningSessions || 0) / 20) * 100,
          );
          const kycInvitedProgress = ownershipData.kycInvited ? 100 : 0;
          const overallOwnership = Math.round(
            (daysActiveProgress + miningSessionsProgress + kycInvitedProgress) /
              3,
          );

          // Calculate mining speed components
          // Base rate is 0.25 (from settings)
          const baseRate = 0.25;
          // Referral boost: each active referral adds 20% of base rate
          const referralCount =
            user.referralStats?.activeCount ||
            user.referralStats?.totalCount ||
            0;
          const referralBoost = referralCount * (baseRate * 0.2);
          // Boost level from any purchased boosts (not in current schema, default to 0)
          const boostLevel = 0;

          return {
            id: user._id,
            name: user.name || "Unknown",
            email: user.email,
            phone: user.phone || "N/A",
            status:
              user.status === "active"
                ? "active"
                : user.isActive !== false
                  ? "active"
                  : "inactive",
            kyc: user.kycStatus || "none",
            totalMining: user.miningStats?.totalMined || 0,
            totalCoins: user.miningStats?.totalCoins || 0,
            baseLevel: baseRate,
            referralLevel: Math.round(referralBoost * 100) / 100,
            boostLevel: boostLevel,
            referrals: user.referralStats?.totalCount || 0,
            activeReferrals: user.referralStats?.activeCount || 0,
            referralEarned: user.referralStats?.totalEarned || 0,
            joined: user.createdAt,
            lastLogin: user.lastLogin,
            miningStreak: user.miningStats?.streak || 0,
            miningLevel: user.miningStats?.level || 1,
            ownership: overallOwnership,
            ownershipDetails: {
              daysActive: ownershipData.daysActive || 0,
              miningSessions: ownershipData.miningSessions || 0,
              kycInvited: ownershipData.kycInvited || false,
            },
            avatar: user.name
              ? user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)
              : "U",
            coinBalance: user.coinBalance || 0,
            walletBalance: user.walletBalance || 0,
            checkinStreak: user.checkinStreak || 0,
            referralCode: user.referralCode || "",
          };
        });

        setUsers(formattedUsers);

        const newPagination = {
          currentPage:
            paginationData.current ||
            paginationData.page ||
            pagination.currentPage,
          totalPages: paginationData.pages || paginationData.totalPages || 1,
          totalUsers: paginationData.total || formattedUsers.length,
          limit: paginationData.limit || pagination.limit,
        };
        setPagination(newPagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setDeleteLoading(userId);
    try {
      const response = await AdminApi.deleteUser(userId);
      if (response.success) {
        showMessage("success", "User deleted successfully");
        fetchUsers();
        fetchStats(); // Refresh stats after deletion
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showMessage("error", "Failed to delete user");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleUpdateCoins = async (userId, amount, action) => {
    try {
      const response = await AdminApi.updateUserCoins(userId, {
        amount,
        action,
      });
      if (response.success) {
        fetchUsers();
        setShowModal(false);
        showMessage(
          "success",
          `Coins ${action === "add" ? "added" : "deducted"} successfully`,
        );
      }
    } catch (error) {
      console.error("Error updating coins:", error);
      showMessage("error", "Failed to update coins");
    }
  };

  // Handle coin add/deduct from view modal
  const handleCoinAction = async (action) => {
    if (
      !coinAmount ||
      isNaN(parseFloat(coinAmount)) ||
      parseFloat(coinAmount) <= 0
    ) {
      showMessage("error", "Please enter a valid amount");
      return;
    }
    setCoinLoading(true);
    try {
      const response = await fetch(
        `http://72.62.167.180:5002/api/admin/users/${selectedUser.id}/${action}-coins`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({
            amount: parseFloat(coinAmount),
            reason: `Admin ${action}`,
          }),
        },
      );
      const data = await response.json();
      if (data.success) {
        showMessage(
          "success",
          `Successfully ${action === "add" ? "added" : "deducted"} ${coinAmount} coins`,
        );
        setCoinAmount("");
        fetchUsers();
        // Update selected user with new balance
        setSelectedUser((prev) => ({
          ...prev,
          coinBalance:
            action === "add"
              ? prev.coinBalance + parseFloat(coinAmount)
              : prev.coinBalance - parseFloat(coinAmount),
        }));
      } else {
        showMessage("error", data.message || "Failed to update coins");
      }
    } catch (error) {
      console.error("Error updating coins:", error);
      showMessage("error", "Failed to update coins");
    } finally {
      setCoinLoading(false);
    }
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      status: user.status,
    });
    setShowEditModal(true);
  };

  // Show toast message
  const showMessage = (type, text) => {
    setActionMessage({ show: true, type, text });
    setTimeout(
      () => setActionMessage({ show: false, type: "", text: "" }),
      3000,
    );
  };

  // Save edited user
  const handleSaveEdit = async () => {
    setEditLoading(true);
    try {
      const response = await AdminApi.updateUser(selectedUser.id, editForm);
      if (response.success) {
        setShowEditModal(false);
        showMessage("success", "User updated successfully");
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showMessage("error", error.message || "Failed to update user");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle ban/unban user
  const handleToggleBan = async (userId, currentStatus) => {
    const action = currentStatus === "active" ? "ban" : "unban";
    if (!window.confirm(`Are you sure you want to ${action} this user?`))
      return;

    setCoinLoading(true); // Reuse loading state for ban action
    try {
      const response = await fetch(
        `http://72.62.167.180:5002/api/admin/users/${userId}/${action}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        showMessage(
          "success",
          `User ${action === "ban" ? "banned" : "unbanned"} successfully`,
        );
        setShowModal(false);
        fetchUsers();
      } else {
        showMessage("error", data.message || `Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Error ${action}ning user:`, error);
      showMessage("error", `Failed to ${action} user`);
    } finally {
      setCoinLoading(false);
    }
  };

  // Handle add new user
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      showMessage("error", "Name, email, and password are required");
      return;
    }

    if (newUser.password.length < 6) {
      showMessage("error", "Password must be at least 6 characters");
      return;
    }

    setAddUserLoading(true);
    try {
      const response = await AdminApi.createUser({
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        password: newUser.password,
        status: newUser.status,
      });

      if (response.success) {
        showMessage("success", `User "${newUser.name}" created successfully`);
        setShowAddModal(false);
        setNewUser({
          name: "",
          email: "",
          phone: "",
          password: "",
          status: "active",
        });
        fetchUsers();
        fetchStats(); // Refresh stats after adding user
      }
    } catch (error) {
      console.error("Error creating user:", error);
      showMessage("error", error.message || "Failed to create user");
    } finally {
      setAddUserLoading(false);
    }
  };

  const filteredUsers = users;

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
        icon: "verified",
      },
      approved: {
        bg: "bg-gradient-to-r from-teal-500 to-emerald-500",
        text: "text-white",
        icon: "verified",
      },
      pending: {
        bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
        text: "text-white",
        icon: "pending",
      },
      rejected: {
        bg: "bg-gradient-to-r from-red-500 to-rose-500",
        text: "text-white",
        icon: "rejected",
      },
      none: {
        bg: "bg-gradient-to-r from-slate-400 to-slate-500",
        text: "text-white",
        icon: "none",
      },
    };
    // Default to 'none' if kyc status is not in config
    const kycConfig = config[kyc] || config.none;
    const { bg, text, icon } = kycConfig;
    const displayKyc = kyc || "none";
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${bg} ${text} shadow-sm`}
      >
        {icon === "verified" && <CheckCircle className="w-3 h-3" />}
        {icon === "pending" && <AlertCircle className="w-3 h-3" />}
        {icon === "rejected" && <XCircle className="w-3 h-3" />}
        {displayKyc.charAt(0).toUpperCase() + displayKyc.slice(1)}
      </span>
    );
  };

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: "+12.5%",
      icon: UsersIcon,
      gradient: "from-blue-600 to-indigo-600",
    },
    {
      label: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      change: "+8.2%",
      icon: Activity,
      gradient: "from-emerald-600 to-teal-600",
    },
    {
      label: "Inactive",
      value: stats.inactiveUsers.toLocaleString(),
      change: "-2.4%",
      icon: AlertCircle,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      label: "KYC Pending",
      value: stats.kycPending.toLocaleString(),
      change: "+5.1%",
      icon: Shield,
      gradient: "from-purple-600 to-pink-600",
    },
  ];

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 overflow-x-hidden">
      {/* Toast Notification */}
      {actionMessage.show && (
        <div
          className={`fixed top-4 right-4 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in ${
            actionMessage.type === "success"
              ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
              : "bg-gradient-to-r from-red-500 to-rose-500 text-white"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{actionMessage.text}</span>
        </div>
      )}

      <Header title="User Management" subtitle="Manage all registered users" />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full">
        {statCards.map((stat, idx) => (
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
            <select
              className="flex-1 xl:flex-none min-w-[120px] px-3 md:px-4 py-2.5 md:py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-amber-500 cursor-pointer hover:bg-slate-100 transition-all"
              value={filterKYC}
              onChange={(e) => setFilterKYC(e.target.value)}
            >
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
                        {user.coinBalance.toLocaleString()}
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
                          setCoinAmount("");
                          setShowModal(true);
                        }}
                        className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all hover:scale-110 hover:shadow-lg"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all hover:scale-110 hover:shadow-lg"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleteLoading === user.id}
                        className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all hover:scale-110 hover:shadow-lg disabled:opacity-50"
                        title="Delete User"
                      >
                        {deleteLoading === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
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
            Showing{" "}
            <span className="font-semibold">
              {pagination.totalUsers > 0
                ? (pagination.currentPage - 1) * pagination.limit + 1
                : 0}
              -
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalUsers,
              )}
            </span>{" "}
            of{" "}
            <span className="font-semibold">
              {pagination.totalUsers.toLocaleString()}
            </span>{" "}
            users
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: Math.max(1, prev.currentPage - 1),
                }))
              }
              disabled={pagination.currentPage === 1}
              className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:bg-slate-100 hover:border-slate-300 transition-all disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/25">
              {pagination.currentPage}
            </button>
            {pagination.totalPages > 1 &&
              pagination.currentPage < pagination.totalPages && (
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      currentPage: prev.currentPage + 1,
                    }))
                  }
                  className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:bg-slate-100 hover:border-slate-300 transition-all font-medium"
                >
                  {pagination.currentPage + 1}
                </button>
              )}
            {pagination.totalPages > 2 &&
              pagination.currentPage < pagination.totalPages - 1 && (
                <>
                  <span className="px-2 text-slate-400">...</span>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        currentPage: pagination.totalPages,
                      }))
                    }
                    className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:bg-slate-100 hover:border-slate-300 transition-all font-medium"
                  >
                    {pagination.totalPages}
                  </button>
                </>
              )}
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  currentPage: Math.min(
                    pagination.totalPages,
                    prev.currentPage + 1,
                  ),
                }))
              }
              disabled={pagination.currentPage === pagination.totalPages}
              className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:bg-slate-100 hover:border-slate-300 transition-all disabled:opacity-50"
            >
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
                        { month: "short", day: "numeric", year: "numeric" },
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
                      {selectedUser.coinBalance.toLocaleString()}
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
                    value={coinAmount}
                    onChange={(e) => setCoinAmount(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition-all"
                    disabled={coinLoading}
                  />
                  <button
                    onClick={() => handleCoinAction("add")}
                    disabled={coinLoading}
                    className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg disabled:opacity-50"
                  >
                    {coinLoading ? "..." : "Add"}
                  </button>
                  <button
                    onClick={() => handleCoinAction("deduct")}
                    disabled={coinLoading}
                    className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg disabled:opacity-50"
                  >
                    {coinLoading ? "..." : "Deduct"}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <h5 className="text-sm font-bold text-slate-800 mb-3 mt-6 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                Quick Actions
              </h5>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleToggleBan(selectedUser.id, selectedUser.status)
                  }
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-lg ${
                    selectedUser.status === "active"
                      ? "bg-red-100 text-red-600 hover:bg-red-500 hover:text-white"
                      : "bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                  }`}
                >
                  {selectedUser.status === "active" ? "Ban User" : "Unban User"}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleEditUser(selectedUser);
                  }}
                  className="flex-1 px-4 py-3 bg-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg"
                >
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Edit User</h3>
                  <p className="text-white/80 text-sm">
                    Update user information
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 transition-all"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
                className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {editLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
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
                  placeholder="Enter phone number (optional)"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password (min 6 characters)"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Status */}
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
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={addUserLoading}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={addUserLoading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addUserLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
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
