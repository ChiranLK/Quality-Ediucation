import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, MapPin, Search, Filter, User, BookOpen, AlertCircle, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { authAPI } from '../services/api';
import axios from 'axios';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    location: '',
    role: 'user',
    subjects: '',
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminAuthToken');
      const tutorToken = sessionStorage.getItem('tutorAuthToken');
      const userToken = localStorage.getItem('userAuthToken');
      
      try {
        const response = await authAPI.getAllUsers();
        const userData = response.data.users || [];
        setUsers(userData);
        setFilteredUsers(userData);
        return;
      } catch (axiosError) {
        const token = userToken || adminToken || tutorToken;
        if (!token) throw new Error('No token available');
        
        const fetchResponse = await fetch('http://localhost:5000/api/auth/all-users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!fetchResponse.ok) throw new Error(`HTTP ${fetchResponse.status}`);
        
        const data = await fetchResponse.json();
        const userData = data.users || data;
        setUsers(userData);
        setFilteredUsers(userData);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingUser(null);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      phoneNumber: '',
      location: '',
      role: 'user',
      subjects: '',
    });
    setFormError('');
    setFormSuccess('');
    setShowCreateModal(true);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: '',
      phoneNumber: user.phoneNumber,
      location: user.location,
      role: user.role,
      subjects: user.tutorProfile?.subjects?.join(', ') || '',
    });
    setFormError('');
    setFormSuccess('');
    setShowCreateModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveUser = async () => {
    setFormError('');
    setFormSuccess('');

    if (!formData.fullName.trim()) {
      setFormError('Full name is required');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return;
    }
    if (!editingUser && !formData.password.trim()) {
      setFormError('Password is required for new users');
      return;
    }

    try {
      const token = localStorage.getItem('adminAuthToken');
      
      if (editingUser) {
        const updateData = {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          location: formData.location,
        };
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }
        if (formData.role === 'tutor' && formData.subjects.trim()) {
          updateData.tutorProfile = {
            subjects: formData.subjects.split(',').map(s => s.trim().toLowerCase()),
          };
        }

        await axios.put(`http://localhost:5000/api/auth/profile`, updateData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setFormSuccess('User updated successfully');
        setUsers(users.map(u => u._id === editingUser._id ? { ...u, ...updateData, fullName: formData.fullName, phoneNumber: formData.phoneNumber, location: formData.location } : u));
      } else {
        const createData = {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          location: formData.location,
          role: formData.role,
        };
        if (formData.role === 'tutor' && formData.subjects.trim()) {
          createData.subjects = formData.subjects.split(',').map(s => s.trim().toLowerCase());
        }

        await axios.post(`http://localhost:5000/api/auth/register`, createData);
        setFormSuccess('User created successfully');
        await fetchUsers();
      }

      setTimeout(() => {
        setShowCreateModal(false);
      }, 1500);
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMsg = error.response?.data?.msg || error.message || 'Failed to save user';
      setFormError(errorMsg);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('adminAuthToken');
      
      await axios.delete(`http://localhost:5000/api/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('User deleted successfully');
      setUsers(users.filter(u => u._id !== userId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  // Filter and search users
  useEffect(() => {
    let filtered = users;

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Search by name or email
    if (searchTerm.trim()) {
      filtered = filtered.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'tutor':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'tutor':
        return <BookOpen className="w-4 h-4 inline mr-1" />;
      case 'admin':
        return <Users className="w-4 h-4 inline mr-1" />;
      default:
        return <User className="w-4 h-4 inline mr-1" />;
    }
  };

  const getRoleLabel = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            Manage Users
          </h2>
          <p className="text-gray-600">
            Total Users: <span className="font-semibold">{users.length}</span>
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search Users
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="user">Students</option>
              <option value="tutor">Tutors</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Joined</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => (
                  <tr key={user._id} className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {user.fullName?.charAt(0)?.toUpperCase()}
                        </div>
                        <p className="font-semibold text-gray-800">{user.fullName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-gray-600">{user.phoneNumber || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="Edit user"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'user').length}</p>
            </div>
            <User className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tutors</p>
              <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'tutor').length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Admins</p>
              <p className="text-2xl font-bold text-gray-800">{users.filter(u => u.role === 'admin').length}</p>
            </div>
            <Users className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                  {formSuccess}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="john@example.com"
                  disabled={editingUser}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {editingUser && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleFormChange}
                  placeholder="0701234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  placeholder="Colombo, Sri Lanka"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">Student</option>
                  <option value="tutor">Tutor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {formData.role === 'tutor' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subjects (comma-separated)</label>
                  <input
                    type="text"
                    name="subjects"
                    value={formData.subjects}
                    onChange={handleFormChange}
                    placeholder="Mathematics, Physics, Chemistry"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <div className="text-center mb-4">
                <Trash2 className="w-12 h-12 text-red-600 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-gray-800">Delete User?</h3>
                <p className="text-gray-600 mt-2">
                  Are you sure you want to delete <strong>{deleteConfirm.fullName}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm._id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

