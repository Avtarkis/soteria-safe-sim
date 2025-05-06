
import * as poseDetection from '@tensorflow-models/pose-detection';
import { ThreatDetection } from './PoseDetectionService';
import { SensorDataPoint } from '../sensors/sensorTypes';

// Constants for fall detection
const FALL_VELOCITY_THRESHOLD = 12; // m/s²
const FALL_IMPACT_THRESHOLD = 15; // m/s²
const INACTIVITY_THRESHOLD = 10000; // 10 seconds in milliseconds

// Pose keypoint indices for MoveNet
const KEYPOINTS = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16,
};

// State for tracking consecutive detections
let lastPosition = { x: 0, y: 0 };
let lastActivityTimestamp = Date.now();
let potentialFallDetected = false;
let lastMotionData: SensorDataPoint[] = [];

export function detectThreatsFromPose(poses: poseDetection.Pose[]): ThreatDetection[] {
  if (!poses || poses.length === 0) return [];
  
  const threats: ThreatDetection[] = [];
  const pose = poses[0]; // Focus on the main detected person
  
  // Update activity timestamp
  lastActivityTimestamp = Date.now();
  
  // Detect weapon-swing gestures
  const weaponThreat = detectWeaponGesture(pose);
  if (weaponThreat) threats.push(weaponThreat);
  
  // Detect falls
  const fallThreat = detectFall(pose);
  if (fallThreat) threats.push(fallThreat);
  
  // Detect struggles or erratic behavior
  const struggleThreat = detectStruggle(pose);
  if (struggleThreat) threats.push(struggleThreat);
  
  return threats;
}

// Process accelerometer data for fall detection
export function processSensorDataForThreats(data: SensorDataPoint[]): ThreatDetection[] {
  lastMotionData = [...lastMotionData.slice(-10), ...data];
  
  if (lastMotionData.length < 5) return [];
  
  const threats: ThreatDetection[] = [];
  
  // Check for falls using accelerometer data
  const fallThreat = detectFallFromAccelerometer(lastMotionData);
  if (fallThreat) threats.push(fallThreat);
  
  // Check for inactivity
  const inactivityThreat = detectInactivity();
  if (inactivityThreat) threats.push(inactivityThreat);
  
  return threats;
}

function detectWeaponGesture(pose: poseDetection.Pose): ThreatDetection | null {
  // Get relevant keypoints
  const rightWrist = pose.keypoints[KEYPOINTS.RIGHT_WRIST];
  const rightElbow = pose.keypoints[KEYPOINTS.RIGHT_ELBOW];
  const rightShoulder = pose.keypoints[KEYPOINTS.RIGHT_SHOULDER];
  const leftWrist = pose.keypoints[KEYPOINTS.LEFT_WRIST];
  const leftElbow = pose.keypoints[KEYPOINTS.LEFT_ELBOW];
  const leftShoulder = pose.keypoints[KEYPOINTS.LEFT_SHOULDER];
  
  // Check confidence of keypoints
  if (!areKeyPointsConfident([rightWrist, rightElbow, rightShoulder, leftWrist, leftElbow, leftShoulder], 0.5)) {
    return null;
  }
  
  // Calculate arm extension angle
  const rightArmExtension = calculateArmExtension(rightWrist, rightElbow, rightShoulder);
  const leftArmExtension = calculateArmExtension(leftWrist, leftElbow, leftShoulder);
  
  // Detect weapon pointing gestures
  if (rightArmExtension > 160 || leftArmExtension > 160) {
    // Extended arm could indicate pointing a weapon
    return {
      type: 'weapon',
      confidence: 0.65,
      details: 'Extended arm detected, possible weapon pointing'
    };
  }
  
  return null;
}

function detectFall(pose: poseDetection.Pose): ThreatDetection | null {
  // Get head and hip keypoints
  const nose = pose.keypoints[KEYPOINTS.NOSE];
  const leftHip = pose.keypoints[KEYPOINTS.LEFT_HIP];
  const rightHip = pose.keypoints[KEYPOINTS.RIGHT_HIP];
  
  if (!areKeyPointsConfident([nose, leftHip, rightHip], 0.5)) {
    return null;
  }
  
  // Calculate hip center
  const hipCenter = {
    x: (leftHip.x + rightHip.x) / 2,
    y: (leftHip.y + rightHip.y) / 2
  };
  
  // Calculate the height ratio (nose to hip)
  const verticalDistance = Math.abs(nose.y - hipCenter.y);
  const horizontalDistance = Math.abs(nose.x - hipCenter.x);
  
  // If the person is more horizontal than vertical, it could be a fall
  if (verticalDistance < horizontalDistance * 0.5 && nose.y > hipCenter.y) {
    return {
      type: 'fall',
      confidence: 0.7,
      details: 'Person detected in horizontal position, possible fall'
    };
  }
  
  return null;
}

function detectStruggle(pose: poseDetection.Pose): ThreatDetection | null {
  // Get relevant keypoints
  const nose = pose.keypoints[KEYPOINTS.NOSE];
  const leftWrist = pose.keypoints[KEYPOINTS.LEFT_WRIST];
  const rightWrist = pose.keypoints[KEYPOINTS.RIGHT_WRIST];
  
  if (!areKeyPointsConfident([nose, leftWrist, rightWrist], 0.5)) {
    return null;
  }
  
  // Calculate motion rate of key points
  const currentPosition = { x: nose.x, y: nose.y };
  const positionDelta = Math.sqrt(
    Math.pow(currentPosition.x - lastPosition.x, 2) +
    Math.pow(currentPosition.y - lastPosition.y, 2)
  );
  
  // Update last position
  lastPosition = currentPosition;
  
  // Check for rapid movements
  if (positionDelta > 30) { // Threshold for rapid movement
    return {
      type: 'struggle',
      confidence: 0.6,
      details: 'Rapid body movement detected, possible struggle'
    };
  }
  
  return null;
}

function detectFallFromAccelerometer(data: SensorDataPoint[]): ThreatDetection | null {
  // Look for sudden acceleration spike followed by impact
  let maxAcceleration = 0;
  
  for (const point of data) {
    if (point.type !== 'accelerometer') continue;
    
    const magnitude = Math.sqrt(
      Math.pow(point.x, 2) + 
      Math.pow(point.y, 2) + 
      Math.pow(point.z, 2)
    );
    
    maxAcceleration = Math.max(maxAcceleration, magnitude);
  }
  
  // First phase of fall detection - rapid acceleration
  if (maxAcceleration > FALL_VELOCITY_THRESHOLD && !potentialFallDetected) {
    potentialFallDetected = true;
    setTimeout(() => {
      potentialFallDetected = false; // Reset if no impact detected
    }, 1000);
    return null;
  }
  
  // Second phase - impact detection
  if (potentialFallDetected && maxAcceleration > FALL_IMPACT_THRESHOLD) {
    potentialFallDetected = false;
    return {
      type: 'fall',
      confidence: 0.8,
      details: 'Fall detected from accelerometer data'
    };
  }
  
  return null;
}

function detectInactivity(): ThreatDetection | null {
  const currentTime = Date.now();
  
  if (currentTime - lastActivityTimestamp > INACTIVITY_THRESHOLD) {
    return {
      type: 'unknown',
      confidence: 0.5,
      details: 'Prolonged inactivity detected'
    };
  }
  
  return null;
}

// Helper function to check if keypoints have sufficient confidence
function areKeyPointsConfident(keypoints: poseDetection.Keypoint[], threshold: number): boolean {
  return keypoints.every(keypoint => keypoint && keypoint.score && keypoint.score >= threshold);
}

// Calculate arm extension angle
function calculateArmExtension(
  wrist: poseDetection.Keypoint, 
  elbow: poseDetection.Keypoint, 
  shoulder: poseDetection.Keypoint
): number {
  // Calculate vectors
  const v1 = {
    x: elbow.x - shoulder.x,
    y: elbow.y - shoulder.y
  };
  
  const v2 = {
    x: wrist.x - elbow.x,
    y: wrist.y - elbow.y
  };
  
  // Calculate dot product
  const dotProduct = v1.x * v2.x + v1.y * v2.y;
  
  // Calculate magnitudes
  const v1Magnitude = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const v2Magnitude = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  
  // Calculate angle in degrees
  const angle = Math.acos(dotProduct / (v1Magnitude * v2Magnitude)) * (180 / Math.PI);
  
  return 180 - angle; // Convert to extension angle
}
