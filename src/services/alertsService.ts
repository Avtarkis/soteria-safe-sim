
import { Alert } from '@/types/alerts';

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

// Save an alert for a user
export const saveUserAlert = async (userId: string, alert: Alert): Promise<boolean> => {
  try {
    const storedAlertsString = localStorage.getItem(`alerts_${userId}`);
    const storedAlerts: Alert[] = storedAlertsString ? JSON.parse(storedAlertsString) : [];
    
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
    const storedAlertsString = localStorage.getItem(`alerts_${userId}`);
    const storedAlerts: Alert[] = storedAlertsString ? JSON.parse(storedAlertsString) : [];
    
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
    const storedAlertsString = localStorage.getItem(`alerts_${userId}`);
    const storedAlerts: Alert[] = storedAlertsString ? JSON.parse(storedAlertsString) : [];
    
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
