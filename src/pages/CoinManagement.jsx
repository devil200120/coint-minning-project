import { useState } from "react";
import Header from "../components/Header";
import {
  Coins,
  Search,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  History,
  Filter,
  Download,
  CheckCircle,
  Loader2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";

const CoinManagement = () => {
  const [selectedUser, setSelectedUser] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [operation, setOperation] = useState("add");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  const users = [
    {
      id: 1,
      name: "Rajesh Vaishnav",
      email: "rajesh@gmail.com",
      balance: 125.5,
    },
    { id: 2, name: "Amit Kumar", email: "amit@gmail.com", balance: 450.75 },
    { id: 3, name: "Priya Singh", email: "priya@gmail.com", balance: 50.0 },
    { id: 4, name: "Rahul Sharma", email: "rahul@gmail.com", balance: 890.25 },
    { id: 5, name: "Sneha Patel", email: "sneha@gmail.com", balance: 200.0 },
  ];

  const transactions = [
    {
      id: 1,
      user: "Rajesh Vaishnav",
      type: "add",
      amount: 50,
      reason: "Bonus reward",
      admin: "Super Admin",
      date: "2024-01-25 14:30",
    },
    {
      id: 2,
      user: "Amit Kumar",
      type: "deduct",
      amount: 25,
      reason: "Penalty",
      admin: "Super Admin",
      date: "2024-01-25 13:15",
    },
    {
      id: 3,
      user: "Priya Singh",
      type: "add",
      amount: 100,
      reason: "Referral bonus",
      admin: "Admin",
      date: "2024-01-25 11:45",
    },
    {
      id: 4,
      user: "Rahul Sharma",
      type: "add",
      amount: 75,
      reason: "Mining completion",
      admin: "System",
      date: "2024-01-25 10:00",
    },
    {
      id: 5,
      user: "Sneha Patel",
      type: "deduct",
      amount: 10,
      reason: "Correction",
      admin: "Super Admin",
      date: "2024-01-24 16:20",
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "all") return true;
    return tx.type === filterType;
  });

  const selectedUserData = users.find((u) => u.id === selectedUser);

  const handleSubmit = () => {
    if (!selectedUser || !amount) {
      alert("Please select a user and enter amount");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage(
        `Successfully ${
          operation === "add" ? "added" : "deducted"
        } ${amount} coins ${operation === "add" ? "to" : "from"} ${
          selectedUserData?.name
        }`
      );
      setShowSuccess(true);
      setAmount("");
      setReason("");
      setSelectedUser("");
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      // Simulate download
      const dataStr = JSON.stringify(filteredTransactions, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "transactions.json";
      link.click();
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const totalPages = 3;

  return (
    <div className="space-y-4 md:space-y-6">
      <Header
        title="Coin Management"
        subtitle="Add or deduct coins from user profiles"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="card p-4 md:p-5 bg-gradient-to-br from-amber-500 to-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs md:text-sm opacity-80 mb-1 truncate">
                Total Coins
              </p>
              <p className="text-xl md:text-3xl font-bold">1.25M</p>
            </div>
            <Coins className="w-8 h-8 md:w-10 md:h-10 opacity-80 shrink-0" />
          </div>
        </div>
        <div className="card p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-slate-500 mb-1 truncate">
                Added Today
              </p>
              <p className="text-lg md:text-2xl font-bold text-emerald-600">
                +12,450
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="card p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-slate-500 mb-1 truncate">
                Deducted Today
              </p>
              <p className="text-lg md:text-2xl font-bold text-red-600">
                -1,250
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
            </div>
          </div>
        </div>
        <div className="card p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-slate-500 mb-1 truncate">
                Transactions
              </p>
              <p className="text-lg md:text-2xl font-bold text-slate-800">
                8,456
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <History className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Coin Operation Form */}
        <div className="card">
          <div className="p-4 md:p-5 border-b border-slate-100">
            <h2 className="text-base md:text-lg font-semibold text-slate-800">
              Update User Coins
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Add or deduct coins from any user
            </p>
          </div>
          <div className="p-4 md:p-5">
            {/* Operation Type */}
            <div className="mb-4 md:mb-5">
              <label className="text-sm font-medium text-slate-700 mb-2 md:mb-3 block">
                Operation Type
              </label>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <button
                  onClick={() => setOperation("add")}
                  className={`p-3 md:p-4 rounded-xl border-2 flex flex-col items-center gap-1 md:gap-2 transition-all ${
                    operation === "add"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Plus className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-sm font-semibold">Add Coins</span>
                </button>
                <button
                  onClick={() => setOperation("deduct")}
                  className={`p-3 md:p-4 rounded-xl border-2 flex flex-col items-center gap-1 md:gap-2 transition-all ${
                    operation === "deduct"
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Minus className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-sm font-semibold">Deduct Coins</span>
                </button>
              </div>
            </div>

            {/* User Search */}
            <div className="mb-4 md:mb-5">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Select User
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-9 md:pl-10 text-sm"
                />
              </div>
              <div className="mt-2 md:mt-3 max-h-36 md:max-h-40 overflow-y-auto rounded-lg border border-slate-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUser(user.id)}
                      className={`flex items-center justify-between p-2 md:p-3 cursor-pointer transition-colors ${
                        selectedUser === user.id
                          ? "bg-amber-50 border-l-4 border-amber-500"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-semibold shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-medium text-slate-800 truncate">
                            {user.name}
                          </p>
                          <p className="text-[10px] md:text-xs text-slate-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs md:text-sm font-semibold text-amber-600 shrink-0 ml-2">
                        {user.balance}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No users found
                  </div>
                )}
              </div>
              {selectedUserData && (
                <div className="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between">
                  <span className="text-xs text-amber-700">
                    Selected: {selectedUserData.name}
                  </span>
                  <button
                    onClick={() => setSelectedUser("")}
                    className="text-amber-600 hover:text-amber-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Amount */}
            <div className="mb-4 md:mb-5">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Amount
              </label>
              <div className="relative">
                <Coins className="w-4 h-4 absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="form-input pl-9 md:pl-10 text-sm"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="mb-4 md:mb-5">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Reason
              </label>
              <textarea
                placeholder="Enter reason for this operation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="form-input min-h-[70px] md:min-h-[80px] resize-none text-sm"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedUser || !amount}
              className={`btn w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                operation === "add" ? "btn-success" : "btn-danger"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {operation === "add" ? (
                    <Plus className="w-4 h-4" />
                  ) : (
                    <Minus className="w-4 h-4" />
                  )}
                  {operation === "add" ? "Add Coins" : "Deduct Coins"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="card lg:col-span-2">
          <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-slate-800">
                Transaction History
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                Recent coin operations by admin
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowFilterModal(true)}
                className="btn btn-secondary text-xs flex-1 sm:flex-none flex items-center justify-center gap-1.5"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filter</span>
                {filterType !== "all" && (
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="btn btn-secondary text-xs flex-1 sm:flex-none flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isExporting ? "Exporting..." : "Export"}</span>
              </button>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {tx.user.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">
                        {tx.user}
                      </p>
                      <p className="text-xs text-slate-500">{tx.date}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      tx.type === "add" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {tx.type === "add" ? "+" : "-"}
                    {tx.amount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                      tx.type === "add"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {tx.type === "add" ? (
                      <Plus className="w-3 h-3" />
                    ) : (
                      <Minus className="w-3 h-3" />
                    )}
                    {tx.type}
                  </span>
                  <span className="text-slate-500">{tx.reason}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-4">
                    User
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-4">
                    Type
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-4">
                    Amount
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-4">
                    Reason
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-4">
                    Admin
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-4">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {tx.user.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-800">
                          {tx.user}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          tx.type === "add"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tx.type === "add" ? (
                          <Plus className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`font-semibold ${
                          tx.type === "add"
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.type === "add" ? "+" : "-"}
                        {tx.amount} coins
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {tx.reason}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {tx.admin}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {tx.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <p className="text-xs md:text-sm text-slate-500">
              Showing 1 to 5 of 8,456 transactions
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="w-8 h-8 md:w-9 md:h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilterModal(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">
                Filter Transactions
              </h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">
                Transaction Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "all", label: "All" },
                  { value: "add", label: "Added" },
                  { value: "deduct", label: "Deducted" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilterType(option.value)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                      filterType === option.value
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setFilterType("all");
                }}
                className="btn btn-secondary flex-1"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="btn btn-primary flex-1"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
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

export default CoinManagement;
