
import React from 'react';
import { SecurityReport, ThreatLevel } from '../types';

interface ThreatCardProps {
  report: SecurityReport;
  onClear?: () => void;
}

export const ThreatCard: React.FC<ThreatCardProps> = ({ report, onClear }) => {
  const getColors = () => {
    switch (report.threatLevel) {
      case ThreatLevel.HIGH: return 'border-threat-high text-threat-high';
      case ThreatLevel.MEDIUM: return 'border-threat-medium text-threat-medium';
      case ThreatLevel.LOW: return 'border-threat-low text-threat-low';
      default: return 'border-gray-500 text-gray-400';
    }
  };

  return (
    <div className={`mt-4 p-4 border-l-4 rounded-r-md bg-cyber-gray/50 animate-fade-in ${getColors()}`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold flex items-center gap-2">
          <i className="fas fa-shield-virus"></i>
          THREAT LEVEL: {report.threatLevel}
        </h4>
        <div className="text-xs opacity-70">
          CONFIDENCE: {report.confidenceScore}%
        </div>
      </div>
      <p className="text-sm text-gray-300 mb-3">{report.explanation}</p>
      <div className="bg-black/30 p-2 rounded text-xs">
        <span className="font-bold uppercase">Action Required:</span> {report.recommendedAction}
      </div>
      {onClear && (
        <button 
          onClick={onClear}
          className="mt-3 text-[10px] uppercase tracking-widest hover:underline"
        >
          [ DISMISS_THREAT ]
        </button>
      )}
    </div>
  );
};
