import React, { useState, useEffect } from "react";
import { 
  Users, Search, Loader2, Trash2, Shield, User, MapPin, CheckCircle, AlertTriangle, BookOpen, Star, DollarSign, Calendar
} from "lucide-react";
import customFetch from "../../../utils/customfetch";
import toast, { Toaster } from "react-hot-toast";

// ─── Helpers ───
function getInitials(name) {
  if (!name) return "T";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function AvatarDisplay({ tutor }) {
  const [imgError, setImgError] = useState(false);
  const hasAvatarUrl = tutor.avatar && !tutor.avatar.includes('default');

  if (hasAvatarUrl && !imgError) {
    const srcPath = tutor.avatar.startsWith('http') 
      ? tutor.avatar 
      : (tutor.avatar.startsWith('/') ? tutor.avatar : `/${tutor.avatar}`);
    return (
      <img 
        src={srcPath} 
        alt={tutor.fullName} 
        onError={() => setImgError(true)}
        className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm" 
      />
    );
  }

  return (
    <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm text-orange-700 dark:text-orange-400 font-bold tracking-widest text-sm">
      {getInitials(tutor.fullName)}
    </div>
  );
}

// ─── Delete Modal ───
function DeleteModal({ tutor, onClose, onConfirm, loading }) {
  if (!tutor) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-xl">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delete Tutor</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Are you sure you want to delete the tutor account for <span className="font-semibold text-gray-900 dark:text-white">{tutor.fullName}</span>?
        </p>
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg mb-6 border border-red-100 dark:border-red-900/20">
          <strong>Warning:</strong> This will permanently remove their profile, materials, and session data.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={() => onConfirm(tutor._id)} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete Tutor
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───
export default function ManageTutors() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("role", "tutor"); 

      const { data } = await customFetch.get(`/auth/all-users?${params.toString()}`);
      setTutors(data.users || []);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to fetch tutors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTutors();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await customFetch.delete(`/auth/users/${id}`);
      toast.success("Tutor successfully deleted");
      setDeleteModal(null);
      fetchTutors();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to delete tutor");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="bottom-right" />

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-orange-600" />
          Manage Tutors
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Verify and oversee tutor accounts across the platform.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tutor name or email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400 transition-shadow"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        </div>
      ) : tutors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-2xl mb-4">
            <BookOpen className="w-12 h-12 text-orange-400 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            No tutors found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {tutors.map((tutor) => {
            const tp = tutor.tutorProfile || {};
            const isVerified = tp.isVerified || false;
            const subs = tp.subjects || [];
            
            return (
              <div key={tutor._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
                <div className="h-1.5 bg-gradient-to-r from-orange-400 to-amber-600" />
                
                <div className="p-6 flex-1 flex flex-col">
                  {/* Top Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <AvatarDisplay tutor={tutor} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{tutor.fullName}</h3>
                          {isVerified && (
                            <CheckCircle className="w-4 h-4 text-green-500" title="Verified Tutor" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          {tutor.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 gap-4 mb-5 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Student Rating</span>
                      <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-semibold flex-wrap">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        {tp.rating?.average > 0 ? (
                          <span>{tp.rating.average.toFixed(1)} <span className="text-xs text-gray-400 font-normal">({tp.rating.count} reviews)</span></span>
                        ) : 'No ratings'}
                      </div>
                    </div>
                  </div>

                  {/* Badges / Extras */}
                  <div className="mb-6 flex-1">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Subjects Tags</h4>
                    <div className="flex flex-wrap gap-2">
                       {subs.length > 0 ? subs.map((sub, idx) => (
                         <span key={idx} className="px-2.5 py-1 text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50 rounded-md">
                           {sub}
                         </span>
                       )) : <span className="text-sm text-gray-400 italic">No subjects listed</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      Joined {new Date(tutor.createdAt).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => setDeleteModal(tutor)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 dark:bg-red-900/20 dark:hover:bg-red-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteModal && (
        <DeleteModal
          tutor={deleteModal}
          onClose={() => setDeleteModal(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
