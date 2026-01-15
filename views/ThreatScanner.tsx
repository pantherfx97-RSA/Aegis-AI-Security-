
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { securityService } from '../geminiService.ts';
import { SecurityReport, ThreatLevel } from '../types.ts';
import { Button } from '../components/Button.tsx';
import { ThreatCard } from '../components/ThreatCard.tsx';
import { localVault } from '../lib/database.ts';

const ThreatScanner: React.FC = () => {
  const [input, setInput] = useState('');
  const [reports, setReports] = useState<(SecurityReport & { id: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Load findings from local vault asynchronously
    const loadArchived = async () => {
      try {
        const entries = await localVault.getEntries('THREAT');
        const archived = entries.map(e => ({
          ...e.metadata,
          id: e.id
        }));
        setReports(archived);
      } catch (err) {
        console.error("Failed to load archived threats:", err);
      }
    };
    loadArchived();
  }, []);

  const handleScan = async () => {
    setLoading(true);
    try {
      const result = await securityService.classifyThreat(input || "Manual Diagnostic Capture");
      // Await the localVault insertion which returns a Promise
      const entry = await localVault.insert('THREAT', result, 30);
      setReports(prev => [{ ...result, id: entry.id }, ...prev]);
      setInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePurge = async () => {
    await localVault.purgeAll();
    setReports([]);
  };

  const handleClearReport = async (id: string) => {
    await localVault.delete(id);
    setReports(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in px-2 pb-12">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold uppercase tracking-[0.2em]">Heuristic_Scanner</h2>
        <p className="text-gray-500 text-[10px] font-mono">CipherX Metadata Audit Pipeline</p>
      </div>

      <div className="bg-cyber-gray p-6 rounded-2xl border border-white/5 shadow-xl">
        <label className="block text-[10px] uppercase text-gray-500 mb-3 font-bold tracking-widest">Raw Log Snippet / Metadata Entry</label>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste abstracted indicators for AegisAI triage..."
          className="w-full h-32 bg-black border border-white/10 rounded-xl p-4 font-mono text-sm focus:border-neon-cyan focus:outline-none transition-all resize-none text-neon-green"
        />
        <div className="mt-4 flex justify-between items-center">
           <span className="text-[9px] text-gray-600 font-mono italic">Privacy: Metadata only. Do not input PII.</span>
           <Button onClick={handleScan} loading={loading} className="px-10">CLASSIFY_VECTOR</Button>
        </div>
      </div>

      {reports.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
             <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Vault_Findings ({reports.length})</h3>
             <button onClick={handlePurge} className="text-[9px] text-threat-high uppercase tracking-widest">Clear Archive</button>
          </div>
          {reports.map((report) => (
            <ThreatCard key={report.id} report={report} onClear={() => handleClearReport(report.id)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ThreatScanner;
