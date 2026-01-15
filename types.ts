
export enum ThreatLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface SecurityReport {
  threatLevel: ThreatLevel;
  confidenceScore: number;
  recommendedAction: string;
  explanation: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface SecurityState {
  isMonitoring: boolean;
  intruderAlertCount: number;
  networkThreatsDetected: number;
  lastSync: Date;
}
