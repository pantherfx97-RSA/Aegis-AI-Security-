
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/Button.tsx';
import { localVault } from '../lib/database.ts';
import { securityService } from '../geminiService.ts';
import { ThreatLevel } from '../types.ts';

interface SentinelProps {
  onIntruderDetected?: () => void;
}

const Sentinel: React.FC<SentinelProps> = ({ onIntruderDetected }) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState<{ id: number; time: string; msg: string; type: string }[]>([]);
  const [alertHistory, setAlertHistory] = useState<any[]>([]);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isAlerting, setIsAlerting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analysisIntervalRef = useRef<number | null>(null);

  const addLog = (msg: string, type: 'info' | 'danger' | 'warning' = 'info') => {
    setLogs(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 15));
  };

  const loadAlertHistory = async () => {
    try {
      const entries = await localVault.getEntries('INTRUSION');
      setAlertHistory(entries.sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      console.error("Failed to load intrusion history:", err);
    }
  };

  useEffect(() => {
    loadAlertHistory();
    const checkCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      } catch (err) {
        console.error("Camera check error:", err);
      }
    };
    checkCameras();
    return () => {
      if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    };
  }, []);

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Scale down for API efficiency
    const scale = 0.5;
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Get base64 without the prefix
    return canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
  };

  const performAIAnalysis = async () => {
    if (!isMonitoring || isAnalyzing) return;
    
    setIsAnalyzing(true);
    addLog("Neural Scan: Capturing frame...", "info");
    
    const frame = captureFrame();
    if (!frame) {
      setIsAnalyzing(false);
      return;
    }

    try {
      const report = await securityService.analyzeVision(frame);
      
      // FIX: Corrected the truncated logic at line 93 and added proper alert handling
      if (report.threatLevel === ThreatLevel.HIGH || report.threatLevel === ThreatLevel.MEDIUM) {
        setIsAlerting(true);
        onIntruderDetected?.();
        addLog(`ALERT: ${report.explanation}`, "danger");
        
        await localVault.insert('INTRUSION', report, 90);
        await loadAlertHistory();
      } else {
        addLog("Neural Scan: Clear.", "info");
        setIsAlerting(false);
      }
    } catch (error) {
      console.error("Vision analysis failed:", error);
      addLog("Neural Scan: Error processing frame.", "warning");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: facingMode } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsMonitoring(true);
        addLog("Sentinel Core: Monitoring active.", "info");
        
        // Start periodic analysis every 15 seconds
        analysisIntervalRef.current = window.setInterval(performAIAnalysis, 15000);
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      addLog("Hardware Error: Camera access denied.", "danger");
    }
  };

  const stopMonitoring = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsMonitoring(false);
    setIsAnalyzing(false);
    setIsAlerting(false);
    addLog("Sentinel Core: Monitoring suspended.", "warning");
  };

  const toggleCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    if (isMonitoring) {
      stopMonitoring();
      // Re-start with new facing mode
      setTimeout(startMonitoring, 100);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in pb-20">
      <div className="lg:col-span-2 space-y-6">
        <div className="relative rounded-[2rem] overflow-hidden bg-black border border-white/10 aspect-video shadow-2xl group">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover transition-opacity duration-1000 ${isMonitoring ? 'opacity-100' : 'opacity-20'}`}
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {isAlerting && (
            <div className="absolute inset-0 border-4 border-threat-high animate-pulse pointer-events-none"></div>
          )}
          
          <div className="absolute top-6 left-6 flex gap-3">
             <div className={`px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase flex items-center gap-2 backdrop-blur-md border ${
               isMonitoring ? 'bg-neon-green/20 border-neon-green/30 text-neon-green' : 'bg-white/5 border-white/10 text-gray-500'
             }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isMonitoring ? 'bg-neon-green animate-pulse' : 'bg-gray-600'}`}></div>
                {isMonitoring ? 'LIVE_STREAMING' : 'OFFLINE'}
             </div>
             {isAnalyzing && (
               <div className="px-3 py-1 rounded-full text-[8px] font-black tracking-widest uppercase bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan backdrop-blur-md flex items-center gap-2">
                 <i className="fas fa-brain animate-pulse"></i>
                 AI_ANALYZING
               </div>
             )}
          </div>

          {!isMonitoring && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
               <i className="fas fa-eye-slash text-4xl text-gray-700 mb-4"></i>
               <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em]">Sentinel Standby</p>
            </div>
          )}

          <div className="absolute bottom-6 right-6 flex gap-4">
            {hasMultipleCameras && (
              <button 
                onClick={toggleCamera}
                className="w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:bg-neon-cyan/20 transition-all backdrop-blur-md"
              >
                <i className="fas fa-camera-rotate"></i>
              </button>
            )}
            <Button 
              variant={isMonitoring ? 'red' : 'cyan'} 
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              className="px-8 rounded-full"
            >
              {isMonitoring ? 'TERMINATE_WATCH' : 'ENGAGE_WATCH'}
            </Button>
          </div>
        </div>

        {/* Logs Section */}
        <div className="bg-cyber-gray/50 rounded-2xl border border-white/5 p-6 h-64 overflow-hidden flex flex-col">
           <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
             <i className="fas fa-list-ul"></i> Sentinel_Event_Log
           </h3>
           <div className="flex-1 overflow-y-auto space-y-3 font-mono">
             {logs.length === 0 && <p className="text-[9px] text-gray-700 italic">No telemetry data available.</p>}
             {logs.map(log => (
               <div key={log.id} className="text-[10px] flex gap-3 opacity-80 hover:opacity-100 transition-opacity">
                 <span className="text-gray-600 shrink-0">[{log.time}]</span>
                 <span className={
                   log.type === 'danger' ? 'text-threat-high font-bold' : 
                   log.type === 'warning' ? 'text-threat-medium' : 'text-neon-cyan'
                 }>
                   {log.msg}
                 </span>
               </div>
             ))}
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-cyber-gray p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-neon-cyan/5 rounded-full blur-2xl group-hover:bg-neon-cyan/10 transition-all"></div>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-6">Sentinel_Policy</h3>
          <ul className="space-y-4">
            {[
              { label: 'Neural Scan Interval', val: '15s' },
              { label: 'Intrusion Sensitivity', val: 'HIGH' },
              { label: 'Privacy Buffer', val: 'NON-PERSISTENT' },
              { label: 'Identity Verification', val: 'ENABLED' }
            ].map((p, i) => (
              <li key={i} className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-2">
                <span className="text-gray-500">{p.label}</span>
                <span className="text-neon-cyan font-bold">{p.val}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-cyber-gray p-8 rounded-[2rem] border border-white/5 shadow-2xl">
           <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-6">Alert_History</h3>
           <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
             {alertHistory.length === 0 && (
               <div className="text-center py-10">
                  <i className="fas fa-check-circle text-neon-green text-3xl mb-3 opacity-20"></i>
                  <p className="text-[9px] text-gray-700 uppercase">Perimeter Secure</p>
               </div>
             )}
             {alertHistory.map((alert) => (
               <div key={alert.id} className="p-4 bg-black/40 rounded-xl border border-white/5 hover:border-threat-high/30 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black text-threat-high uppercase">Intrusion Detected</span>
                    <span className="text-[8px] text-gray-600">{new Date(alert.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 line-clamp-2 italic leading-relaxed">{alert.metadata.explanation}</p>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

// FIX: Added missing default export to satisfy App.tsx import requirements
export default Sentinel;
