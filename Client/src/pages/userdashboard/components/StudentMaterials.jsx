import React, { useState, useEffect } from 'react';
import {
  FileText, Search, Download, Heart, Eye, ChevronLeft, ChevronRight,
  BookOpen, Filter, Loader2, File, Image, FileType, Tag, GraduationCap, BookMarked, User
} from 'lucide-react';
import customFetch from '../../../utils/customfetch';
import toast, { Toaster } from 'react-hot-toast';

// ─── Helpers ────────────────────────────────────────────────────────────────
const GRADE_OPTIONS = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12', 'A/L', 'O/L', 'University', 'Other'
];

const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Sinhala', 'History', 'Geography', 'Science', 'ICT',
  'Economics', 'Business Studies', 'Art', 'Music', 'Other'
];

function getFileIcon(url = '') {
  if (!url) return <File className="w-5 h-5" />;
  const lower = url.toLowerCase();
  if (lower.includes('.pdf')) return <FileText className="w-5 h-5 text-red-500" />;
  if (lower.includes('.doc')) return <FileText className="w-5 h-5 text-blue-500" />;
  if (lower.includes('.ppt')) return <FileType className="w-5 h-5 text-orange-500" />;
  if (/\.(jpg|jpeg|png|gif|webp)/.test(lower)) return <Image className="w-5 h-5 text-purple-500" />;
  return <File className="w-5 h-5 text-gray-500" />;
}

function getFileTypeBadge(url = '') {
  if (!url) return { label: 'FILE', color: 'bg-gray-100 text-gray-600' };
  const lower = url.toLowerCase();
  if (lower.includes('.pdf')) return { label: 'PDF', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  if (lower.includes('.docx') || lower.includes('.doc')) return { label: 'DOC', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
  if (lower.includes('.pptx') || lower.includes('.ppt')) return { label: 'PPT', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' };
  if (lower.includes('.txt')) return { label: 'TXT', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' };
  if (/\.(jpg|jpeg|png|gif|webp)/.test(lower)) return { label: 'IMG', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' };
  return { label: 'FILE', color: 'bg-gray-100 text-gray-600' };
}

// ─── Material Card ────────────────────────────────────────────────────────────
function StudentMaterialCard({ material, onDownload, onLike }) {
  const badge = getFileTypeBadge(material.fileUrl);

  const handleDownloadClick = () => {
    onDownload(material._id);
    // Explicitly open download in a new tab if it's a direct Cloudinary URL
    window.open(material.fileUrl, '_blank');
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Top Accent */}
      <div className="h-1.5 bg-gradient-to-r from-blue-400 to-indigo-500" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 p-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
            {getFileIcon(material.fileUrl)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate" title={material.title}>{material.title}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${badge.color}`}>{badge.label}</span>
              <span className="flex items-center gap-1 text-[10px] font-medium text-gray-500 dark:text-gray-400 max-w-[120px] truncate">
                <User className="w-3 h-3" />
                {material.uploaderName || 'Instructor'}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{material.description}</p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3 flex-wrap">
          <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">
            <BookMarked className="w-3 h-3" />
            <span className="capitalize">{material.subject}</span>
          </span>
          <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-md">
            <GraduationCap className="w-3 h-3" />
            {material.grade}
          </span>
        </div>

        {/* Tags */}
        {material.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {material.tags.slice(0, 3).map(tag => (
              <span key={tag} className="flex items-center gap-0.5 text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300 px-1.5 py-0.5 rounded-md">
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            {material.tags.length > 3 && (
              <span className="text-[10px] text-gray-400">+{material.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Metrics + Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1" title="Views"><Eye className="w-3 h-3" />{material.metrics?.views ?? 0}</span>
            <span className="flex items-center gap-1" title="Downloads"><Download className="w-3 h-3" />{material.metrics?.downloads ?? 0}</span>
            <button onClick={() => onLike(material._id)} className="flex items-center gap-1 hover:text-red-500 transition-colors" title="Like">
              <Heart className="w-3 h-3" />{material.metrics?.likes ?? 0}
            </button>
          </div>
          <button
            onClick={handleDownloadClick}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentMaterials({ user }) {
  const studentGrade = user?.grade || ""; // '' means no grade set yet

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, total: 1, count: 0 });
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const page = pagination.current;

  // Fetch materials — always locked to student's grade if set
  const fetchMaterials = async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 9, status: 'active' });
      if (search) params.set('keyword', search);
      if (filterSubject) params.set('subject', filterSubject);
      // 🔒 Always filter by student's own grade if they have one set
      if (studentGrade) params.set('grade', studentGrade);

      const { data } = await customFetch.get(`/materials?${params}`);
      setMaterials(data.data || []);
      setPagination({
        current: data.pagination?.current || 1,
        total: data.pagination?.pages || 1,
        count: data.pagination?.total || 0,
      });
    } catch (err) {
      toast.error('Failed to load study materials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSubject, studentGrade]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMaterials(1);
  };

  const handleDownloadRecord = async (id) => {
    try {
      await customFetch.post(`/materials/${id}/download`);
      setTimeout(() => fetchMaterials(page), 1000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLike = async (id) => {
    try {
      await customFetch.post(`/materials/${id}/like`);
      fetchMaterials(page);
    } catch (e) {
      toast.error('Cannot update like status.');
    }
  };

  const clearFilters = () => {
    setFilterSubject('');
    setSearch('');
  };

  const hasFilters = filterSubject || search;

  return (
    <div className="space-y-6">
      <Toaster position="bottom-right" />
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          Study Materials Library
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Found {pagination.count} material{pagination.count !== 1 ? 's' : ''} available.
          </p>
          {/* Grade lock badge */}
          {studentGrade ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
              <GraduationCap className="w-3.5 h-3.5" />
              Showing: {studentGrade}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700">
              ⚠ Set your grade in Settings to see materials for your level
            </span>
          )}
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex gap-3 flex-wrap">
          <form onSubmit={handleSearch} className="flex flex-1 min-w-[200px] gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search resources by topic, title, or tags..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-shadow"
              />
            </div>
            <button type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors">
              Search
            </button>
          </form>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
              : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
          </button>
        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-3">
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Subjects</option>
              {SUBJECT_OPTIONS.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
            </select>
            {/* Note: Grade filter is locked to student's profile grade — no dropdown shown */}
            {hasFilters && (
              <button onClick={clearFilters}
                className="px-3 py-2 text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading resources...</p>
          </div>
        </div>
      ) : materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl mb-4">
            <BookOpen className="w-12 h-12 text-blue-400 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {hasFilters ? 'No materials match your criteria' : 'No materials available'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
            {hasFilters
              ? 'Try adjusting your search or filters to find what you are looking for.'
              : 'Tutors haven\'t uploaded any public study materials yet. Check back soon!'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium text-sm transition-colors">
              Reset Search
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {materials.map(m => (
              <StudentMaterialCard
                key={m._id}
                material={m}
                onDownload={handleDownloadRecord}
                onLike={handleLike}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => fetchMaterials(page - 1)} disabled={page <= 1}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400 px-3">
                Page <span className="font-semibold text-gray-900 dark:text-white">{page}</span> of {pagination.total}
              </span>
              <button
                onClick={() => fetchMaterials(page + 1)} disabled={page >= pagination.total}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
