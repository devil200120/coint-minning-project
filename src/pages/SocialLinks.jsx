import { useState } from "react";
import Header from "../components/Header";
import {
  Link2,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  Save,
  ExternalLink,
  Globe,
  Loader2,
  Check,
} from "lucide-react";

const SocialLinks = () => {
  const [links, setLinks] = useState({
    twitter: "https://twitter.com/miningapp",
    instagram: "https://instagram.com/miningapp",
    facebook: "https://facebook.com/miningapp",
    youtube: "https://youtube.com/@miningapp",
    telegram: "https://t.me/miningapp",
    website: "https://miningapp.com",
  });

  const socialPlatforms = [
    {
      key: "twitter",
      name: "Twitter / X",
      icon: Twitter,
      color: "bg-slate-900",
      placeholder: "https://twitter.com/username",
    },
    {
      key: "instagram",
      name: "Instagram",
      icon: Instagram,
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      placeholder: "https://instagram.com/username",
    },
    {
      key: "facebook",
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600",
      placeholder: "https://facebook.com/pagename",
    },
    {
      key: "youtube",
      name: "YouTube",
      icon: Youtube,
      color: "bg-red-600",
      placeholder: "https://youtube.com/@channel",
    },
    {
      key: "telegram",
      name: "Telegram",
      icon: MessageCircle,
      color: "bg-sky-500",
      placeholder: "https://t.me/groupname",
    },
    {
      key: "website",
      name: "Website",
      icon: Globe,
      color: "bg-emerald-500",
      placeholder: "https://yourwebsite.com",
    },
  ];

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [quickActions, setQuickActions] = useState({
    followOnX: true,
    joinTelegram: true,
  });

  const handleChange = (key, value) => {
    setLinks((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveLinks = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div>
      <Header
        title="Social Media Links"
        subtitle="Manage social media links shown in the app"
      />

      {/* Preview */}
      <div className="card mb-6">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">App Preview</h2>
          <p className="text-sm text-slate-500">
            How social links appear in the user app
          </p>
        </div>
        <div className="p-5">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md mx-auto">
            <h3 className="text-white text-center font-semibold mb-4">
              Join the community
            </h3>
            <div className="flex justify-center gap-4">
              {socialPlatforms.slice(0, 5).map((platform) => (
                <a
                  key={platform.key}
                  href={links[platform.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-12 h-12 ${platform.color} rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform`}
                >
                  <platform.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Social Links Form */}
      <div className="card">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            Social Media Links
          </h2>
          <p className="text-sm text-slate-500">
            Enter your social media profile URLs
          </p>
        </div>
        <div className="p-5">
          <div className="space-y-4">
            {socialPlatforms.map((platform) => (
              <div
                key={platform.key}
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
              >
                <div
                  className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center text-white`}
                >
                  <platform.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-700 mb-1 block">
                    {platform.name}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder={platform.placeholder}
                      value={links[platform.key]}
                      onChange={(e) =>
                        handleChange(platform.key, e.target.value)
                      }
                      className="form-input flex-1"
                    />
                    {links[platform.key] && (
                      <a
                        href={links[platform.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end gap-3">
            {showSuccess && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Links saved successfully!
                </span>
              </div>
            )}
            <button
              onClick={handleSaveLinks}
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
                  Save All Links
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mt-6">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">
            Quick Actions
          </h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <h4 className="font-semibold text-slate-800 mb-2">
                Follow on X Button
              </h4>
              <p className="text-sm text-slate-600 mb-3">
                Shows "Follow on X" button in user app
              </p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={quickActions.followOnX}
                  onChange={() =>
                    setQuickActions((prev) => ({
                      ...prev,
                      followOnX: !prev.followOnX,
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className="ml-3 text-sm font-medium text-slate-700">
                  {quickActions.followOnX ? "Enabled" : "Disabled"}
                </span>
              </label>
            </div>
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl">
              <h4 className="font-semibold text-slate-800 mb-2">
                Join Telegram Button
              </h4>
              <p className="text-sm text-slate-600 mb-3">
                Shows "Join Telegram" button in user app
              </p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={quickActions.joinTelegram}
                  onChange={() =>
                    setQuickActions((prev) => ({
                      ...prev,
                      joinTelegram: !prev.joinTelegram,
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className="ml-3 text-sm font-medium text-slate-700">
                  {quickActions.joinTelegram ? "Enabled" : "Disabled"}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialLinks;
