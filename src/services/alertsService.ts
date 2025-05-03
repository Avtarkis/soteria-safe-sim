
import { Alert, AlertStatus } from '@/types/alerts';

/**
 * Service for managing user alerts
 */

// Get all alerts for a user
export const getUserAlerts = async (userId: string): Promise<Alert[]> => {
  // This would normally fetch from an API
  // For now, we'll use local storage
  try {
    const storedAlertsString = localStorage.getItem(`alerts_${userId}`);
    const storedAlerts: Alert[] = storedAlertsString ? JSON.parse(storedAlertsString) : [];
    return storedAlerts;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
};

// Fetch user alerts (combination of stored alerts and threat alerts)
// This is used by the useAlerts hook
export const fetchUserAlerts = async (userId: string): Promise<{ storedAlerts: Alert[], threatAlerts: Alert[] }> => {
  try {
    // Get stored alerts from local storage
    const storedAlerts = await getUserAlerts(userId);
    
    // In a real app, we might fetch real-time threat alerts from an API
    // For now, we'll just return the stored alerts
    return {
      storedAlerts,
      threatAlerts: [] // No threat alerts for now
    };
  } catch (error) {
    console.error('Error fetching all user alerts:', error);
    return { storedAlerts: [], threatAlerts: [] };
  }
};

// Update alert status (mark as read/dismissed/resolved)
export const updateAlertStatus = async (alertId: string, status: AlertStatus, userId: string): Promise<boolean> => {
  try {
    const alerts = await getUserAlerts(userId);
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId ? { ...alert, status } : alert
    );
    
    localStorage.setItem(`alerts_${userId}`, JSON.stringify(updatedAlerts));
    return true;
  } catch (error) {
    console.error('Error updating alert status:', error);
    return false;
  }
};

// Save an alert for a user
export const saveUserAlert = async (userId: string, alert: Alert): Promise<boolean> => {
  try {
    const storedAlerts: Alert[] = await getUserAlerts(userId);
    
    // Add new alert
    storedAlerts.push(alert);
    
    // Save back to storage
    localStorage.setItem(`alerts_${userId}`, JSON.stringify(storedAlerts));
    return true;
  } catch (error) {
    console.error('Error saving alert:', error);
    return false;
  }
};

// Delete an alert
export const deleteUserAlert = async (userId: string, alertId: string): Promise<boolean> => {
  try {
    const storedAlerts: Alert[] = await getUserAlerts(userId);
    
    // Filter out the alert to delete
    const updatedAlerts = storedAlerts.filter(alert => alert.id !== alertId);
    
    // Save back to storage
    localStorage.setItem(`alerts_${userId}`, JSON.stringify(updatedAlerts));
    return true;
  } catch (error) {
    console.error('Error deleting alert:', error);
    return false;
  }
};

// Mark an alert as read
export const markAlertAsRead = async (userId: string, alertId: string): Promise<boolean> => {
  try {
    const storedAlerts: Alert[] = await getUserAlerts(userId);
    
    // Find and update the alert
    const updatedAlerts = storedAlerts.map(alert => {
      if (alert.id === alertId) {
        return { ...alert, read: true };
      }
      return alert;
    });
    
    // Save back to storage
    localStorage.setItem(`alerts_${userId}`, JSON.stringify(updatedAlerts));
    return true;
  } catch (error) {
    console.error('Error marking alert as read:', error);
    return false;
  }
};

// Get demo alerts for development mode
export const getDemoAlerts = (): Alert[] => {
  const now = new Date().toISOString();
  return [
    {
      id: 'demo-1',
      title: 'Security Alert',
      description: 'Unusual login detected from a new location.',
      severity: 'warning',
      category: 'security',
      status: 'active',
      createdAt: now,
      userId: 'demo',
      actionText: 'Review Activity',
      actionLink: '/security',
      icon: 'shield'
    },
    {
      id: 'demo-2',
      title: 'Weather Warning',
      description: 'Severe storm expected in your area in the next 24 hours.',
      severity: 'critical',
      category: 'environmental',
      status: 'active',
      createdAt: now,
      userId: 'demo',
      actionText: 'See Forecast',
      actionLink: '/map',
      icon: 'cloud-lightning'
    },
    {
      id: 'demo-3',
      title: 'COVID-19 Exposure Alert',
      description: 'You may have been exposed to COVID-19 based on your recent locations.',
      severity: 'warning',
      category: 'health',
      status: 'active',
      createdAt: now,
      userId: 'demo',
      actionText: 'Health Guidelines',
      actionLink: '/health',
      icon: 'activity'
    }
  ];
};
