
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'green' | 'red';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'cyan', 
  loading, 
  className = '', 
  ...props 
}) => {
  const variants = {
    cyan: 'border-neon-cyan text-neon-cyan shadow-neon hover:bg-neon-cyan/10',
    green: 'border-neon-green text-neon-green shadow-neon-green hover:bg-neon-green/10',
    red: 'border-threat-high text-threat-high shadow-[0_0_10px_rgba(255,0,60,0.3)] hover:bg-threat-high/10',
  };

  return (
    <button
      className={`px-4 py-2 border rounded-md font-mono transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <i className="fas fa-circle-notch animate-spin"></i>
          SEC_SYNC...
        </span>
      ) : children}
    </button>
  );
};
