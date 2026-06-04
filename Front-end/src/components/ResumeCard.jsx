import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Trash2, ArrowRight } from 'lucide-react';

const ResumeCard = ({ result, onDelete }) => {
  const { _id, atsScore, createdAt, resumeId } = result;
  const filename = resumeId?.filename || 'Untitled Resume';
  
  // Format Date nicely
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Badge colors
  const getBadgeColors = (score) => {
    if (score >= 75) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (score >= 50) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  return (
    <div className="glass-panel hover-glow rounded-xl p-5 flex flex-col justify-between h-48 relative group overflow-hidden border border-white/5">
      {/* Background radial highlight */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all duration-300"></div>
      
      <div>
        {/* Header: File info & Delete button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-white/5 text-primary group-hover:text-white transition-colors duration-300">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-100 truncate pr-2 group-hover:text-primary transition-colors" title={filename}>
              {filename}
            </h3>
          </div>
          
          <button
            onClick={() => onDelete(_id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
            title="Delete from history"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Date of analysis */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-4">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(createdAt)}</span>
        </div>
      </div>

      {/* Footer: Score & View Details link */}
      <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeColors(atsScore)}`}>
          Score: {atsScore}
        </div>
        
        <Link
          to={`/result/${_id}`}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-white group/btn transition-colors"
        >
          <span>View Report</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default ResumeCard;
