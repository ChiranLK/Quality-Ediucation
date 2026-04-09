import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, FileText, Trash2, Edit3, X, Plus, Search,
  Download, Heart, Eye, ChevronLeft, ChevronRight,
  BookOpen, Filter, CheckCircle, AlertCircle, Loader2,
  File, Image, FileType, Tag, GraduationCap, BookMarked
} from 'lucide-react';
import customFetch from '../../../utils/customfetch';

// ─── Helpers ────────────────────────────────────────────────────────────────
const GRADE_OPTIONS = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12', 'Grade 13', 'Other'
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

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium transition-all animate-in slide-in-from-bottom-4 duration-300 ${
      toast.type === 'success'
        ? 'bg-emerald-600 text-white'
        : toast.type === 'delete'
        ? 'bg-red-600 text-white'
        : 'bg-red-600 text-white'
    }`}>



      {toast.type === 'success'
        ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
        : toast.type === 'delete'
        ? <Trash2 className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      {toast.message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Upload / Edit Modal ──────────────────────────────────────────────────────
function MaterialModal({ mode, material, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: material?.title || '',
    description: material?.description || '',
    subject: material?.subject || '',
    grade: material?.grade || '',
    tags: material?.tags?.join(', ') || '',
    status: material?.status || 'active',
    manualSubject: '',
  });
  const [showManualSubject, setShowManualSubject] = useState(material?.subject && !SUBJECT_OPTIONS.map(s => s.toLowerCase()).includes(material.subject.toLowerCase()));

  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'subject' && value === 'other') {
      setShowManualSubject(true);
    } else if (name === 'subject') {
      setShowManualSubject(false);
    }
    setForm(f => ({ ...f, [name]: value }));
  };


  const handleFileSelect = (f) => {
    if (!f) return;
    const allowed = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(f.type)) {
      setError('File type not allowed. Use PDF, DOC, DOCX, PPT, PPTX, TXT, or Image.');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5 MB.');
      return;
    }
    setError('');
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'create' && !file) { setError('Please select a file to upload.'); return; }
    if (!form.title.trim() || !form.subject.trim() || !form.grade.trim() || !form.description.trim()) {
      setError('Title, description, subject, and grade are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      
      const finalSubject = (form.subject === 'other' ? form.manualSubject : form.subject).trim().toLowerCase();
      fd.append('subject', finalSubject);
      
      fd.append('grade', form.grade.trim());
      fd.append('status', form.status);

      // Tags: parse comma-separated
      const tags = form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      tags.forEach(tag => fd.append('tags[]', tag));

      if (file) fd.append('file', file);

      if (mode === 'create') {
        await customFetch.post('/materials', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        onSuccess('Material uploaded successfully!');
      } else {
        await customFetch.patch(`/materials/${material._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        onSuccess('Material updated successfully!');
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.msg || 'Something went wrong.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900/40 p-2 rounded-xl">
              {mode === 'create' ? <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> : <Edit3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {mode === 'create' ? 'Upload Study Material' : 'Edit Study Material'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {mode === 'create' ? 'Add new learning resources for students' : 'Update material details'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* File Drop Zone */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragOver ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' :
              file ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/10' :
              'border-slate-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10'
            }`}

          >
            <input ref={fileRef} type="file" className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp"
              onChange={(e) => handleFileSelect(e.target.files[0])} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                {getFileIcon(file.name)}
                <div className="text-left">
                  <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">{file.name}</p>

                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="ml-auto p-1 hover:bg-red-100 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mode === 'edit' ? 'Drop new file to replace (optional)' : 'Drop file here or click to browse'}
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, PPT, PPTX, TXT, Images · Max 5 MB</p>
              </>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title" value={form.title} onChange={handleChange} required
              placeholder="Enter Title"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
            />

          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description" value={form.description} onChange={handleChange} required rows={3}
              placeholder="Briefly describe what this material covers..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 resize-none"
            />

          </div>

          {/* Subject + Grade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                name="subject" value={form.subject} onChange={handleChange} required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >

                <option value="">Select subject</option>
                {SUBJECT_OPTIONS.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
              </select>
            </div>
            {showManualSubject && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Add Subject <span className="text-red-500">*</span>
                </label>
                <input
                  name="manualSubject" value={form.manualSubject} onChange={handleChange} required
                  placeholder="Enter Subject Name"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                />
              </div>
            )}
            <div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Grade <span className="text-red-500">*</span>
              </label>
              <select
                name="grade" value={form.grade} onChange={handleChange} required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >

                <option value="">Select grade</option>
                {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Tags <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input
              name="tags" value={form.tags} onChange={handleChange}
              placeholder="e.g. algebra, equations, chapter3"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
            />

          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
            <select
              name="status" value={form.status} onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >

              <option value="active">Active – visible to students</option>
              <option value="pending">Pending – under review</option>
              <option value="archived">Archived – hidden</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'create' ? 'Upload Material' : 'Save Changes'}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ material, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-xl">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delete Material</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{material.title}"</span>?
        </p>
        <p className="text-xs text-gray-400 mb-6">
          This will permanently remove the file from Cloudinary and cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Material Card ────────────────────────────────────────────────────────────
function MaterialCard({ material, onEdit, onDelete, onDownload, onToggleStatus }) {
  const badge = getFileTypeBadge(material.fileUrl);

  const statusColors = {
    active: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };


  const isPublished = material.status === 'active';

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Top Accent */}
      <div className={`h-1.5 ${isPublished ? 'bg-gradient-to-r from-indigo-400 to-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`} />


      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="flex-shrink-0 p-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
              {getFileIcon(material.fileUrl)}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{material.title}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${badge.color}`}>{badge.label}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${statusColors[material.status] || statusColors.active}`}>
                  {material.status?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onToggleStatus(material)} title={isPublished ? 'Unpublish' : 'Publish'}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white">
              {isPublished ? <X className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            </button>
            <button onClick={() => onEdit(material)} title="Edit"
              className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors text-gray-500 hover:text-indigo-600">
              <Edit3 className="w-4 h-4" />
            </button>

            <button onClick={() => onDelete(material)} title="Delete"
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors text-gray-500 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{material.description}</p>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3 flex-wrap">
          <span className="flex items-center gap-1">
            <BookMarked className="w-3 h-3" />
            {material.subject}
          </span>
          <span className="flex items-center gap-1">
            <GraduationCap className="w-3 h-3" />
            {material.grade}
          </span>
        </div>

        {/* Tags */}
        {material.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {material.tags.slice(0, 4).map(tag => (
              <span key={tag} className="flex items-center gap-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md">
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            {material.tags.length > 4 && (
              <span className="text-[10px] text-gray-400">+{material.tags.length - 4} more</span>
            )}
          </div>
        )}

        {/* Metrics + Download */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{material.metrics?.views ?? 0}</span>
            <span className="flex items-center gap-1"><Download className="w-3 h-3" />{material.metrics?.downloads ?? 0}</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{material.metrics?.likes ?? 0}</span>
          </div>
          <a
            href={material.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onDownload(material._id)}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <Download className="w-3 h-3" />
            Open
          </a>

        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudyMaterials({ user }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, total: 1, count: 0 });
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [modal, setModal] = useState(null); // null | { type: 'create'|'edit'|'delete', material? }
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const page = pagination.current;

  // Fetch my materials
  const fetchMaterials = async (pg = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 9 });
      if (search) params.set('keyword', search);
      if (filterSubject) params.set('subject', filterSubject);
      if (filterGrade) params.set('grade', filterGrade);
      if (filterStatus) params.set('status', filterStatus);

      const endpoint = user?.role === 'admin' ? '/materials' : '/materials/my';
      const { data } = await customFetch.get(`${endpoint}?${params}`);
      setMaterials(data.data || []);
      setPagination({
        current: data.pagination?.current || 1,
        total: data.pagination?.pages || 1,
        count: data.pagination?.total || 0,
      });

    } catch (err) {
      showToast('Failed to load materials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials(1);
  }, [filterSubject, filterGrade, filterStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMaterials(1);
  };

  const showToast = (message, type = 'success') => setToast({ message, type });
  const closeToast = () => setToast(null);

  const handleUploadSuccess = (msg) => {
    showToast(msg);
    fetchMaterials(1);
  };

  const handleDelete = async () => {
    if (!modal?.material) return;
    setDeleteLoading(true);
    try {
      await customFetch.delete(`/materials/${modal.material._id}`);
      showToast('Material deleted successfully.', 'delete');
      setModal(null);
      fetchMaterials(page);
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownload = async (id) => {
    try { await customFetch.post(`/materials/${id}/download`); } catch {}
  };

  const clearFilters = () => {
    setFilterSubject('');
    setFilterGrade('');
    setFilterStatus('');
    setSearch('');
  };

  const handleToggleStatus = async (material) => {
    try {
      const newStatus = material.status === 'active' ? 'archived' : 'active';
      const fd = new FormData();
      fd.append('status', newStatus);
      await customFetch.patch(`/materials/${material._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast(`Material ${newStatus === 'active' ? 'published' : 'unpublished'} successfully.`);
      fetchMaterials(page);
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const hasFilters = filterSubject || filterGrade || filterStatus || search;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            {user?.role === 'admin' ? 'Manage Study Materials' : 'My Study Materials'}
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {pagination.count} material{pagination.count !== 1 ? 's' : ''} uploaded
          </p>
        </div>
        <button
          onClick={() => setModal({ type: 'create' })}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Upload Material
        </button>

      </div>

      {/* Search + Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-slate-200 dark:border-gray-700 p-4 shadow-md">

        <div className="flex gap-3 flex-wrap">
          <form onSubmit={handleSearch} className="flex flex-1 min-w-[200px] gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, description, or tags..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
              />

            </div>
            <button type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors">
              Search
            </button>

          </form>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-700 dark:text-indigo-400'
              : 'border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
          </button>

        </div>

        {/* Filter Dropdowns */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-3">
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">

              <option value="">All Subjects</option>
              {SUBJECT_OPTIONS.map(s => <option key={s} value={s.toLowerCase()}>{s}</option>)}
            </select>
            <select value={filterGrade} onChange={e => setFilterGrade(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">

              <option value="">All Grades</option>
              {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">

              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="archived">Archived</option>
            </select>
            {hasFilters && (
              <button onClick={clearFilters}
                className="px-3 py-2 text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />

            <p className="text-sm text-gray-500 dark:text-gray-400">Loading materials...</p>
          </div>
        </div>
      ) : materials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl mb-4">
            <BookOpen className="w-12 h-12 text-indigo-400 mx-auto" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {hasFilters ? 'No materials found' : 'No materials yet'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
            {hasFilters
              ? 'Try adjusting your search or filters.'
              : user?.role === 'admin'
              ? 'No study materials have been uploaded by any tutor yet.'
              : 'Start sharing knowledge with your students by uploading your first study material.'}
          </p>
          {!hasFilters && (
            <button onClick={() => setModal({ type: 'create' })}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors">
              <Plus className="w-4 h-4" />
              Upload Your First Material
            </button>
          )}

        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {materials.map(m => (
              <MaterialCard
                key={m._id}
                material={m}
                onEdit={(mat) => setModal({ type: 'edit', material: mat })}
                onDelete={(mat) => setModal({ type: 'delete', material: mat })}
                onDownload={handleDownload}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
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

      {/* Modals */}
      {modal?.type === 'create' && (
        <MaterialModal mode="create" onClose={() => setModal(null)} onSuccess={handleUploadSuccess} />
      )}
      {modal?.type === 'edit' && (
        <MaterialModal mode="edit" material={modal.material} onClose={() => setModal(null)} onSuccess={handleUploadSuccess} />
      )}
      {modal?.type === 'delete' && (
        <DeleteModal
          material={modal.material}
          onClose={() => setModal(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}

      {/* Toast */}
      {toast && <Toast toast={toast} onClose={closeToast} />}
    </div>
  );
}
