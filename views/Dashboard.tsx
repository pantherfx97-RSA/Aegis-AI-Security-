
import React, { useState, useEffect } from 'react';
import { SecurityState } from '../types';
import { localVault } from '../lib/database';

interface DashboardProps {
  state: SecurityState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const [dbStats, setDbStats] = useState({ totalRecords: 0, storageUsed: 0, lastSync: '' });

  useEffect(() => {
    // Correctly fetch stats asynchronously
    const fetchStats = async () => {
      try {
        const stats = await localVault.getStats();
        setDbStats(stats);
      } catch (err) {
        console.error("Failed to fetch vault stats:", err);
      }
    };
    
    // Initial fetch
    fetchStats();
    
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-cyber-gray p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <i className="fas fa-server text-4xl text-neon-cyan"></i>
          </div>
          <h3 className="text-gray-500 text-[10px] uppercase mb-1 font-bold tracking-[0.2em]">Vault Integrity</h3>
          <p className="text-4xl font-bold text-white tracking-tighter">100<span className="text-neon-cyan text-2xl">%</span></p>
          <div className="mt-4 flex items-center gap-2 text-[9px] text-neon-green font-mono uppercase">
             <i className="fas fa-lock animate-pulse"></i> Locally Encrypted
          </div>
        </div>
        
        <div className="bg-cyber-gray p-6 rounded-2xl border border-white/5 shadow-xl group">
          <h3 className="text-gray-500 text-[10px] uppercase mb-1 font-bold tracking-[0.2em]">Archived Incidents</h3>
          <p className="text-4xl font-bold text-white tracking-tighter">{dbStats.totalRecords}</p>
          <div className="mt-4 flex items-center gap-2 text-[9px] text-threat-high font-mono uppercase">
             <i className="fas fa-shield-virus"></i> Retention Protocol Active
          </div>
        </div>

        <div className="bg-cyber-gray p-6 rounded-2xl border border-white/5 shadow-xl group">
          <h3 className="text-gray-500 text-[10px] uppercase mb-1 font-bold tracking-[0.2em]">Local Cache</h3>
          <p className="text-4xl font-bold text-white tracking-tighter">{dbStats.storageUsed.toFixed(1)}<span className="text-sm font-normal text-gray-500"> KB</span></p>
          <div className="mt-4 flex items-center gap-2 text-[9px] text-neon-cyan font-mono uppercase">
             <i className="fas fa-memory"></i> Volatile Memory Storage
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-cyber-gray rounded-2xl border border-white/5 p-6 shadow-2xl">
          <h2 className="text-sm font-bold mb-6 flex items-center gap-3 uppercase tracking-[0.3em] text-white border-b border-white/5 pb-4">
            <i className="fas fa-microchip text-neon-cyan"></i>
            Neural_Telemetry
          </h2>
          <div className="space-y-4">
            {[
              { time: new Date().toLocaleTimeString(), event: 'CipherX Vault Sync: Successful', type: 'success' },
              { time: 'T-Minus 12m', event: 'AES-256 Entropy Rotation', type: 'info' },
              { time: 'T-Minus 1h', event: 'Retention Scrubber Executed', type: 'info' },
              { time: 'T-Minus 4h', event: 'Heuristic Node Re-Optimized', type: 'success' },
              { time: 'SESSION_START', event: 'AegisAI Identity Verified: Wally Nthani', type: 'success' },
            ].map((log, i) => (
              <div key={i} className="flex gap-4 items-center text-[10px] font-mono border-b border-white/5 pb-3 last:border-0 opacity-80 hover:opacity-100 transition-opacity">
                <span className="text-gray-600 shrink-0">[{log.time}]</span>
                <span className={`uppercase font-bold ${
                  log.type === 'warning' ? 'text-threat-medium' : 
                  log.type === 'success' ? 'text-neon-green' : 'text-neon-cyan'
                }`}>
                  {log.event}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-cyber-gray rounded-2xl border border-white/5 p-8 flex flex-col items-center justify-center text-center shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-green/5 pointer-events-none"></div>
          <div className="relative mb-8">
             <div className="w-32 h-32 rounded-full border border-dashed border-neon-cyan/20 animate-[spin_20s_linear_infinite]"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-user-secret text-4xl text-neon-cyan/50"></i>
             </div>
          </div>
          <h3 className="text-md font-bold mb-2 uppercase tracking-widest text-white">Identity_Guarded</h3>
          <p className="text-[10px] text-gray-500 max-w-sm leading-relaxed uppercase font-mono">
            CipherX Zero-Knowledge architecture ensures Wally Nthani's raw interactions are never buffered externally. 
            AI Inference is performed locally or via privacy-wrapped API tunnels.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
