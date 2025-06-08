
// Soteria Device Configuration
// Update these values when final production hardware is available

export const DEVICE_CONFIG = {
  // BLE Device Specifications
  BLE: {
    deviceName: 'Soteria Safety Device',
    serviceUUID: 'f7ac1f10-01ab-42e9-bf3c-010203040506',
    characteristics: {
      panicTrigger: 'f7ac1f11-01ab-42e9-bf3c-010203040506',
      feedback: 'f7ac1f12-01ab-42e9-bf3c-010203040506'
    }
  },
  
  // NFC Command Specifications
  NFC: {
    actions: {
      ACTIVATE: 'activate',
      CANCEL: 'cancel',
      STATUS_CHECK: 'status_check'
    } as const
  },
  
  // Emergency Response Configuration
  EMERGENCY: {
    vibrationPatterns: {
      alert: [200, 100, 200, 100, 200],
      sos: [100, 100, 100, 100, 100, 300, 300, 100, 300, 100, 300, 300, 100, 100, 100, 100, 100],
      heartbeat: [100, 100, 100, 100, 800]
    },
    wakeLockDuration: 30 * 60 * 1000, // 30 minutes
    syncRetryAttempts: 3
  }
};

export type SoteriaDeviceConfig = typeof DEVICE_CONFIG;
export type NFCAction = keyof typeof DEVICE_CONFIG.NFC.actions;
