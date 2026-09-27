import React, { useState, useEffect } from 'react';
import './LandingScreen.css';

export default function LandingScreen({ onFinish }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 400);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleEnter();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // return (
//     <div 
//       className={`landing-overlay ${isExiting ? 'landing-exit' : ''}`}
//       onClick={handleEnter}
//     >
//       {/* Animated Subtle Blue Grid Background */}
//       <div className="landing-grid-bg" />

//       {/* Main Center Container */}
//       <div className="landing-content-card flex flex-col items-center text-center">
        
//         {/* 1. Campus Compass Logo in Center */}
//         <div className="loading-logo-wrapper mb-5">
//           <img 
//             src="/campus compass.jpeg" 
//             alt="Campus Compass Logo" 
//             className="loading-logo-img" 
//           />
//         </div>

//         {/* 2. Below Logo: CAMPUS COMPASS */}
//         <h1 
//           className="loading-title text-2xl sm:text-3xl font-bold tracking-tight mb-1 select-none"
//           style={{ fontFamily: "'Libre Baskerville', 'Libre Bodoni', Georgia, serif", color: '#0F4C81' }}
//         >
//           CAMPUS COMPASS
//         </h1>

//         {/* 3. Below CAMPUS COMPASS: IEDC CCE */}
//         <h2 className="loading-subtitle text-xs sm:text-sm font-black tracking-widest text-black uppercase mb-2 select-none">
//           IEDC CCE
//         </h2>

//         {/* 4. Below IEDC CCE: Christ College of Engineering Irinjalakuda (Autonomous) */}
//         <p className="loading-college text-xs sm:text-sm font-semibold text-slate-600 max-w-xs leading-snug mb-6 select-none">
//           Christ College of Engineering Irinjalakuda (Autonomous)
//         </p>

//         {/* Animated Loading Bar & Status */}
//         <div className="w-full max-w-[180px] flex flex-col items-center gap-2 mt-1">
//           <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
//             <div className="loading-progress-bar h-full bg-[#0F4C81] rounded-full"></div>
//           </div>
//           <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
//             Loading Map...
//           </span>
//         </div>

//       </div>
//     </div>
  // );
}
