import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ScoreCircle from '../components/ScoreCircle';
import { Check, X, ArrowRight, Printer, RefreshCw, ChevronLeft, AlertCircle, Sparkles, Loader2, ListTodo, KeyRound, Lightbulb, Compass } from 'lucide-react';

const Result = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResult = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/resume/result/${id}`);
      setResult(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching result details:', err);
      setError(err.response?.data?.message || 'Failed to fetch analysis details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-dark-bg">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-slate-400 mt-4 text-sm">Assembling your resume feedback...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-dark-bg px-4">
        <div className="max-w-md w-full glass-panel border border-white/5 p-8 rounded-2xl text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mb-5">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Report Not Found</h2>
          <p className="text-slate-400 text-sm mt-2 mb-6">
            {error || 'This analysis report could not be found or you do not have permission to view it.'}
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary/95 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const { 
    atsScore, 
    strengths = [], 
    foundKeywords = [], 
    missingSkills = [], 
    missingKeywords = [], 
    spellingErrors = [], 
    suggestions = [], 
    overallFeedback, 
    resumeId 
  } = result;
  const filename = resumeId?.filename || 'Untitled Resume';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-dark-bg py-10 print-container">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb (Hidden during printing) */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-8 no-print">
          <Link
            to="/dashboard"
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex gap-2.5 flex-wrap">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print Report</span>
            </button>
            
            <Link
              to="/upload"
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/10 hover:opacity-95 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Scan Another</span>
            </Link>
          </div>
        </div>

        {/* Print Header (Visible only when printing) */}
        <div className="hidden print:block mb-8 border-b pb-6">
          <h1 className="text-3xl font-bold text-slate-900 print-text-dark">ResumeAI Analysis Report</h1>
          <p className="text-slate-500 mt-2 print-text-muted">Document: {filename}</p>
          <p className="text-slate-400 text-xs mt-1 print-text-muted">Date Generated: {new Date(result.createdAt).toLocaleDateString()}</p>
        </div>

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Core Score Stats Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel border border-white/5 rounded-2xl p-6 text-center shadow-xl print-card">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6 print-text-muted">Analysis Score</h2>
              
              <ScoreCircle score={atsScore} size={180} />
              
              <div className="mt-8 border-t border-white/5 pt-6 print:border-slate-200">
                <span className="block text-xs text-slate-500 font-bold uppercase tracking-wider print-text-muted">Resume Document</span>
                <span className="block text-sm font-semibold text-slate-200 mt-1 truncate print-text-dark" title={filename}>
                  {filename}
                </span>
              </div>
            </div>

            {/* Overall Feedback Summary Card */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 shadow-xl print-card">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 print-text-dark">
                <Compass className="h-4 w-4 text-primary" />
                <span>Overall Evaluation</span>
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed print-text-muted">
                {overallFeedback}
              </p>
            </div>
          </div>

          {/* Right Column: Detailed Sections */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Section 1: Strengths */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl print-card">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-100 border-b border-white/5 pb-4 mb-4 print:border-slate-200 print-text-dark">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <span>Key Strengths</span>
              </h3>
              
              {strengths && strengths.length > 0 ? (
                <ul className="space-y-3.5">
                  {strengths.map((str, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-slate-300 print-text-muted">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5 print:bg-emerald-100 print:text-emerald-600">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">No specific strengths listed.</p>
              )}
            </div>

            {/* Section 2: Missing Skills */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl print-card">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-100 border-b border-white/5 pb-4 mb-4 print:border-slate-200 print-text-dark">
                <ListTodo className="h-5 w-5 text-rose-400" />
                <span>Missing Professional Skills</span>
              </h3>
              
              {missingSkills && missingSkills.length > 0 ? (
                <ul className="space-y-3.5">
                  {missingSkills.map((skill, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-slate-300 print-text-muted">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mt-0.5 print:bg-rose-100 print:text-rose-600">
                        <X className="h-3 w-3 stroke-[3]" />
                      </span>
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-emerald-400 font-medium">Great! No major missing skills identified.</p>
              )}
            </div>

            {/* Section 3: Identified Quality Keywords */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl print-card">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-100 border-b border-white/5 pb-4 mb-4 print:border-slate-200 print-text-dark">
                <Check className="h-5 w-5 text-emerald-400" />
                <span>Identified Quality Keywords</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed print-text-muted">
                These keywords were successfully detected in your resume and align with modern ATS filters.
              </p>
              
              {foundKeywords && foundKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {foundKeywords.map((kw, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider print:bg-emerald-100 print:text-emerald-700 print:border-emerald-200"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No major technical keywords identified.</p>
              )}
            </div>

            {/* Section 4: ATS Keywords Missing */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl print-card">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-100 border-b border-white/5 pb-4 mb-4 print:border-slate-200 print-text-dark">
                <KeyRound className="h-5 w-5 text-amber-400" />
                <span>ATS Keywords Missing</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed print-text-muted">
                These keywords are commonly parsed by Applicant Tracking Systems for matching roles. Add them contextually inside your projects or summary headers.
              </p>
              
              {missingKeywords && missingKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {missingKeywords.map((kw, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider print:bg-amber-100 print:text-amber-700 print:border-amber-200"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-emerald-400 font-medium">All essential keywords appear properly configured!</p>
              )}
            </div>

            {/* Section 5: Spelling & Grammar Errors */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl print-card">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-100 border-b border-white/5 pb-4 mb-4 print:border-slate-200 print-text-dark">
                <AlertCircle className="h-5 w-5 text-rose-400" />
                <span>Spelling & Grammar Errors</span>
              </h3>
              
              {spellingErrors && spellingErrors.length > 0 ? (
                <ul className="space-y-3.5">
                  {spellingErrors.map((err, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-slate-300 print-text-muted">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mt-0.5 print:bg-rose-100 print:text-rose-600">
                        <X className="h-3 w-3 stroke-[3]" />
                      </span>
                      <span>{err}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-emerald-400 font-medium flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 print:bg-emerald-100 print:text-emerald-600">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span>No spelling or grammatical errors found. Great job!</span>
                </p>
              )}
            </div>

            {/* Section 6: Suggestions */}
            <div className="glass-panel border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl print-card">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-100 border-b border-white/5 pb-4 mb-4 print:border-slate-200 print-text-dark">
                <Lightbulb className="h-5 w-5 text-primary" />
                <span>Actionable Suggestions</span>
              </h3>
              
              {suggestions && suggestions.length > 0 ? (
                <ul className="space-y-4">
                  {suggestions.map((sug, index) => (
                    <li key={index} className="flex items-start gap-3.5 text-sm text-slate-300 print-text-muted">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5 print:bg-sky-100 print:text-sky-600">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                      <span className="leading-relaxed">{sug}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 italic">No formatting issues or suggestions.</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;
