import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, FileText, CheckCircle2, ChevronRight, Zap, Target, Search } from 'lucide-react';

const Landing = () => {
  const token = localStorage.getItem('token');

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl sm:h-[40rem] sm:w-[40rem] opacity-50"></div>
      <div className="absolute top-1/3 left-1/3 -z-10 h-72 w-72 rounded-full bg-secondary/15 blur-3xl opacity-40"></div>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Sparkles Brand Pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4 animate-spin-slow" />
            <span>AI-Powered Resume Feedback</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
            Optimize Your Resume for the{' '}
            <span className="gradient-text-animate block mt-2">ATS Screening System</span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-slate-400 max-w-2xl mx-auto">
            Upload your resume, get an instant ATS score, identify missing technical skills, discover critical search keywords, and receive professional improvement tips powered by Google Gemini AI.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to={token ? '/upload' : '/register'}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3.5 text-base font-semibold text-white shadow-xl shadow-primary/20 hover:opacity-95 hover:scale-[1.02] hover:shadow-primary/30 transition-all duration-200"
            >
              <span>Scan Your Resume Free</span>
              <ChevronRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            
            <Link
              to="/login"
              className="text-base font-semibold leading-6 text-slate-300 hover:text-white transition-colors"
            >
              Sign In <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Section */}
        <div className="mx-auto mt-24 max-w-5xl sm:mt-32">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            
            {/* Feature 1 */}
            <div className="glass-panel rounded-2xl p-8 border border-white/5 relative group hover:border-primary/20 transition-all duration-300">
              <div className="rounded-xl bg-primary/10 text-primary p-3 w-fit mb-5">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-primary transition-colors">Instant ATS Score</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Get a score from 0-100 based on standard industry filters, section headers, and credential checks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel rounded-2xl p-8 border border-white/5 relative group hover:border-secondary/20 transition-all duration-300">
              <div className="rounded-xl bg-secondary/10 text-secondary p-3 w-fit mb-5">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-secondary transition-colors">Keywords Analysis</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Extract high-value industry terms and standard keywords missing from your resume text to bypass screening filters.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel rounded-2xl p-8 border border-white/5 relative group hover:border-primary/20 transition-all duration-300">
              <div className="rounded-xl bg-primary/10 text-primary p-3 w-fit mb-5">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-primary transition-colors">Actionable Tips</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Receive itemized suggestions on phrasing, layout, and formatting structure to improve readability.
              </p>
            </div>

          </div>
        </div>

        {/* Timeline/How it works */}
        <div className="mx-auto mt-28 max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">How It Works</h2>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-4 relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary text-lg font-bold mb-4">
                1
              </div>
              <h3 className="text-base font-semibold text-slate-200">Create Account</h3>
              <p className="mt-2 text-xs text-slate-400 max-w-[200px]">Sign up in seconds to secure your dashboard history.</p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-lg font-bold mb-4">
                2
              </div>
              <h3 className="text-base font-semibold text-slate-200">Upload PDF</h3>
              <p className="mt-2 text-xs text-slate-400 max-w-[200px]">Drag & drop your standard resume PDF file (up to 5MB).</p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary text-lg font-bold mb-4">
                3
              </div>
              <h3 className="text-base font-semibold text-slate-200">AI Deep Scan</h3>
              <p className="mt-2 text-xs text-slate-400 max-w-[200px]">Our backend parses your text and calls Gemini AI for analysis.</p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-lg font-bold mb-4">
                4
              </div>
              <h3 className="text-base font-semibold text-slate-200">Get Report</h3>
              <p className="mt-2 text-xs text-slate-400 max-w-[200px]">Download your PDF export and optimize your formatting.</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Landing;
