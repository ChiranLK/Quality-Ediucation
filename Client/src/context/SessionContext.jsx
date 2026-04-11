/**
 * SessionContext.jsx
 *
 * Centralises ALL tutoring-session state and API calls.
 * - Tutors: create / update / delete their own sessions (`mySessions`)
 * - Students: browse all sessions (`sessions`), join/leave, view enrolled (`enrolledSessions`)
 * - Both: view session details
 *
 * Usage:
 *   const { sessions, loading, fetchSessions, createSession, joinSession, ... } = useSession();
 */
import { createContext, useContext, useState, useCallback } from 'react';
import customFetch from '../utils/customfetch';

const SessionContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function SessionProvider({ children }) {
  // ── State ─────────────────────────────────────────────────────────────────
  /** All public sessions (student browse view) */
  const [sessions, setSessions] = useState([]);
  /** Tutor's own created sessions */
  const [mySessions, setMySessions] = useState([]);
  /** Student's enrolled sessions */
  const [enrolledSessions, setEnrolledSessions] = useState([]);

  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [pagination, setPagination]   = useState({ current: 1, total: 1, count: 0 });

  // ── Helper ────────────────────────────────────────────────────────────────
  const buildParams = (filters = {}) => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== '' && v !== undefined && v !== null) p.set(k, v);
    });
    return p;
  };

  // ── Fetch all sessions (public, for students) ─────────────────────────────
  /**
   * @param {object} filters  subject, grade, level, page, limit, keyword
   */
  const fetchSessions = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = buildParams({ limit: 9, ...filters });
      const { data } = await customFetch.get(`/tutoring-sessions?${params}`);
      // Backend returns { sessions: [...] } or { data: [...] }
      const list = data.sessions || data.data || [];
      setSessions(list);
      setPagination({
        current: data.pagination?.current || 1,
        total:   data.pagination?.pages   || 1,
        count:   data.pagination?.total   || list.length,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch tutor's own sessions ────────────────────────────────────────────
  /**
   * @param {string} tutorId  the logged-in tutor's _id
   */
  const fetchMySessions = useCallback(async (tutorId) => {
    if (!tutorId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await customFetch.get(`/tutoring-sessions/tutor/${tutorId}`);
      setMySessions(data.sessions || data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch enrolled sessions (student) ─────────────────────────────────────
  const fetchEnrolledSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await customFetch.get('/tutoring-sessions/my-enrolled');
      setEnrolledSessions(data.sessions || data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load enrolled sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Create session (tutor only) ───────────────────────────────────────────
  /**
   * @param {object} sessionData  Validated form payload
   * @returns {object} created session
   */
  const createSession = useCallback(async (sessionData) => {
    const { data } = await customFetch.post('/tutoring-sessions', sessionData);
    const created = data.session || data.data;
    setMySessions((prev) => [created, ...prev]);
    return created;
  }, []);

  // ── Update session (tutor only) ───────────────────────────────────────────
  /**
   * @param {string} id
   * @param {object} sessionData
   */
  const updateSession = useCallback(async (id, sessionData) => {
    const { data } = await customFetch.put(`/tutoring-sessions/${id}`, sessionData);
    const updated = data.session || data.data;
    setMySessions((prev) => prev.map((s) => (s._id === id ? updated : s)));
    return updated;
  }, []);

  // ── Delete session (tutor only) ───────────────────────────────────────────
  /**
   * @param {string} id
   */
  const deleteSession = useCallback(async (id) => {
    await customFetch.delete(`/tutoring-sessions/${id}`);
    setMySessions((prev)  => prev.filter((s) => s._id !== id));
    setSessions((prev)    => prev.filter((s) => s._id !== id));
  }, []);

  // ── Join session (student) ────────────────────────────────────────────────
  /**
   * @param {string} id  session _id
   */
  const joinSession = useCallback(async (id) => {
    const { data } = await customFetch.post(`/tutoring-sessions/${id}/join`);
    const currentEnrolled = data.currentEnrolled ?? data?.session?.capacity?.currentEnrolled;
    setSessions((prev) =>
      prev.map((s) =>
        s._id === id
          ? {
              ...s,
              capacity: {
                ...s.capacity,
                currentEnrolled: currentEnrolled ?? s.capacity?.currentEnrolled,
              },
            }
          : s
      )
    );
    return data;
  }, []);

  // ── Leave session (student) ───────────────────────────────────────────────
  /**
   * @param {string} id  session _id
   */
  const leaveSession = useCallback(async (id) => {
    const { data } = await customFetch.post(`/tutoring-sessions/${id}/leave`);
    const currentEnrolled = data.currentEnrolled ?? data?.session?.capacity?.currentEnrolled;
    setSessions((prev) =>
      prev.map((s) =>
        s._id === id
          ? {
              ...s,
              capacity: {
                ...s.capacity,
                currentEnrolled: currentEnrolled ?? s.capacity?.currentEnrolled,
              },
            }
          : s
      )
    );
    setEnrolledSessions((prev) => prev.filter((s) => s._id !== id));
    return data;
  }, []);

  // ── Context value ─────────────────────────────────────────────────────────
  const value = {
    sessions,
    mySessions,
    enrolledSessions,
    loading,
    error,
    pagination,
    setError,
    fetchSessions,
    fetchMySessions,
    fetchEnrolledSessions,
    createSession,
    updateSession,
    deleteSession,
    joinSession,
    leaveSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
/**
 * useSession — access SessionContext.
 * Must be called inside <SessionProvider>.
 */
export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}

export default SessionContext;
