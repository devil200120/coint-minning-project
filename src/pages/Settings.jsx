import { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminApi from "../services/api";
import {
  Settings as SettingsIcon,
  Save,
  Coins,
  Clock,
  Users,
  Shield,
  Bell,
  Key,
  Database,
  RefreshCw,
  Loader2,
  Check,
  AlertCircle,
  Wallet,
  ArrowLeftRight,
  CreditCard,
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    appName: "Mining App",
    supportEmail: "support@miningapp.com",
    appVersion: "1.0.0",
    maintenanceMode: false,
    maintenanceMessage: "",
  });

  // Mining Settings State
  const [miningSettings, setMiningSettings] = useState({
    miningCycleDuration: 24,
    miningRate: 0.25,
    referralBoostPercent: 20,
    maxCoinsPerCycle: 200,
    boostCost: 50,
  });

  // Referral Settings State
  const [referralSettings, setReferralSettings] = useState({
    directReferralBonus: 50,
    indirectReferralBonus: 20,
    signupBonus: 100,
  });

  // Withdrawal Settings State
  const [withdrawalSettings, setWithdrawalSettings] = useState({
    minWithdrawal: 100,
    coinValue: 0.01,
    withdrawalCooldown: 24,
  });

  // Transfer Settings State
  const [transferSettings, setTransferSettings] = useState({
    minTransfer: 10,
    maxTransfer: 10000,
    transferFeePercent: 0,
  });

  // KYC/Ownership Settings State
  const [ownershipSettings, setOwnershipSettings] = useState({
    ownershipDaysRequired: 30,
    miningSessionsRequired: 20,
  });

  // Daily Checkin Settings State
  const [checkinSettings, setCheckinSettings] = useState({
    dailyCheckinBonuses: [5, 10, 15, 20, 30, 40, 50],
  });

  // Payment Settings State
  const [paymentSettings, setPaymentSettings] = useState({
    paymentUpiId: "",
    paymentUpiQrCode: "",
    paymentBankName: "",
    paymentAccountNumber: "",
    paymentIfscCode: "",
    paymentAccountHolderName: "",
    coinPricePerDollar: 10,
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState([
    {
      name: "24hr Mining Complete",
      description: "Notify when mining cycle completes",
      enabled: true,
    },
    {
      name: "Inactive User Reminder",
      description: "Remind inactive users to mine",
      enabled: true,
    },
    {
      name: "KYC Reminder",
      description: "Remind users to complete KYC",
      enabled: true,
    },
    {
      name: "Payment Status Update",
      description: "Notify on payment approval/rejection",
      enabled: true,
    },
    {
      name: "Referral Signup",
      description: "Notify when someone uses referral",
      enabled: true,
    },
    {
      name: "Ownership Milestone",
      description: "Notify on ownership progress",
      enabled: false,
    },
  ]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminApi.getSettings();

      if (response.success) {
        const settings = response.settings || {};

        // Map flat settings to grouped state
        setGeneralSettings({
          appName: settings.appName || "Mining App",
          supportEmail: settings.supportEmail || "support@miningapp.com",
          appVersion: settings.appVersion || "1.0.0",
          maintenanceMode: settings.maintenanceMode || false,
          maintenanceMessage: settings.maintenanceMessage || "",
        });

        setMiningSettings({
          miningCycleDuration: settings.miningCycleDuration || 24,
          miningRate: settings.miningRate || 0.25,
          referralBoostPercent: settings.referralBoostPercent || 20,
          maxCoinsPerCycle: settings.maxCoinsPerCycle || 200,
          boostCost: settings.boostCost || 50,
        });

        setReferralSettings({
          directReferralBonus: settings.directReferralBonus || 50,
          indirectReferralBonus: settings.indirectReferralBonus || 20,
          signupBonus: settings.signupBonus || 100,
        });

        setWithdrawalSettings({
          minWithdrawal: settings.minWithdrawal || 100,
          coinValue: settings.coinValue || 0.01,
          withdrawalCooldown: settings.withdrawalCooldown || 24,
        });

        setTransferSettings({
          minTransfer: settings.minTransfer || 10,
          maxTransfer: settings.maxTransfer || 10000,
          transferFeePercent: settings.transferFeePercent || 0,
        });

        setOwnershipSettings({
          ownershipDaysRequired: settings.ownershipDaysRequired || 30,
          miningSessionsRequired: settings.miningSessionsRequired || 20,
        });

        setCheckinSettings({
          dailyCheckinBonuses: settings.dailyCheckinBonuses || [
            5, 10, 15, 20, 30, 40, 50,
          ],
        });

        setPaymentSettings({
          paymentUpiId: settings.paymentUpiId || "",
          paymentUpiQrCode: settings.paymentUpiQrCode || "",
          paymentBankName: settings.paymentBankName || "",
          paymentAccountNumber: settings.paymentAccountNumber || "",
          paymentIfscCode: settings.paymentIfscCode || "",
          paymentAccountHolderName: settings.paymentAccountHolderName || "",
          coinPricePerDollar: settings.coinPricePerDollar || 10,
        });
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Combine all settings into flat structure for bulk update
      const allSettings = {
        // General
        appName: generalSettings.appName,
        supportEmail: generalSettings.supportEmail,
        appVersion: generalSettings.appVersion,
        maintenanceMode: generalSettings.maintenanceMode,
        maintenanceMessage: generalSettings.maintenanceMessage,
        // Mining
        miningCycleDuration: miningSettings.miningCycleDuration,
        miningRate: miningSettings.miningRate,
        referralBoostPercent: miningSettings.referralBoostPercent,
        maxCoinsPerCycle: miningSettings.maxCoinsPerCycle,
        boostCost: miningSettings.boostCost,
        // Referral
        directReferralBonus: referralSettings.directReferralBonus,
        indirectReferralBonus: referralSettings.indirectReferralBonus,
        signupBonus: referralSettings.signupBonus,
        // Withdrawal
        minWithdrawal: withdrawalSettings.minWithdrawal,
        coinValue: withdrawalSettings.coinValue,
        withdrawalCooldown: withdrawalSettings.withdrawalCooldown,
        // Transfer
        minTransfer: transferSettings.minTransfer,
        maxTransfer: transferSettings.maxTransfer,
        transferFeePercent: transferSettings.transferFeePercent,
        // KYC/Ownership
        ownershipDaysRequired: ownershipSettings.ownershipDaysRequired,
        miningSessionsRequired: ownershipSettings.miningSessionsRequired,
        // Checkin
        dailyCheckinBonuses: checkinSettings.dailyCheckinBonuses,
        // Payment
        paymentUpiId: paymentSettings.paymentUpiId,
        paymentUpiQrCode: paymentSettings.paymentUpiQrCode,
        paymentBankName: paymentSettings.paymentBankName,
        paymentAccountNumber: paymentSettings.paymentAccountNumber,
        paymentIfscCode: paymentSettings.paymentIfscCode,
        paymentAccountHolderName: paymentSettings.paymentAccountHolderName,
        coinPricePerDollar: paymentSettings.coinPricePerDollar,
      };

      const response = await AdminApi.updateSettings({ settings: allSettings });

      if (response.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Failed to save settings");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleNotification = (idx) => {
    setNotificationSettings((prev) =>
      prev.map((notif, i) =>
        i === idx ? { ...notif, enabled: !notif.enabled } : notif,
      ),
    );
  };

  const handleCheckinBonusChange = (index, value) => {
    setCheckinSettings((prev) => {
      const newBonuses = [...prev.dailyCheckinBonuses];
      newBonuses[index] = Number(value);
      return { ...prev, dailyCheckinBonuses: newBonuses };
    });
  };

  const tabs = [
    { id: "general", name: "General", icon: SettingsIcon },
    { id: "mining", name: "Mining", icon: Coins },
    { id: "referral", name: "Referral", icon: Users },
    { id: "withdrawal", name: "Withdrawal", icon: Wallet },
    { id: "transfer", name: "Transfer", icon: ArrowLeftRight },
    { id: "ownership", name: "Ownership", icon: Shield },
    { id: "checkin", name: "Daily Check-in", icon: Clock },
    { id: "payment", name: "Payment", icon: CreditCard },
    { id: "notifications", name: "Notifications", icon: Bell },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Header
          title="Settings"
          subtitle="Configure app settings and parameters"
        />
        <button
          onClick={fetchSettings}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Sidebar Tabs */}
        <div className="card p-2 md:p-3">
          <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl text-left transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Content */}
        <div className="card lg:col-span-3">
          {/* General Settings */}
          {activeTab === "general" && (
            <>
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">
                  General Settings
                </h2>
                <p className="text-sm text-slate-500">
                  Basic app configuration
                </p>
              </div>
              <div className="p-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      App Name
                    </label>
                    <input
                      type="text"
                      value={generalSettings.appName}
                      onChange={(e) =>
                        setGeneralSettings((prev) => ({
                          ...prev,
                          appName: e.target.value,
                        }))
                      }
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={generalSettings.supportEmail}
                      onChange={(e) =>
                        setGeneralSettings((prev) => ({
                          ...prev,
                          supportEmail: e.target.value,
                        }))
                      }
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      App Version
                    </label>
                    <input
                      type="text"
                      value={generalSettings.appVersion}
                      onChange={(e) =>
                        setGeneralSettings((prev) => ({
                          ...prev,
                          appVersion: e.target.value,
                        }))
                      }
                      className="form-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Maintenance Mode
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generalSettings.maintenanceMode}
                        onChange={() =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            maintenanceMode: !prev.maintenanceMode,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                    <span className="text-sm text-slate-600">
                      Enable maintenance mode
                    </span>
                  </div>
                </div>

                {generalSettings.maintenanceMode && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Maintenance Message
                    </label>
                    <textarea
                      value={generalSettings.maintenanceMessage}
                      onChange={(e) =>
                        setGeneralSettings((prev) => ({
                          ...prev,
                          maintenanceMessage: e.target.value,
                        }))
                      }
                      rows={3}
                      className="form-input"
                      placeholder="Enter maintenance message to display to users..."
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Mining Settings */}
          {activeTab === "mining" && (
            <>
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">
                  Mining Settings
                </h2>
                <p className="text-sm text-slate-500">
                  Configure mining cycle and rates
                </p>
              </div>
              <div className="p-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Mining Cycle Duration
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={miningSettings.miningCycleDuration}
                        onChange={(e) =>
                          setMiningSettings((prev) => ({
                            ...prev,
                            miningCycleDuration: Number(e.target.value),
                          }))
                        }
                        className="form-input"
                      />
                      <span className="flex items-center px-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                        hours
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Base Mining Rate
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={miningSettings.miningRate}
                        onChange={(e) =>
                          setMiningSettings((prev) => ({
                            ...prev,
                            miningRate: Number(e.target.value),
                          }))
                        }
                        step={0.01}
                        className="form-input"
                      />
                      <span className="flex items-center px-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                        coins/hr
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Referral Boost Percent
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={miningSettings.referralBoostPercent}
                        onChange={(e) =>
                          setMiningSettings((prev) => ({
                            ...prev,
                            referralBoostPercent: Number(e.target.value),
                          }))
                        }
                        className="form-input"
                      />
                      <span className="flex items-center px-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                        %
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Max Coins Per Cycle
                    </label>
                    <input
                      type="number"
                      value={miningSettings.maxCoinsPerCycle}
                      onChange={(e) =>
                        setMiningSettings((prev) => ({
                          ...prev,
                          maxCoinsPerCycle: Number(e.target.value),
                        }))
                      }
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Boost Cost
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={miningSettings.boostCost}
                        onChange={(e) =>
                          setMiningSettings((prev) => ({
                            ...prev,
                            boostCost: Number(e.target.value),
                          }))
                        }
                        className="form-input"
                      />
                      <span className="flex items-center px-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                        coins
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">Mining Cycle Info</span>
                  </div>
                  <p className="text-sm text-amber-600">
                    Users mine at base rate for the configured cycle duration. After completion,
                    they receive auto notification to start new cycle.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Referral Settings */}
          {activeTab === "referral" && (
            <>
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">
                  Referral Settings
                </h2>
                <p className="text-sm text-slate-500">
                  Configure referral bonus structure
                </p>
              </div>
              <div className="p-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Direct Referral Bonus
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={referralSettings.directReferralBonus}
                        onChange={(e) =>
                          setReferralSettings((prev) => ({
                            ...prev,
                            directReferralBonus: Number(e.target.value),
                          }))
                        }
                        className="form-input"
                      />
                      <span className="flex items-center px-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                        coins
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Indirect Referral Bonus
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={referralSettings.indirectReferralBonus}
                        onChange={(e) =>
                          setReferralSettings((prev) => ({
                            ...prev,
                            indirectReferralBonus: Number(e.target.value),
                          }))
                        }
                        className="form-input"
                      />
                      <span className="flex items-center px-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                        coins
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Signup Bonus
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={referralSettings.signupBonus}
                        onChange={(e) =>
                          setReferralSettings((prev) => ({
                            ...prev,
                            signupBonus: Number(e.target.value),
                          }))
                        }
                        className="form-input"
                      />
                      <span className="flex items-center px-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                        coins
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-700 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">Referral Structure</span>
                  </div>
                  <p className="text-sm text-emerald-600">
                    Direct referrals earn {referralSettings.directReferralBonus} coins, indirect referrals earn {referralSettings.indirectReferralBonus} coins. 
                    New users get {referralSettings.signupBonus} coins as signup bonus.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Withdrawal Settings */}
          {activeTab === "withdrawal" && (
            <>
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">
                  Withdrawal Settings
                </h2>
                <p className="text-sm text-slate-500">
                  Configure withdrawal limits and coin value
                </p>
              </div>
              <div className="p-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Minimum Withdrawal
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={withdrawalSettings.minWithdrawal}
                        onChange={(e) =>
                          setWithdrawalSettings((prev) => ({
                            ...prev,
                            minWithdrawal: Number(e.target.value),
                          }))
                        }
                        className="form-input"
                      />
                      <span className="flex items-center px-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                        coins
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Coin Value
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={withdrawalSettings.coinValue}
                        onChange={(e) =>
                          setWithdrawalSettings((prev) => ({
                            ...prev,
                            coinValue: Number(e.target.value),
                          }))
                        }
                        step={0.001}
                        className="form-input"
                      />
                      <span className="flex items-center px-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                        USD
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Withdrawal Cooldown
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={withdrawalSettings.withdrawalCooldown}
                        onChange={(e) =>
                          setWithdrawalSettings((prev) => ({
                            ...prev,
                            withdrawalCooldown: Number(e.target.value),
                          }))
                        }
                        className="form-input"
                      />
                      <span className="flex items-center px-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                        hours
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Wallet className="w-5 h-5" />
                    <span className="font-semibold">Withdrawal Info</span>
                  </div>
                  <p className="text-sm text-blue-600">
                    Users can withdraw minimum {withdrawalSettings.minWithdrawal} coins. 
                    1 coin = ${withdrawalSettings.coinValue} USD. 
                    Cooldown: {withdrawalSettings.withdrawalCooldown} hours between withdrawals.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Transfer Settings */}
          {activeTab === "transfer" && (
            <>
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">
                  Transfer Settings
                </h2>
                <p className="text-sm text-slate-500">
                  Configure coin transfer between users
                </p>
              </div>
              <div className="p-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Minimum Transfer
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={transferSettings.minTransfer}
                        onChange={(e) =>
                          setTransferSettings((prev) => ({
                            ...prev,
                            minTransfer: Number(e.target.value),
                          }))
                        }
                        className="form-input"
                      />
                      <span className="flex items-center px-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                        coins
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Maximum Transfer
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={transferSettings.maxTransfer}
                        onChange={(e) =>
                          setTransferSettings((prev) => ({
                            ...prev,
                            maxTransfer: Number(e.target.value),
                          }))
                        }
                        className="form-input"
                      />
                      <span className="flex items-center px-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                        coins
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Transfer Fee
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={transferSettings.transferFeePercent}
                        onChange={(e) =>
                          setTransferSettings((prev) => ({
                            ...prev,
                            transferFeePercent: Number(e.target.value),
                          }))
                        }
                        step={0.1}
                        className="form-input"
                      />
                      <span className="flex items-center px-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <div className="flex items-center gap-2 text-purple-700 mb-2">
                    <ArrowLeftRight className="w-5 h-5" />
                    <span className="font-semibold">Transfer Info</span>
                  </div>
                  <p className="text-sm text-purple-600">
                    Users can transfer between {transferSettings.minTransfer} - {transferSettings.maxTransfer} coins. 
                    Transfer fee: {transferSettings.transferFeePercent}%.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Ownership Settings */}
          {activeTab === "ownership" && (
            <>
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">
                  Ownership Settings
                </h2>
                <p className="text-sm text-slate-500">
                  Configure ownership completion parameters
                </p>
              </div>
              <div className="p-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Ownership Days Required
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={ownershipSettings.ownershipDaysRequired}
                        onChange={(e) =>
                          setOwnershipSettings((prev) => ({
                            ...prev,
                            ownershipDaysRequired: Number(e.target.value),
                          }))
                        }
                        className="form-input"
                      />
                      <span className="flex items-center px-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                        days
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Mining Sessions Required
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={ownershipSettings.miningSessionsRequired}
                        onChange={(e) =>
                          setOwnershipSettings((prev) => ({
                            ...prev,
                            miningSessionsRequired: Number(e.target.value),
                          }))
                        }
                        className="form-input"
                      />
                      <span className="flex items-center px-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                        sessions
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Ownership Completion</span>
                  </div>
                  <p className="text-sm text-blue-600">
                    Users must complete {ownershipSettings.ownershipDaysRequired} days of activity and {ownershipSettings.miningSessionsRequired} mining sessions
                    to complete ownership. After completion, they receive invite
                    and join waitlist.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Daily Check-in Settings */}
          {activeTab === "checkin" && (
            <>
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">
                  Daily Check-in Bonuses
                </h2>
                <p className="text-sm text-slate-500">
                  Configure daily check-in bonus rewards (7 days)
                </p>
              </div>
              <div className="p-5 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {checkinSettings.dailyCheckinBonuses.map((bonus, index) => (
                    <div key={index} className="text-center">
                      <label className="text-xs font-medium text-slate-500 mb-2 block">
                        Day {index + 1}
                      </label>
                      <input
                        type="number"
                        value={bonus}
                        onChange={(e) => handleCheckinBonusChange(index, e.target.value)}
                        className="form-input text-center text-lg font-bold"
                      />
                      <span className="text-xs text-slate-500">coins</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">Check-in Info</span>
                  </div>
                  <p className="text-sm text-amber-600">
                    Users receive increasing daily rewards for consecutive check-ins. 
                    After 7 days, the cycle resets.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Payment Settings */}
          {activeTab === "payment" && (
            <>
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">
                  Payment Settings
                </h2>
                <p className="text-sm text-slate-500">
                  Configure payment methods for coin purchase
                </p>
              </div>
              <div className="p-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.paymentUpiId}
                      onChange={(e) =>
                        setPaymentSettings((prev) => ({
                          ...prev,
                          paymentUpiId: e.target.value,
                        }))
                      }
                      placeholder="example@upi"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      UPI QR Code URL
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.paymentUpiQrCode}
                      onChange={(e) =>
                        setPaymentSettings((prev) => ({
                          ...prev,
                          paymentUpiQrCode: e.target.value,
                        }))
                      }
                      placeholder="https://..."
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.paymentBankName}
                      onChange={(e) =>
                        setPaymentSettings((prev) => ({
                          ...prev,
                          paymentBankName: e.target.value,
                        }))
                      }
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.paymentAccountNumber}
                      onChange={(e) =>
                        setPaymentSettings((prev) => ({
                          ...prev,
                          paymentAccountNumber: e.target.value,
                        }))
                      }
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.paymentIfscCode}
                      onChange={(e) =>
                        setPaymentSettings((prev) => ({
                          ...prev,
                          paymentIfscCode: e.target.value,
                        }))
                      }
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={paymentSettings.paymentAccountHolderName}
                      onChange={(e) =>
                        setPaymentSettings((prev) => ({
                          ...prev,
                          paymentAccountHolderName: e.target.value,
                        }))
                      }
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Coins per Dollar
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={paymentSettings.coinPricePerDollar}
                        onChange={(e) =>
                          setPaymentSettings((prev) => ({
                            ...prev,
                            coinPricePerDollar: Number(e.target.value),
                          }))
                        }
                        className="form-input"
                      />
                      <span className="flex items-center px-4 bg-slate-100 rounded-lg text-sm text-slate-600">
                        coins/$1
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-semibold">Payment Info</span>
                  </div>
                  <p className="text-sm text-green-600">
                    These payment details will be shown to users when they want to purchase coins. 
                    Users can pay via UPI or bank transfer.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Notification Settings */}
          {activeTab === "notifications" && (
            <>
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">
                  Notification Settings
                </h2>
                <p className="text-sm text-slate-500">
                  Configure auto notification triggers
                </p>
              </div>
              <div className="p-5 space-y-6">
                <div className="space-y-4">
                  {notificationSettings.map((notif, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                    >
                      <div>
                        <p className="font-medium text-slate-800">
                          {notif.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {notif.description}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notif.enabled}
                          onChange={() => toggleNotification(idx)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Save Button */}
          <div className="p-5 border-t border-slate-100 flex justify-end gap-3">
            {showSuccess && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Settings saved successfully!
                </span>
              </div>
            )}
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
