import { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminApi from "../services/api";
import {
  Shield,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  FileText,
  User,
  Calendar,
  MapPin,
  X,
  AlertCircle,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const KYC = () => {
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [documentFilter, setDocumentFilter] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [processingAction, setProcessingAction] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [kycRequests, setKycRequests] = useState([]);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    total: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchKYCStats();
  }, []);

  useEffect(() => {
    fetchKYCRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage]);

  const fetchKYCStats = async () => {
    try {
      const response = await AdminApi.getKYCStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error("Error fetching KYC stats:", error);
    }
  };

  const fetchKYCRequests = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        status: activeTab !== "all" ? activeTab : undefined,
      };

      const response = await AdminApi.getKYCList(params);

      if (response.success) {
        // API returns response.kycRequests directly, not response.data.kycRequests
        const kycData =
          response.kycRequests || response.data?.kycRequests || [];
        const paginationData =
          response.pagination || response.data?.pagination || {};

        const formattedKYC = kycData.map((kyc) => ({
          id: kyc._id,
          userId: kyc.user?._id || kyc.userId?._id || kyc.userId,
          name: kyc.user?.name || kyc.personalInfo?.fullName || "Unknown",
          email: kyc.user?.email || "N/A",
          phone: kyc.user?.phone || "N/A",
          status: kyc.status || "pending",
          submitted: kyc.createdAt
            ? new Date(kyc.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "N/A",
          documentType: kyc.document?.type || "N/A",
          documentNumber: kyc.document?.number || "N/A",
          address: kyc.personalInfo?.address
            ? `${kyc.personalInfo.address}${kyc.personalInfo.city ? ", " + kyc.personalInfo.city : ""}${kyc.personalInfo.country ? ", " + kyc.personalInfo.country : ""}`
            : "N/A",
          dob: kyc.personalInfo?.dateOfBirth
            ? new Date(kyc.personalInfo.dateOfBirth).toLocaleDateString(
                "en-IN",
                { year: "numeric", month: "short", day: "numeric" },
              )
            : "N/A",
          frontImage: kyc.document?.frontImage,
          backImage: kyc.document?.backImage,
          selfie: kyc.selfie,
          rejectionReason: kyc.rejectionReason,
        }));

        setKycRequests(formattedKYC);
        setPagination({
          totalPages: paginationData.pages || paginationData.totalPages || 1,
          total: paginationData.total || formattedKYC.length,
        });
      }
    } catch (error) {
      console.error("Error fetching KYC requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter by search and document type (tab filtering is done by API)
  const filteredRequests = kycRequests.filter((k) => {
    const matchesSearch =
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.documentNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDocument =
      !documentFilter ||
      k.documentType.toLowerCase().includes(documentFilter.toLowerCase());
    return matchesSearch && matchesDocument;
  });

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const dataStr = JSON.stringify(filteredRequests, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `kyc-${activeTab}-${
        new Date().toISOString().split("T")[0]
      }.json`;
      link.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
    }, 1000);
  };

  const handleApprove = async (kyc, fromModal = false) => {
    setProcessingId(kyc.id);
    setProcessingAction("approve");

    try {
      const response = await AdminApi.approveKYC(kyc.id);

      if (response.success) {
        setKycRequests((prev) =>
          prev.map((k) => (k.id === kyc.id ? { ...k, status: "approved" } : k)),
        );
        setSuccessMessage(`KYC for ${kyc.name} has been approved!`);
        setShowSuccess(true);
        if (fromModal) setShowModal(false);
        setTimeout(() => setShowSuccess(false), 3000);
        fetchKYCRequests(); // Refresh the list
        fetchKYCStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Error approving KYC:", error);
      alert("Failed to approve KYC");
    } finally {
      setProcessingId(null);
      setProcessingAction("");
    }
  };

  const handleRejectClick = (kyc) => {
    setSelectedKyc(kyc);
    setShowRejectModal(true);
    setRejectReason("");
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    setProcessingId(selectedKyc.id);
    setProcessingAction("reject");

    try {
      const response = await AdminApi.rejectKYC(selectedKyc.id, rejectReason);

      if (response.success) {
        setKycRequests((prev) =>
          prev.map((k) =>
            k.id === selectedKyc.id
              ? { ...k, status: "rejected", rejectionReason: rejectReason }
              : k,
          ),
        );
        setShowRejectModal(false);
        setShowModal(false);
        setSuccessMessage(`KYC for ${selectedKyc.name} has been rejected.`);
        setShowSuccess(true);
        setSelectedKyc(null);
        setRejectReason("");
        setTimeout(() => setShowSuccess(false), 3000);
        fetchKYCRequests(); // Refresh the list
        fetchKYCStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Error rejecting KYC:", error);
      alert("Failed to reject KYC");
    } finally {
      setProcessingId(null);
      setProcessingAction("");
    }
  };

  if (loading && kycRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const styles = {
      approved: "bg-emerald-100 text-emerald-700",
      pending: "bg-amber-100 text-amber-700",
      rejected: "bg-red-100 text-red-700",
    };
    const icons = {
      approved: <CheckCircle className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      rejected: <XCircle className="w-3 h-3" />,
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${styles[status]}`}
      >
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div>
      <Header
        title="KYC Verification"
        subtitle="Review and verify user KYC documents"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="card p-3 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-500 mb-1">
                Total Requests
              </p>
              <p className="text-lg md:text-2xl font-bold text-slate-800">
                {stats.total.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
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
              <p className="text-xs md:text-sm text-slate-500 mb-1">Verified</p>
              <p className="text-lg md:text-2xl font-bold text-emerald-600">
                {stats.approved.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="card p-3 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-500 mb-1">Rejected</p>
              <p className="text-lg md:text-2xl font-bold text-red-600">
                {stats.rejected}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {["pending", "approved", "rejected", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium capitalize transition-colors whitespace-nowrap ${
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

        {/* Filters */}
        <div className="p-4 md:p-5 border-b border-slate-100 space-y-3 md:space-y-0 md:flex md:flex-wrap md:gap-4 md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="flex items-center gap-2 px-3 md:px-4 py-2.5 bg-slate-100 rounded-lg">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search KYC..."
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
            <select
              value={documentFilter}
              onChange={(e) => setDocumentFilter(e.target.value)}
              className="form-select text-sm"
            >
              <option value="">All Documents</option>
              <option value="aadhar">Aadhar Card</option>
              <option value="pan">PAN Card</option>
              <option value="voter">Voter ID</option>
              <option value="passport">Passport</option>
            </select>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn btn-secondary w-full md:w-auto flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export
              </>
            )}
          </button>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((kyc) => (
              <div key={kyc.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {kyc.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">
                        {kyc.name}
                      </p>
                      <p className="text-xs text-slate-500">{kyc.email}</p>
                    </div>
                  </div>
                  {getStatusBadge(kyc.status)}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{kyc.documentType}</span>
                  <span className="text-slate-500">{kyc.submitted}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedKyc(kyc);
                      setShowModal(true);
                    }}
                    className="flex-1 py-2 px-3 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  {kyc.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(kyc)}
                        disabled={processingId === kyc.id}
                        className="flex-1 py-2 px-3 bg-emerald-100 text-emerald-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-60"
                      >
                        {processingId === kyc.id &&
                        processingAction === "approve" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectClick(kyc)}
                        disabled={processingId === kyc.id}
                        className="flex-1 py-2 px-3 bg-red-100 text-red-600 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-60"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              No KYC requests found
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-4">
                  User
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-4">
                  Document
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-4">
                  Submitted
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
              {filteredRequests.length > 0 ? (
                filteredRequests.map((kyc) => (
                  <tr
                    key={kyc.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {kyc.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {kyc.name}
                          </p>
                          <p className="text-xs text-slate-500">{kyc.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-slate-800">
                          {kyc.documentType}
                        </p>
                        <p className="text-xs text-slate-500">
                          {kyc.documentNumber}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {kyc.submitted}
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(kyc.status)}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedKyc(kyc);
                            setShowModal(true);
                          }}
                          className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {kyc.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(kyc)}
                              disabled={processingId === kyc.id}
                              className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors disabled:opacity-60"
                              title="Approve"
                            >
                              {processingId === kyc.id &&
                              processingAction === "approve" ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleRejectClick(kyc)}
                              disabled={processingId === kyc.id}
                              className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors disabled:opacity-60"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No KYC requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <p className="text-xs md:text-sm text-slate-500">
            Showing {filteredRequests.length} of {pagination.total} requests
          </p>
          <div className="flex gap-1 md:gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 md:w-9 md:h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from(
              { length: Math.min(pagination.totalPages, 5) },
              (_, i) => i + 1,
            ).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                  currentPage === page
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30"
                    : "border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={currentPage === pagination.totalPages}
              className="w-8 h-8 md:w-9 md:h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KYC Detail Modal */}
      {showModal && selectedKyc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800">
                  KYC Verification Details
                </h3>
                <p className="text-xs md:text-sm text-slate-500">
                  Review document and verify
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedKyc(null);
                }}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 md:p-6">
              {/* User Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xl md:text-2xl font-bold shrink-0">
                  {selectedKyc.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base md:text-lg font-bold text-slate-800">
                    {selectedKyc.name}
                  </h4>
                  <p className="text-xs md:text-sm text-slate-500 truncate">
                    {selectedKyc.email} • {selectedKyc.phone}
                  </p>
                </div>
                {getStatusBadge(selectedKyc.status)}
              </div>

              {/* Document Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 md:p-4 bg-slate-50 rounded-xl">
                  <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Document Type</p>
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {selectedKyc.documentType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 md:p-4 bg-slate-50 rounded-xl">
                  <Shield className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Document Number</p>
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {selectedKyc.documentNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 md:p-4 bg-slate-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Date of Birth</p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedKyc.dob}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 md:p-4 bg-slate-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {selectedKyc.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Images */}
              <h5 className="text-sm font-semibold text-slate-800 mb-3">
                Document Images
              </h5>
              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
                {selectedKyc.frontImage ? (
                  <a
                    href={selectedKyc.frontImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-amber-400 transition-colors cursor-pointer"
                  >
                    <img
                      src={selectedKyc.frontImage}
                      alt="Front Side"
                      className="w-full h-full object-cover"
                    />
                  </a>
                ) : (
                  <div className="aspect-video bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                    <FileText className="w-6 h-6 md:w-8 md:h-8 text-slate-400 mb-1 md:mb-2" />
                    <span className="text-[10px] md:text-xs text-slate-500">
                      Front Side
                    </span>
                  </div>
                )}
                {selectedKyc.backImage ? (
                  <a
                    href={selectedKyc.backImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-amber-400 transition-colors cursor-pointer"
                  >
                    <img
                      src={selectedKyc.backImage}
                      alt="Back Side"
                      className="w-full h-full object-cover"
                    />
                  </a>
                ) : (
                  <div className="aspect-video bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                    <FileText className="w-6 h-6 md:w-8 md:h-8 text-slate-400 mb-1 md:mb-2" />
                    <span className="text-[10px] md:text-xs text-slate-500">
                      Back Side
                    </span>
                  </div>
                )}
                {selectedKyc.selfie ? (
                  <a
                    href={selectedKyc.selfie}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-amber-400 transition-colors cursor-pointer"
                  >
                    <img
                      src={selectedKyc.selfie}
                      alt="Selfie"
                      className="w-full h-full object-cover"
                    />
                  </a>
                ) : (
                  <div className="aspect-video bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                    <User className="w-6 h-6 md:w-8 md:h-8 text-slate-400 mb-1 md:mb-2" />
                    <span className="text-[10px] md:text-xs text-slate-500">
                      Selfie
                    </span>
                  </div>
                )}
              </div>

              {/* Rejection Reason */}
              {selectedKyc.status === "rejected" &&
                selectedKyc.rejectionReason && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold">Rejection Reason</span>
                    </div>
                    <p className="text-sm text-red-700">
                      {selectedKyc.rejectionReason}
                    </p>
                  </div>
                )}

              {/* Actions */}
              {selectedKyc.status === "pending" && (
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button
                    onClick={() => handleApprove(selectedKyc, true)}
                    disabled={processingId === selectedKyc.id}
                    className="btn btn-success flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {processingId === selectedKyc.id &&
                    processingAction === "approve" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Approve KYC
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleRejectClick(selectedKyc)}
                    disabled={processingId === selectedKyc.id}
                    className="btn btn-danger flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject KYC
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && selectedKyc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Reject KYC</h3>
                <p className="text-sm text-slate-500">
                  Provide a reason for rejection
                </p>
              </div>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mb-5">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Rejection Reason *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejecting this KYC..."
                className="form-input min-h-[100px] resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={
                  !rejectReason.trim() || processingId === selectedKyc.id
                }
                className="btn btn-danger flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {processingId === selectedKyc.id &&
                processingAction === "reject" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Confirm Reject
                  </>
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

export default KYC;
