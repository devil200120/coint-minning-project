import { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminApi from "../services/api";
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
  Coins,
  GitBranch,
  ArrowRight,
  Info,
} from "lucide-react";

const Referrals = () => {
  const [expandedUser, setExpandedUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    directReferrals: 0,
    indirectReferrals: 0,
    totalCoinsDistributed: 0,
  });
  const [topLeaders, setTopLeaders] = useState([]);

  // Referral commission settings
  const [settings, setSettings] = useState({
    directBonus: 50,
    indirectBonus: 20,
    signupBonus: 100,
  });

  useEffect(() => {
    fetchReferrals();
    fetchStats();
    fetchSettings();
  }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const response = await AdminApi.getReferrals({ limit: 100 });

      if (response.success) {
        const referralsData = response.referrals || [];

        // Group referrals by referrer to create a user-centric view
        const userReferralMap = {};

        referralsData.forEach((ref) => {
          const referrerId = ref.referrer?._id;
          if (!referrerId) return;

          if (!userReferralMap[referrerId]) {
            userReferralMap[referrerId] = {
              id: referrerId,
              name: ref.referrer?.name || "Unknown",
              email: ref.referrer?.email || "N/A",
              referralCode: ref.referrer?.referralCode || "",
              directReferrals: 0,
              indirectReferrals: 0,
              totalReferrals: 0,
              coinsEarned: 0,
              team: [],
            };
          }

          const type = ref.type || "direct";
          if (type === "direct") {
            userReferralMap[referrerId].directReferrals++;
          } else {
            userReferralMap[referrerId].indirectReferrals++;
          }
          userReferralMap[referrerId].totalReferrals++;
          userReferralMap[referrerId].coinsEarned += ref.coinsEarned || 0;

          userReferralMap[referrerId].team.push({
            name: ref.referred?.name || "Unknown",
            status: ref.referred?.status || ref.status || "active",
            joined: ref.createdAt,
            type: type,
            coinsGenerated: ref.coinsEarned || 0,
          });
        });

        const formattedData = Object.values(userReferralMap).sort(
          (a, b) => b.totalReferrals - a.totalReferrals,
        );

        setReferralData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await AdminApi.getReferralStats();
      if (response.success && response.stats) {
        setStats({
          totalReferrals: response.stats.total || 0,
          directReferrals: response.stats.direct || 0,
          indirectReferrals: response.stats.indirect || 0,
          totalCoinsDistributed: response.stats.totalBonusDistributed || 0,
        });

        // Set top leaders from stats
        if (
          response.stats.topReferrers &&
          response.stats.topReferrers.length > 0
        ) {
          setTopLeaders(
            response.stats.topReferrers.map((leader, idx) => ({
              rank: idx + 1,
              name: leader.name || "Unknown",
              directRefs: leader.count || 0,
              totalRefs: leader.count || 0,
              coinsEarned: leader.totalBonus || 0,
            })),
          );
        }
      }
    } catch (error) {
      console.error("Error fetching referral stats:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await AdminApi.getReferralSettings();
      if (response.success && response.settings) {
        setSettings({
          directBonus: response.settings.directReferralBonus || 50,
          indirectBonus: response.settings.indirectReferralBonus || 20,
          signupBonus: response.settings.signupBonus || 100,
        });
      }
    } catch (error) {
      console.error("Error fetching referral settings:", error);
    }
  };

  const handleSettingsChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateSettings = async () => {
    setIsSaving(true);
    try {
      const response = await AdminApi.updateReferralSettings({
        directReferralBonus: settings.directBonus,
        indirectReferralBonus: settings.indirectBonus,
        signupBonus: settings.signupBonus,
      });
      if (response.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Format coins number for display
  const formatCoins = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString();
  };

  // Default top leaders if none from API
  const displayLeaders =
    topLeaders.length > 0
      ? topLeaders
      : [
          {
            rank: 1,
            name: "No data",
            directRefs: 0,
            totalRefs: 0,
            coinsEarned: 0,
          },
        ];

  const filteredReferrals = referralData.filter(
    (user) =>
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
              <p className="text-xs md:text-sm text-slate-500 mb-1">
                Total Referrals
              </p>
              <p className="text-lg md:text-2xl font-bold text-slate-800">
                {stats.totalReferrals.toLocaleString()}
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
              <p className="text-xs md:text-sm text-slate-500 mb-1">
                Direct (L1)
              </p>
              <p className="text-lg md:text-2xl font-bold text-emerald-600">
                {stats.directReferrals.toLocaleString()}
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
              <p className="text-xs md:text-sm text-slate-500 mb-1">
                Indirect (L2-L5)
              </p>
              <p className="text-lg md:text-2xl font-bold text-amber-600">
                {stats.indirectReferrals.toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <GitBranch className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
            </div>
          </div>
        </div>
        <div className="card p-3 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-500 mb-1">
                Coins Given
              </p>
              <p className="text-lg md:text-2xl font-bold text-slate-800">
                {formatCoins(stats.totalCoinsDistributed)}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* How It Works - Referral Explanation */}
      <div className="card mb-4 md:mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
        <div className="p-4 md:p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 mb-2">
                Referral Reward System
              </h3>
              <p className="text-sm text-slate-600 mb-3">
                Users earn coins when their referrals (or sub-referrals) bring
                new users. Direct referrals earn more, indirect earn less but
                still rewarded.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Direct: {settings.directBonus} coins
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Indirect: {settings.indirectBonus} coins
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Signup Bonus: {settings.signupBonus} coins
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Example */}
      <div className="card mb-4 md:mb-6">
        <div className="p-4 md:p-5 border-b border-slate-100">
          <h2 className="text-base md:text-lg font-semibold text-slate-800">
            How Referral Rewards Work
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            Visual example of the referral chain
          </p>
        </div>
        <div className="p-4 md:p-5">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            {/* User A */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                A
              </div>
              <p className="font-semibold text-slate-800">User A</p>
              <p className="text-xs text-slate-500">Original Referrer</p>
            </div>

            <div className="flex flex-col items-center">
              <ArrowRight className="w-6 h-6 text-emerald-500 rotate-90 md:rotate-0" />
              <span className="text-xs font-medium text-emerald-600 mt-1">
                refers
              </span>
            </div>

            {/* User B */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                B
              </div>
              <p className="font-semibold text-slate-800">User B</p>
              <div className="mt-1 space-y-1">
                <span className="block text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                  A gets {settings.directBonus} coins (direct)
                </span>
                <span className="block text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                  B gets {settings.signupBonus} bonus
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <ArrowRight className="w-6 h-6 text-blue-500 rotate-90 md:rotate-0" />
              <span className="text-xs font-medium text-blue-600 mt-1">
                refers
              </span>
            </div>

            {/* User C */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                C
              </div>
              <p className="font-semibold text-slate-800">User C</p>
              <div className="mt-1 space-y-1">
                <span className="block text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                  B gets {settings.directBonus} coins (direct)
                </span>
                <span className="block text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                  A gets {settings.indirectBonus} coins (indirect)
                </span>
                <span className="block text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                  C gets {settings.signupBonus} bonus
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <ArrowRight className="w-6 h-6 text-purple-500 rotate-90 md:rotate-0" />
              <span className="text-xs font-medium text-purple-600 mt-1">
                refers
              </span>
            </div>

            {/* User D */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                D
              </div>
              <p className="font-semibold text-slate-800">User D</p>
              <div className="mt-1 space-y-1">
                <span className="block text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                  C gets {settings.directBonus} coins (direct)
                </span>
                <span className="block text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                  A & B get {settings.indirectBonus} each (indirect)
                </span>
              </div>
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
              By total coins earned from referrals
            </p>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              </div>
            ) : displayLeaders.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                No referral data yet
              </p>
            ) : (
              displayLeaders.map((leader, idx) => (
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
                    <p className="font-semibold text-slate-800">
                      {leader.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {leader.directRefs} direct • {leader.totalRefs} total
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-amber-600 flex items-center gap-1">
                      <Coins className="w-4 h-4" />
                      {leader.coinsEarned}
                    </p>
                    <p className="text-xs text-slate-500">coins earned</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Referral Teams */}
        <div className="card lg:col-span-2">
          <div className="p-4 md:p-5 border-b border-slate-100 space-y-3 md:space-y-0 md:flex md:justify-between md:items-center">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-slate-800">
                Referral Network
              </h2>
              <p className="text-xs md:text-sm text-slate-500">
                View multi-level referral chains and coin earnings
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-100 rounded-lg">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none bg-transparent text-sm w-full md:w-48 focus:outline-none"
              />
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : filteredReferrals.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No referral data found</p>
              </div>
            ) : (
              filteredReferrals.map((user) => (
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
                        {user.referralCode && (
                          <p className="text-xs text-blue-500">
                            Code: {user.referralCode}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:gap-4 lg:gap-6">
                      <div className="flex gap-4 md:gap-6">
                        <div className="text-center">
                          <p className="text-base md:text-lg font-bold text-emerald-600">
                            {user.directReferrals}
                          </p>
                          <p className="text-[10px] md:text-xs text-slate-500">
                            Direct
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-base md:text-lg font-bold text-blue-600">
                            {user.indirectReferrals}
                          </p>
                          <p className="text-[10px] md:text-xs text-slate-500">
                            Indirect
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-base md:text-lg font-bold text-amber-600 flex items-center gap-1">
                            <Coins className="w-4 h-4" />
                            {user.coinsEarned}
                          </p>
                          <p className="text-[10px] md:text-xs text-slate-500">
                            Earned
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
                    <div className="mt-4 ml-0 md:ml-16 p-4 bg-slate-50 rounded-xl">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">
                        Referral Chain ({user.team.length} members)
                      </h4>
                      {user.team.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">
                          No team members yet
                        </p>
                      ) : (
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
                                    {member.joined
                                      ? new Date(
                                          member.joined,
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    member.type === "direct"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {member.type === "direct"
                                    ? "Direct"
                                    : "Indirect"}
                                </span>
                                <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                                  <Coins className="w-3 h-3" />+
                                  {member.coinsGenerated}
                                </span>
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
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Commission Settings */}
      <div className="card mt-4 md:mt-6">
        <div className="p-4 md:p-5 border-b border-slate-100">
          <h2 className="text-base md:text-lg font-semibold text-slate-800">
            Referral Commission Settings
          </h2>
          <p className="text-xs md:text-sm text-slate-500">
            Configure coins for direct and indirect referrals
          </p>
        </div>
        <div className="p-4 md:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <label className="text-sm font-medium text-emerald-700 mb-2 block flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                Direct Referral Bonus
              </label>
              <p className="text-xs text-emerald-600 mb-2">
                When you directly refer someone
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.directBonus}
                  onChange={(e) =>
                    handleSettingsChange("directBonus", Number(e.target.value))
                  }
                  className="form-input"
                />
                <span className="text-sm text-emerald-600">coins</span>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <label className="text-sm font-medium text-blue-700 mb-2 block flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Indirect Referral Bonus
              </label>
              <p className="text-xs text-blue-600 mb-2">
                When your sub-users refer someone
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.indirectBonus}
                  onChange={(e) =>
                    handleSettingsChange(
                      "indirectBonus",
                      Number(e.target.value),
                    )
                  }
                  className="form-input"
                />
                <span className="text-sm text-blue-600">coins</span>
              </div>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <label className="text-sm font-medium text-amber-700 mb-2 block flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Signup Bonus
              </label>
              <p className="text-xs text-amber-600 mb-2">
                New user gets when they join
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.signupBonus}
                  onChange={(e) =>
                    handleSettingsChange("signupBonus", Number(e.target.value))
                  }
                  className="form-input"
                />
                <span className="text-sm text-amber-600">coins</span>
              </div>
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
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-600">
                  <li>
                    User A refers User B → A gets{" "}
                    <strong>{settings.directBonus} coins</strong> (direct)
                  </li>
                  <li>
                    User B refers User C → B gets {settings.directBonus} coins,
                    A gets <strong>{settings.indirectBonus} coins</strong>{" "}
                    (indirect)
                  </li>
                  <li>
                    User C refers User D → C gets {settings.directBonus} coins,
                    A & B both get{" "}
                    <strong>{settings.indirectBonus} coins</strong> each
                    (indirect)
                  </li>
                  <li>
                    New users get <strong>{settings.signupBonus} coins</strong>{" "}
                    signup bonus
                  </li>
                </ul>
              </div>
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
              <p className="text-sm text-emerald-100">
                Commission settings saved successfully.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Referrals;
