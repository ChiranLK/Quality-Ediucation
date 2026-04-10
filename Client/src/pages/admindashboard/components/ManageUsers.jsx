import React, { useState, useEffect } from "react";
import { 
  Users, Search, Filter, Loader2, Trash2, Shield, User,
  Mail, Phone, MapPin, Calendar, AlertCircle, X, CheckCircle
} from "lucide-react";
import customFetch from "../../../utils/customfetch";
import toast, { Toaster } from "react-hot-toast";

// ─── Helpers ───
function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function AvatarDisplay({ user }) {
  const [imgError, setImgError] = useState(false);
  const hasAvatarUrl = user.avatar && !user.avatar.includes('default');

  if (hasAvatarUrl && !imgError) {
    const srcPath = user.avatar.startsWith('http') 
      ? user.avatar 
      : (user.avatar.startsWith('/') ? user.avatar : `/${user.avatar}`);
    return (
      <img 
        src={srcPath} 
        alt={user.fullName} 
        onError={() => setImgError(true)}
        className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm" 
      />
    );
  }

  return (
    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm text-indigo-700 dark:text-indigo-400 font-bold tracking-widest text-[13px]">
      {getInitials(user.fullName)}
    </div>
  );
}

// ─── Delete Modal ───
function DeleteModal({ user, onClose, onConfirm, loading }) {
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-xl">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delete User</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">{user.fullName}</span>?
        </p>
        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded-lg mb-6 border border-red-100 dark:border-red-900/20">
          <strong>Warning:</strong> This action cannot be undone. All associated data for this user will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={() => onConfirm(user._id)} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───
export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("role", "user"); // Only load students

      const { data } = await customFetch.get(`/auth/all-users?${params.toString()}`);
      setUsers(data.users || []);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Delay fetching slightly to avoid spamming the backend while typing
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await customFetch.delete(`/auth/users/${id}`);
      toast.success("User successfully deleted");
      setDeleteModal(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to delete user");
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
          <Users className="w-6 h-6 text-rose-600" />
          Manage Users
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View and remove registered users.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder-gray-400 transition-shadow"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-2xl mb-4">
            <Users className="w-12 h-12 text-rose-400 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            No users found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {users.map((user) => (
            <div key={user._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
              {/* Card Header Colored Accent */}
              <div className={`h-1.5 ${
                user.role === 'admin' ? 'bg-gradient-to-r from-red-400 to-rose-600' : 
                user.role === 'tutor' ? 'bg-gradient-to-r from-indigo-400 to-purple-600' : 
                'bg-gradient-to-r from-blue-400 to-cyan-500'
              }`} />
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <AvatarDisplay user={user} />
                    <div>
                      <h3 className="text-[15px] font-bold text-gray-900 dark:text-white line-clamp-1">{user.fullName}</h3>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-1 ${
                        user.role === 'admin' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                        user.role === 'tutor' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate" title={user.email}>{user.email}</span>
                  </div>
                  {user.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto flex justify-end">
                  <button
                    onClick={() => setDeleteModal(user)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 dark:bg-red-900/20 dark:hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <DeleteModal
          user={deleteModal}
          onClose={() => setDeleteModal(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
