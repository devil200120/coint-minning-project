import { useState, useEffect } from "react";
import Header from "../components/Header";
import AdminApi from "../services/api";
import {
  Image,
  Plus,
  Edit,
  Trash2,
  Eye,
  Upload,
  X,
  GripVertical,
  Link2,
  Loader2,
} from "lucide-react";

const Banners = () => {
  const [showModal, setShowModal] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalViews: 0,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await AdminApi.getBanners();

      if (response.success) {
        // API returns response.banners directly
        const bannersData = response.banners || response.data?.banners || [];

        const formattedBanners = bannersData.map((banner) => ({
          id: banner._id,
          title: banner.title,
          description: banner.description,
          image: banner.image,
          link: banner.link || "",
          status:
            banner.status === "active" || banner.isActive
              ? "active"
              : "inactive",
          order: banner.order || 1,
          views: banner.views || 0,
        }));

        setBanners(formattedBanners);
        setStats({
          total: formattedBanners.length,
          active: formattedBanners.filter((b) => b.status === "active").length,
          totalViews: formattedBanners.reduce((acc, b) => acc + b.views, 0),
        });
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;

    try {
      const response = await AdminApi.deleteBanner(bannerId);
      if (response.success) {
        fetchBanners();
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert("Failed to delete banner");
    }
  };

  if (loading && banners.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Home Banners"
        subtitle="Manage promotional banners on home screen"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="card p-3 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-500 mb-1">Total</p>
              <p className="text-lg md:text-2xl font-bold text-slate-800">
                {stats.total}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <Image className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="card p-3 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-500 mb-1">Active</p>
              <p className="text-lg md:text-2xl font-bold text-emerald-600">
                {stats.active}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="card p-3 md:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-slate-500 mb-1">Views</p>
              <p className="text-lg md:text-2xl font-bold text-slate-800">
                {stats.totalViews >= 1000
                  ? `${(stats.totalViews / 1000).toFixed(1)}K`
                  : stats.totalViews}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Banner List */}
      <div className="card">
        <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-slate-800">
              Banner Images
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Drag to reorder. Max 2 banners.
            </p>
          </div>
          <button
            onClick={() => {
              setEditBanner(null);
              setShowModal(true);
            }}
            className="btn btn-primary w-full sm:w-auto"
            disabled={banners.length >= 2}
          >
            <Plus className="w-4 h-4" />
            Add Banner
          </button>
        </div>

        <div className="p-4 md:p-5">
          <div className="space-y-4">
            {banners.map((banner, idx) => (
              <div
                key={banner.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div className="hidden sm:block cursor-move text-slate-400 hover:text-slate-600">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Banner Preview */}
                <div className="w-full sm:w-32 md:w-48 h-20 md:h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  <span className="text-white text-xs font-medium">
                    Banner {idx + 1}
                  </span>
                </div>

                {/* Banner Info */}
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">
                    {banner.title}
                  </h4>
                  <p className="text-sm text-slate-500 mb-2">
                    {banner.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      {banner.link}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {banner.views} views
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        banner.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {banner.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditBanner(banner);
                      setShowModal(true);
                    }}
                    className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center hover:bg-amber-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {banners.length < 2 && (
            <div
              onClick={() => {
                setEditBanner(null);
                setShowModal(true);
              }}
              className="mt-4 p-8 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors"
            >
              <Upload className="w-10 h-10 text-slate-400 mb-3" />
              <span className="text-slate-600 font-medium">
                Click to add banner
              </span>
              <span className="text-sm text-slate-400">
                Recommended size: 1200x400 px
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {editBanner ? "Edit Banner" : "Add New Banner"}
                </h3>
                <p className="text-sm text-slate-500">
                  Upload banner image and details
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              {/* Image Upload */}
              <div className="mb-5">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Banner Image
                </label>
                <div className="aspect-[3/1] bg-slate-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-50 hover:border-amber-400 transition-colors">
                  <Upload className="w-10 h-10 text-slate-400 mb-3" />
                  <span className="text-slate-600 font-medium">
                    Click to upload image
                  </span>
                  <span className="text-sm text-slate-400">
                    Recommended: 1200x400 px, Max 2MB
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="mb-5">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Banner Title
                </label>
                <input
                  type="text"
                  placeholder="Enter banner title..."
                  defaultValue={editBanner?.title || ""}
                  className="form-input"
                />
              </div>

              {/* Description */}
              <div className="mb-5">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Description
                </label>
                <textarea
                  placeholder="Enter banner description..."
                  defaultValue={editBanner?.description || ""}
                  className="form-input min-h-[80px] resize-none"
                />
              </div>

              {/* Link */}
              <div className="mb-5">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Link URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com or /page"
                  defaultValue={editBanner?.link || ""}
                  className="form-input"
                />
              </div>

              {/* Status */}
              <div className="mb-6">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Status
                </label>
                <select
                  className="form-select"
                  defaultValue={editBanner?.status || "active"}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button className="btn btn-primary flex-1">
                  {editBanner ? "Update Banner" : "Add Banner"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
