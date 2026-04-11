/**
 * BrowseSessions.jsx
 *
 * Student-facing page to browse, filter, join, and leave tutoring sessions.
 * Uses SessionContext for all API interactions.
 *
 * Features:
 * - Browse all available sessions with subject / grade / level filters
 * - Join / Leave session with live UI feedback
 * - "My Enrolled Sessions" tab
 * - Loading skeleton & empty states
 */
import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, Users, BookOpen, Search, Filter,
  GraduationCap, LogIn, LogOut as LeaveIcon, RefreshCw,
  ChevronLeft, ChevronRight, Tag, User, Loader2, X,
  // ADD THIS
  Link as LinkIcon, Video
} from 'lucide-react';
import { useSession } from '../../../context/SessionContext';

// ── Constants ──────────────────────────────────────────────────────────────────
const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
  'Sinhala', 'History', 'Geography', 'Science', 'ICT',
  'Economics', 'Business Studies', 'Art', 'Music',
];

const GRADE_OPTIONS = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12', 'O/L', 'A/L', 'University',
];

const LEVEL_OPTIONS = ['beginner', 'intermediate', 'advanced'];

const LEVEL_BADGE = {
  beginner:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium animate-in slide-in-from-bottom-4 duration-300 ${
      type === 'success' ? 'bg-indigo-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {message}
      <button onClick={onClose}><X className="w-4 h-4 opacity-70 hover:opacity-100" /></button>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
// ADD THIS — check if current time is within the session window
function isSessionActive(session) {
  if (!session.schedule?.date || !session.schedule?.startTime || !session.schedule?.endTime) {
    return false;
  }
  const dateStr = new Date(session.schedule.date).toISOString().split('T')[0]; // YYYY-MM-DD
  const start = new Date(`${dateStr}T${session.schedule.startTime}:00`);
  const end   = new Date(`${dateStr}T${session.schedule.endTime}:00`);
  const now   = new Date();
  return now >= start && now <= end;
}

// ADD THIS — check if session has already ended
function isSessionEnded(session) {
  if (!session.schedule?.date || !session.schedule?.endTime) return false;
  const dateStr = new Date(session.schedule.date).toISOString().split('T')[0];
  const end = new Date(`${dateStr}T${session.schedule.endTime}:00`);
  return new Date() > end;
}

// ── Session Card ──────────────────────────────────────────────────────────────
function SessionCard({ session, userId, onJoin, onLeave, onOpenMeet, actionLoading }) {
  const isEnrolled = session.students?.some(
    (s) => (s._id || s) === userId
  );
  const isFull = session.capacity?.enrolled >= session.capacity?.maxParticipants;
  const isLoading = actionLoading === session._id;
  // ADD THIS — derive meet link from nested location object
  const meetLink = session.location?.meetingLink;

  const formattedDate = session.schedule?.date
    ? new Date(session.schedule.date).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
      })
    : 'TBD';

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Top accent */}
      <div className="h-1.5 bg-gradient-to-r from-indigo-400 to-blue-500" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{session.title}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {session.level && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${LEVEL_BADGE[session.level] || LEVEL_BADGE.beginner}`}>
                  {session.level.toUpperCase()}
                </span>
              )}
              {session.grade && (
                <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-md font-medium">
                  {session.grade}
                </span>
              )}
              {isEnrolled && (
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-md font-bold">
                  ENROLLED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
          {session.description}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span className="capitalize">{session.subject}</span>
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </span>
          {session.schedule?.startTime && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {session.schedule.startTime} – {session.schedule.endTime}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {session.capacity?.enrolled ?? 0}/{session.capacity?.maxParticipants ?? '?'}
          </span>
          {session.tutorId?.fullName && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {session.tutorId.fullName}
            </span>
          )}
          {/* ADD THIS — show Meet link indicator if present */}
          {meetLink && (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <Video className="w-3 h-3" />
              Online
            </span>
          )}
        </div>

        {/* Tags */}
        {session.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {session.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="flex items-center gap-0.5 text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-md">
                <Tag className="w-2.5 h-2.5" /> {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
          {isEnrolled ? (
            <>
              {/* ADD THIS — open Meet link with time-gate check */}
              {meetLink && (
                <button
                  onClick={() => onOpenMeet(session)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  Join Google Meet
                </button>
              )}
              <button
                onClick={() => onLeave(session._id)}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LeaveIcon className="w-3.5 h-3.5" />}
                Leave Session
              </button>
            </>
          ) : (
            <button
              onClick={() => onJoin(session._id)}
              disabled={isLoading || isFull}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
              {isFull ? 'Session Full' : 'Join Session'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BrowseSessions({ user }) {
  const {
    sessions, enrolledSessions, loading, pagination,
    fetchSessions, fetchEnrolledSessions, joinSession, leaveSession,
  } = useSession();

  // ── Local filter / tab state ───────────────────────────────────────────────
  const [tab, setTab]                   = useState('browse');   // 'browse' | 'enrolled'
  const [search, setSearch]             = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterGrade, setFilterGrade]   = useState(user?.grade || '');
  const [filterLevel, setFilterLevel]   = useState('');
  const [showFilters, setShowFilters]   = useState(false);
  const [actionLoading, setActionLoading] = useState(null);    // id of session being joined/left
  const [toast, setToast]               = useState(null);

  const page = pagination.current;

  // ── Load on mount and when filters change ─────────────────────────────────
  useEffect(() => {
    fetchSessions({
      page: 1,
      keyword:  search,
      subject:  filterSubject,
      grade:    filterGrade,
      level:    filterLevel,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterSubject, filterGrade, filterLevel]);

  useEffect(() => {
    fetchEnrolledSessions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    fetchSessions({ page: 1, keyword: search, subject: filterSubject, grade: filterGrade, level: filterLevel });
  };

  // UPDATE THIS — opens meetingLink directly, no time-window check on student side
  const handleJoin = async (id) => {
    setActionLoading(id);
    try {
      await joinSession(id);
      await fetchEnrolledSessions();
      setToast({ message: 'Joined session successfully!', type: 'success' });
      // Refresh list to update capacity
      fetchSessions({ page, keyword: search, subject: filterSubject, grade: filterGrade, level: filterLevel });

      // UPDATE THIS — removed time validation; open link directly
      const session = sessions.find((s) => s._id === id);
      if (session) {
        const meetLink = session.meetingLink || session.location?.meetingLink;
        if (!meetLink) {
          // ADD THIS — guard: no link stored
          alert('Meeting link not available.');
        } else {
          // REMOVE THIS (was: time-gate checks) — open immediately
          window.open(meetLink, '_blank', 'noopener,noreferrer');
        }
      }
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to join session.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  // ADD THIS — time-gated Meet link handler
  const handleOpenMeet = (session) => {
    const meetLink = session.location?.meetingLink;
    if (!meetLink) return;

    if (isSessionEnded(session)) {
      alert('This session has already ended.');
      return;
    }
    if (!isSessionActive(session)) {
      alert(
        `Session hasn't started yet. It begins at ${session.schedule?.startTime} on ` +
        new Date(session.schedule?.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) +
        '.'
      );
      return;
    }
    window.open(meetLink, '_blank', 'noopener,noreferrer');
  };

  const handleLeave = async (id) => {
    setActionLoading(id);
    try {
      await leaveSession(id);
      await fetchEnrolledSessions();
      setToast({ message: 'Left session.', type: 'success' });
      fetchSessions({ page, keyword: search, subject: filterSubject, grade: filterGrade, level: filterLevel });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to leave session.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const clearFilters = () => {
    setFilterSubject('');
    setFilterGrade('');
    setFilterLevel('');
    setSearch('');
  };

  const hasFilters = filterSubject || filterGrade || filterLevel || search;
  const userId = user?._id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-600" />
          Tutoring Sessions
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Browse available sessions and join to start learning.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {['browse', 'enrolled'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === t
                ? 'bg-white dark:bg-gray-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t === 'browse' ? `Browse (${sessions.length})` : `My Sessions (${enrolledSessions.length})`}
          </button>
        ))}
      </div>

      {/* ── Browse Tab ── */}
      {tab === 'browse' && (
        <>
          {/* Search + Filter bar */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex gap-3 flex-wrap">
              <form onSubmit={handleSearch} className="flex flex-1 min-w-[200px] gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search sessions by title, subject or tutor..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400"
                  />
                </div>
                <button type="submit" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors">
                  Search
                </button>
              </form>

              <button
                onClick={() => setShowFilters((f) => !f)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  showFilters
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-700 dark:text-indigo-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
              </button>

              <button
                onClick={() => fetchSessions({ page: 1, keyword: search, subject: filterSubject, grade: filterGrade, level: filterLevel })}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {showFilters && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-3">
                <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">All Subjects</option>
                  {SUBJECT_OPTIONS.map((s) => <option key={s} value={s.toLowerCase()}>{s}</option>)}
                </select>

                <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">All Grades</option>
                  {GRADE_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>

                <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">All Levels</option>
                  {LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>

                {hasFilters && (
                  <button onClick={clearFilters} className="px-3 py-2 text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Clear All
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Session grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading sessions...</p>
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl mb-4">
                <Calendar className="w-12 h-12 text-indigo-400 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {hasFilters ? 'No sessions match your filters' : 'No sessions available'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                {hasFilters ? 'Try adjusting your filters.' : 'Check back soon as tutors add new sessions.'}
              </p>
              {hasFilters && (
                <button onClick={clearFilters} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium text-sm transition-colors">
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sessions.map((s) => (
                  <SessionCard
                    key={s._id}
                    session={s}
                    userId={userId}
                    onJoin={handleJoin}
                    onLeave={handleLeave}
                    onOpenMeet={handleOpenMeet}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.total > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => fetchSessions({ page: page - 1, keyword: search, subject: filterSubject, grade: filterGrade, level: filterLevel })}
                    disabled={page <= 1}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 px-3">
                    Page <span className="font-semibold text-gray-900 dark:text-white">{page}</span> of {pagination.total}
                  </span>
                  <button
                    onClick={() => fetchSessions({ page: page + 1, keyword: search, subject: filterSubject, grade: filterGrade, level: filterLevel })}
                    disabled={page >= pagination.total}
                    className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── Enrolled Tab ── */}
      {tab === 'enrolled' && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
          ) : enrolledSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl mb-4">
                <GraduationCap className="w-12 h-12 text-indigo-400 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No enrolled sessions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                Browse available sessions and join ones that interest you.
              </p>
              <button onClick={() => setTab('browse')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors">
                Browse Sessions
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrolledSessions.map((s) => (
                <SessionCard
                  key={s._id}
                  session={s}
                  userId={userId}
                  onJoin={handleJoin}
                  onLeave={handleLeave}
                  onOpenMeet={handleOpenMeet}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Toast notification */}
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
