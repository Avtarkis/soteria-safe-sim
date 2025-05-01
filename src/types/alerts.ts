
export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  category: 'security' | 'health' | 'environmental' | 'travel' | 'family' | 'cyber';
  status: 'active' | 'dismissed' | 'resolved';
  createdAt: string;
  userId: string;
  actionText?: string;
  actionLink?: string;
  icon?: string;
}

export type AlertSeverity = Alert['severity'];
export type AlertCategory = Alert['category'];
export type AlertStatus = Alert['status'];
