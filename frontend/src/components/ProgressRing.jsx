import React from 'react';

const ProgressRing = ({ percent, size = 160, strokeWidth = 8, variant = 'dark' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  const isLight = variant === 'light';

  return (
    <div className="flex flex-col items-center justify-center relative select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90 drop-shadow-sm">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B4513" /> {/* SaddleBrown */}
            <stop offset="100%" stopColor="#D4AF37" /> {/* Gold */}
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isLight ? "rgba(255,255,255,0.1)" : "rgba(139,69,19,0.1)"}
          strokeWidth={strokeWidth}
          fill="transparent"
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
          <span className={`text-4xl font-serif font-bold leading-none ${isLight ? 'text-cream' : 'text-ink'}`}>{percent}</span>
          <span className={`text-xs font-sans font-bold ml-0.5 ${isLight ? 'text-gold' : 'text-brown'}`}>%</span>
        </div>
        <span className={`text-[8px] font-sans uppercase tracking-[0.2em] mt-2 font-bold text-center px-4 leading-tight ${isLight ? 'text-parchment/60' : 'text-ink-muted'}`}>
          {percent === 100 ? 'ARCHIVED' : 'PROGRESS'}
        </span>
      </div>
    </div>
  );
};

export default ProgressRing;

