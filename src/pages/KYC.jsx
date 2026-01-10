import { useState } from "react";
import Header from "../components/Header";
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

  const [kycRequests, setKycRequests] = useState([
    {
      id: 1,
      name: "Rajesh Vaishnav",
      email: "rajesh@gmail.com",
      phone: "+91 98765 43210",
      status: "pending",
      submitted: "2024-01-25",
      documentType: "Aadhar Card",
      documentNumber: "XXXX-XXXX-1234",
      address: "Mumbai, Maharashtra",
      dob: "1990-05-15",
      frontImage: "aadhar_front.jpg",
      backImage: "aadhar_back.jpg",
      selfie: "selfie.jpg",
    },
    {
      id: 2,
      name: "Amit Kumar",
      email: "amit@gmail.com",
      phone: "+91 87654 32109",
      status: "pending",
      submitted: "2024-01-24",
      documentType: "PAN Card",
      documentNumber: "ABCDE1234F",
      address: "Delhi, India",
      dob: "1988-08-22",
      frontImage: "pan_front.jpg",
      backImage: null,
      selfie: "selfie.jpg",
    },
    {
      id: 3,
      name: "Priya Singh",
      email: "priya@gmail.com",
      phone: "+91 76543 21098",
      status: "verified",
      submitted: "2024-01-20",
      documentType: "Aadhar Card",
      documentNumber: "XXXX-XXXX-5678",
      address: "Bangalore, Karnataka",
      dob: "1995-03-10",
    },
    {
      id: 4,
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "+91 65432 10987",
      status: "rejected",
      submitted: "2024-01-18",
      documentType: "Voter ID",
      documentNumber: "ABC1234567",
      address: "Chennai, Tamil Nadu",
      dob: "1992-11-28",
      rejectionReason: "Document image not clear",
    },
    {
      id: 5,
      name: "Sneha Patel",
      email: "sneha@gmail.com",
      phone: "+91 54321 09876",
      status: "pending",
      submitted: "2024-01-26",
      documentType: "Passport",
      documentNumber: "J12345678",
      address: "Ahmedabad, Gujarat",
      dob: "1993-07-20",
    },
  ]);

  // Filter by tab, search, and document type
  const filteredRequests = kycRequests.filter((k) => {
    const matchesTab = activeTab === "all" || k.status === activeTab;
    const matchesSearch =
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.documentNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDocument =
      !documentFilter ||
      k.documentType.toLowerCase().includes(documentFilter.toLowerCase());
    return matchesTab && matchesSearch && matchesDocument;
  });

  const pendingCount = kycRequests.filter((k) => k.status === "pending").length;

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

  const handleApprove = (kyc, fromModal = false) => {
    setProcessingId(kyc.id);
    setProcessingAction("approve");
    setTimeout(() => {
      setKycRequests((prev) =>
        prev.map((k) => (k.id === kyc.id ? { ...k, status: "verified" } : k))
      );
      setProcessingId(null);
      setProcessingAction("");
      setSuccessMessage(`KYC for ${kyc.name} has been approved!`);
      setShowSuccess(true);
      if (fromModal) {
        setShowModal(false);
        setSelectedKyc(null);
      }
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const handleRejectClick = (kyc) => {
    setSelectedKyc(kyc);
    setShowRejectModal(true);
    setRejectReason("");
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    setProcessingId(selectedKyc.id);
    setProcessingAction("reject");
    setTimeout(() => {
      setKycRequests((prev) =>
        prev.map((k) =>
          k.id === selectedKyc.id
            ? { ...k, status: "rejected", rejectionReason: rejectReason }
            : k
        )
      );
      setProcessingId(null);
      setProcessingAction("");
      setShowRejectModal(false);
      setShowModal(false);
      setSuccessMessage(`KYC for ${selectedKyc.name} has been rejected.`);
      setShowSuccess(true);
      setSelectedKyc(null);
      setRejectReason("");
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const getStatusBadge = (status) => {
    const styles = {
      verified: "bg-emerald-100 text-emerald-700",
      pending: "bg-amber-100 text-amber-700",
      rejected: "bg-red-100 text-red-700",
    };
    const icons = {
      verified: <CheckCircle className="w-3 h-3" />,
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
                2,456
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
              <p className="text-xl md:text-3xl font-bold">12</p>
            </div>
            <Clock className="w-8 h-8 md:w-10 md:h-10 opacity-80" />
          </div>
        </div>
        <div className="card p-3 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-500 mb-1">Verified</p>
              <p className="text-lg md:text-2xl font-bold text-emerald-600">
                2,389
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
              <p className="text-lg md:text-2xl font-bold text-red-600">55</p>
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
          {["pending", "verified", "rejected", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "text-amber-600 border-b-2 border-amber-500"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}{" "}
              {tab === "pending" && pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {pendingCount}
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
            Showing {filteredRequests.length} of {kycRequests.length} requests
          </p>
          <div className="flex gap-1 md:gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 md:w-9 md:h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3].map((page) => (
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
              onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
              disabled={currentPage === 3}
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
                <div className="aspect-video bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50 transition-colors cursor-pointer">
                  <FileText className="w-6 h-6 md:w-8 md:h-8 text-slate-400 mb-1 md:mb-2" />
                  <span className="text-[10px] md:text-xs text-slate-500">
                    Front Side
                  </span>
                </div>
                <div className="aspect-video bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50 transition-colors cursor-pointer">
                  <FileText className="w-6 h-6 md:w-8 md:h-8 text-slate-400 mb-1 md:mb-2" />
                  <span className="text-[10px] md:text-xs text-slate-500">
                    Back Side
                  </span>
                </div>
                <div className="aspect-video bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50 transition-colors cursor-pointer">
                  <User className="w-6 h-6 md:w-8 md:h-8 text-slate-400 mb-1 md:mb-2" />
                  <span className="text-[10px] md:text-xs text-slate-500">
                    Selfie
                  </span>
                </div>
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
