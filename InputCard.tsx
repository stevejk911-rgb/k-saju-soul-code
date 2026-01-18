import React from 'react';

interface InputCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}

export const InputCard: React.FC<InputCardProps> = ({ title, subtitle, children, className = '' }) => {
  return (
    <div className={`w-full bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl animate-fade-in-up ${className}`}>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-heading font-black text-white mb-2 tracking-tight uppercase italic drop-shadow-lg">
          {title}
        </h1>
        <p className="text-sm text-zinc-400 font-medium leading-relaxed font-sans max-w-[90%] mx-auto">
          {subtitle}
        </p>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};