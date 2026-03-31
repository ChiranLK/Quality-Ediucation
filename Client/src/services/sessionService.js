// src/services/sessionService.js
import customFetch from '../utils/customfetch';

export const sessionService = {
  // Get all sessions for the tutor
  async getSessions(tutorId) {
    try {
      const response = await customFetch(`/tutoring-sessions?tutorId=${tutorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  },

  // Create a new session
  async createSession(sessionData) {
    try {
      const response = await customFetch.post('/tutoring-sessions', sessionData);
      return response.data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  // Update a session
  async updateSession(sessionId, sessionData) {
    try {
      const response = await customFetch.put(`/tutoring-sessions/${sessionId}`, sessionData);
      return response.data;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },

  // Delete a session
  async deleteSession(sessionId) {
    try {
      const response = await customFetch.delete(`/tutoring-sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  // Get session details
  async getSessionDetails(sessionId) {
    try {
      const response = await customFetch(`/tutoring-sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching session details:', error);
      throw error;
    }
  },
};