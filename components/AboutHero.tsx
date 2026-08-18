
import React from 'react';

const AboutHero: React.FC = () => {
  return (
    <div className="relative w-full pt-8 pb-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white tracking-tight">Profile & Portfolio</h1>
           <p className="text-slate-400 text-sm mt-1">Exploring the intersection of Infrastructure and Technology.</p>
        </div>
        <div className="hidden md:block text-right">
           <div className="text-xs font-mono text-cyan-500 bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-900/50">
              LAST UPDATED: SEP 2025
           </div>
        </div>
      </div>
    </div>
  );
};

export default AboutHero;
