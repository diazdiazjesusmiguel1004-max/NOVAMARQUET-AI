import React from 'react';
import { Link } from 'react-router-dom';

const BrandLogo = ({ showLink = true, size = 'md', darkText = false }) => {
  const isLarge = size === 'lg';

  const content = (
    <div className="flex items-center gap-2.5 group cursor-pointer select-none">
      {/* Icon Badge */}
      <div className={`relative flex items-center justify-center ${isLarge ? 'w-12 h-12 rounded-2xl' : 'w-10 h-10 rounded-xl'} bg-slate-950 border border-amber-500/40 shadow-md shadow-amber-500/10 group-hover:scale-105 group-hover:border-amber-400 transition-all duration-300`}>
        <span className={`font-black tracking-tighter ${isLarge ? 'text-xl' : 'text-base'}`}>
          <span className="text-amber-400">N</span>
          <span className="text-white">M</span>
        </span>
      </div>

      {/* Typography with Amazon-style smile arrow */}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline">
          <span className={`font-black tracking-tight group-hover:text-amber-500 transition-colors ${darkText ? 'text-slate-800' : 'text-white'} ${isLarge ? 'text-2xl' : 'text-xl'}`}>
            novamarquet
          </span>
        </div>
        
        {/* Amazon-style Smile Arc Arrow */}
        <svg viewBox="0 0 140 18" className={`${isLarge ? 'w-36 h-4 -mt-1' : 'w-28 h-3.5 -mt-1'} overflow-visible`}>
          <path
            d="M 8 4 Q 70 20 132 4"
            fill="none"
            stroke="url(#brand-amber-grad-logo)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <polygon
            points="127,1 137,4 130,10"
            fill="#f59e0b"
          />
          <defs>
            <linearGradient id="brand-amber-grad-logo" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );

  if (showLink) {
    return <Link to="/" className="inline-block">{content}</Link>;
  }
  return content;
};

export default BrandLogo;
