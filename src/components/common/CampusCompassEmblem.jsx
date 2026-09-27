import React from 'react';

export default function CampusCompassEmblem({ size = "normal", className = "" }) {
  const isSmall = size === "small";

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Emblem Image */}
      <img
        src="/campus compass.jpeg"
        alt="Campus Compass Emblem"
        className={`shrink-0 rounded-lg object-cover shadow-xs border border-gray-200/60 ${isSmall ? 'w-6.5 h-6.5' : 'w-8 h-8'}`}
      />

      {/* Brand Text Stack */}
      <div className="flex flex-col leading-tight justify-center">
        <span
          className={`font-bold tracking-tight whitespace-nowrap ${isSmall ? 'text-[11.5px]' : 'text-[14px]'}`}
          style={{ fontFamily: "'Libre Baskerville', 'Libre Bodoni', Georgia, serif", color: '#0F4C81' }}
        >
          CAMPUS COMPASS
        </span>
        <span
          className={`font-black tracking-widest text-black uppercase whitespace-nowrap ${isSmall ? 'text-[8.5px]' : 'text-[10px]'}`}
        >
          IEDC CCE
        </span>
      </div>
    </div>
  );
}
