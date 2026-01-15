
import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-cyber-black flex flex-col items-center justify-center z-[9999] transition-opacity duration-1000 animate-pulse">
      <div className="relative mb-8">
        <div className="w-24 h-24 border-2 border-neon-cyan rounded-2xl flex items-center justify-center shadow-neon animate-pulse">
          <i className="fas fa-shield-halved text-5xl text-neon-cyan"></i>
        </div>
        <div className="absolute inset-0 border border-neon-cyan/20 rounded-2xl animate-ping"></div>
      </div>
      
      <h1 className="text-4xl font-bold tracking-[0.4em] text-white mb-2">
        AEGIS<span className="text-neon-cyan">AI</span>
      </h1>
      <p className="text-xs text-neon-cyan/60 uppercase tracking-[0.3em] font-mono mb-12">
        Your Intelligent Shield
      </p>

      <div className="mt-12 text-center">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono">
          Founded by <span className="text-gray-400">Wally Nthani</span>
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
