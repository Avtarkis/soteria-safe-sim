
import { nativeAPIManager } from './NativeAPIManager';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

class PushNotificationService {
  private vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  private serviceEndpoint = '/api/notifications';

  async initializePushNotifications(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return false;
      }

      const permission = await nativeAPIManager.requestNotificationPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(this.vapidPublicKey || '')
      });

      await this.sendSubscriptionToServer(subscription);
      console.log('Push notifications initialized successfully');
      return true;

    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch(`${this.serviceEndpoint}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
    } catch (error) {
      console.error('Error sending subscription to server:', error);
    }
  }

  async sendNotification(payload: NotificationPayload, userIds?: string[]): Promise<boolean> {
    try {
      const response = await fetch(`${this.serviceEndpoint}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload,
          userIds,
          timestamp: new Date().toISOString(),
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  async sendEmergencyAlert(
    emergencyType: string,
    location: [number, number],
    description: string
  ): Promise<boolean> {
    const payload: NotificationPayload = {
      title: '🚨 EMERGENCY ALERT',
      body: `${emergencyType}: ${description}`,
      icon: '/soteria-logo.png',
      badge: '/favicon.ico',
      data: {
        type: 'emergency',
        emergencyType,
        location,
        timestamp: Date.now(),
      },
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/favicon.ico'
        },
        {
          action: 'help',
          title: 'Send Help'
        }
      ]
    };

    return await this.sendNotification(payload);
  }

  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async unsubscribe(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        // Notify server to remove subscription
        await fetch(`${this.serviceEndpoint}/unsubscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
export type { NotificationPayload, PushSubscription };
