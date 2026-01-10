import { useState } from "react";
import Header from "../components/Header";
import {
  Bell,
  Send,
  Clock,
  CheckCircle,
  Users,
  User,
  Trash2,
  Edit,
  Plus,
  X,
  AlertCircle,
  Loader2,
  Check,
  Search,
} from "lucide-react";

const Notifications = () => {
  const [showModal, setShowModal] = useState(false);
  const [notificationType, setNotificationType] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingNotification, setEditingNotification] = useState(null);

  const users = [
    { id: 1, name: "Rajesh Vaishnav", email: "rajesh@gmail.com" },
    { id: 2, name: "Amit Kumar", email: "amit@gmail.com" },
    { id: 3, name: "Priya Singh", email: "priya@gmail.com" },
    { id: 4, name: "Rahul Sharma", email: "rahul@gmail.com" },
  ];

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "24hr Mining Cycle Complete!",
      message:
        "Your mining cycle is complete. Start a new cycle to continue earning!",
      type: "auto",
      audience: "All Users",
      sent: "2024-01-25 00:00",
      deliveredTo: 8234,
      status: "sent",
    },
    {
      id: 2,
      title: "KYC Verification Required",
      message: "Please complete your KYC to unlock all features.",
      type: "auto",
      audience: "KYC Pending Users",
      sent: "2024-01-24 10:00",
      deliveredTo: 1190,
      status: "sent",
    },
    {
      id: 3,
      title: "Special Bonus Offer!",
      message:
        "Get 50% extra coins on your next referral. Offer valid till Jan 31.",
      type: "manual",
      audience: "All Users",
      sent: "2024-01-23 15:30",
      deliveredTo: 12845,
      status: "sent",
    },
    {
      id: 4,
      title: "Welcome to Mining App!",
      message: "Start your mining journey and earn coins every hour.",
      type: "auto",
      audience: "New Users",
      sent: "Automatic",
      deliveredTo: "Auto",
      status: "active",
    },
  ]);

  const [autoNotifications, setAutoNotifications] = useState([
    {
      id: 1,
      trigger: "24hr Mining Complete",
      enabled: true,
      message: "Your mining cycle is complete!",
    },
    {
      id: 2,
      trigger: "Inactive for 12 hours",
      enabled: true,
      message: "We miss you! Come back and mine.",
    },
    {
      id: 3,
      trigger: "KYC Pending",
      enabled: true,
      message: "Complete your KYC verification.",
    },
    {
      id: 4,
      trigger: "Referral Signup",
      enabled: true,
      message: "Someone signed up using your referral!",
    },
    {
      id: 5,
      trigger: "Payment Approved",
      enabled: true,
      message: "Your payment has been approved.",
    },
    {
      id: 6,
      trigger: "Payment Rejected",
      enabled: true,
      message: "Your payment was rejected. Please check.",
    },
  ]);

  const toggleAutoNotification = (id) => {
    setAutoNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
    );
  };

  const handleSendNotification = () => {
    if (!title.trim() || !message.trim()) {
      alert("Please enter title and message");
      return;
    }
    if (notificationType === "specific" && !selectedUser) {
      alert("Please select a user");
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      const newNotification = {
        id: Date.now(),
        title: title,
        message: message,
        type: "manual",
        audience:
          notificationType === "all"
            ? "All Users"
            : users.find((u) => u.id === selectedUser)?.name || "Specific User",
        sent: new Date().toLocaleString(),
        deliveredTo: notificationType === "all" ? 12845 : 1,
        status: "sent",
      };
      setNotifications((prev) => [newNotification, ...prev]);
      setIsSending(false);
      setShowModal(false);
      setTitle("");
      setMessage("");
      setSelectedUser("");
      setUserSearch("");
      setNotificationType("all");
      setSuccessMessage("Notification sent successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const handleDeleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setShowDeleteConfirm(null);
    setSuccessMessage("Notification deleted!");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleEditNotification = (notif) => {
    setEditingNotification(notif);
    setTitle(notif.title);
    setMessage(notif.message);
    setShowModal(true);
  };

  const handleUpdateNotification = () => {
    if (!title.trim() || !message.trim()) {
      alert("Please enter title and message");
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === editingNotification.id
            ? { ...n, title: title, message: message }
            : n
        )
      );
      setIsSending(false);
      setShowModal(false);
      setEditingNotification(null);
      setTitle("");
      setMessage("");
      setSuccessMessage("Notification updated!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNotification(null);
    setTitle("");
    setMessage("");
    setSelectedUser("");
    setUserSearch("");
    setNotificationType("all");
  };

  return (
    <div>
      <Header
        title="Notifications"
        subtitle="Send and manage push notifications"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Total Sent</p>
              <p className="text-2xl font-bold text-slate-800">45,678</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">
                Today's Notifications
              </p>
              <p className="text-2xl font-bold text-emerald-600">1,234</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Send className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Auto Notifications</p>
              <p className="text-2xl font-bold text-amber-600">6 Active</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Delivery Rate</p>
              <p className="text-2xl font-bold text-slate-800">98.5%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Auto Notifications Settings */}
        <div className="card">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">
              Auto Notifications
            </h2>
            <p className="text-sm text-slate-500">
              Automatic trigger-based notifications
            </p>
          </div>
          <div className="p-5 space-y-4">
            {autoNotifications.map((notif) => (
              <div
                key={notif.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {notif.trigger}
                  </p>
                  <p className="text-xs text-slate-500">{notif.message}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notif.enabled}
                    onChange={() => toggleAutoNotification(notif.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Notification History */}
        <div className="card lg:col-span-2">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Notification History
              </h2>
              <p className="text-sm text-slate-500">
                Recent sent notifications
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4" />
              Send New
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-800">
                        {notif.title}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          notif.type === "auto"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {notif.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {notif.audience}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notif.sent}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Delivered: {notif.deliveredTo}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditNotification(notif)}
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(notif.id)}
                      className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Send Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="p-5 md:p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800">
                  {editingNotification
                    ? "Edit Notification"
                    : "Send Notification"}
                </h3>
                <p className="text-xs md:text-sm text-slate-500">
                  {editingNotification
                    ? "Update notification details"
                    : "Create and send push notification"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 md:p-6">
              {/* Title */}
              <div className="mb-4 md:mb-5">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Notification Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter notification title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Message */}
              <div className="mb-4 md:mb-5">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Message *
                </label>
                <textarea
                  placeholder="Enter notification message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="form-input min-h-[100px] resize-none"
                />
              </div>

              {/* Audience - Only show for new notifications */}
              {!editingNotification && (
                <>
                  <div className="mb-4 md:mb-5">
                    <label className="text-sm font-medium text-slate-700 mb-3 block">
                      Target Audience
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`p-3 md:p-4 rounded-xl border-2 cursor-pointer flex items-center gap-2 md:gap-3 transition-all ${
                          notificationType === "all"
                            ? "border-amber-500 bg-amber-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="audience"
                          checked={notificationType === "all"}
                          onChange={() => setNotificationType("all")}
                          className="sr-only"
                        />
                        <Users className="w-5 h-5 text-slate-600" />
                        <span className="text-sm font-medium">All Users</span>
                      </label>
                      <label
                        className={`p-3 md:p-4 rounded-xl border-2 cursor-pointer flex items-center gap-2 md:gap-3 transition-all ${
                          notificationType === "specific"
                            ? "border-amber-500 bg-amber-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="audience"
                          checked={notificationType === "specific"}
                          onChange={() => setNotificationType("specific")}
                          className="sr-only"
                        />
                        <User className="w-5 h-5 text-slate-600" />
                        <span className="text-sm font-medium">
                          Specific User
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Specific User Search */}
                  {notificationType === "specific" && (
                    <div className="mb-4 md:mb-5">
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Select User *
                      </label>
                      <div className="relative mb-2">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search by name or email..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="form-input pl-9"
                        />
                      </div>
                      <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              onClick={() => setSelectedUser(user.id)}
                              className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                                selectedUser === user.id
                                  ? "bg-amber-50 border-l-4 border-amber-500"
                                  : "hover:bg-slate-50"
                              }`}
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {user.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-slate-500">
                            No users found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Send Button */}
              <button
                onClick={
                  editingNotification
                    ? handleUpdateNotification
                    : handleSendNotification
                }
                disabled={
                  isSending ||
                  !title.trim() ||
                  !message.trim() ||
                  (notificationType === "specific" &&
                    !selectedUser &&
                    !editingNotification)
                }
                className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editingNotification ? "Updating..." : "Sending..."}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {editingNotification
                      ? "Update Notification"
                      : "Send Notification"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 text-center mb-2">
              Delete Notification?
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              This action cannot be undone. The notification will be permanently
              removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteNotification(showDeleteConfirm)}
                className="btn btn-danger flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[70] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-3 bg-emerald-600 text-white px-4 md:px-5 py-3 rounded-xl shadow-lg">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Success!</p>
              <p className="text-xs text-emerald-100">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
