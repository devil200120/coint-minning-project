import { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminApi from "../services/api";
import {
  Ticket,
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Coins,
  Zap,
  Percent,
  Calendar,
  X,
  Loader2,
  Check,
  Gift,
  TrendingUp,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const PromoCodes = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [copiedCode, setCopiedCode] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(null);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "coins",
    value: "",
    maxUses: "",
    usesPerUser: 1,
    minPurchase: "",
    validFrom: "",
    validUntil: "",
    isActive: true,
    targetAudience: "all",
  });

  const [promoCodes, setPromoCodes] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const [stats, setStats] = useState({
    totalCodes: 0,
    activeCodes: 0,
    totalRedemptions: 0,
    coinsGiven: 0,
  });

  // Fetch promo codes
  const fetchPromoCodes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        status: filterStatus,
        rewardType: filterType,
      };

      const response = await AdminApi.getPromoCodes(params);
      setPromoCodes(response.promoCodes || []);
      setPagination(
        response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
        },
      );
    } catch (err) {
      console.error("Failed to fetch promo codes:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await AdminApi.getPromoCodeStats();
      setStats(
        response.stats || {
          totalCodes: 0,
          activeCodes: 0,
          totalRedemptions: 0,
          coinsGiven: 0,
        },
      );
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // Initial load and refetch on filter/page change
  useEffect(() => {
    fetchPromoCodes();
  }, [currentPage, filterStatus, filterType]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchPromoCodes();
      } else {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const statsDisplay = [
    {
      label: "Total Codes",
      value: stats.totalCodes,
      icon: Ticket,
      color: "bg-blue-100 text-blue-600",
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      label: "Active Codes",
      value: stats.activeCodes,
      icon: CheckCircle,
      color: "bg-emerald-100 text-emerald-600",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      label: "Total Redemptions",
      value: stats.totalRedemptions?.toLocaleString() || "0",
      icon: Gift,
      color: "bg-amber-100 text-amber-600",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      label: "Coins Given",
      value:
        stats.coinsGiven >= 1000
          ? `${(stats.coinsGiven / 1000).toFixed(1)}K`
          : stats.coinsGiven?.toString() || "0",
      icon: Coins,
      color: "bg-purple-100 text-purple-600",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const showSuccessToast = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, code }));
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.value) {
      alert("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const promoData = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        type: formData.type,
        value: Number(formData.value),
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        usesPerUser: Number(formData.usesPerUser) || 1,
        minPurchase: formData.minPurchase ? Number(formData.minPurchase) : 0,
        validFrom: formData.validFrom || null,
        validUntil: formData.validUntil || null,
        isActive: formData.isActive,
        targetAudience: formData.targetAudience,
      };

      if (editingPromo) {
        await AdminApi.updatePromoCode(
          editingPromo.id || editingPromo._id,
          promoData,
        );
        showSuccessToast("Promo code updated successfully!");
      } else {
        await AdminApi.createPromoCode(promoData);
        showSuccessToast("Promo code created successfully!");
      }

      closeModal();
      fetchPromoCodes();
      fetchStats();
    } catch (err) {
      console.error("Failed to save promo code:", err);
      alert(err.message || "Failed to save promo code");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      await AdminApi.deletePromoCode(id);
      showSuccessToast("Promo code deleted!");
      setShowDeleteConfirm(null);
      fetchPromoCodes();
      fetchStats();
    } catch (err) {
      console.error("Failed to delete promo code:", err);
      alert(err.message || "Failed to delete promo code");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleStatus = async (id) => {
    setIsTogglingStatus(id);
    try {
      await AdminApi.togglePromoCodeStatus(id);
      showSuccessToast("Status updated successfully!");
      fetchPromoCodes();
      fetchStats();
    } catch (err) {
      console.error("Failed to toggle status:", err);
      alert(err.message || "Failed to toggle status");
    } finally {
      setIsTogglingStatus(null);
    }
  };

  const openEditModal = (promo) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      description: promo.description || "",
      type: promo.type || promo.rewardType || "coins",
      value: (promo.value || promo.rewardValue || "").toString(),
      maxUses: promo.maxUses?.toString() || "",
      usesPerUser: promo.usesPerUser || promo.maxUsesPerUser || 1,
      minPurchase: (
        promo.minPurchase ||
        promo.minPurchaseAmount ||
        ""
      ).toString(),
      validFrom:
        promo.validFrom ||
        (promo.startDate ? promo.startDate.split("T")[0] : "") ||
        "",
      validUntil:
        promo.validUntil ||
        (promo.endDate ? promo.endDate.split("T")[0] : "") ||
        "",
      isActive:
        promo.isActive !== undefined
          ? promo.isActive
          : promo.status === "active",
      targetAudience: promo.targetAudience || promo.targetUsers || "all",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPromo(null);
    setFormData({
      code: "",
      description: "",
      type: "coins",
      value: "",
      maxUses: "",
      usesPerUser: 1,
      minPurchase: "",
      validFrom: "",
      validUntil: "",
      isActive: true,
      targetAudience: "all",
    });
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "coins":
        return <Coins className="w-4 h-4" />;
      case "boost":
        return <Zap className="w-4 h-4" />;
      case "discount":
      case "discount_percent":
      case "discount_fixed":
        return <Percent className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "coins":
        return "bg-amber-100 text-amber-700";
      case "boost":
        return "bg-emerald-100 text-emerald-700";
      case "discount":
      case "discount_percent":
      case "discount_fixed":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "coins":
        return "Coins";
      case "boost":
        return "Boost";
      case "discount":
      case "discount_percent":
        return "Discount %";
      case "discount_fixed":
        return "Discount $";
      default:
        return type?.charAt(0).toUpperCase() + type?.slice(1) || "Unknown";
    }
  };

  const getValueDisplay = (promo) => {
    const type = promo.type || promo.rewardType;
    const value = promo.value || promo.rewardValue;
    switch (type) {
      case "coins":
        return `${value} coins`;
      case "boost":
        return `${value}% boost`;
      case "discount":
      case "discount_percent":
        return `${value}% off`;
      case "discount_fixed":
        return `$${value} off`;
      default:
        return `${value}`;
    }
  };

  const getAudienceLabel = (audience) => {
    switch (audience) {
      case "all":
        return "All Users";
      case "new_users":
        return "New Users";
      case "kyc_verified":
        return "KYC Verified";
      case "referral_users":
        return "Referral Users";
      case "premium":
        return "Premium Users";
      default:
        return audience || "All Users";
    }
  };

  const isExpired = (validUntil) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Header
        title="Promo Codes"
        subtitle="Create and manage promotional codes"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statsDisplay.map((stat, idx) => (
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
                <p className="text-xl md:text-2xl font-bold text-slate-800">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>
            {/* Filters */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="coins">Coins</option>
              <option value="boost">Boost</option>
              <option value="discount_percent">Discount %</option>
              <option value="discount_fixed">Discount $</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                fetchPromoCodes();
                fetchStats();
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Code
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="p-12 text-center">
            <Loader2 className="w-10 h-10 text-amber-500 mx-auto mb-4 animate-spin" />
            <p className="text-slate-500">Loading promo codes...</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Failed to load promo codes
            </h3>
            <p className="text-slate-500 mb-4">{error}</p>
            <button
              onClick={fetchPromoCodes}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Desktop Table */}
        {!isLoading && !error && promoCodes.length > 0 && (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                      Code
                    </th>
                    <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                      Type
                    </th>
                    <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                      Value
                    </th>
                    <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                      Usage
                    </th>
                    <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                      Validity
                    </th>
                    <th className="text-left text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                      Status
                    </th>
                    <th className="text-center text-xs font-bold text-slate-600 uppercase tracking-wider px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {promoCodes.map((promo) => (
                    <tr
                      key={promo.id || promo._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <code className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-mono font-semibold text-slate-800">
                              {promo.code}
                            </code>
                            <button
                              onClick={() => copyToClipboard(promo.code)}
                              className="text-slate-400 hover:text-slate-600 transition-colors"
                              title="Copy code"
                            >
                              {copiedCode === promo.code ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 max-w-[200px] truncate">
                            {promo.description || "-"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getTypeColor(
                            promo.type || promo.rewardType,
                          )}`}
                        >
                          {getTypeIcon(promo.type || promo.rewardType)}
                          {getTypeLabel(promo.type || promo.rewardType)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">
                          {getValueDisplay(promo)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-800">
                              {promo.usedCount || 0}
                            </span>
                            <span className="text-slate-400">/</span>
                            <span className="text-sm text-slate-500">
                              {promo.maxUses || "∞"}
                            </span>
                          </div>
                          {promo.maxUses && (
                            <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    ((promo.usedCount || 0) / promo.maxUses) *
                                      100,
                                    100,
                                  )}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {promo.validFrom && (
                            <p className="text-slate-600">
                              From: {promo.validFrom}
                            </p>
                          )}
                          {promo.validUntil ? (
                            <p
                              className={
                                isExpired(promo.validUntil)
                                  ? "text-red-500"
                                  : "text-slate-500"
                              }
                            >
                              Until: {promo.validUntil}
                            </p>
                          ) : (
                            <p className="text-emerald-500">No expiry</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isExpired(promo.validUntil) ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                            <Clock className="w-3 h-3" />
                            Expired
                          </span>
                        ) : promo.isActive || promo.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => toggleStatus(promo.id || promo._id)}
                            disabled={
                              isTogglingStatus === (promo.id || promo._id)
                            }
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50 ${
                              promo.isActive || promo.status === "active"
                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                            }`}
                            title={
                              promo.isActive || promo.status === "active"
                                ? "Deactivate"
                                : "Activate"
                            }
                          >
                            {isTogglingStatus === (promo.id || promo._id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : promo.isActive || promo.status === "active" ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openEditModal(promo)}
                            className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center hover:bg-amber-200 transition-all hover:scale-110"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setShowDeleteConfirm(promo.id || promo._id)
                            }
                            className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-all hover:scale-110"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {promoCodes.map((promo) => (
                <div key={promo.id || promo._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <code className="px-2.5 py-1 bg-slate-100 rounded-lg text-sm font-mono font-semibold text-slate-800">
                          {promo.code}
                        </code>
                        <button
                          onClick={() => copyToClipboard(promo.code)}
                          className="text-slate-400"
                        >
                          {copiedCode === promo.code ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500">
                        {promo.description || "-"}
                      </p>
                    </div>
                    {promo.isActive || promo.status === "active" ? (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getTypeColor(
                        promo.type || promo.rewardType,
                      )}`}
                    >
                      {getTypeIcon(promo.type || promo.rewardType)}
                      {getValueDisplay(promo)}
                    </span>
                    <span className="text-xs text-slate-500">
                      Used: {promo.usedCount || 0}/{promo.maxUses || "∞"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(promo)}
                      className="flex-1 py-2 bg-amber-100 text-amber-600 rounded-xl text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setShowDeleteConfirm(promo.id || promo._id)
                      }
                      className="flex-1 py-2 bg-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !error && promoCodes.length === 0 && (
          <div className="p-12 text-center">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              No promo codes found
            </h3>
            <p className="text-slate-500 mb-4">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Create your first promo code to get started"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                Create Code
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && promoCodes.length > 0 && (
          <div className="p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-semibold">
                {(pagination.currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(
                  pagination.currentPage * itemsPerPage,
                  pagination.totalItems,
                )}
              </span>{" "}
              of <span className="font-semibold">{pagination.totalItems}</span>{" "}
              promo codes
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from(
                { length: Math.min(pagination.totalPages, 5) },
                (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25"
                          : "border-2 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                },
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= pagination.totalPages}
                className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 p-6">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {editingPromo ? "Edit Promo Code" : "Create Promo Code"}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {editingPromo
                      ? "Update promo code details"
                      : "Set up a new promotional code"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-5">
                {/* Code */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Promo Code *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="e.g., WELCOME100"
                      className="flex-1 px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-mono uppercase"
                    />
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="e.g., Welcome bonus for new users"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Type & Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Reward Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-amber-500 cursor-pointer transition-all"
                    >
                      <option value="coins">Bonus Coins</option>
                      <option value="boost">Mining Boost (%)</option>
                      <option value="discount_percent">
                        Purchase Discount (%)
                      </option>
                      <option value="discount_fixed">
                        Purchase Discount ($)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Value *
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) =>
                        setFormData({ ...formData, value: e.target.value })
                      }
                      placeholder={
                        formData.type === "coins" ? "e.g., 100" : "e.g., 20"
                      }
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Usage Limits */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Max Total Uses
                    </label>
                    <input
                      type="number"
                      value={formData.maxUses}
                      onChange={(e) =>
                        setFormData({ ...formData, maxUses: e.target.value })
                      }
                      placeholder="Leave empty for unlimited"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Uses Per User
                    </label>
                    <input
                      type="number"
                      value={formData.usesPerUser}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          usesPerUser: Number(e.target.value),
                        })
                      }
                      min="1"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Validity Period */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Valid From
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) =>
                        setFormData({ ...formData, validFrom: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) =>
                        setFormData({ ...formData, validUntil: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Min Purchase & Target Audience */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Min Purchase (coins)
                    </label>
                    <input
                      type="number"
                      value={formData.minPurchase}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minPurchase: e.target.value,
                        })
                      }
                      placeholder="0"
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Target Audience
                    </label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          targetAudience: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:border-amber-500 cursor-pointer transition-all"
                    >
                      <option value="all">All Users</option>
                      <option value="new_users">New Users Only</option>
                      <option value="kyc_verified">KYC Verified</option>
                      <option value="referral_users">Referral Users</option>
                    </select>
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-700">
                      Active Status
                    </p>
                    <p className="text-sm text-slate-500">
                      Enable or disable this promo code
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={() =>
                        setFormData({
                          ...formData,
                          isActive: !formData.isActive,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-amber-500/25 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingPromo ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{editingPromo ? "Update Code" : "Create Code"}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
              Delete Promo Code?
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              This action cannot be undone. The promo code will be permanently
              deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[70] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-3 bg-emerald-600 text-white px-4 md:px-5 py-3 rounded-xl shadow-lg max-w-sm">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm">Success!</p>
              <p className="text-xs text-emerald-100 truncate">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodes;
