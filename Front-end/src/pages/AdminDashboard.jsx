import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Trash2, 
  ExternalLink, 
  Search, 
  RefreshCw, 
  ShieldAlert, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalResumes: 0, avgAtsScore: 0 });
  const [users, setUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { _id, name/filename, type: 'user'|'result' }
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async (showIndicator = false) => {
    if (showIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');
    try {
      const [statsRes, usersRes, resultsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/results')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setResults(resultsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err.response?.data?.message || 'Failed to load admin data. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDeleteConfirm = (item, type) => {
    setDeleteConfirm({
      _id: item._id,
      name: type === 'user' ? item.name : item.resumeId?.filename || 'Untitled Resume',
      email: type === 'user' ? item.email : item.userId?.email || 'N/A',
      type
    });
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    setError('');
    try {
      if (deleteConfirm.type === 'user') {
        await api.delete(`/admin/users/${deleteConfirm._id}`);
        setSuccessMessage(`User "${deleteConfirm.name}" and all associated data deleted successfully.`);
      } else {
        await api.delete(`/admin/results/${deleteConfirm._id}`);
        setSuccessMessage(`Analysis result for "${deleteConfirm.name}" deleted successfully.`);
      }
      setDeleteConfirm(null);
      await fetchData(true);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Deletion failed. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter users or results based on search query
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredResults = results.filter(res => 
    res.resumeId?.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-slate-500 font-medium animate-pulse">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-primary" /> Admin Panel
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System overview, user accounts, and resume analysis audit log.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-2 mb-6">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-600 flex items-center gap-2 mb-6 shadow-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        {/* Users Card */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border hover-glow transition-all duration-300">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Users</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.totalUsers}</h3>
          </div>
          <div className="rounded-2xl bg-indigo-50 p-4 text-primary">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Resumes Card */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border hover-glow transition-all duration-300">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Resumes Analyzed</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.totalResumes}</h3>
          </div>
          <div className="rounded-2xl bg-sky-50 p-4 text-secondary">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        {/* ATS Score Card */}
        <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border hover-glow transition-all duration-300">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg ATS Score</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.avgAtsScore}%</h3>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Control Actions & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-200 pb-5">
        {/* Tabs switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-xl self-start">
          <button
            onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'users' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => { setActiveTab('results'); setSearchQuery(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'results' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Resumes ({results.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder={activeTab === 'users' ? "Search users by name or email..." : "Search resumes by file, user or email..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      {/* Main Lists Tables */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm border border-slate-200/60">
        {activeTab === 'users' ? (
          /* USERS TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-150">
              <thead className="bg-slate-50/75">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
                  <th scope="col" className="px-6 py-4 text-center scope text-xs font-semibold uppercase tracking-wider text-slate-500">Resumes Count</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Joined Date</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-sm text-slate-400 font-medium">
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-800">{user.name}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{user.email}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                          user.role === 'admin' 
                            ? 'bg-indigo-50 text-primary border border-indigo-100' 
                            : 'bg-slate-50 text-slate-500 border border-slate-100'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-center font-bold text-slate-700">{user.resumeCount}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-center">
                        <button
                          onClick={() => handleOpenDeleteConfirm(user, 'user')}
                          disabled={user.role === 'admin'}
                          className={`inline-flex items-center gap-1 text-red-500 hover:text-red-700 font-semibold text-xs cursor-pointer transition-colors ${
                            user.role === 'admin' ? 'opacity-40 cursor-not-allowed' : ''
                          }`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete User
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* RESUMES TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-150">
              <thead className="bg-slate-50/75">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">File Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Uploaded By</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">ATS Score</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Analyzed Date</th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-sm text-slate-400 font-medium">
                      No resume analysis results found.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((res) => (
                    <tr key={res._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          {res.resumeId?.filename || 'Untitled Resume'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700">{res.userId?.name || 'N/A'}</span>
                          <span className="text-xs text-slate-400">{res.userId?.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-center">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          res.atsScore >= 80 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : res.atsScore >= 60 
                            ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                            : 'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {res.atsScore}%
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                          {formatDate(res.createdAt)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-center flex items-center justify-center gap-4">
                        <Link
                          to={`/result/${res._id}`}
                          className="inline-flex items-center gap-1 text-primary hover:text-indigo-800 font-semibold text-xs transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View Report
                        </Link>
                        <button
                          onClick={() => handleOpenDeleteConfirm(res, 'result')}
                          className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 font-semibold text-xs cursor-pointer transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 shadow-2xl relative bg-white">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
                <ShieldAlert className="h-6 w-6" />
              </div>
              
              <h3 className="text-lg font-bold text-slate-900">
                Confirm {deleteConfirm.type === 'user' ? 'User' : 'Result'} Deletion
              </h3>
              
              <p className="text-sm text-slate-500 mt-2">
                Are you sure you want to delete {deleteConfirm.type === 'user' ? `user "${deleteConfirm.name}"` : `the analysis result for "${deleteConfirm.name}"`}?
              </p>
              
              {deleteConfirm.type === 'user' && (
                <p className="text-xs text-red-500 font-semibold mt-2 bg-red-50 p-2.5 rounded-lg border border-red-100">
                  Warning: Deleting this user will also delete all of their uploaded resumes and generated reports. This action cannot be undone.
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {deleteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Delete Permanently'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
