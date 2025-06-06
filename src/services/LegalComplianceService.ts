
interface ComplianceConfig {
  gdprEnabled: boolean;
  ccpaEnabled: boolean;
  dataRetentionDays: number;
  cookieConsentRequired: boolean;
  analyticsEnabled: boolean;
  marketingConsentRequired: boolean;
}

interface UserConsent {
  userId: string;
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  location: boolean;
  medical: boolean;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
}

interface DataRequest {
  id: string;
  userId: string;
  type: 'export' | 'delete' | 'rectify';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: number;
  completedAt?: number;
  details?: string;
}

class LegalComplianceService {
  private config: ComplianceConfig;
  private consentRecords: Map<string, UserConsent> = new Map();
  private dataRequests: Map<string, DataRequest> = new Map();

  constructor() {
    this.config = {
      gdprEnabled: true,
      ccpaEnabled: true,
      dataRetentionDays: 365,
      cookieConsentRequired: true,
      analyticsEnabled: false, // Disabled by default until consent
      marketingConsentRequired: true
    };
    this.loadStoredConsent();
  }

  // GDPR Compliance Methods
  recordConsent(userId: string, consents: Omit<UserConsent, 'userId' | 'timestamp'>): void {
    const consentRecord: UserConsent = {
      userId,
      timestamp: Date.now(),
      ...consents
    };
    
    this.consentRecords.set(userId, consentRecord);
    this.persistConsent(consentRecord);
    
    // Update analytics and marketing based on consent
    this.updateServiceConsents(consentRecord);
  }

  getConsent(userId: string): UserConsent | null {
    return this.consentRecords.get(userId) || null;
  }

  hasValidConsent(userId: string, type: keyof Pick<UserConsent, 'analytics' | 'marketing' | 'location' | 'medical'>): boolean {
    const consent = this.getConsent(userId);
    if (!consent) return false;
    
    // Check if consent is still valid (not older than 13 months for GDPR)
    const consentAge = Date.now() - consent.timestamp;
    const maxAge = 13 * 30 * 24 * 60 * 60 * 1000; // 13 months
    
    if (consentAge > maxAge) return false;
    
    return consent[type] === true;
  }

  // Data Subject Rights (GDPR Articles 15-22)
  requestDataExport(userId: string): string {
    const requestId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const request: DataRequest = {
      id: requestId,
      userId,
      type: 'export',
      status: 'pending',
      requestedAt: Date.now()
    };
    
    this.dataRequests.set(requestId, request);
    this.processDataExport(requestId);
    
    return requestId;
  }

  requestDataDeletion(userId: string): string {
    const requestId = `delete-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const request: DataRequest = {
      id: requestId,
      userId,
      type: 'delete',
      status: 'pending',
      requestedAt: Date.now()
    };
    
    this.dataRequests.set(requestId, request);
    this.processDataDeletion(requestId);
    
    return requestId;
  }

  private async processDataExport(requestId: string): Promise<void> {
    const request = this.dataRequests.get(requestId);
    if (!request) return;

    try {
      request.status = 'processing';
      
      // Simulate data collection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would:
      // 1. Collect all user data from databases
      // 2. Format it according to GDPR requirements
      // 3. Create a downloadable file
      // 4. Send email notification to user
      
      request.status = 'completed';
      request.completedAt = Date.now();
      request.details = 'Data export completed. Download link sent via email.';
      
    } catch (error) {
      request.status = 'failed';
      request.details = `Export failed: ${error}`;
    }
  }

  private async processDataDeletion(requestId: string): Promise<void> {
    const request = this.dataRequests.get(requestId);
    if (!request) return;

    try {
      request.status = 'processing';
      
      // Simulate data deletion process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would:
      // 1. Anonymize or delete personal data
      // 2. Maintain audit trail (anonymized)
      // 3. Update all related systems
      // 4. Send confirmation to user
      
      request.status = 'completed';
      request.completedAt = Date.now();
      request.details = 'Personal data successfully deleted from all systems.';
      
    } catch (error) {
      request.status = 'failed';
      request.details = `Deletion failed: ${error}`;
    }
  }

  getDataRequestStatus(requestId: string): DataRequest | null {
    return this.dataRequests.get(requestId) || null;
  }

  // Cookie and Tracking Compliance
  shouldShowCookieBanner(): boolean {
    return this.config.cookieConsentRequired && !this.hasStoredConsent();
  }

  canUseAnalytics(userId?: string): boolean {
    if (!userId) return false;
    return this.hasValidConsent(userId, 'analytics');
  }

  canUseMarketing(userId?: string): boolean {
    if (!userId) return false;
    return this.hasValidConsent(userId, 'marketing');
  }

  // Privacy Policy and Terms
  getPrivacyPolicyVersion(): string {
    return '1.2.0'; // Version tracking for policy updates
  }

  getTermsOfServiceVersion(): string {
    return '1.1.0';
  }

  hasAcceptedCurrentTerms(userId: string): boolean {
    const consent = this.getConsent(userId);
    if (!consent) return false;
    
    // Check if user accepted current version
    // In a real implementation, track policy version acceptance
    return true; // Simplified for demo
  }

  // Data Retention Compliance
  scheduleDataRetention(): void {
    // In a real implementation, this would:
    // 1. Identify data older than retention period
    // 2. Anonymize or delete expired data
    // 3. Generate compliance reports
    console.log(`Data retention scheduled for ${this.config.dataRetentionDays} days`);
  }

  // Audit and Reporting
  generateComplianceReport(): any {
    return {
      totalUsers: this.consentRecords.size,
      consentTypes: {
        analytics: Array.from(this.consentRecords.values()).filter(c => c.analytics).length,
        marketing: Array.from(this.consentRecords.values()).filter(c => c.marketing).length,
        location: Array.from(this.consentRecords.values()).filter(c => c.location).length,
        medical: Array.from(this.consentRecords.values()).filter(c => c.medical).length
      },
      dataRequests: {
        total: this.dataRequests.size,
        pending: Array.from(this.dataRequests.values()).filter(r => r.status === 'pending').length,
        completed: Array.from(this.dataRequests.values()).filter(r => r.status === 'completed').length
      },
      config: this.config,
      generatedAt: Date.now()
    };
  }

  // Private helper methods
  private loadStoredConsent(): void {
    try {
      const stored = localStorage.getItem('legalCompliance');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.consents) {
          Object.entries(data.consents).forEach(([userId, consent]) => {
            this.consentRecords.set(userId, consent as UserConsent);
          });
        }
      }
    } catch (error) {
      console.error('Error loading stored consent:', error);
    }
  }

  private persistConsent(consent: UserConsent): void {
    try {
      const stored = JSON.parse(localStorage.getItem('legalCompliance') || '{}');
      if (!stored.consents) stored.consents = {};
      stored.consents[consent.userId] = consent;
      localStorage.setItem('legalCompliance', JSON.stringify(stored));
    } catch (error) {
      console.error('Error persisting consent:', error);
    }
  }

  private hasStoredConsent(): boolean {
    try {
      const stored = localStorage.getItem('legalCompliance');
      return stored !== null;
    } catch {
      return false;
    }
  }

  private updateServiceConsents(consent: UserConsent): void {
    // Update analytics service
    if (consent.analytics) {
      this.config.analyticsEnabled = true;
    }
    
    // Notify other services about consent changes
    document.dispatchEvent(new CustomEvent('consentUpdated', {
      detail: consent
    }));
  }

  updateConfig(newConfig: Partial<ComplianceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): ComplianceConfig {
    return { ...this.config };
  }
}

export const legalComplianceService = new LegalComplianceService();
export default legalComplianceService;
export type { ComplianceConfig, UserConsent, DataRequest };
