
import React, { useState, useEffect } from 'react';
import { SecurityState } from '../types.ts';
import { localVault } from '../lib/database.ts';
import { securityService } from '../geminiService.ts';
import { Button } from '../components/Button.tsx';

interface DashboardProps {
  state: SecurityState;
  isInstalled?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ state, isInstalled }) => {
  const [dbStats, setDbStats] = useState({ totalRecords: 0, storageUsed: 0, lastSync: '' });
  const [badgeUrl, setBadgeUrl] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [localRisk, setLocalRisk] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await localVault.getStats();
        setDbStats(stats);
      } catch (err) {
        console.error("Vault stats fetch failed:", err);
      }
    };
    fetchStats();
    
    // Attempt local risk assessment if geolocation available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const assessment = await securityService.getLocalRiskAssessment(pos.coords.latitude, pos.coords.longitude);
        setLocalRisk(assessment);
      });
    }

    const interval = setInterval(fetchStats, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleBadgeSynthesis = async () => {
    setIsSynthesizing(true);
    const url = await securityService.generateIdentityBadge();
    setBadgeUrl(url);
    setIsSynthesizing(false);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto py-2">
      {/* HUD Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-cyber-gray p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-neon-cyan/5 rounded-full blur-2xl group-hover:bg-neon-cyan/10 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em]">Vault_Health</h3>
            <i className="fas fa-microchip text-neon-cyan text-xs"></i>
          </div>
          <p className="text-5xl font-black text-white tracking-tighter">100<span className="text-neon-cyan text-xl ml-1">%</span></p>
          <div className="mt-4 flex items-center gap-2 text-[9px] text-neon-green font-mono uppercase bg-neon-green/5 px-2 py-1 rounded-full w-fit">
             <div className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse shadow-neon-green"></div>
             Zero-Trust Enabled
          </div>
        </div>
        
        <div className="bg-cyber-gray p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-neon-purple/5 rounded-full blur-2xl group-hover:bg-neon-purple/10 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em]">Metadata_Archive</h3>
            <i className="fas fa-database text-neon-purple text-xs"></i>
          </div>
          <p className="text-5xl font-black text-white tracking-tighter">{dbStats.totalRecords}<span className="text-gray-600 text-xs ml-2 font-mono uppercase tracking-widest">nodes</span></p>
          <div className="mt-4 flex items-center gap-2 text-[9px] text-gray-500 font-mono uppercase">
             <i className="fas fa-clock-rotate-left"></i> {dbStats.storageUsed.toFixed(1)} KB Cached
          </div>
        </div>

        <div className="bg-cyber-gray p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-threat-high/5 rounded-full blur-2xl group-hover:bg-threat-high/10 transition-all"></div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3em]">Deployment</h3>
            <i className="fas fa-rocket text-neon-cyan text-xs"></i>
          </div>
          <p className="text-2xl font-black text-white tracking-tighter uppercase">
            {isInstalled ? 'NATIVE' : 'BROWSER'}
          </p>
          <div className="mt-4 flex items-center gap-2 text-[9px] font-mono uppercase">
             {isInstalled ? (
               <span className="text-neon-green"><i className="fas fa-check-circle"></i> Optimized for Standalone</span>
             ) : (
               <span className="text-neon-cyan animate-pulse"><i className="fas fa-circle-exclamation"></i> Upgrade Recommended</span>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* Geolocation Grounding Card */}
          <div className="bg-cyber-gray/50 backdrop-blur-md rounded-[2rem] border border-white/5 p-8 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white flex items-center gap-3">
                  <i className="fas fa-location-dot text-neon-cyan"></i> Geospatial_Risk_Assessment
                </h2>
             </div>
             <div className="p-4 bg-black/40 rounded-xl border border-neon-cyan/10 font-mono text-[11px] leading-relaxed text-gray-400">
               {localRisk || "Initializing regional vulnerability scan..."}
             </div>
          </div>

          {/* Telemetry Stream */}
          <div className="bg-cyber-gray/50 backdrop-blur-md rounded-[2rem] border border-white/5 p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white flex items-center gap-3">
                <span className="w-2 h-2 bg-neon-cyan rounded-full shadow-neon"></span>
                Neural_Audit_Log
              </h2>
              <span className="text-[9px] text-gray-600 font-mono">LIVE_FEED</span>
            </div>
            <div className="space-y-6">
              {[
                { time: new Date().toLocaleTimeString(), event: 'Identity Synth Pipeline Ready', type: 'success' },
                { time: 'T-Minus 8m', event: 'AES Metadata Rotation Key Regenerated', type: 'info' },
                { time: 'T-Minus 24m', event: 'Maps Grounding: High Security Node Detected', type: 'purple' },
                { time: 'T-Minus 1h', event: 'Intrusion Countermeasures Stabilized', type: 'success' },
              ].map((log, i) => (
                <div key={i} className="flex gap-6 items-start text-[10px] font-mono group opacity-70 hover:opacity-100 transition-opacity">
                  <span className="text-gray-600 shrink-0 pt-0.5">[{log.time}]</span>
                  <div className="space-y-1">
                    <span className={`uppercase font-bold tracking-widest ${
                      log.type === 'purple' ? 'text-neon-purple' : 
                      log.type === 'success' ? 'text-neon-green' : 'text-neon-cyan'
                    }`}>
                      {log.event}
                    </span>
                    <div className="h-px w-full bg-white/5 mt-2 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Brand Section / Identity Synthesis */}
        <div className="lg:col-span-2 bg-gradient-to-br from-cyber-gray to-black rounded-[2.5rem] border border-white/5 p-8 flex flex-col items-center shadow-2xl relative group overflow-hidden">
          <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          
          <div className="w-full text-center mb-6">
             <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">Identity_Vault</h3>
             <p className="text-[9px] text-gray-600 mt-1">Founding Member Credentials</p>
          </div>

          <div className="relative w-full aspect-[3/4] bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden mb-6 group/badge">
             {badgeUrl ? (
               <img src={badgeUrl} alt="ID Badge" className="w-full h-full object-cover animate-fade-in" />
             ) : (
               <div className="flex flex-col items-center text-center p-8">
                  <i className="fas fa-id-card-clip text-4xl text-gray-800 mb-4"></i>
                  <p className="text-[10px] text-gray-600 uppercase font-mono tracking-widest italic">Digital Identity Not Synthesized</p>
               </div>
             )}
             {isSynthesizing && (
               <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-neon-cyan">
                  <i className="fas fa-dna animate-pulse text-3xl mb-4"></i>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Synthesizing_Biometrics...</span>
               </div>
             )}
          </div>

          <Button 
            variant="cyan" 
            onClick={handleBadgeSynthesis} 
            loading={isSynthesizing} 
            className="w-full py-4 rounded-xl text-[10px] tracking-widest"
          >
            {badgeUrl ? 'RE-SYNTH_IDENTITY' : 'GENERATE_ID_CREDENTIAL'}
          </Button>

          <div className="mt-8 pt-8 border-t border-white/5 w-full flex justify-center gap-4">
             <div className="flex flex-col items-center">
                <span className="text-[8px] text-gray-600 font-bold uppercase mb-1">Entity</span>
                <span className="text-[9px] text-neon-purple font-bold uppercase tracking-widest">W. NTHANI</span>
             </div>
             <div className="w-px h-6 bg-white/5"></div>
             <div className="flex flex-col items-center">
                <span className="text-[8px] text-gray-600 font-bold uppercase mb-1">Clearance</span>
                <span className="text-[9px] text-neon-cyan font-bold uppercase tracking-widest">FOUNDER</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
