
import React, { useState } from 'react';
import { localVault } from '../lib/database';
import { Button } from '../components/Button';

const Settings: React.FC = () => {
  const [purgeLoading, setPurgeLoading] = useState(false);

  const handleGlobalPurge = async () => {
    if (!confirm("Are you sure? This will PERMANENTLY delete all locally stored security logs, breach archives, and password metadata. This action cannot be undone.")) return;
    
    setPurgeLoading(true);
    try {
      await localVault.purgeAll();
      alert("Vault wiped successfully. Session reset.");
      window.location.reload();
    } catch (err) {
      console.error("Purge failed:", err);
    } finally {
      setPurgeLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-fade-in py-8 pb-20 px-2">
      <div className="flex items-center gap-4 mb-4">
        <i className="fas fa-gear text-2xl text-neon-cyan"></i>
        <h2 className="text-2xl font-bold uppercase tracking-widest text-white">System_Config</h2>
      </div>

      {/* Data Management */}
      <section className="space-y-6">
        <h3 className="text-sm font-bold text-neon-cyan uppercase tracking-widest flex items-center gap-2">
          <i className="fas fa-database"></i> Data Management
        </h3>
        <div className="bg-cyber-gray/50 rounded-2xl border border-white/5 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-1">Wipe Encrypted Vault</h4>
              <p className="text-[10px] text-gray-500 font-mono">Purge all IndexedDB records and clear volatile metadata.</p>
            </div>
            <Button variant="red" onClick={handleGlobalPurge} loading={purgeLoading} className="text-[10px] w-full sm:w-auto">
              FACTORY_RESET_VAULT
            </Button>
          </div>
        </div>
      </section>

      {/* Founder's Vision Section */}
      <section className="space-y-6">
        <h3 className="text-sm font-bold text-neon-cyan uppercase tracking-widest flex items-center gap-2">
          <i className="fas fa-lightbulb"></i> Founder’s Vision
        </h3>
        <div className="bg-cyber-gray/50 rounded-2xl border border-white/5 p-8 shadow-2xl relative overflow-hidden italic text-gray-300 leading-relaxed font-serif">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <i className="fas fa-quote-right text-6xl text-neon-cyan"></i>
          </div>
          <div className="relative z-10 space-y-4">
            <p className="text-lg">
              "AegisAI was born from a simple belief: security should be intelligent, silent, and respectful of privacy."
            </p>
            <p className="text-sm">
              In a world where digital threats evolve faster than people can react, I envisioned an AI-driven shield—one that doesn’t just respond to attacks, but anticipates them. AegisAI is designed to protect individuals without exploiting their data, to defend quietly without creating fear, and to empower users without complexity.
            </p>
            <p className="text-sm">
              This platform is built with a privacy-first philosophy, where trust is earned through transparency, and protection never comes at the cost of freedom.
            </p>
            <p className="text-sm">
              AegisAI is not just an app—it is a commitment to ethical security in an increasingly exposed world.
            </p>
            <div className="pt-6 border-t border-white/5 not-italic font-mono">
              <p className="text-neon-cyan font-bold">— Wally Nthani</p>
              <p className="text-[10px] text-gray-500 uppercase">Founder, CipherX Inc | Creator of AegisAI</p>
            </div>
          </div>
        </div>
      </section>

      {/* Credits Section */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-neon-cyan uppercase tracking-widest flex items-center gap-2">
          <i className="fas fa-award"></i> Credits
        </h3>
        <div className="bg-cyber-gray/50 rounded-2xl border border-white/5 p-6 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Founder & Security Architect</p>
              <p className="text-neon-green font-bold">Wally Nthani</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Company</p>
              <p className="text-white">CipherX Inc</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Product Name</p>
              <p className="text-white">AegisAI</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Platform Vision</p>
              <p className="text-gray-400 text-xs">Intelligent, privacy-first digital security</p>
            </div>
          </div>
        </div>
      </section>

      {/* Legal & Compliance Section */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-threat-medium uppercase tracking-widest flex items-center gap-2">
          <i className="fas fa-scale-balanced"></i> Legal & Compliance
        </h3>
        <div className="bg-black/40 rounded-2xl border border-white/5 p-8 space-y-6">
          <div className="space-y-2">
            <h4 className="text-[10px] text-neon-cyan font-bold uppercase tracking-widest">Trademark Notice</h4>
            <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
              AegisAI™ is a trademark of CipherX Inc. All product names, logos, and brands are property of their respective owners.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] text-neon-cyan font-bold uppercase tracking-widest">Ownership & Rights</h4>
            <p className="text-[11px] text-gray-400 font-mono leading-relaxed">
              © 2026 CipherX Inc. All rights reserved. AegisAI is an independently developed security application and is not affiliated with, endorsed by, or sponsored by any government entity, law enforcement agency, or operating system provider.
            </p>
          </div>

          <div className="space-y-2 border-t border-white/5 pt-4">
            <h4 className="text-[10px] text-threat-high font-bold uppercase tracking-widest">Disclaimer</h4>
            <p className="text-[11px] text-gray-500 font-mono italic leading-relaxed">
              AegisAI provides intelligent security monitoring and alerts. While it enhances protection, no software can guarantee complete security against all threats.
            </p>
          </div>
        </div>
      </section>

      <div className="text-center pt-8 border-t border-white/5">
        <p className="text-[10px] text-gray-700 uppercase tracking-[0.5em] font-mono">
          Locked Identity // AegisAI v2.5.0-STABLE
        </p>
      </div>
    </div>
  );
};

export default Settings;
