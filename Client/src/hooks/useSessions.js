// src/hooks/useSessions.js
import { useState, useEffect } from 'react';
import { sessionService } from '../services/sessionService';

export const useSessions = (tutorId) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch sessions
  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sessionService.getSessions(tutorId);
      setSessions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create session
  const createSession = async (sessionData) => {
    try {
      const newSession = await sessionService.createSession(sessionData);
      setSessions(prev => [...prev, newSession]);
      return newSession;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update session
  const updateSession = async (sessionId, sessionData) => {
    try {
      const updatedSession = await sessionService.updateSession(sessionId, sessionData);
      setSessions(prev => prev.map(session =>
        session.id === sessionId ? updatedSession : session
      ));
      return updatedSession;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete session
  const deleteSession = async (sessionId) => {
    try {
      await sessionService.deleteSession(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (tutorId) {
      fetchSessions();
    }
  }, [tutorId]);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
  };
};