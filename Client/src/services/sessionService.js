// src/services/sessionService.js
import customFetch from '../utils/customfetch';

export const sessionService = {
  // Get all sessions for the tutor
  async getSessions(tutorId) {
    try {
      const response = await customFetch(`/api/tutors/${tutorId}/sessions`);
      return response;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  },

  // Create a new session
  async createSession(sessionData) {
    try {
      const response = await customFetch('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });
      return response;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  // Update a session
  async updateSession(sessionId, sessionData) {
    try {
      const response = await customFetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify(sessionData),
      });
      return response;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },

  // Delete a session
  async deleteSession(sessionId) {
    try {
      const response = await customFetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  // Get session details
  async getSessionDetails(sessionId) {
    try {
      const response = await customFetch(`/api/sessions/${sessionId}`);
      return response;
    } catch (error) {
      console.error('Error fetching session details:', error);
      throw error;
    }
  },
};