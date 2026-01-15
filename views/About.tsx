
import React from 'react';

const About: React.FC = () => {
  const BRAND_LOGO_URL = "https://cdn-icons-png.flaticon.com/512/2092/2092663.png";

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-fade-in py-10">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl border border-neon-cyan/20 bg-white/5 backdrop-blur-xl shadow-neon mb-4 p-5 overflow-hidden group">
          <img 
            src={BRAND_LOGO_URL} 
            alt="AEGIS AI SECURITY" 
            className="w-full h-full object-contain invert filter drop-shadow-[0_0_8px_rgba(0,243,255,0.5)] group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <h2 className="text-4xl font-black uppercase tracking-[0.5em] text-white">THE_MISSION</h2>
        <div className="h-1 w-24 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-cyan mx-auto rounded-full shadow-neon"></div>
      </div>

      <div className="bg-cyber-gray/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-8 text-gray-400 leading-relaxed font-mono">
          <p className="text-lg text-white leading-relaxed first-letter:text-5xl first-letter:font-black first-letter:text-neon-cyan first-letter:mr-3 first-letter:float-left first-letter:leading-none">
            AEGIS AI SECURITY is a next-generation security intelligence system engineered for complete digital sovereignty and proactive privacy enforcement.
          </p>
          
          <p className="text-sm">
            Created by <span className="text-neon-cyan font-black tracking-widest">WALLY NTHANI</span>, founder of CipherX Inc., this platform bridges the gap between complex enterprise security and personal privacy protection. By leveraging locally-contained AI, we ensure that your most sensitive security metadata never leaves your device's encrypted vault.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-neon-cyan/30 transition-colors">
              <h4 className="text-neon-cyan text-[10px] uppercase font-black mb-3 tracking-[0.3em]">Cyber Sovereignty</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Absolute control over your personal threat surface without third-party surveillance.</p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-neon-purple/30 transition-colors">
              <h4 className="text-neon-purple text-[10px] uppercase font-black mb-3 tracking-[0.3em]">Ethical Intelligence</h4>
              <p className="text-xs text-gray-500 leading-relaxed">AI logic fine-tuned to protect individual rights while mitigating global digital threats.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-8">
        <p className="text-[9px] text-gray-700 uppercase tracking-[0.6em] font-mono">
          SYSTEM_INSTALLED // SENTINEL_ONLINE // South Africa 2026
        </p>
      </div>
    </div>
  );
};

export default About;
