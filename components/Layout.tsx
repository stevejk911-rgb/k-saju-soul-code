import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { COPY } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  onBack: () => void;
  showBack: boolean;
  step: number;
  totalSteps: number;
}

export const Layout: React.FC<LayoutProps> = ({ children, onBack, showBack, step, totalSteps }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Background Image - Smart loading strategy */}
      <img 
        src="bg.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover z-0 transform scale-105 pointer-events-none opacity-80"
        onError={(e) => {
          const target = e.currentTarget;
          // If loading from root fails, try loading from public/ explicit folder
          if (!target.src.includes('public')) {
            target.src = 'public/bg.png';
          } else {
            // If both fail, hide it to avoid broken image icon
            target.style.display = 'none';
          }
        }}
      />
      
      {/* Cinematic Overlay - Reduced opacity to let background shine through */}
      {/* Top gradient for header visibility */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent z-0 pointer-events-none" />
      
      {/* Bottom gradient for footer visibility */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent z-0 pointer-events-none" />
      
      {/* Very subtle vignette */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-6">
        <div className="text-xl font-['Eczar'] font-black tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
          {COPY.header} <span className="text-red-600">.</span>
        </div>
        {showBack && (
          <button 
            onClick={onBack}
            className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-red-500 transition-colors bg-black/50 px-4 py-2 rounded-none border border-zinc-800 hover:border-red-600 backdrop-blur-sm"
          >
            <span className="mr-2">{COPY.back}</span>
            <ArrowLeft className="w-3 h-3" />
          </button>
        )}
      </header>

      {/* Progress Bar - Sharp Red Line */}
      <div className="relative z-20 flex justify-center items-center space-x-1 mb-8 px-12">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div 
            key={i}
            className={`h-1 transition-all duration-500 ease-out ${
              i <= step ? 'w-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]' : 'w-full bg-zinc-800/50'
            }`}
          />
        ))}
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col px-6 pb-8 overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};