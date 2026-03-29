import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, MapPin, Search, AlertCircle, Calendar, X, TrendingUp, Target, CheckCircle } from 'lucide-react';
import { tutorsAPI, progressAPI } from '../services/api';
import axios from 'axios';

export default function MyStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tutor, setTutor] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProgress, setStudentProgress] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Get tutor ID from sessionStorage
      const tutorData = JSON.parse(sessionStorage.getItem('tutorProfileData'));
      console.log('[MyStudents] tutorProfileData:', tutorData);
      
      if (!tutorData || !tutorData._id) {
        throw new Error('Tutor profile data not found in sessionStorage');
      }

      setTutor(tutorData);

      try {
        console.log('[MyStudents] Attempting API call to fetch students...');
        const response = await tutorsAPI.getTutorStudents(tutorData._id);
        console.log('Students fetched:', response.data);
        setStudents(response.data.students || []);
        setFilteredStudents(response.data.students || []);
        return;
      } catch (axiosError) {
        console.error('[MyStudents] API call failed, trying fallback:', {
          status: axiosError.response?.status,
          message: axiosError.message,
          data: axiosError.response?.data
        });
        
        // Fallback: Use fetch directly with explicit token
        const tutorToken = sessionStorage.getItem('tutorAuthToken');
        const adminToken = localStorage.getItem('adminAuthToken');
        const token = tutorToken || adminToken;
        
        console.log('[MyStudents] Token check:', {
          hasTutorToken: !!tutorToken,
          hasAdminToken: !!adminToken,
          selectedToken: !!token,
          tokenPreview: token ? token.substring(0, 20) + '...' : 'NONE'
        });
        
        if (!token) throw new Error('No tutor or admin token available in storage');
        
        const fetchResponse = await fetch(`http://localhost:5000/api/tutors/${tutorData._id}/my-students`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!fetchResponse.ok) {
          throw new Error(`HTTP ${fetchResponse.status}: ${fetchResponse.statusText}`);
        }
        
        const data = await fetchResponse.json();
        const studentList = data.students || data;
        setStudents(studentList);
        setFilteredStudents(studentList);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      alert(`Failed to fetch students: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter students by search term
  useEffect(() => {
    let filtered = students;

    if (searchTerm.trim()) {
      filtered = filtered.filter(student =>
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const fetchStudentProgress = async (studentId) => {
    try {
      setProgressLoading(true);
      const response = await progressAPI.getProgressByStudent(studentId);
      console.log('Student progress fetched:', response.data);
      setStudentProgress(response.data.progress || []);
    } catch (error) {
      console.error('Failed to fetch student progress:', error);
      // Try fallback with axios
      try {
        const tutorToken = sessionStorage.getItem('tutorAuthToken');
        const adminToken = localStorage.getItem('adminAuthToken');
        const token = tutorToken || adminToken;
        
        if (token) {
          const response = await axios.get(`http://localhost:5000/api/progress/student/${studentId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setStudentProgress(response.data.progress || []);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setStudentProgress([]);
      }
    } finally {
      setProgressLoading(false);
    }
  };

  const handleViewProgress = (student) => {
    setSelectedStudent(student);
    fetchStudentProgress(student._id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-blue-600" />
          My Students
        </h2>
        <p className="text-gray-600">
          Total Students: <span className="font-semibold">{students.length}</span>
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or email..."
          className="input"
        />
      </div>

      {/* Students Grid */}
      <div>
        {filteredStudents.length === 0 ? (
          <div className="card text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              {searchTerm ? 'No students found matching your search' : 'No students yet'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Students will appear here once they give you feedback
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div key={student._id} className="card hover:shadow-lg transition-shadow">
                {/* Avatar and Name */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    {student.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg">{student.fullName}</h3>
                    <p className="text-xs text-gray-600">Student</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a href={`mailto:${student.email}`} className="text-blue-600 hover:text-blue-800 break-all">
                      {student.email}
                    </a>
                  </div>

                  {student.phoneNumber && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a href={`tel:${student.phoneNumber}`} className="text-gray-700 hover:text-blue-600">
                        {student.phoneNumber}
                      </a>
                    </div>
                  )}

                  {student.location && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700">{student.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600">
                      Joined {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => handleViewProgress(student)}
                  className="w-full mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                >
                  View Progress
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <div className="text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-gray-800">{students.length}</p>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Active This Month</p>
              <p className="text-3xl font-bold text-gray-800">
                {students.filter(s => {
                  if (!s.createdAt) return false;
                  const lastMonth = new Date();
                  lastMonth.setMonth(lastMonth.getMonth() - 1);
                  return new Date(s.createdAt) > lastMonth;
                }).length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {selectedStudent.fullName}'s Progress
                </h3>
                <p className="text-sm text-gray-600 mt-1">{selectedStudent.email}</p>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {progressLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="spinner w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4" />
                    <p className="text-gray-600">Loading progress...</p>
                  </div>
                </div>
              ) : studentProgress.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No progress recorded yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentProgress.map((prog) => (
                    <div key={prog._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">{prog.topic}</h4>
                          {prog.tutorId && (
                            <p className="text-sm text-gray-600">
                              Tutor: {typeof prog.tutorId === 'object' ? prog.tutorId.fullName : 'Loading...'}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{prog.completionPercent}%</div>
                          <p className="text-xs text-gray-600">Complete</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${prog.completionPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Status and Date */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {prog.completionPercent === 100 ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-green-600 font-medium">Completed</span>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                              <span className="text-blue-600 font-medium">In Progress</span>
                            </>
                          )}
                        </div>
                        <span className="text-gray-600">
                          {prog.updatedAt ? new Date(prog.updatedAt).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>

                      {/* Notes */}
                      {prog.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{prog.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Summary Stats */}
              {studentProgress.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Total Topics</p>
                      <p className="text-2xl font-bold text-gray-800">{studentProgress.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Completed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {studentProgress.filter(p => p.completionPercent === 100).length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">Avg Progress</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {Math.round(studentProgress.reduce((sum, p) => sum + p.completionPercent, 0) / studentProgress.length)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
