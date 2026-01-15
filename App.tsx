
import React, { useState, useEffect } from 'react';
import { SecurityState } from './types.ts';
import { Button } from './components/Button.tsx';
import Dashboard from './views/Dashboard.tsx';
import ThreatScanner from './views/ThreatScanner.tsx';
import PasswordAudit from './views/PasswordAudit.tsx';
import Sentinel from './views/Sentinel.tsx';
import Assistant from './views/Assistant.tsx';
import Settings from './views/Settings.tsx';
import SplashScreen from './components/SplashScreen.tsx';

type Tab = 'dashboard' | 'scanner' | 'passwords' | 'sentinel' | 'assistant' | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showSplash, setShowSplash] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  
  const [systemState, setSystemState] = useState<SecurityState>({
    isMonitoring: true,
    intruderAlertCount: 0,
    networkThreatsDetected: 0,
    lastSync: new Date(),
  });

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 2500);

    // PWA Install Logic
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      console.log('AegisAI successfully installed to Home Screen.');
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => clearTimeout(splashTimer);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    setDeferredPrompt(null);
  };

  const handleIntruderDetected = () => {
    setSystemState(prev => ({
      ...prev,
      intruderAlertCount: prev.intruderAlertCount + 1,
      lastSync: new Date()
    }));
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  const NavItem: React.FC<{ tab: Tab; icon: string; label: string }> = ({ tab, icon, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col items-center justify-center py-3 px-1 transition-all duration-300 border-b-2 ${
        activeTab === tab 
          ? 'border-neon-cyan text-neon-cyan' 
          : 'border-transparent text-gray-500 hover:text-gray-300'
      }`}
    >
      <i className={`fas ${icon} text-lg mb-1`}></i>
      <span className="text-[10px] uppercase font-mono tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-black text-gray-200 font-mono selection:bg-neon-cyan/30 animate-fade-in">
      {/* PWA Install Banner */}
      {deferredPrompt && (
        <div className="bg-neon-cyan text-black px-4 py-2 text-center text-[10px] font-bold uppercase tracking-widest animate-pulse flex justify-between items-center z-[100]">
          <span>Add AegisAI to Home Screen for offline security.</span>
          <button onClick={handleInstallClick} className="bg-black text-neon-cyan px-3 py-1 rounded border border-black hover:bg-black/80">INSTALL_NOW</button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 border-2 border-neon-cyan rounded-lg flex items-center justify-center shadow-neon">
              <i className="fas fa-shield-halved text-neon-cyan"></i>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full animate-pulse shadow-neon-green"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-white leading-tight">
              AEGIS<span className="text-neon-cyan">AI</span>
            </h1>
            <p className="text-[10px] text-neon-green/80 uppercase">Sentinel Mode Active</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase">Vault Integrity</p>
            <div className="w-24 h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-neon-cyan w-full animate-pulse"></div>
            </div>
          </div>
          <Button variant="cyan" onClick={() => setActiveTab('settings')} className="text-[10px]">CONFIG_VAULT</Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full p-4 pb-24 md:pb-4">
        {activeTab === 'dashboard' && <Dashboard state={systemState} />}
        {activeTab === 'scanner' && <ThreatScanner />}
        {activeTab === 'passwords' && <PasswordAudit />}
        {activeTab === 'sentinel' && <Sentinel onIntruderDetected={handleIntruderDetected} />}
        {activeTab === 'assistant' && <Assistant />}
        {activeTab === 'settings' && <Settings />}
      </main>

      {/* Mobile Navigation / Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-cyber-gray border-t border-white/5 grid grid-cols-6 px-2 z-50 md:sticky md:top-0 md:bg-black/60 md:border-t-0 md:mb-6 md:rounded-full md:mx-auto md:max-w-2xl md:shadow-2xl md:backdrop-blur-xl md:border md:border-white/10">
        <NavItem tab="dashboard" icon="fa-gauge-high" label="Vault" />
        <NavItem tab="scanner" icon="fa-microscope" label="Scan" />
        <NavItem tab="passwords" icon="fa-key" label="Audit" />
        <NavItem tab="sentinel" icon="fa-eye" label="Optic" />
        <NavItem tab="assistant" icon="fa-robot" label="AI" />
        <NavItem tab="settings" icon="fa-gear" label="Config" />
      </nav>
    </div>
  );
};

export default App;
