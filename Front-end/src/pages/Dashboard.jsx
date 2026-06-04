import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ResumeCard from '../components/ResumeCard';
import { UploadCloud, BarChart3, Trophy, Sparkles, FileText, Search, Loader2, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    bestScore: 0,
    improvement: 0,
  });

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/resume/all');
      const data = response.data;
      setResumes(data);
      setFilteredResumes(data);
      calculateStats(data);
      setError('');
    } catch (err) {
      console.error('Error fetching resume history:', err);
      setError('Could not load history. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    if (!data || data.length === 0) {
      setStats({ total: 0, bestScore: 0, improvement: 0 });
      return;
    }

    const total = data.length;
    const scores = data.map((r) => r.atsScore);
    const bestScore = Math.max(...scores);

    // Calculate score growth: latest score minus oldest score
    let improvement = 0;
    if (total > 1) {
      const latestScore = data[0].atsScore; // Sorted by createdAt -1 (latest first)
      const oldestScore = data[total - 1].atsScore;
      improvement = latestScore - oldestScore;
    }

    setStats({ total, bestScore, improvement });
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // Filter resumes when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredResumes(resumes);
    } else {
      const filtered = resumes.filter((r) =>
        (r.resumeId?.filename || 'Untitled Resume')
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
      setFilteredResumes(filtered);
    }
  }, [searchQuery, resumes]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this analysis report from your history?')) {
      return;
    }

    try {
      await api.delete(`/resume/${id}`);
      // Remove from state
      const updated = resumes.filter((r) => r._id !== id);
      setResumes(updated);
      calculateStats(updated);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete report. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-dark-bg py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Your Dashboard</h1>
            <p className="text-slate-400 mt-1">Manage and track your ATS optimization reports</p>
          </div>
          <Link
            to="/upload"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:opacity-95 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload New Resume</span>
          </Link>
        </div>

        {error && (
          <div className="mb-8 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>{error}</span>
            </div>
            <button onClick={fetchResumes} className="flex items-center gap-1 text-xs text-red-300 hover:underline">
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-10">
          {/* Stat 1: Total Analyses */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 relative overflow-hidden flex items-center gap-4">
            <div className="rounded-xl bg-primary/10 text-primary p-3">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Total Analyses</span>
              <span className="text-2xl font-bold text-white mt-1">{loading ? '...' : stats.total}</span>
            </div>
          </div>

          {/* Stat 2: Best Score */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 relative overflow-hidden flex items-center gap-4">
            <div className="rounded-xl bg-amber-500/10 text-amber-400 p-3">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Best Score</span>
              <span className="text-2xl font-bold text-white mt-1">
                {loading ? '...' : stats.total > 0 ? `${stats.bestScore}/100` : '—'}
              </span>
            </div>
          </div>

          {/* Stat 3: Score Improvement */}
          <div className="glass-panel rounded-2xl p-6 border border-white/5 relative overflow-hidden flex items-center gap-4">
            <div className="rounded-xl bg-secondary/10 text-secondary p-3">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Score Growth</span>
              <span className={`text-2xl font-bold mt-1 ${stats.improvement > 0 ? 'text-emerald-400' : stats.improvement < 0 ? 'text-rose-400' : 'text-white'}`}>
                {loading ? '...' : stats.total > 1 ? (stats.improvement >= 0 ? `+${stats.improvement} pts` : `${stats.improvement} pts`) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* History Search & Layout */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-100 self-start sm:self-center">Analysis History</h2>
          
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search resumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:border-primary focus:bg-white/10 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Cards Grid / Empty States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-slate-400 mt-4 text-sm">Loading your resume logs...</p>
          </div>
        ) : filteredResumes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResumes.map((result) => (
              <ResumeCard key={result._id} result={result} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="glass-panel border border-white/5 border-dashed rounded-2xl p-16 text-center">
            <div className="mx-auto w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 mb-6">
              <UploadCloud className="h-8 w-8" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-200">No resumes analyzed yet</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mt-2 mb-8">
              {searchQuery ? 'No resumes match your search query. Try typing something else.' : 'Upload your resume in PDF format to receive instant feedback, missing technical keywords, and optimization guidelines.'}
            </p>
            
            {!searchQuery && (
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-3 text-sm font-semibold text-white shadow-md hover:opacity-95 transition-all"
              >
                <span>Upload First Resume</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
