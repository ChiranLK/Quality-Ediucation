import { useState, useRef, useEffect } from "react";
import {
  User, Mail, Phone, MapPin, Camera, Trash2, Save, Loader2, AlertCircle,
  CheckCircle, X, TriangleAlert, ShieldAlert, GraduationCap,
} from "lucide-react";
import customFetch from "../../../utils/customfetch.jsx";
import toast from "react-hot-toast";

// ── Custom Delete Confirmation Modal ─────────────────────────────────────────
function DeleteConfirmModal({ step, onConfirm, onCancel, isDeleting }) {
  // Prevent scroll on body while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal card */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeInScale_0.2s_ease-out]">

        {/* Red top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-400 to-rose-600" />

        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              {step === 1
                ? <TriangleAlert className="w-8 h-8 text-red-500" />
                : <ShieldAlert  className="w-8 h-8 text-red-600" />}
            </div>
          </div>

          {step === 1 ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Delete Your Account?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed mb-1">
                You are about to permanently delete your account.
              </p>
              <ul className="mt-3 mb-6 space-y-2">
                {[
                  "All your profile data will be erased",
                  "Your study material history will be lost",
                  "You will be logged out immediately",
                  "This action cannot be undone",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                    <X className="w-4 h-4 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                Are You Absolutely Sure?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center leading-relaxed mb-6">
                This is your final confirmation. Once you click{" "}
                <span className="font-semibold text-red-500">Delete Forever</span>, your
                account will be permanently removed with no way to recover it.
              </p>
            </>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
              ) : step === 1 ? (
                "Yes, Continue"
              ) : (
                <><Trash2 className="w-4 h-4" /> Delete Forever</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserProfile({ user, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalStep, setDeleteModalStep] = useState(0); // 0=hidden 1=warning 2=final
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    location: user?.location || "",
    grade: user?.grade || "",
  });

  const GRADE_OPTIONS = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12', 'O/L', 'A/L', 'University', 'Other',
  ];

  // Keep in sync if parent user prop changes
  useEffect(() => {
    setFormData({
      fullName: user?.fullName || user?.name || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      location: user?.location || "",
      grade: user?.grade || "",
    });
  }, [user]);

  const getAvatarSrc = () => {
    if (user?.avatar && user.avatar !== "uploads/default-avatar.png") {
      return `http://localhost:5000/${user.avatar}`;
    }
    const name = user?.fullName || user?.name || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff&size=128`;
  };

  const [avatarSrc, setAvatarSrc] = useState(getAvatarSrc);
  const fileInputRef = useRef(null);

  // Keep avatarSrc in sync when parent user avatar changes
  useEffect(() => {
    setAvatarSrc(getAvatarSrc());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.avatar]);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCancelEdit = () => {
    setFormData({
      fullName: user?.fullName || user?.name || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      location: user?.location || "",
      grade: user?.grade || "",
    });
    setIsEditing(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (formData.fullName.trim().length < 3) {
      toast.error("Full name must be at least 3 characters");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (formData.phoneNumber && !/^[0-9]{10}$/.test(formData.phoneNumber)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        location: formData.location.trim(),
        grade: formData.grade,
      };

      const response = await customFetch.put("/auth/profile", payload);
      const saved = response.data.user;

      // 1. Lift state up to App so sidebar & navbar re-render instantly
      onUpdateUser({
        fullName: saved.fullName,
        name: saved.fullName, // Sidebar reads user.name
        email: saved.email,
        phoneNumber: saved.phoneNumber,
        location: saved.location,
        grade: saved.grade || "",
      });

      toast.success("✅ Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      const msg = error.response?.data?.msg || error.response?.data?.error || "Failed to update profile";
      toast.error(`❌ ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB");
      return;
    }

    const data = new FormData();
    data.append("avatar", file);

    setIsUploading(true);
    try {
      const response = await customFetch.put("/auth/profile/avatar", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newAvatar = `http://localhost:5000/${response.data.avatar}`;
      setAvatarSrc(newAvatar);

      // Lift updated avatar to parent so it's reflected elsewhere instantly
      onUpdateUser({ avatar: response.data.avatar });
      toast.success("✅ Profile picture updated!");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploading(true);
    try {
      await customFetch.delete("/auth/profile/avatar");
      const name = user?.fullName || user?.name || "U";
      const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff&size=128`;
      setAvatarSrc(fallback);
      onUpdateUser({ avatar: "uploads/default-avatar.png" });
      toast.success("✅ Profile picture removed!");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to remove avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteModalStep === 1) {
      // Move to second confirmation step
      setDeleteModalStep(2);
      return;
    }

    // Step 2 — actually delete
    setIsDeleting(true);
    try {
      await customFetch.delete("/auth/profile");
      toast.success("Account deleted. Goodbye!");
      setTimeout(() => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to delete profile");
      setIsDeleting(false);
      setDeleteModalStep(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 pb-10">
      {/* Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

        {/* Cover banner */}
        <div className="h-28 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-600" />

        {/* Avatar row */}
        <div className="px-8 -mt-14 flex justify-between items-end mb-6">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <img
              src={avatarSrc}
              alt="Avatar"
              className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-indigo-100 shadow"
            />
            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {isUploading
                ? <Loader2 className="w-7 h-7 text-white animate-spin" />
                : <Camera className="w-7 h-7 text-white" />}
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-white bg-indigo-600 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Change photo
            </span>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
            />
          </div>

          {/* Remove photo -- only shown when user has a custom avatar */}
          {user?.avatar && user.avatar !== "uploads/default-avatar.png" && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={isUploading}
              className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors mt-1 disabled:opacity-50"
            >
              Remove photo
            </button>
          )}

          <div className="mb-2">
            {isEditing ? (
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Name / role display */}
        <div className="px-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.fullName || user?.name}</h2>
          <p className="text-sm text-indigo-500 dark:text-indigo-400 capitalize font-medium">{user?.role}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveProfile} className="px-8 pb-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-500" /> Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your full name"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-indigo-500" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your email"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-indigo-500" /> Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="10-digit number e.g. 0712345678"
                maxLength={10}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-500" /> Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="City, Country"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm"
              />
            </div>

            {/* Grade — students only */}
            {user?.role === "user" && (
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-500" /> Your Grade / Level
                </label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm"
                >
                  <option value="">-- Select grade --</option>
                  {GRADE_OPTIONS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Save button — only visible in edit mode */}
          {isEditing && (
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isSaving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  : <><CheckCircle className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          )}
        </form>

        {/* Danger Zone */}
        <div className="mx-8 mb-8 p-5 rounded-xl border border-red-100 dark:border-red-900/40 bg-red-50/50 dark:bg-red-900/10">
          <h3 className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-sm mb-1">
            <AlertCircle className="w-4 h-4" /> Danger Zone
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Permanently delete your account and all associated data. This action is irreversible.
          </p>
          <button
            onClick={() => setDeleteModalStep(1)}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            <Trash2 className="w-4 h-4" /> Delete My Account
          </button>
        </div>

      </div>

      {/* Custom delete confirmation modal */}
      {deleteModalStep > 0 && (
        <DeleteConfirmModal
          step={deleteModalStep}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { if (!isDeleting) setDeleteModalStep(0); }}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
