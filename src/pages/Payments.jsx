import { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminApi from "../services/api";
import {
  CreditCard,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Copy,
  QrCode,
  Receipt,
  IndianRupee,
  X,
  AlertCircle,
  ExternalLink,
  Loader2,
  Check,
  Save,
  Upload,
} from "lucide-react";

const Payments = () => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectPaymentId, setRejectPaymentId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(null);
  const [copiedText, setCopiedText] = useState("");
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [isUploadingQR, setIsUploadingQR] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalCollected: 0,
    todayCollected: 0,
  });

  // UPI Settings State
  const [upiSettings, setUpiSettings] = useState({
    upiId: "",
    upiName: "",
    qrCode: "",
  });

  useEffect(() => {
    fetchPaymentStats();
    fetchPaymentSettings();
  }, []);

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, pagination.currentPage]);

  const fetchPaymentStats = async () => {
    try {
      const response = await AdminApi.getPaymentStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error("Error fetching payment stats:", error);
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      const response = await AdminApi.getPaymentSettings();
      if (response.success && response.settings) {
        setUpiSettings({
          upiId: response.settings.upiId || "",
          upiName: response.settings.upiName || "",
          qrCode: response.settings.qrCode || "",
        });
      }
    } catch (error) {
      console.error("Error fetching payment settings:", error);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 10,
        status: activeTab !== "all" ? activeTab : undefined,
      };

      const response = await AdminApi.getPayments(params);

      if (response.success) {
        // API returns response.payments (from PaymentProof collection)
        const paymentsData = response.payments || [];
        const paginationData = response.pagination || {};

        const formattedPayments = paymentsData.map((payment) => ({
          id: payment._id,
          user: payment.user?.name || "Unknown",
          email: payment.user?.email || "N/A",
          phone: payment.user?.phone || "N/A",
          utr: payment.utr || "N/A",
          amount: payment.amount || 0,
          upiId: payment.upiId || "N/A",
          status: payment.status || "pending",
          submitted: payment.createdAt
            ? new Date(payment.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A",
          screenshot: payment.screenshot,
          purpose:
            payment.purpose
              ?.replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()) || "Coin Purchase",
          coinsToCredit: payment.coinsToCredit || 0,
          coinPackage: payment.coinPackage,
          rejectionReason: payment.rejectionReason,
        }));

        setPayments(formattedPayments);
        setPagination((prev) => ({
          ...prev,
          totalPages: paginationData.pages || paginationData.totalPages || 1,
          total: paginationData.total || formattedPayments.length,
        }));
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(
    (p) =>
      searchQuery === "" ||
      p.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.utr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const showSuccessToast = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleApprove = async (paymentId) => {
    setIsProcessing(paymentId);
    try {
      const response = await AdminApi.approvePayment(paymentId);

      if (response.success) {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === paymentId ? { ...p, status: "approved" } : p,
          ),
        );
        showSuccessToast("Payment approved successfully!");
        if (selectedPayment?.id === paymentId) {
          setSelectedPayment((prev) => ({ ...prev, status: "approved" }));
        }
        fetchPayments();
        fetchPaymentStats();
      }
    } catch (error) {
      console.error("Error approving payment:", error);
      alert("Failed to approve payment");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectClick = (paymentId) => {
    setRejectPaymentId(paymentId);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) return;
    setIsProcessing(rejectPaymentId);

    try {
      const response = await AdminApi.rejectPayment(
        rejectPaymentId,
        rejectReason,
      );

      if (response.success) {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === rejectPaymentId
              ? { ...p, status: "rejected", rejectionReason: rejectReason }
              : p,
          ),
        );
        setShowRejectModal(false);
        showSuccessToast("Payment rejected!");
        if (selectedPayment?.id === rejectPaymentId) {
          setSelectedPayment((prev) => ({
            ...prev,
            status: "rejected",
            rejectionReason: rejectReason,
          }));
        }
        setShowModal(false);
        fetchPayments();
        fetchPaymentStats();
      }
    } catch (error) {
      console.error("Error rejecting payment:", error);
      alert("Failed to reject payment");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await AdminApi.updatePaymentSettings({
        upiId: upiSettings.upiId,
        upiName: upiSettings.upiName,
        qrCode: upiSettings.qrCode,
      });
      if (response.success) {
        showSuccessToast("Payment settings saved!");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save payment settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleQRCodeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setIsUploadingQR(true);
    try {
      const formData = new FormData();
      formData.append("qrCode", file);

      const response = await AdminApi.uploadQRCode(formData);
      if (response.success) {
        setUpiSettings((prev) => ({
          ...prev,
          qrCode: response.qrCode,
        }));
        showSuccessToast("QR Code uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading QR code:", error);
      alert(error.message || "Failed to upload QR code");
    } finally {
      setIsUploadingQR(false);
      e.target.value = ""; // Reset file input
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: "status-verified",
      pending: "status-pending",
      rejected: "status-rejected",
    };
    const icons = {
      approved: <CheckCircle className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
    };
    return (
      <span className={`status-badge ${styles[status]}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  return (
    <div>
      <Header
        title="Payments & UTR"
        subtitle="Manage QR/UPI payments and UTR verification"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="card p-3 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-500 mb-1">Total</p>
              <p className="text-lg md:text-2xl font-bold text-slate-800">
                {stats.total.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="card p-3 md:p-5 bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm opacity-80 mb-1">Pending</p>
              <p className="text-xl md:text-3xl font-bold">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 md:w-10 md:h-10 opacity-80" />
          </div>
        </div>
        <div className="card p-3 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-500 mb-1">
                Collected
              </p>
              <p className="text-lg md:text-2xl font-bold text-emerald-600">
                {formatCurrency(stats.totalCollected)}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="card p-3 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-500 mb-1">Today</p>
              <p className="text-lg md:text-2xl font-bold text-slate-800">
                {formatCurrency(stats.todayCollected)}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* UPI Settings */}
        <div className="card">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">
              Payment Settings
            </h2>
            <p className="text-sm text-slate-500">
              UPI & QR code configuration
            </p>
          </div>
          <div className="p-5">
            {/* QR Code */}
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-700 mb-3 block">
                QR Code
              </label>
              {upiSettings.qrCode ? (
                <div className="relative group">
                  <div className="w-full aspect-square bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
                    <img
                      src={upiSettings.qrCode}
                      alt="Payment QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl flex flex-col items-center justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQRCodeUpload}
                      className="hidden"
                      disabled={isUploadingQR}
                    />
                    {isUploadingQR ? (
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-white mb-2" />
                        <span className="text-white text-sm font-medium">
                          Change QR Code
                        </span>
                      </>
                    )}
                  </label>
                </div>
              ) : (
                <label className="w-full aspect-square bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-50 hover:border-amber-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQRCodeUpload}
                    className="hidden"
                    disabled={isUploadingQR}
                  />
                  {isUploadingQR ? (
                    <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-16 h-16 text-slate-400 mb-3" />
                      <span className="text-sm text-slate-600 font-medium">
                        Click to Upload QR Code
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        PNG, JPG up to 5MB
                      </span>
                    </>
                  )}
                </label>
              )}
            </div>

            {/* UPI ID */}
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                UPI ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={upiSettings.upiId}
                  onChange={(e) =>
                    setUpiSettings((prev) => ({
                      ...prev,
                      upiId: e.target.value,
                    }))
                  }
                  placeholder="yourname@upi"
                  className="form-input flex-1"
                />
                <button
                  onClick={() => copyToClipboard(upiSettings.upiId)}
                  className="btn btn-secondary"
                  title="Copy UPI ID"
                  disabled={!upiSettings.upiId}
                >
                  {copiedText === upiSettings.upiId ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Account Name */}
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Account Name
              </label>
              <input
                type="text"
                value={upiSettings.upiName}
                onChange={(e) =>
                  setUpiSettings((prev) => ({
                    ...prev,
                    upiName: e.target.value,
                  }))
                }
                placeholder="Account holder name"
                className="form-input"
              />
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Payment Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Payments List */}
        <div className="card lg:col-span-2">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {["pending", "approved", "rejected", "all"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className={`px-5 py-4 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "text-amber-600 border-b-2 border-amber-500"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab}{" "}
                {tab === "pending" && stats.pending > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {stats.pending}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 rounded-lg">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by UTR, user or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none bg-transparent text-sm w-full focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Payments */}
          <div className="divide-y divide-slate-100">
            {filteredPayments.map((payment) => (
              <div
                key={payment.id}
                className="p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      {payment.user.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {payment.user}
                      </p>
                      <p className="text-sm text-slate-500">{payment.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-600">
                          {payment.utr}
                        </span>
                        <button
                          onClick={() => copyToClipboard(payment.utr)}
                          className="text-slate-400 hover:text-slate-600"
                          title="Copy UTR"
                        >
                          {copiedText === payment.utr ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-800">
                      ₹{payment.amount}
                    </p>
                    {getStatusBadge(payment.status)}
                    <p className="text-xs text-slate-500 mt-2">
                      {payment.submitted}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <span className="text-sm text-slate-500">
                    Purpose: {payment.purpose}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setShowModal(true);
                      }}
                      className="btn btn-secondary text-xs"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    {payment.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(payment.id)}
                          disabled={isProcessing === payment.id}
                          className="btn btn-success text-xs disabled:opacity-50"
                        >
                          {isProcessing === payment.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectClick(payment.id)}
                          disabled={isProcessing === payment.id}
                          className="btn btn-danger text-xs disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Detail Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Payment Details
                </h3>
                <p className="text-sm text-slate-500">
                  UTR: {selectedPayment.utr}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {selectedPayment.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-800">
                    {selectedPayment.user}
                  </h4>
                  <p className="text-sm text-slate-500">
                    {selectedPayment.email}
                  </p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Amount</p>
                  <p className="text-xl font-bold text-emerald-600">
                    ₹{selectedPayment.amount}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  {getStatusBadge(selectedPayment.status)}
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">UPI ID Used</p>
                  <p className="text-sm font-medium text-slate-800">
                    {selectedPayment.upiId}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Submitted</p>
                  <p className="text-sm font-medium text-slate-800">
                    {selectedPayment.submitted}
                  </p>
                </div>
              </div>

              {/* UTR Number */}
              <div className="mb-6">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  UTR Number
                </label>
                <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
                  <span className="font-mono text-slate-800 flex-1">
                    {selectedPayment.utr}
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedPayment.utr)}
                    className="text-slate-500 hover:text-slate-700"
                    title="Copy UTR"
                  >
                    {copiedText === selectedPayment.utr ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Payment Screenshot */}
              <div className="mb-6">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Payment Screenshot
                </label>
                {selectedPayment.screenshot ? (
                  <a
                    href={selectedPayment.screenshot}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-amber-400 transition-colors"
                  >
                    <img
                      src={selectedPayment.screenshot}
                      alt="Payment Screenshot"
                      className="w-full h-full object-contain"
                    />
                  </a>
                ) : (
                  <div className="aspect-video bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                    <Receipt className="w-12 h-12 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-500">
                      No Screenshot Uploaded
                    </span>
                  </div>
                )}
              </div>

              {/* Coins to Credit */}
              {selectedPayment.coinsToCredit > 0 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">Coins to Credit:</span>{" "}
                    {selectedPayment.coinsToCredit.toLocaleString()} coins
                  </p>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedPayment.status === "rejected" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Rejection Reason</span>
                  </div>
                  <p className="text-sm text-red-700">
                    {selectedPayment.rejectionReason}
                  </p>
                </div>
              )}

              {/* Actions */}
              {selectedPayment.status === "pending" && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleApprove(selectedPayment.id)}
                    disabled={isProcessing === selectedPayment.id}
                    className="btn btn-success flex-1 disabled:opacity-50"
                  >
                    {isProcessing === selectedPayment.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve Payment
                  </button>
                  <button
                    onClick={() => handleRejectClick(selectedPayment.id)}
                    disabled={isProcessing === selectedPayment.id}
                    className="btn btn-danger flex-1 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Reject Payment
                </h3>
                <p className="text-sm text-slate-500">
                  Please provide a reason
                </p>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Rejection Reason
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="form-input min-h-[100px] resize-none"
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={!rejectReason.trim() || isProcessing}
                  className="btn btn-danger flex-1 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Reject Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          <Check className="w-5 h-5" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Payments;
