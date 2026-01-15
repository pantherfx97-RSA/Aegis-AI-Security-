
import React, { useState } from 'react';
import { localVault } from '../lib/database.ts';
import { Button } from '../components/Button.tsx';

interface SettingsProps {
  canInstall?: boolean;
  isInstalled?: boolean;
  onInstall?: () => void;
  isIOS?: boolean;
}

const Settings: React.FC<SettingsProps> = ({ canInstall, isInstalled, onInstall, isIOS }) => {
  const [purgeLoading, setPurgeLoading] = useState(false);
  const BRAND_LOGO_URL = "https://cdn-icons-png.flaticon.com/512/2092/2092663.png";

  const handleGlobalPurge = async () => {
    if (!confirm("Confirm Vault Deletion? All encrypted metadata nodes will be permanently unlinked and scrubbed. Irreversible operation.")) return;
    
    setPurgeLoading(true);
    try {
      await localVault.purgeAll();
      alert("Vault integrity reset. All local caches scrubbed.");
      window.location.reload();
    } catch (err) {
      console.error("Scrub failed:", err);
    } finally {
      setPurgeLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in py-8 pb-32 px-2">
      <div className="flex items-center gap-6 mb-4">
        <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan shadow-neon">
           <i className="fas fa-sliders text-xl"></i>
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-[0.3em] text-white">Console_Config</h2>
          <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">Hardware & Software Handshake</p>
        </div>
      </div>

      {/* Deployment Section */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-neon-cyan uppercase tracking-[0.4em] px-4">01 // System_Deployment</h3>
        <div className="bg-cyber-gray border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl"></div>
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-24 h-24 shrink-0 border border-neon-cyan/20 rounded-3xl bg-black/40 p-5 overflow-hidden shadow-neon group">
              <img 
                src={BRAND_LOGO_URL} 
                alt="Logo" 
                className="w-full h-full object-contain invert brightness-125 filter drop-shadow-[0_0_5px_rgba(0,243,255,0.4)] group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-2 flex items-center justify-center md:justify-start gap-3">
                {isInstalled ? (
                  <><span className="w-2 h-2 bg-neon-green rounded-full animate-pulse shadow-neon-green"></span> Core Integrated</>
                ) : (
                  <><span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse shadow-neon"></span> Deploy Shield Instance</>
                )}
              </h4>
              <p className="text-[11px] text-gray-500 font-mono leading-relaxed max-w-md">
                {isInstalled 
                  ? "Standalone AEGIS AI SECURITY session active. You are running a native system instance with biometric security enabled."
                  : "Optimize performance by deploying AEGIS AI SECURITY to your device home screen. Enables full-screen immersion and deeper vault persistence."
                }
              </p>
            </div>
            <div className="w-full md:w-auto">
              {canInstall && !isInstalled && (
                <Button variant="cyan" onClick={onInstall} className="w-full py-4 px-8 text-[10px] font-black tracking-[0.2em] rounded-2xl">
                  EXECUTE_DEPLOYMENT
                </Button>
              )}
              {isInstalled && (
                <div className="px-6 py-3 border border-neon-green/30 bg-neon-green/10 text-neon-green rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3">
                  <i className="fas fa-check-double"></i>
                  NATIVE_MODE
                </div>
              )}
              {!canInstall && !isInstalled && (
                <div className="bg-black/60 border border-white/5 p-4 rounded-2xl text-[9px] text-gray-500 font-mono leading-tight">
                  {isIOS ? (
                    <>
                      <span className="text-neon-cyan font-bold block mb-1">MANUAL INSTALL (iOS):</span>
                      1. Tap the Share icon <i className="fas fa-arrow-up-from-bracket mx-1"></i><br/>
                      2. Select <span className="text-white">"Add to Home Screen"</span><br/>
                      3. Launch AEGIS AI SECURITY from your app grid.
                    </>
                  ) : (
                    <>
                      <span className="text-neon-cyan font-bold block mb-1">MANUAL INSTALL:</span>
                      Check your browser menu for "Install App" or "Add to Home Screen" to enable native mode.
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Persistence Section */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] px-4">02 // Persistence_Manager</h3>
        <div className="bg-cyber-gray border border-white/5 rounded-[2rem] p-8 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Global Vault Scrub</h4>
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">Destroy all local data pointers and volatile caches.</p>
            </div>
            <Button variant="red" onClick={handleGlobalPurge} loading={purgeLoading} className="w-full md:w-auto px-8 py-3 rounded-2xl text-[10px]">
              PURGE_ALL_NODES
            </Button>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-neon-purple uppercase tracking-[0.4em] px-4">03 // Identity_Vision</h3>
        <div className="bg-cyber-gray border border-white/5 rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <i className="fas fa-quote-right text-8xl text-neon-purple"></i>
          </div>
          <div className="relative z-10 space-y-6">
            <p className="text-2xl font-black text-white italic leading-tight tracking-tight">
              "Security is not a wall; it is a pulse. It must be constant, silent, and deeply respectful of the individual."
            </p>
            <div className="pt-8 border-t border-white/5 flex items-center justify-between">
              <div>
                <p className="text-neon-cyan font-black tracking-[0.3em] uppercase">WALLY NTHANI</p>
                <p className="text-[10px] text-gray-600 uppercase font-mono mt-1">Founding Architect // CipherX Inc</p>
              </div>
              <div className="w-12 h-12 rounded-full border border-neon-purple/20 bg-neon-purple/5 flex items-center justify-center text-neon-purple">
                 <i className="fas fa-fingerprint"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="text-center py-10 opacity-30">
        <p className="text-[9px] text-gray-500 uppercase tracking-[0.8em] font-mono">
          AEGIS AI SECURITY // ENCRYPTED_STABLE_NODE
        </p>
      </div>
    </div>
  );
};

export default Settings;
