import React from 'react';

const ProgressRing = ({ percent, size = 160, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90 drop-shadow-sm">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B4513" /> {/* SaddleBrown */}
            <stop offset="100%" stopColor="#D4AF37" /> {/* Gold */}
          </linearGradient>
        </defs>
        
        {/* Shadow circle for depth */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-20"
        />
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-border-warm"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline">
          <span className="text-4xl font-serif font-bold text-ink leading-none">{percent}</span>
          <span className="text-xs font-sans font-bold text-ink-muted ml-0.5">%</span>
        </div>
        <span className="text-[9px] font-sans text-ink-muted uppercase tracking-[0.25em] mt-2 font-bold">
          {percent === 100 ? 'Volume archived' : 'Reading progress'}
        </span>
      </div>
    </div>
  );
};

export default ProgressRing;

