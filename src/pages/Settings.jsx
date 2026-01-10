import { useState } from "react";
import Header from "../components/Header";
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
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    appName: "Mining App",
    supportEmail: "support@miningapp.com",
    supportPhone: "+91 98765 43210",
    appVersion: "1.0.0",
    allowSignupWithoutReferral: true,
    maintenanceMode: false,
  });

  // Mining Settings State
  const [miningSettings, setMiningSettings] = useState({
    miningCycleDuration: 24,
    baseMiningRate: 0.25,
    boostRateIncrease: 20,
    maxCoinsPerCycle: 200,
  });

  // Referral Settings State
  const [referralSettings, setReferralSettings] = useState({
    commissionRate: 10,
    maxReferralLegs: 10,
    referralBonus: 50,
    inactivePingInterval: 12,
  });

  // Ownership Settings State
  const [ownershipSettings, setOwnershipSettings] = useState({
    ownershipDaysRequired: 100,
    miningCoinsRequired: 200,
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

  const handleSaveChanges = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const toggleNotification = (idx) => {
    setNotificationSettings((prev) =>
      prev.map((notif, i) =>
        i === idx ? { ...notif, enabled: !notif.enabled } : notif
      )
    );
  };

  const tabs = [
    { id: "general", name: "General", icon: SettingsIcon },
    { id: "mining", name: "Mining", icon: Coins },
    { id: "referral", name: "Referral", icon: Users },
    { id: "ownership", name: "Ownership", icon: Shield },
    { id: "notifications", name: "Notifications", icon: Bell },
  ];

  return (
    <div>
      <Header
        title="Settings"
        subtitle="Configure app settings and parameters"
      />

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
                      Support Phone
                    </label>
                    <input
                      type="tel"
                      value={generalSettings.supportPhone}
                      onChange={(e) =>
                        setGeneralSettings((prev) => ({
                          ...prev,
                          supportPhone: e.target.value,
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
                    Allow Signup Without Referral
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generalSettings.allowSignupWithoutReferral}
                        onChange={() =>
                          setGeneralSettings((prev) => ({
                            ...prev,
                            allowSignupWithoutReferral:
                              !prev.allowSignupWithoutReferral,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                    <span className="text-sm text-slate-600">
                      Users can signup without referral code
                    </span>
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
                        value={miningSettings.baseMiningRate}
                        onChange={(e) =>
                          setMiningSettings((prev) => ({
                            ...prev,
                            baseMiningRate: Number(e.target.value),
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
                      Boost Rate Increase
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={miningSettings.boostRateIncrease}
                        onChange={(e) =>
                          setMiningSettings((prev) => ({
                            ...prev,
                            boostRateIncrease: Number(e.target.value),
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
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-700 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">Mining Cycle Info</span>
                  </div>
                  <p className="text-sm text-amber-600">
                    Users mine at 1 hour rate for 24 hours. After completion,
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
                  Configure referral commission structure
                </p>
              </div>
              <div className="p-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Commission Rate
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={referralSettings.commissionRate}
                        onChange={(e) =>
                          setReferralSettings((prev) => ({
                            ...prev,
                            commissionRate: Number(e.target.value),
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
                      Max Referral Legs
                    </label>
                    <input
                      type="number"
                      value={referralSettings.maxReferralLegs}
                      onChange={(e) =>
                        setReferralSettings((prev) => ({
                          ...prev,
                          maxReferralLegs: Number(e.target.value),
                        }))
                      }
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      Referral Bonus (First Signup)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={referralSettings.referralBonus}
                        onChange={(e) =>
                          setReferralSettings((prev) => ({
                            ...prev,
                            referralBonus: Number(e.target.value),
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
                      Inactive Ping Interval
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={referralSettings.inactivePingInterval}
                        onChange={(e) =>
                          setReferralSettings((prev) => ({
                            ...prev,
                            inactivePingInterval: Number(e.target.value),
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

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-700 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">Referral Structure</span>
                  </div>
                  <p className="text-sm text-emerald-600">
                    Leaders get 10% commission from 10 referral legs. Users can
                    ping inactive team members every 12 hours.
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
                      Mining Coins Required
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={ownershipSettings.miningCoinsRequired}
                        onChange={(e) =>
                          setOwnershipSettings((prev) => ({
                            ...prev,
                            miningCoinsRequired: Number(e.target.value),
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

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">Ownership Completion</span>
                  </div>
                  <p className="text-sm text-blue-600">
                    Users must complete 100 days of activity and mine 200 coins
                    to complete ownership. After completion, they receive invite
                    and join waitlist.
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
