import React, { useEffect, useState } from 'react';

const ScoreCircle = ({ score = 0, size = 160 }) => {
  const [offset, setOffset] = useState(314.16);
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // 314.159

  useEffect(() => {
    // Delay offset animation slightly for mounting transition
    const timer = setTimeout(() => {
      const progressOffset = circumference - (score / 100) * circumference;
      setOffset(progressOffset);
    }, 100);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  // Color mapping based on score thresholds
  const getColorClasses = (val) => {
    if (val >= 75) {
      return {
        stroke: 'stroke-emerald-500',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        glow: 'shadow-emerald-500/20',
        label: 'Excellent'
      };
    } else if (val >= 50) {
      return {
        stroke: 'stroke-amber-500',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        glow: 'shadow-amber-500/20',
        label: 'Needs Work'
      };
    } else {
      return {
        stroke: 'stroke-rose-500',
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        glow: 'shadow-rose-500/20',
        label: 'Critical'
      };
    }
  };

  const themeColors = getColorClasses(score);

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`relative flex items-center justify-center rounded-full border p-4 transition-all duration-700 shadow-lg ${themeColors.bg} ${themeColors.border} ${themeColors.glow}`}
        style={{ width: size, height: size }}
      >
        {/* SVG Circle Gauge */}
        <svg className="absolute top-0 left-0 h-full w-full -rotate-90" viewBox="0 0 120 120">
          {/* Background Track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="fill-none stroke-slate-800"
            strokeWidth="8"
          />
          {/* Animated Foreground Arc */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            className={`fill-none transition-all duration-1000 ease-out ${themeColors.stroke}`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>

        {/* Text Center Overlay */}
        <div className="text-center z-10">
          <span className={`text-4xl font-extrabold tracking-tight ${themeColors.text}`}>
            {score}
          </span>
          <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">
            ATS Score
          </span>
        </div>
      </div>
      
      {/* Score Badge Label */}
      <span className={`mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${themeColors.text} ${themeColors.bg} ${themeColors.border}`}>
        {themeColors.label}
      </span>
    </div>
  );
};

export default ScoreCircle;
