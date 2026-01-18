import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false,
  className = '',
  ...props 
}) => {
  // Base: Geometric, bold, high-fashion feel
  const baseStyles = "w-full py-4 px-8 font-heading font-black text-sm tracking-[0.1em] uppercase transition-all duration-300 active:scale-[0.98] flex items-center justify-center relative overflow-hidden group";
  
  const variants = {
    // Primary: Deep Red - The "Blindfold" Color
    primary: "bg-red-600 text-white shadow-[0_10px_30px_-10px_rgba(220,38,38,0.5)] hover:bg-red-500 hover:shadow-[0_10px_40px_-5px_rgba(220,38,38,0.7)] rounded-xl",
    
    // Secondary: Dark, stealthy
    secondary: "bg-zinc-900/80 backdrop-blur-md text-zinc-300 border border-zinc-700 hover:text-white hover:border-red-600/50 hover:bg-black rounded-xl",
    
    // Outline: Minimalist
    outline: "bg-transparent border border-zinc-600 text-zinc-400 hover:border-white hover:text-white rounded-xl",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className} ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Hover Reveal Effect */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
      )}
      
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
    </button>
  );
};