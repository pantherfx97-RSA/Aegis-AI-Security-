
import React, { useState, useEffect } from 'react';
import { SecurityState } from './types.ts';
import { Button } from './components/Button.tsx';
import Dashboard from './views/Dashboard.tsx';
import ThreatScanner from './views/ThreatScanner.tsx';
import PasswordAudit from './views/PasswordAudit.tsx';
import Sentinel from './views/Sentinel.tsx';
import Assistant from './views/Assistant.tsx';
import Settings from './views/Settings.tsx';
import VoiceCore from './views/VoiceCore.tsx';
import SplashScreen from './components/SplashScreen.tsx';

type Tab = 'dashboard' | 'scanner' | 'passwords' | 'sentinel' | 'assistant' | 'voice' | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showSplash, setShowSplash] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  const [systemState, setSystemState] = useState<SecurityState>({
    isMonitoring: true,
    intruderAlertCount: 0,
    networkThreatsDetected: 0,
    lastSync: new Date(),
  });

  const BRAND_LOGO_URL = "https://cdn-icons-png.flaticon.com/512/2092/2092663.png";

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 2800);
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    });

    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => clearTimeout(splashTimer);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const handleIntruderDetected = () => {
    setSystemState(prev => ({
      ...prev,
      intruderAlertCount: prev.intruderAlertCount + 1,
      lastSync: new Date()
    }));
  };

  if (showSplash) return <SplashScreen />;

  const NavItem: React.FC<{ tab: Tab; icon: string; label: string }> = ({ tab, icon, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col items-center justify-center py-2.5 px-1 transition-all duration-300 relative group ${
        activeTab === tab ? 'text-neon-cyan' : 'text-gray-600 hover:text-gray-400'
      }`}
    >
      <div className={`mb-1 transition-transform duration-300 ${activeTab === tab ? 'scale-110' : 'group-hover:scale-105'}`}>
        <i className={`fas ${icon} text-lg`}></i>
      </div>
      <span className="text-[9px] uppercase font-mono tracking-tighter opacity-70">{label}</span>
      {activeTab === tab && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-neon-cyan rounded-full shadow-neon animate-pulse"></div>
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-cyber-black text-gray-200 font-mono selection:bg-neon-cyan/20 animate-fade-in">
      {deferredPrompt && activeTab === 'dashboard' && !isInstalled && (
        <div className="bg-gradient-to-r from-neon-cyan/10 to-transparent border-b border-neon-cyan/20 text-white px-5 py-3 text-[10px] font-bold uppercase tracking-widest flex justify-between items-center z-[100] backdrop-blur-md animate-fade-in">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-neon-cyan rounded-full animate-ping"></div>
             <span>System Optimization: Deployment Package Ready</span>
          </div>
          <button onClick={handleInstallClick} className="bg-neon-cyan text-black px-5 py-2 rounded-lg font-black hover:shadow-neon transition-all text-[9px] tracking-tighter">EXECUTE_UPGRADE</button>
        </div>
      )}

      <header className="sticky top-0 z-50 bg-cyber-black/90 backdrop-blur-2xl border-b border-white/5 p-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-11 h-11 border border-white/10 rounded-xl flex items-center justify-center bg-white/5 p-2 overflow-hidden group hover:border-neon-cyan/50 transition-all duration-500">
              <img src={BRAND_LOGO_URL} alt="AEGIS AI SECURITY" className="w-full h-full object-contain filter invert group-hover:brightness-125 group-hover:scale-110 transition-all" style={{ filter: 'drop-shadow(0 0 4px rgba(0, 243, 255, 0.4))' }} />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-neon-green rounded-full border-2 border-cyber-black animate-pulse shadow-neon-green"></div>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-[0.2em] text-white leading-none uppercase">AEGIS AI <span className="text-neon-cyan">SECURITY</span></h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[8px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded ${isInstalled ? 'text-neon-green bg-neon-green/10' : 'text-neon-cyan bg-neon-cyan/10'}`}>{isInstalled ? 'NATIVE_CORE_ACTIVE' : 'WEB_INSTANCE_STABLE'}</span>
              <span className="text-[8px] text-gray-600 uppercase">v2.9.4_X</span>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest">Vault Shielding</span>
              <span className="text-[9px] text-neon-cyan font-bold">98.4%</span>
            </div>
            <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple w-[98.4%] animate-pulse"></div>
            </div>
          </div>
          <Button variant="cyan" onClick={() => setActiveTab('voice')} className="text-[9px] rounded-full px-6 flex items-center gap-2">
            <i className="fas fa-signal-stream animate-pulse"></i> COMM_LINK
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full p-4 pb-28 md:pb-6">
        <div className="relative">
          {activeTab === 'dashboard' && <Dashboard state={systemState} isInstalled={isInstalled} />}
          {activeTab === 'scanner' && <ThreatScanner />}
          {activeTab === 'passwords' && <PasswordAudit />}
          {activeTab === 'sentinel' && <Sentinel onIntruderDetected={handleIntruderDetected} />}
          {activeTab === 'assistant' && <Assistant />}
          {activeTab === 'voice' && <VoiceCore />}
          {activeTab === 'settings' && <Settings canInstall={!!deferredPrompt} isInstalled={isInstalled} onInstall={handleInstallClick} isIOS={isIOS} />}
        </div>
      </main>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-xl bg-cyber-gray/80 backdrop-blur-3xl border border-white/10 grid grid-cols-7 px-1 py-1 z-50 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] md:bottom-6">
        <NavItem tab="dashboard" icon="fa-chart-network" label="Status" />
        <NavItem tab="scanner" icon="fa-bolt-lightning" label="Scan" />
        <NavItem tab="passwords" icon="fa-fingerprint" label="Audit" />
        <NavItem tab="sentinel" icon="fa-eye" label="Optic" />
        <NavItem tab="voice" icon="fa-waveform-lines" label="Comm" />
        <NavItem tab="assistant" icon="fa-atom" label="Core" />
        <NavItem tab="settings" icon="fa-sliders" label="Menu" />
      </nav>
    </div>
  );
};

export default App;
