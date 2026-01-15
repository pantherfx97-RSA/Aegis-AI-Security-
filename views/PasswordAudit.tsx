
import React, { useState, useEffect } from 'react';
import { securityService } from '../geminiService.ts';
import { SecurityReport } from '../types.ts';
import { Button } from '../components/Button.tsx';
import { ThreatCard } from '../components/ThreatCard.tsx';
import { localVault } from '../lib/database.ts';

const PasswordAudit: React.FC = () => {
  const [meta, setMeta] = useState('');
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    try {
      const entries = await localVault.getEntries('PASSWORD_META');
      setHistory(entries.sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      console.error("Vault access error:", err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleAudit = async () => {
    if (!meta.trim()) return;
    setLoading(true);
    try {
      const result = await securityService.auditPasswordMeta(meta);
      setReport(result);
      await localVault.insert('PASSWORD_META', result, 3650);
      await loadHistory();
      setMeta('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async (id: string) => {
    await localVault.delete(id);
    await loadHistory();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="text-center mb-8">
        <i className="fas fa-key text-5xl text-neon-green mb-4 shadow-neon-green/20"></i>
        <h2 className="text-2xl font-bold uppercase tracking-widest text-white">Metadata Auditor</h2>
        <p className="text-gray-500 text-xs font-mono">CipherX Zero-Knowledge Entropy Analysis</p>
      </div>

      <div className="bg-cyber-gray p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div className="bg-neon-green/5 border border-neon-green/20 p-4 rounded-xl mb-6 text-[10px] text-neon-green font-mono uppercase leading-relaxed">
          <i className="fas fa-user-shield mr-2"></i>
          SECURE PROTOCOL: Paste entropy patterns or complexity summaries. 
          <span className="text-threat-high font-bold underline ml-1">NEVER enter raw passwords.</span>
        </div>
        
        <label className="block text-[10px] uppercase text-gray-500 mb-3 font-bold tracking-[0.2em]">
          Credential Metadata
        </label>
        <textarea
          value={meta}
          onChange={(e) => setMeta(e.target.value)}
          placeholder="e.g. Length: 16, Mixed Case, Symbols, No dictionary words..."
          className="w-full h-32 bg-black border border-white/10 rounded-xl p-4 font-mono text-sm focus:border-neon-green focus:outline-none transition-all resize-none text-neon-green placeholder:text-gray-800"
        />
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-[9px] text-gray-600 italic">Analytic engine: gemini-3-flash</span>
          <Button 
            variant="green"
            onClick={handleAudit} 
            loading={loading}
            className="px-8"
          >
            AUDIT_METADATA
          </Button>
        </div>
      </div>

      {report && (
        <div className="animate-bounce">
          <ThreatCard report={report} onClear={() => setReport(null)} />
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-4 mt-12">
          <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-2 flex items-center gap-2">
            <i className="fas fa-clock-rotate-left"></i> Vault_History
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {history.map((entry) => (
              <div key={entry.id} className="bg-cyber-gray/40 border border-white/5 rounded-xl p-4 flex justify-between items-start group hover:border-white/10 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-neon-green uppercase">{entry.metadata.threatLevel} RISK</span>
                    <span className="text-[9px] text-gray-600">[{new Date(entry.timestamp).toLocaleDateString()}]</span>
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-1 italic">{entry.metadata.explanation}</p>
                </div>
                <button 
                  onClick={() => handleClear(entry.id)}
                  className="text-[10px] text-gray-700 hover:text-threat-high p-2 transition-colors"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordAudit;
