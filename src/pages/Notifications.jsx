import { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminApi from "../services/api";
import {
  Bell,
  Send,
  Clock,
  CheckCircle,
  Users,
  User,
  Trash2,
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
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    todayCount: 0,
    byType: {},
  });
  const [templates, setTemplates] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
    fetchStats();
    fetchTemplates();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await AdminApi.getNotificationStats();
      if (response.success && response.stats) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error("Error fetching notification stats:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await AdminApi.getNotificationTemplates();
      if (response.success && response.templates) {
        setTemplates(response.templates);
      }
    } catch (error) {
      console.error("Error fetching notification templates:", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch users for dropdown
      const usersResponse = await AdminApi.getUsers({ limit: 100 });
      if (usersResponse.success) {
        // API returns response.users directly
        const usersData =
          usersResponse.users || usersResponse.data?.users || [];
        setUsers(
          usersData.map((u) => ({
            id: u._id,
            name: u.name || "Unknown",
            email: u.email,
          })),
        );
      }

      // Fetch notifications
      const notifsResponse = await AdminApi.getNotifications({ limit: 50 });
      if (notifsResponse.success) {
        // API returns response.notifications directly
        const notifsData =
          notifsResponse.notifications ||
          notifsResponse.data?.notifications ||
          [];
        const formattedNotifs = notifsData.map((notif) => ({
          id: notif._id,
          title: notif.title,
          message: notif.message || notif.body,
          type: notif.type || "system",
          read: notif.read,
          userName: notif.user?.name || null,
          userEmail: notif.user?.email || null,
          sent: notif.createdAt
            ? new Date(notif.createdAt).toLocaleString()
            : "N/A",
        }));
        setNotifications(formattedNotifs);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!title || !message) {
      alert("Please fill in title and message");
      return;
    }

    setIsSending(true);
    try {
      let response;

      if (notificationType === "all") {
        // Use bulk notification for all users
        response = await AdminApi.sendBulkNotification({
          title,
          message,
          type: "system",
        });
      } else {
        // Send to specific user
        if (!selectedUser) {
          alert("Please select a user");
          setIsSending(false);
          return;
        }
        response = await AdminApi.sendNotification({
          userId: selectedUser,
          title,
          message,
          type: "system",
        });
      }

      if (response.success) {
        const count = response.count || 1;
        setSuccessMessage(
          `Notification sent to ${count} user${count > 1 ? "s" : ""} successfully!`,
        );
        setShowSuccess(true);
        setShowModal(false);
        setTitle("");
        setMessage("");
        setSelectedUser("");
        setNotificationType("all");
        setTimeout(() => setShowSuccess(false), 3000);
        fetchData();
        fetchStats();
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      alert(error.message || "Failed to send notification");
    } finally {
      setIsSending(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const [autoNotifications, setAutoNotifications] = useState([
    {
      id: 1,
      trigger: "24hr Mining Complete",
      enabled: true,
      message: "Your mining cycle is complete!",
      type: "mining",
    },
    {
      id: 2,
      trigger: "Inactive for 12 hours",
      enabled: true,
      message: "We miss you! Come back and mine.",
      type: "reminder",
    },
    {
      id: 3,
      trigger: "KYC Pending",
      enabled: true,
      message: "Complete your KYC verification.",
      type: "kyc",
    },
    {
      id: 4,
      trigger: "Referral Signup",
      enabled: true,
      message: "Someone signed up using your referral!",
      type: "referral",
    },
    {
      id: 5,
      trigger: "Payment Approved",
      enabled: true,
      message: "Your payment has been approved.",
      type: "system",
    },
    {
      id: 6,
      trigger: "Payment Rejected",
      enabled: true,
      message: "Your payment was rejected. Please check.",
      type: "system",
    },
  ]);

  const toggleAutoNotification = (id) => {
    setAutoNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)),
    );
  };

  const handleDeleteNotification = async (id) => {
    setIsDeleting(true);
    try {
      const response = await AdminApi.deleteNotification(id);
      if (response.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setShowDeleteConfirm(null);
        setSuccessMessage("Notification deleted!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert(error.message || "Failed to delete notification");
    } finally {
      setIsDeleting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
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
              <p className="text-2xl font-bold text-slate-800">
                {stats.total.toLocaleString()}
              </p>
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
              <p className="text-2xl font-bold text-emerald-600">
                {stats.todayCount.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Send className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Unread</p>
              <p className="text-2xl font-bold text-amber-600">
                {stats.unread.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Auto Triggers</p>
              <p className="text-2xl font-bold text-slate-800">
                {autoNotifications.filter((n) => n.enabled).length} Active
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Auto Notifications Settings */}
        <div className="card h-fit">
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
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-medium text-slate-800">
                    {notif.trigger}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {notif.message}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
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
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No notifications sent yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-semibold text-slate-800">
                          {notif.title}
                        </h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                            notif.type === "mining"
                              ? "bg-blue-100 text-blue-700"
                              : notif.type === "referral"
                                ? "bg-purple-100 text-purple-700"
                                : notif.type === "kyc"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : notif.type === "reminder"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {notif.type}
                        </span>
                        {!notif.read && (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 shrink-0">
                            Unread
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-3">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[150px]">
                            {notif.userName ||
                              notif.userEmail ||
                              "Unknown User"}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          {notif.sent}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
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
              ))
            )}
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
                  Send Notification
                </h3>
                <p className="text-xs md:text-sm text-slate-500">
                  Create and send push notification
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
              {/* Quick Templates */}
              {templates.length > 0 && (
                <div className="mb-4 md:mb-5">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Quick Templates
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setTitle(template.title);
                          setMessage(template.message);
                        }}
                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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

              {/* Audience */}
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
                    <span className="text-sm font-medium">Specific User</span>
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

              {/* Send Button */}
              <button
                onClick={handleSendNotification}
                disabled={
                  isSending ||
                  !title.trim() ||
                  !message.trim() ||
                  (notificationType === "specific" && !selectedUser)
                }
                className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Notification
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
                disabled={isDeleting}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteNotification(showDeleteConfirm)}
                disabled={isDeleting}
                className="btn btn-danger flex-1 flex items-center justify-center gap-2"
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
