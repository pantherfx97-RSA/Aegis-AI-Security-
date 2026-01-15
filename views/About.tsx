
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl border-2 border-neon-cyan bg-neon-cyan/5 shadow-neon mb-4">
          <i className="fas fa-shield-halved text-4xl text-neon-cyan"></i>
        </div>
        <h2 className="text-3xl font-bold uppercase tracking-[0.2em] text-white">About</h2>
        <div className="h-1 w-20 bg-neon-cyan mx-auto rounded-full"></div>
      </div>

      <div className="bg-cyber-gray/50 rounded-2xl border border-white/5 p-8 shadow-2xl relative overflow-hidden">
        {/* Abstract background element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-neon-green/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6 text-gray-300 leading-relaxed">
          <p className="text-lg first-letter:text-4xl first-letter:font-bold first-letter:text-neon-cyan first-letter:mr-1 first-letter:float-left">
            AegisAI is an AI-powered security and privacy platform designed to protect users from digital threats and unauthorized access.
          </p>
          
          <p>
            Founded by <span className="text-neon-cyan font-bold">Wally Nthani</span>, a South African security innovator, AegisAI is built with a privacy-first philosophy—combining intelligent threat detection with silent, ethical defense mechanisms.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
              <h4 className="text-neon-cyan text-xs uppercase font-bold mb-2 tracking-widest">Our Vision</h4>
              <p className="text-xs text-gray-400">To democratize enterprise-grade security intelligence for individual users worldwide.</p>
            </div>
            <div className="p-4 bg-black/40 rounded-xl border border-white/5">
              <h4 className="text-neon-green text-xs uppercase font-bold mb-2 tracking-widest">Privacy Ethos</h4>
              <p className="text-xs text-gray-400">Zero-knowledge infrastructure ensuring your raw data never leaves your local environment.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-mono">
          System Version: 2.5.0-STABLE // Sentinel Protocol Active
        </p>
      </div>
    </div>
  );
};

export default About;
