interface MedicalSensorReading {
  timestamp: number;
  sensorType: 'heartRate' | 'bloodPressure' | 'oxygenSaturation' | 'temperature' | 'bloodGlucose' | 'ecg';
  value: number | { systolic: number; diastolic: number } | number[];
  unit: string;
  accuracy: number;
  deviceId: string;
  deviceName: string;
}

interface ConnectedDevice {
  id: string;
  name: string;
  type: 'smartwatch' | 'fitness_tracker' | 'medical_device' | 'smartphone';
  manufacturer: string;
  model: string;
  connectionType: 'bluetooth' | 'wifi' | 'usb' | 'nfc';
  isConnected: boolean;
  lastSeen: number;
  capabilities: string[];
}

interface HealthAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  sensor: string;
  message: string;
  value: any;
  threshold: any;
  timestamp: number;
  acknowledged: boolean;
}

class AdvancedMedicalSensorService {
  private connectedDevices: Map<string, ConnectedDevice> = new Map();
  private sensorReadings: Map<string, MedicalSensorReading[]> = new Map();
  private alertListeners: Array<(alert: HealthAlert) => void> = [];
  private isMonitoring = false;
  private monitoringInterval: number | null = null;

  // Health thresholds
  private healthThresholds = {
    heartRate: { min: 60, max: 100 },
    systolicBP: { min: 90, max: 140 },
    diastolicBP: { min: 60, max: 90 },
    oxygenSaturation: { min: 95, max: 100 },
    temperature: { min: 97.0, max: 99.5 },
    bloodGlucose: { min: 70, max: 140 }
  };

  async initializeSensors(): Promise<boolean> {
    try {
      console.log('Initializing advanced medical sensors...');
      
      // Initialize Web Bluetooth for medical devices
      await this.initializeBluetoothDevices();
      
      // Initialize smartphone sensors
      await this.initializeSmartphoneSensors();
      
      // Initialize WebUSB for medical devices
      await this.initializeUSBDevices();
      
      // Initialize NFC for medical cards/devices
      await this.initializeNFCDevices();
      
      console.log('Medical sensors initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing medical sensors:', error);
      return false;
    }
  }

  private async initializeBluetoothDevices(): Promise<void> {
    if (!('bluetooth' in navigator)) {
      console.warn('Web Bluetooth not supported');
      return;
    }

    try {
      // Request Bluetooth devices with health services
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { services: ['blood_pressure'] },
          { services: ['glucose'] },
          { services: ['health_thermometer'] },
          { namePrefix: 'Fitbit' },
          { namePrefix: 'Apple Watch' },
          { namePrefix: 'Samsung' },
          { namePrefix: 'Garmin' }
        ],
        optionalServices: [
          'heart_rate',
          'blood_pressure',
          'glucose',
          'health_thermometer',
          'battery_service',
          'device_information'
        ]
      });

      if (device) {
        await this.connectBluetoothDevice(device);
      }
    } catch (error) {
      console.error('Bluetooth device initialization failed:', error);
    }
  }

  private async connectBluetoothDevice(device: any): Promise<void> {
    try {
      console.log('Connecting to device:', device.name);
      
      const server = await device.gatt.connect();
      
      // Get device information
      const deviceInfo: ConnectedDevice = {
        id: device.id,
        name: device.name || 'Unknown Device',
        type: this.determineDeviceType(device.name),
        manufacturer: 'Unknown',
        model: 'Unknown',
        connectionType: 'bluetooth',
        isConnected: true,
        lastSeen: Date.now(),
        capabilities: []
      };

      // Discover available services
      const services = await server.getPrimaryServices();
      
      for (const service of services) {
        await this.handleBluetoothService(service, deviceInfo);
      }

      this.connectedDevices.set(device.id, deviceInfo);
      
      // Handle disconnection
      device.addEventListener('gattserverdisconnected', () => {
        deviceInfo.isConnected = false;
        console.log(`Device ${device.name} disconnected`);
      });

    } catch (error) {
      console.error('Error connecting to Bluetooth device:', error);
    }
  }

  private async handleBluetoothService(service: any, deviceInfo: ConnectedDevice): Promise<void> {
    try {
      const characteristics = await service.getCharacteristics();
      
      for (const characteristic of characteristics) {
        if (characteristic.properties.notify || characteristic.properties.read) {
          await this.subscribeToCharacteristic(characteristic, deviceInfo);
        }
      }
    } catch (error) {
      console.error('Error handling Bluetooth service:', error);
    }
  }

  private async subscribeToCharacteristic(characteristic: any, deviceInfo: ConnectedDevice): Promise<void> {
    try {
      const serviceUUID = characteristic.service.uuid;
      
      if (serviceUUID === 'heart_rate') {
        deviceInfo.capabilities.push('heartRate');
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
          const heartRate = this.parseHeartRateValue(event.target.value);
          this.processSensorReading({
            timestamp: Date.now(),
            sensorType: 'heartRate',
            value: heartRate,
            unit: 'bpm',
            accuracy: 0.95,
            deviceId: deviceInfo.id,
            deviceName: deviceInfo.name
          });
        });
      } else if (serviceUUID === 'blood_pressure') {
        deviceInfo.capabilities.push('bloodPressure');
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
          const bloodPressure = this.parseBloodPressureValue(event.target.value);
          this.processSensorReading({
            timestamp: Date.now(),
            sensorType: 'bloodPressure',
            value: bloodPressure,
            unit: 'mmHg',
            accuracy: 0.90,
            deviceId: deviceInfo.id,
            deviceName: deviceInfo.name
          });
        });
      } else if (serviceUUID === 'health_thermometer') {
        deviceInfo.capabilities.push('temperature');
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
          const temperature = this.parseTemperatureValue(event.target.value);
          this.processSensorReading({
            timestamp: Date.now(),
            sensorType: 'temperature',
            value: temperature,
            unit: '°F',
            accuracy: 0.98,
            deviceId: deviceInfo.id,
            deviceName: deviceInfo.name
          });
        });
      }
    } catch (error) {
      console.error('Error subscribing to characteristic:', error);
    }
  }

  private async initializeSmartphoneSensors(): Promise<void> {
    // Camera-based heart rate detection
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }
        });
        
        // Implement photoplethysmography (PPG) for heart rate
        this.startCameraHeartRateDetection(stream);
      } catch (error) {
        console.error('Camera access failed:', error);
      }
    }

    // Accelerometer for fall detection and activity
    if ('Accelerometer' in window) {
      try {
        const sensor = new (window as any).Accelerometer({ frequency: 60 });
        sensor.addEventListener('reading', () => {
          this.processAccelerometerData(sensor.x, sensor.y, sensor.z);
        });
        sensor.start();
      } catch (error) {
        console.error('Accelerometer access failed:', error);
      }
    }
  }

  private startCameraHeartRateDetection(stream: MediaStream): void {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.srcObject = stream;
    video.play();
    
    // Process video frames for heart rate detection
    const processFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0);
        
        // Analyze red channel intensity variations
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          const heartRate = this.analyzeHeartRateFromImage(imageData);
          if (heartRate > 0) {
            this.processSensorReading({
              timestamp: Date.now(),
              sensorType: 'heartRate',
              value: heartRate,
              unit: 'bpm',
              accuracy: 0.80, // Camera-based is less accurate
              deviceId: 'smartphone_camera',
              deviceName: 'Smartphone Camera'
            });
          }
        }
      }
      requestAnimationFrame(processFrame);
    };
    
    processFrame();
  }

  private analyzeHeartRateFromImage(imageData: ImageData): number {
    // Simplified PPG analysis - in production, use more sophisticated algorithms
    const data = imageData.data;
    let redSum = 0;
    let pixelCount = 0;
    
    // Sample center region of image (fingertip area)
    const centerX = imageData.width / 2;
    const centerY = imageData.height / 2;
    const sampleSize = 50;
    
    for (let y = centerY - sampleSize; y < centerY + sampleSize; y++) {
      for (let x = centerX - sampleSize; x < centerX + sampleSize; x++) {
        const index = (y * imageData.width + x) * 4;
        redSum += data[index]; // Red channel
        pixelCount++;
      }
    }
    
    const avgRed = redSum / pixelCount;
    
    // Store for time series analysis
    if (!this.sensorReadings.has('camera_red_intensity')) {
      this.sensorReadings.set('camera_red_intensity', []);
    }
    
    const readings = this.sensorReadings.get('camera_red_intensity')!;
    readings.push({
      timestamp: Date.now(),
      sensorType: 'heartRate',
      value: avgRed,
      unit: 'intensity',
      accuracy: 1.0,
      deviceId: 'camera',
      deviceName: 'Camera'
    });
    
    // Keep only last 30 seconds of data
    const thirtySecondsAgo = Date.now() - 30000;
    const recentReadings = readings.filter(r => r.timestamp > thirtySecondsAgo);
    this.sensorReadings.set('camera_red_intensity', recentReadings);
    
    // Calculate heart rate from intensity variations
    if (recentReadings.length > 10) {
      return this.calculateHeartRateFromIntensity(recentReadings);
    }
    
    return 0;
  }

  private calculateHeartRateFromIntensity(readings: MedicalSensorReading[]): number {
    // FFT or peak detection algorithm would go here
    // Simplified: count peaks in intensity over time
    const values = readings.map(r => r.value as number);
    let peaks = 0;
    
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i - 1] && values[i] > values[i + 1]) {
        peaks++;
      }
    }
    
    const timeSpan = (readings[readings.length - 1].timestamp - readings[0].timestamp) / 1000;
    const heartRate = (peaks / timeSpan) * 60;
    
    return heartRate > 50 && heartRate < 200 ? heartRate : 0;
  }

  private async initializeUSBDevices(): Promise<void> {
    if (!('usb' in navigator)) {
      console.warn('WebUSB not supported');
      return;
    }

    try {
      // Request USB medical devices
      const device = await (navigator as any).usb.requestDevice({
        filters: [
          { vendorId: 0x2717 }, // Example: Medical device vendor
          { vendorId: 0x0483 }  // Example: Another medical device vendor
        ]
      });

      if (device) {
        await this.connectUSBDevice(device);
      }
    } catch (error) {
      console.error('USB device initialization failed:', error);
    }
  }

  private async connectUSBDevice(device: any): Promise<void> {
    try {
      await device.open();
      
      const deviceInfo: ConnectedDevice = {
        id: `usb_${device.serialNumber || Date.now()}`,
        name: device.productName || 'USB Medical Device',
        type: 'medical_device',
        manufacturer: device.manufacturerName || 'Unknown',
        model: device.productName || 'Unknown',
        connectionType: 'usb',
        isConnected: true,
        lastSeen: Date.now(),
        capabilities: ['bloodGlucose', 'bloodPressure'] // Depends on device
      };

      this.connectedDevices.set(deviceInfo.id, deviceInfo);
      
      // Start reading from device
      this.startUSBDataReading(device, deviceInfo);
    } catch (error) {
      console.error('Error connecting to USB device:', error);
    }
  }

  private async startUSBDataReading(device: any, deviceInfo: ConnectedDevice): Promise<void> {
    try {
      // USB communication protocol depends on specific device
      // This is a simplified example
      const data = await device.transferIn(1, 64); // Endpoint 1, 64 bytes
      
      if (data.status === 'ok') {
        // Parse device-specific data format
        const reading = this.parseUSBDeviceData(data.data, deviceInfo);
        if (reading) {
          this.processSensorReading(reading);
        }
      }
      
      // Continue reading
      setTimeout(() => this.startUSBDataReading(device, deviceInfo), 1000);
    } catch (error) {
      console.error('USB data reading error:', error);
    }
  }

  private parseUSBDeviceData(data: DataView, deviceInfo: ConnectedDevice): MedicalSensorReading | null {
    // Device-specific parsing logic
    // This is a placeholder - real implementation would depend on device protocol
    return null;
  }

  private async initializeNFCDevices(): Promise<void> {
    if (!('NDEFReader' in window)) {
      console.warn('Web NFC not supported');
      return;
    }

    try {
      const ndef = new (window as any).NDEFReader();
      
      ndef.addEventListener('reading', (event: any) => {
        console.log('NFC tag read:', event);
        // Parse medical data from NFC tag
        this.parseNFCMedicalData(event.message);
      });
      
      await ndef.scan();
      console.log('NFC scanning started');
    } catch (error) {
      console.error('NFC initialization failed:', error);
    }
  }

  private parseNFCMedicalData(message: any): void {
    // Parse NDEF message for medical data
    for (const record of message.records) {
      if (record.recordType === 'text') {
        const textDecoder = new TextDecoder(record.encoding);
        const data = textDecoder.decode(record.data);
        
        // Parse medical data format
        try {
          const medicalData = JSON.parse(data);
          if (medicalData.type === 'medical_id') {
            // Store emergency medical information
            this.storeEmergencyMedicalInfo(medicalData);
          }
        } catch (error) {
          console.error('Error parsing NFC medical data:', error);
        }
      }
    }
  }

  private storeEmergencyMedicalInfo(data: any): void {
    localStorage.setItem('emergencyMedicalInfo', JSON.stringify(data));
    console.log('Emergency medical information stored:', data);
  }

  private processSensorReading(reading: MedicalSensorReading): void {
    // Store reading
    if (!this.sensorReadings.has(reading.sensorType)) {
      this.sensorReadings.set(reading.sensorType, []);
    }
    
    const readings = this.sensorReadings.get(reading.sensorType)!;
    readings.push(reading);
    
    // Keep only last 24 hours of data
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentReadings = readings.filter(r => r.timestamp > oneDayAgo);
    this.sensorReadings.set(reading.sensorType, recentReadings);
    
    // Check for health alerts
    this.checkHealthAlerts(reading);
    
    // Dispatch event for real-time updates
    document.dispatchEvent(new CustomEvent('medicalSensorReading', {
      detail: reading
    }));
  }

  private checkHealthAlerts(reading: MedicalSensorReading): void {
    const alerts: HealthAlert[] = [];
    
    switch (reading.sensorType) {
      case 'heartRate':
        const hr = reading.value as number;
        if (hr < this.healthThresholds.heartRate.min) {
          alerts.push(this.createAlert('warning', 'heartRate', 'Low heart rate detected', hr, this.healthThresholds.heartRate.min));
        } else if (hr > this.healthThresholds.heartRate.max) {
          alerts.push(this.createAlert('critical', 'heartRate', 'High heart rate detected', hr, this.healthThresholds.heartRate.max));
        }
        break;
        
      case 'bloodPressure':
        const bp = reading.value as { systolic: number; diastolic: number };
        if (bp.systolic > this.healthThresholds.systolicBP.max || bp.diastolic > this.healthThresholds.diastolicBP.max) {
          alerts.push(this.createAlert('critical', 'bloodPressure', 'High blood pressure detected', bp, this.healthThresholds));
        }
        break;
        
      case 'oxygenSaturation':
        const o2 = reading.value as number;
        if (o2 < this.healthThresholds.oxygenSaturation.min) {
          alerts.push(this.createAlert('critical', 'oxygenSaturation', 'Low oxygen saturation detected', o2, this.healthThresholds.oxygenSaturation.min));
        }
        break;
    }
    
    // Trigger alerts
    alerts.forEach(alert => {
      this.alertListeners.forEach(listener => listener(alert));
    });
  }

  private createAlert(type: 'critical' | 'warning' | 'info', sensor: string, message: string, value: any, threshold: any): HealthAlert {
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      sensor,
      message,
      value,
      threshold,
      timestamp: Date.now(),
      acknowledged: false
    };
  }

  // Additional utility methods
  private parseHeartRateValue(dataView: DataView): number {
    const flags = dataView.getUint8(0);
    const is16Bit = flags & 0x01;
    return is16Bit ? dataView.getUint16(1, true) : dataView.getUint8(1);
  }

  private parseBloodPressureValue(dataView: DataView): { systolic: number; diastolic: number } {
    return {
      systolic: dataView.getUint16(1, true),
      diastolic: dataView.getUint16(3, true)
    };
  }

  private parseTemperatureValue(dataView: DataView): number {
    const tempValue = dataView.getUint32(1, true);
    return (tempValue / 100) * 9/5 + 32; // Convert to Fahrenheit
  }

  private determineDeviceType(deviceName: string): 'smartwatch' | 'fitness_tracker' | 'medical_device' | 'smartphone' {
    const name = deviceName.toLowerCase();
    if (name.includes('watch')) return 'smartwatch';
    if (name.includes('fit') || name.includes('band')) return 'fitness_tracker';
    if (name.includes('phone')) return 'smartphone';
    return 'medical_device';
  }

  private processAccelerometerData(x: number, y: number, z: number): void {
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    
    // Fall detection
    if (magnitude > 20 || magnitude < 2) {
      const alert = this.createAlert('critical', 'accelerometer', 'Potential fall detected', magnitude, { min: 2, max: 20 });
      this.alertListeners.forEach(listener => listener(alert));
    }
  }

  // Public API methods
  startMonitoring(): boolean {
    if (this.isMonitoring) return true;
    
    this.isMonitoring = true;
    
    // Start periodic monitoring
    this.monitoringInterval = window.setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Every minute
    
    console.log('Medical monitoring started');
    return true;
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('Medical monitoring stopped');
  }

  private performHealthCheck(): void {
    // Aggregate recent readings and perform analysis
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    
    this.sensorReadings.forEach((readings, sensorType) => {
      const recentReadings = readings.filter(r => r.timestamp > fiveMinutesAgo);
      if (recentReadings.length > 0) {
        // Perform trend analysis, anomaly detection, etc.
        this.analyzeTrends(sensorType, recentReadings);
      }
    });
  }

  private analyzeTrends(sensorType: string, readings: MedicalSensorReading[]): void {
    // Implement trend analysis algorithms
    console.log(`Analyzing trends for ${sensorType}:`, readings.length, 'readings');
  }

  addAlertListener(callback: (alert: HealthAlert) => void): () => void {
    this.alertListeners.push(callback);
    return () => {
      const index = this.alertListeners.indexOf(callback);
      if (index !== -1) {
        this.alertListeners.splice(index, 1);
      }
    };
  }

  getConnectedDevices(): ConnectedDevice[] {
    return Array.from(this.connectedDevices.values());
  }

  getRecentReadings(sensorType: string, hours: number = 1): MedicalSensorReading[] {
    const readings = this.sensorReadings.get(sensorType) || [];
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return readings.filter(r => r.timestamp > cutoff);
  }

  updateHealthThresholds(newThresholds: Partial<typeof this.healthThresholds>): void {
    Object.assign(this.healthThresholds, newThresholds);
  }

  exportHealthData(): any {
    const data: any = {};
    this.sensorReadings.forEach((readings, sensorType) => {
      data[sensorType] = readings;
    });
    return {
      readings: data,
      devices: Array.from(this.connectedDevices.values()),
      thresholds: this.healthThresholds,
      exportedAt: new Date().toISOString()
    };
  }
}

export const advancedMedicalSensorService = new AdvancedMedicalSensorService();
export default advancedMedicalSensorService;
export type { MedicalSensorReading, ConnectedDevice, HealthAlert };
