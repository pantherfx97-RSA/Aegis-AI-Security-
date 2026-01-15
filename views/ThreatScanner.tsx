
import React, { useState, useEffect, useRef } from 'react';
import { securityService } from '../geminiService.ts';
import { SecurityReport, ThreatLevel } from '../types.ts';
import { Button } from '../components/Button.tsx';
import { ThreatCard } from '../components/ThreatCard.tsx';
import { localVault } from '../lib/database.ts';

const ThreatScanner: React.FC = () => {
  const [input, setInput] = useState('');
  const [reports, setReports] = useState<(SecurityReport & { id: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [isScanningVisual, setIsScanningVisual] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
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

  const triggerScanline = () => {
    setIsScanningVisual(true);
    setTimeout(() => setIsScanningVisual(false), 4000);
  };

  const handleScan = async () => {
    if (!input.trim() && !loading) return;
    setLoading(true);
    triggerScanline();
    try {
      const result = await securityService.classifyThreat(input || "Manual Diagnostic Capture");
      const entry = await localVault.insert('THREAT', result, 30);
      setReports(prev => [{ ...result, id: entry.id }, ...prev]);
      setInput('');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSystemIntegrityCheck = async () => {
    setLoading(true);
    triggerScanline();
    
    const sysMetadata = {
      userAgent: navigator.userAgent,
      platform: (navigator as any).platform,
      language: navigator.language,
      hardwareConcurrency: navigator.hardwareConcurrency,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      cookiesEnabled: navigator.cookieEnabled,
      connectionType: (navigator as any).connection?.effectiveType || 'unknown',
      memory: (navigator as any).deviceMemory || 'unknown'
    };

    try {
      const prompt = `Perform a deep System Integrity Audit. Metadata: ${JSON.stringify(sysMetadata)}. 
      Check for browser-specific vulnerabilities and tracking vectors. 
      Provide a specific, actionable solution in the 'recommendedAction' field if issues are found.`;
      
      const result = await securityService.classifyThreat(prompt);
      const entry = await localVault.insert('THREAT', {
        ...result,
        explanation: `[INTEGRITY_AUDIT] ${result.explanation}`
      }, 30);
      setReports(prev => [{ ...result, id: entry.id, explanation: `[INTEGRITY_AUDIT] ${result.explanation}` }, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const scanDeviceForThreats = async () => {
    setLoading(true);
    triggerScanline();

    const forensicContext = {
      timestamp: Date.now(),
      os: (navigator as any).platform,
      cores: navigator.hardwareConcurrency,
      plugins: Array.from(navigator.plugins).map(p => p.name),
      doNotTrack: navigator.doNotTrack,
      webdriver: navigator.webdriver,
      touchPoints: navigator.maxTouchPoints
    };

    try {
      const prompt = `Perform a FORENSIC DEVICE SCAN. Diagnostic Data: ${JSON.stringify(forensicContext)}. 
      Examine the device environment for signs of 'hacks', persistent malware, rootkit indicators, or unauthorized system modifications. 
      Determine if the platform stability is compromised. 
      YOU MUST identify any potential threats and strongly suggest a technical SOLUTION for each. 
      Return a HIGH PRIORITY alert if any red flags are detected.`;

      const result = await securityService.classifyThreat(prompt);
      const entry = await localVault.insert('THREAT', {
        ...result,
        explanation: `[FORENSIC_DEVICE_SCAN] ${result.explanation}`
      }, 60);
      setReports(prev => [{ ...result, id: entry.id, explanation: `[FORENSIC_DEVICE_SCAN] ${result.explanation}` }, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePurge = async () => {
    if (confirm("Purge all findings from the vault?")) {
      await localVault.purgeAll();
      setReports([]);
    }
  };

  const handleClearReport = async (id: string) => {
    await localVault.delete(id);
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const handleExportLogs = () => {
    if (reports.length === 0) return;
    
    const exportData = reports.map(({ id, ...rest }) => ({
      report_id: id,
      timestamp: new Date().toISOString(),
      ...rest
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AEGIS_SECURITY_REPORT_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in px-2 pb-12 relative">
      {/* Dynamic Scanline Overlay */}
      {isScanningVisual && (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-neon-cyan/5 animate-[pulse_1s_ease-in-out_infinite]"></div>
          <div className="scan-bar-sweep"></div>
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-white">Heuristic_Scanner</h2>
        <p className="text-gray-500 text-[10px] font-mono">CipherX Metadata Audit Pipeline</p>
      </div>

      <div className="bg-cyber-gray p-6 rounded-2xl border border-white/5 shadow-xl relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
          <label className="block text-[10px] uppercase text-gray-500 font-bold tracking-widest">Raw Log Snippet / Metadata Entry</label>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={handleSystemIntegrityCheck}
              disabled={loading}
              className="flex-1 sm:flex-none text-[9px] font-black text-neon-purple hover:text-neon-cyan transition-all uppercase tracking-widest border border-neon-purple/20 px-4 py-2 rounded-full bg-neon-purple/5 hover:bg-neon-purple/10 flex items-center justify-center gap-2 group shadow-lg"
            >
              <i className="fas fa-microchip group-hover:rotate-180 transition-transform duration-500"></i>
              INTEGRITY
            </button>
            <button 
              onClick={scanDeviceForThreats}
              disabled={loading}
              className="flex-1 sm:flex-none text-[9px] font-black text-neon-cyan hover:text-white transition-all uppercase tracking-widest border border-neon-cyan/20 px-4 py-2 rounded-full bg-neon-cyan/5 hover:bg-neon-cyan/10 flex items-center justify-center gap-2 group shadow-lg"
            >
              <i className="fas fa-shield-virus group-hover:scale-110 transition-transform"></i>
              SCAN_DEVICE
            </button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste abstracted indicators or server logs for AegisAI triage..."
          className="w-full h-32 bg-black border border-white/10 rounded-xl p-4 font-mono text-sm focus:border-neon-cyan focus:outline-none transition-all resize-none text-neon-green placeholder:text-gray-800"
        />
        <div className="mt-4 flex justify-between items-center">
           <span className="text-[9px] text-gray-600 font-mono italic">Privacy: Metadata only. Do not input PII.</span>
           <Button onClick={handleScan} loading={loading} className="px-10">CLASSIFY_VECTOR</Button>
        </div>
      </div>

      {reports.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
             <h3 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
               <i className="fas fa-fingerprint text-neon-cyan"></i>
               Vault_Findings ({reports.length})
             </h3>
             <div className="flex items-center gap-4">
               <button 
                onClick={handleExportLogs} 
                className="text-[9px] text-neon-cyan uppercase tracking-widest font-black hover:underline flex items-center gap-2"
               >
                 <i className="fas fa-download"></i>
                 EXPORT_LOGS
               </button>
               <button onClick={handlePurge} className="text-[9px] text-threat-high uppercase tracking-widest hover:underline">Clear Archive</button>
             </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {reports.map((report) => (
              <ThreatCard key={report.id} report={report} onClear={() => handleClearReport(report.id)} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        .scan-bar-sweep {
          position: fixed;
          top: -20vh;
          left: 0;
          width: 100%;
          height: 20vh;
          background: linear-gradient(to bottom, 
            transparent, 
            rgba(0, 243, 255, 0.1) 40%, 
            rgba(0, 243, 255, 0.8) 50%, 
            rgba(0, 243, 255, 0.1) 60%, 
            transparent
          );
          box-shadow: 0 0 40px rgba(0, 243, 255, 0.5);
          z-index: 101;
          animation: sweep-down 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes sweep-down {
          0% { transform: translateY(-20vh); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(120vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ThreatScanner;
