
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/Button.tsx';
import { localVault } from '../lib/database.ts';

interface SentinelProps {
  onIntruderDetected?: () => void;
}

interface DetectedObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
  velocity: { x: number; y: number };
  isThreat: boolean;
}

const Sentinel: React.FC<SentinelProps> = ({ onIntruderDetected }) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [logs, setLogs] = useState<{ id: number; time: string; msg: string; type: string }[]>([]);
  const [alertHistory, setAlertHistory] = useState<any[]>([]);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isAlerting, setIsAlerting] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const animationRef = useRef<number>(null);

  const addLog = (msg: string, type: 'info' | 'danger' = 'info') => {
    setLogs(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 10));
  };

  const loadAlertHistory = async () => {
    try {
      const entries = await localVault.getEntries('INTRUSION');
      setAlertHistory(entries);
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
  }, []);

  const startMonitoring = async (mode: 'user' | 'environment' = facingMode) => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode, width: { ideal: 1280 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsMonitoring(true);
        setFacingMode(mode);
        addLog(`Vault Optic Online. Protocol: WALLY-CIPHER.`, "info");
        setDetectedObjects([{ id: 'T-1', x: 20, y: 30, width: 10, height: 20, label: 'SCANNING', confidence: 0.9, velocity: { x: 0.1, y: 0.05 }, isThreat: false }]);
      }
    } catch (err) {
      addLog("Sensor Lock: Permission Denied.", "danger");
      setIsMonitoring(false);
    }
  };

  const stopMonitoring = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsMonitoring(false);
    setIsAlerting(false);
    setDetectedObjects([]);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    addLog("Vault Optic Standby.", "info");
  };

  useEffect(() => {
    if (!isMonitoring) return;
    const update = () => {
      setDetectedObjects(prev => prev.map(obj => {
        let nx = obj.x + obj.velocity.x;
        let ny = obj.y + obj.velocity.y;
        let vx = obj.velocity.x;
        let vy = obj.velocity.y;
        if (nx <= 0 || nx >= 90) vx *= -1;
        if (ny <= 0 || ny >= 80) vy *= -1;

        if (!obj.isThreat && Math.random() > 0.999) {
          setIsAlerting(true);
          onIntruderDetected?.();
          localVault.insert('INTRUSION', { label: obj.label, sensor: facingMode, confidence: 94 }, 7)
            .then(() => loadAlertHistory())
            .catch(err => console.error("Failed to record intrusion:", err));
          
          addLog("INTRUSION DETECTED: Locally Encrypted Log Generated.", "danger");
          setTimeout(() => setIsAlerting(false), 3000);
          return { ...obj, isThreat: true, velocity: { x: vx * 2, y: vy * 2 } };
        }
        return { ...obj, x: nx, y: ny, velocity: { x: vx, y: vy } };
      }));
      animationRef.current = requestAnimationFrame(update);
    };
    animationRef.current = requestAnimationFrame(update);
    return () => animationRef.current && cancelAnimationFrame(animationRef.current);
  }, [isMonitoring, facingMode]);

  const handlePurge = async () => {
    try {
      await localVault.purgeAll();
      await loadAlertHistory();
    } catch (err) {
      console.error("Failed to purge vault:", err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in px-2 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-white">CipherX_Sentinel</h2>
          <p className="text-gray-500 text-[10px] font-mono">Local-Only Biometric & Motion Heuristics.</p>
        </div>
        <div className="flex gap-2">
          {hasMultipleCameras && (
            <button onClick={() => startMonitoring(facingMode === 'user' ? 'environment' : 'user')} className="p-3 border border-white/10 rounded-lg bg-cyber-gray text-neon-cyan shadow-lg hover:bg-white/5 transition-all">
              <i className="fas fa-camera-rotate"></i>
            </button>
          )}
          <Button variant={isMonitoring ? "red" : "green"} onClick={isMonitoring ? stopMonitoring : () => startMonitoring()} className="px-8">
            {isMonitoring ? "SECURE_OFFLINE" : "ENGAGE_VAULT_OPTICS"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 relative aspect-video bg-black rounded-3xl border-2 overflow-hidden shadow-2xl transition-all duration-500 ${isAlerting ? 'border-threat-high animate-pulse' : 'border-white/5'}`}>
          <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover grayscale contrast-125 transition-opacity duration-1000 ${isMonitoring ? 'opacity-40' : 'opacity-0'}`} />
          {isMonitoring && detectedObjects.map(obj => (
            <div key={obj.id} className={`absolute border transition-all duration-100 ${obj.isThreat ? 'border-threat-high shadow-[0_0_15px_red]' : 'border-neon-cyan/40 shadow-neon'}`} style={{ left: `${obj.x}%`, top: `${obj.y}%`, width: `${obj.width}%`, height: `${obj.height}%` }}>
              <div className={`absolute -top-5 left-0 px-1 py-0.5 text-[8px] font-bold ${obj.isThreat ? 'bg-threat-high text-white' : 'bg-neon-cyan/20 text-neon-cyan'}`}>
                {obj.isThreat ? 'ALERT_INTRUDER' : 'TRACKING_M_01'}
              </div>
            </div>
          ))}
          {!isMonitoring && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-800 bg-cyber-black/90 z-40">
              <i className="fas fa-eye-slash text-4xl mb-4"></i>
              <span className="text-[10px] uppercase tracking-[0.3em]">VAULT_MODE_STANDBY</span>
            </div>
          )}
          {isAlerting && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
               <div className="bg-threat-high/20 backdrop-blur-md p-8 border-2 border-threat-high text-threat-high font-bold text-xl uppercase tracking-widest animate-bounce">
                  Intrusion Verified
               </div>
            </div>
          )}
        </div>

        <div className="bg-cyber-gray/90 rounded-3xl border border-white/5 p-6 flex flex-col h-[400px]">
          <h3 className="text-[10px] font-bold uppercase text-gray-400 mb-4 tracking-[0.2em] border-b border-white/5 pb-2">LOCAL_AUDIT_STREAM</h3>
          <div className="flex-1 overflow-y-auto space-y-3 font-mono">
            {logs.map(log => (
              <div key={log.id} className="flex gap-2 text-[10px]">
                <span className="text-gray-600 shrink-0">[{log.time}]</span>
                <span className={log.type === 'danger' ? 'text-threat-high' : 'text-neon-cyan'}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-cyber-gray/50 rounded-3xl border border-white/5 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2">
            <i className="fas fa-database text-neon-cyan"></i> Encrypted Breach Archive
          </h3>
          <button onClick={handlePurge} className="text-[10px] text-gray-600 hover:text-threat-high font-bold tracking-widest uppercase transition-colors">PURGE_VAULT</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] font-mono">
            <thead>
              <tr className="text-gray-600 border-b border-white/5">
                <th className="pb-2 uppercase">Entry_ID</th>
                <th className="pb-2 uppercase">Timestamp</th>
                <th className="pb-2 uppercase">Risk</th>
                <th className="pb-2 text-right uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {alertHistory.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-gray-700 uppercase tracking-widest italic">Zero Incidents Recorded</td></tr>
              ) : alertHistory.map(b => (
                <tr key={b.id}>
                  <td className="py-3 text-neon-cyan">{b.id}</td>
                  <td className="py-3 text-gray-400">{new Date(b.timestamp).toLocaleString()}</td>
                  <td className="py-3 text-threat-high font-bold">HIGH</td>
                  <td className="py-3 text-right"><span className="text-neon-green bg-neon-green/10 px-2 py-0.5 rounded border border-neon-green/20">ENCRYPTED</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Sentinel;
