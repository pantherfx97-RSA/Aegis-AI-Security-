
import React from 'react';
import { SecurityReport, ThreatLevel } from '../types.ts';

interface ThreatCardProps {
  report: SecurityReport;
  onClear?: () => void;
}

export const ThreatCard: React.FC<ThreatCardProps> = ({ report, onClear }) => {
  const getColors = () => {
    switch (report.threatLevel) {
      case ThreatLevel.HIGH: return 'border-threat-high text-threat-high bg-threat-high/5';
      case ThreatLevel.MEDIUM: return 'border-threat-medium text-threat-medium bg-threat-medium/5';
      case ThreatLevel.LOW: return 'border-threat-low text-threat-low bg-threat-low/5';
      default: return 'border-gray-500 text-gray-400 bg-white/5';
    }
  };

  const getIcon = () => {
    switch (report.threatLevel) {
      case ThreatLevel.HIGH: return 'fa-radiation animate-pulse';
      case ThreatLevel.MEDIUM: return 'fa-triangle-exclamation';
      case ThreatLevel.LOW: return 'fa-shield-check';
      default: return 'fa-circle-info';
    }
  };

  return (
    <div className={`p-5 border border-white/10 border-l-4 rounded-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl animate-fade-in ${getColors()}`}>
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3">
          <i className={`fas ${getIcon()} text-lg`}></i>
          {report.threatLevel} PRIORITY THREAT
        </h4>
        <div className="text-[9px] font-mono bg-black/40 px-2 py-1 rounded border border-white/5 text-gray-400">
          CONFIDENCE: {report.confidenceScore}%
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-200 leading-relaxed font-mono">
          {report.explanation}
        </p>
      </div>

      <div className="mt-4 p-4 rounded-xl bg-black/60 border border-white/10 shadow-inner group">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black text-neon-cyan uppercase tracking-widest">Recommended Mitigation:</span>
          <div className="h-px flex-1 bg-neon-cyan/10"></div>
        </div>
        <p className="text-xs text-neon-green font-mono leading-relaxed group-hover:translate-x-1 transition-transform">
          {report.recommendedAction}
        </p>
      </div>

      {onClear && (
        <div className="mt-4 flex justify-end">
          <button 
            onClick={onClear}
            className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 hover:text-white transition-colors flex items-center gap-2"
          >
            [ ARCHIVE_FINDING ]
            <i className="fas fa-folder-closed"></i>
          </button>
        </div>
      )}
    </div>
  );
};
