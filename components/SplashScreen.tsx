
import React from 'react';

const SplashScreen: React.FC = () => {
  const BRAND_LOGO_URL = "https://cdn-icons-png.flaticon.com/512/2092/2092663.png";

  return (
    <div className="fixed inset-0 bg-cyber-black flex flex-col items-center justify-center z-[9999] overflow-hidden">
      {/* Background HUD elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-neon-cyan/20 rounded-full animate-[spin_30s_linear_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-dashed border-neon-purple/20 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>
      </div>

      <div className="relative mb-12 group">
        <div className="w-28 h-28 border border-neon-cyan/30 rounded-[2rem] flex items-center justify-center shadow-neon bg-white/5 backdrop-blur-md p-4 overflow-hidden relative z-10 transition-transform duration-1000 group-hover:scale-110">
          <img 
            src={BRAND_LOGO_URL} 
            alt="AEGIS AI SECURITY" 
            className="w-full h-full object-contain invert brightness-125 drop-shadow-[0_0_10px_rgba(0,243,255,0.6)]"
          />
        </div>
        <div className="absolute inset-0 border-2 border-neon-cyan/10 rounded-[2rem] animate-ping"></div>
        <div className="absolute -inset-4 border border-neon-purple/10 rounded-[2.5rem] animate-[pulse_4s_infinite]"></div>
      </div>
      
      <div className="text-center relative z-10">
        <h1 className="text-4xl font-black tracking-[0.4em] text-white mb-3 uppercase">
          AEGIS AI <span className="text-neon-cyan">SECURITY</span>
        </h1>
        <div className="flex items-center justify-center gap-4 text-[10px] text-neon-cyan/40 uppercase tracking-[0.4em] font-mono">
           <span className="h-px w-8 bg-current"></span>
           <span>SECURE PROTOCOL</span>
           <span className="h-px w-8 bg-current"></span>
        </div>
      </div>

      <div className="absolute bottom-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-32 h-0.5 bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-neon-cyan w-full animate-[loader_2.5s_ease-in-out]"></div>
          </div>
          <p className="text-[9px] text-gray-700 uppercase tracking-widest font-mono">
            Encrypted Instance by <span className="text-neon-purple font-bold">Wally Nthani</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes loader {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
