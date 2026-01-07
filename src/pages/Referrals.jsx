import { useState } from "react";
import Header from "../components/Header";
import {
  Search,
  UserPlus,
  Users,
  CheckCircle,
  XCircle,
  Bell,
  Share2,
  TrendingUp,
  ChevronDown,
  Eye,
  Loader2,
  Check,
  Save,
} from "lucide-react";

const Referrals = () => {
  const [expandedUser, setExpandedUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [settings, setSettings] = useState({
    commissionRate: 10,
    maxLegs: 10,
    boostPercentage: 20,
  });

  const handleSettingsChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateSettings = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const referralData = [
    {
      id: 1,
      name: "Rajesh Vaishnav",
      email: "rajesh@gmail.com",
      totalReferrals: 15,
      activeReferrals: 10,
      inactiveReferrals: 5,
      commission: "10%",
      earnings: 125.5,
      team: [
        { name: "Amit Kumar", status: "active", joined: "2024-01-10" },
        { name: "Priya Singh", status: "inactive", joined: "2024-01-15" },
        { name: "Rahul Sharma", status: "active", joined: "2024-01-18" },
        { name: "Sneha Patel", status: "active", joined: "2024-01-20" },
        { name: "Vikram Singh", status: "inactive", joined: "2024-01-22" },
      ],
    },
    {
      id: 2,
      name: "Amit Kumar",
      email: "amit@gmail.com",
      totalReferrals: 8,
      activeReferrals: 6,
      inactiveReferrals: 2,
      commission: "10%",
      earnings: 85.25,
      team: [
        { name: "Neha Gupta", status: "active", joined: "2024-01-12" },
        { name: "Karan Mehta", status: "active", joined: "2024-01-14" },
      ],
    },
    {
      id: 3,
      name: "Priya Singh",
      email: "priya@gmail.com",
      totalReferrals: 3,
      activeReferrals: 1,
      inactiveReferrals: 2,
      commission: "10%",
      earnings: 15.0,
      team: [{ name: "Ravi Kumar", status: "inactive", joined: "2024-01-25" }],
    },
  ];

  const topLeaders = [
    { rank: 1, name: "Vikram Singh", referrals: 125, earnings: 1250.0 },
    { rank: 2, name: "Rahul Sharma", referrals: 98, earnings: 980.0 },
    { rank: 3, name: "Amit Kumar", referrals: 75, earnings: 750.0 },
    { rank: 4, name: "Priya Singh", referrals: 62, earnings: 620.0 },
    { rank: 5, name: "Sneha Patel", referrals: 55, earnings: 550.0 },
  ];

  return (
    <div>
      <Header
        title="Referral Management"
        subtitle="Manage referral teams and commissions"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="card p-3 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-500 mb-1">Total</p>
              <p className="text-lg md:text-2xl font-bold text-slate-800">
                4,521
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
            </div>
          </div>
        </div>
        <div className="card p-3 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-500 mb-1">Active</p>
              <p className="text-lg md:text-2xl font-bold text-emerald-600">
                3,215
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
              <p className="text-xs md:text-sm text-slate-500 mb-1">Inactive</p>
              <p className="text-lg md:text-2xl font-bold text-amber-600">
                1,306
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
            </div>
          </div>
        </div>
        <div className="card p-3 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-500 mb-1">Rate</p>
              <p className="text-lg md:text-2xl font-bold text-slate-800">
                10%
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Top Leaders */}
        <div className="card">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">
              Top Referral Leaders
            </h2>
            <p className="text-sm text-slate-500">
              By total referrals (10% commission)
            </p>
          </div>
          <div className="p-5">
            {topLeaders.map((leader, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    leader.rank === 1
                      ? "bg-gradient-to-br from-amber-400 to-yellow-500"
                      : leader.rank === 2
                      ? "bg-gradient-to-br from-slate-300 to-slate-400"
                      : leader.rank === 3
                      ? "bg-gradient-to-br from-orange-400 to-amber-600"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {leader.rank}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{leader.name}</p>
                  <p className="text-xs text-slate-500">
                    {leader.referrals} referrals
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald-600">
                    ₹{leader.earnings}
                  </p>
                  <p className="text-xs text-slate-500">earnings</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referral Teams */}
        <div className="card lg:col-span-2">
          <div className="p-4 md:p-5 border-b border-slate-100 space-y-3 md:space-y-0 md:flex md:justify-between md:items-center">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-slate-800">
                Referral Teams
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                View team members with 10 leg commission structure
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-100 rounded-lg">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="border-none bg-transparent text-sm w-full md:w-48 focus:outline-none"
              />
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {referralData.map((user) => (
              <div key={user.id} className="p-4 md:p-5">
                <div
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                  onClick={() =>
                    setExpandedUser(expandedUser === user.id ? null : user.id)
                  }
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">
                        {user.name}
                      </p>
                      <p className="text-xs md:text-sm text-slate-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:gap-4 lg:gap-6">
                    <div className="flex gap-4 md:gap-6">
                      <div className="text-center">
                        <p className="text-base md:text-lg font-bold text-slate-800">
                          {user.totalReferrals}
                        </p>
                        <p className="text-[10px] md:text-xs text-slate-500">
                          Total
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-base md:text-lg font-bold text-emerald-600">
                          {user.activeReferrals}
                        </p>
                        <p className="text-[10px] md:text-xs text-slate-500">
                          Active
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-base md:text-lg font-bold text-amber-600">
                          {user.inactiveReferrals}
                        </p>
                        <p className="text-[10px] md:text-xs text-slate-500">
                          Inactive
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn btn-secondary text-xs hidden sm:flex">
                        <Bell className="w-4 h-4" />
                        <span className="hidden lg:inline">Ping</span>
                      </button>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          expandedUser === user.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Team View */}
                {expandedUser === user.id && (
                  <div className="mt-4 ml-16 p-4 bg-slate-50 rounded-xl">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">
                      Team Members
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {user.team.map((member, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-white rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {member.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                Joined: {member.joined}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`status-badge ${
                              member.status === "active"
                                ? "status-active"
                                : "status-inactive"
                            }`}
                          >
                            {member.status === "active" ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {member.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commission Settings */}
      <div className="card mt-4 md:mt-6">
        <div className="p-4 md:p-5 border-b border-slate-100">
          <h2 className="text-base md:text-lg font-semibold text-slate-800">
            Commission Settings
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            Configure referral commission structure
          </p>
        </div>
        <div className="p-4 md:p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Commission Rate (%)
              </label>
              <input
                type="number"
                value={settings.commissionRate}
                onChange={(e) => handleSettingsChange('commissionRate', Number(e.target.value))}
                className="form-input"
              />
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Max Referral Legs
              </label>
              <input
                type="number"
                value={settings.maxLegs}
                onChange={(e) => handleSettingsChange('maxLegs', Number(e.target.value))}
                className="form-input"
              />
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Boost Percentage
              </label>
              <input
                type="number"
                value={settings.boostPercentage}
                onChange={(e) => handleSettingsChange('boostPercentage', Number(e.target.value))}
                className="form-input"
              />
            </div>
            <div className="p-4 bg-slate-50 rounded-xl flex items-end">
              <button
                onClick={handleUpdateSettings}
                disabled={isSaving}
                className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-3 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Settings Updated!</p>
              <p className="text-sm text-emerald-100">Commission settings saved successfully.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Referrals;
