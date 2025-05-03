
import { ReactNode } from 'react';
import { Bell, Shield, AlertTriangle, Camera, Phone, Mic, MapPin, Watch, Volume2, Heart, EyeOff } from 'lucide-react';

export interface Feature {
  id: string;
  name: string;
  premium: string | boolean;
  family: string | boolean;
}

export interface FeatureItem {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const comparisonFeatures: Feature[] = [
  { id: 'ai-threat', name: 'AI Threat Detection', premium: 'Advanced', family: 'Advanced+' },
  { id: 'dark-web', name: 'Dark Web Monitoring', premium: 'Comprehensive', family: 'Comprehensive' },
  { id: 'devices', name: 'Device Protection', premium: '1 Device', family: 'Up to 5 devices' },
  { id: 'voice', name: 'Voice Assistant', premium: true, family: true },
  { id: 'support', name: 'Support', premium: '24/7 Priority', family: '24/7 Priority' },
  { id: 'disaster', name: 'Natural Disaster Detection', premium: true, family: true },
  { id: 'incident', name: 'Live Incident Capturing', premium: true, family: true },
  { id: 'police', name: 'Instant Police Voice Call', premium: true, family: true },
  { id: 'radius', name: '200m Radius Alert', premium: true, family: true },
  { id: 'smartwatch', name: 'Smartwatch Integration', premium: true, family: true },
  { id: 'safety-ai', name: 'Personalized Safety AI', premium: true, family: true },
  { id: 'health', name: 'Health Monitoring', premium: true, family: true },
  { id: 'family-location', name: 'Family Location Sharing', premium: false, family: true },
];

export const getFeatureShowcaseItems = (): FeatureItem[] => [
  {
    id: 'ai-emergency',
    icon: <Bell className="h-6 w-6 text-primary" />,
    title: 'AI Emergency Alert',
    description: 'Instantly notifies family, law enforcement and emergency responders when a threat is detected.'
  },
  {
    id: 'disaster',
    icon: <AlertTriangle className="h-6 w-6 text-primary" />,
    title: 'Natural Disaster Detection',
    description: 'Detects natural disasters and provides safe evacuation routes.'
  },
  {
    id: 'incident',
    icon: <Camera className="h-6 w-6 text-primary" />,
    title: 'Live Incident Capturing',
    description: 'Uses your phone to capture evidence of incidents for sharing with authorities.'
  },
  {
    id: 'police',
    icon: <Phone className="h-6 w-6 text-primary" />,
    title: 'Instant Police Call',
    description: 'Activates an instant police voice call to deter attackers.'
  },
  {
    id: 'ai-threat',
    icon: <Mic className="h-6 w-6 text-primary" />,
    title: 'AI Threat Detection',
    description: 'Recognizes gunshots, screams, and violent incidents.'
  },
  {
    id: 'radius',
    icon: <MapPin className="h-6 w-6 text-primary" />,
    title: '200m Radius Alert',
    description: 'Sends SOS alerts to nearby mobile users for community response.'
  },
  {
    id: 'cyber',
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: 'Cyber Threat Detection',
    description: 'Identifies and blocks digital threats before they compromise your security.'
  },
  {
    id: 'smartwatch',
    icon: <Watch className="h-6 w-6 text-primary" />,
    title: 'Smartwatch Integration',
    description: 'Using DarkTrace Technology, Soteria integrates with smartwatches, causing them to vibrate to warn users of potential threats even when your phone is not accessible.'
  },
  {
    id: 'emergency',
    icon: <Bell className="h-6 w-6 text-primary" />,
    title: 'Emergency Services',
    description: 'Works with emergency service APIs for direct dispatch.'
  },
  {
    id: 'siren',
    icon: <Volume2 className="h-6 w-6 text-primary" />,
    title: 'Police Siren Mode',
    description: 'Plays convincing police siren sounds to deter attackers.'
  },
  {
    id: 'health',
    icon: <Heart className="h-6 w-6 text-primary" />,
    title: 'Health Monitor',
    description: 'Monitors health status and alerts contacts in emergencies.'
  },
  {
    id: 'stealth',
    icon: <EyeOff className="h-6 w-6 text-primary" />,
    title: 'Stealth Mode',
    description: 'Works in the background undetected by attackers.'
  }
];

export const faqItems: FaqItem[] = [
  {
    question: 'Can I cancel my subscription at any time?',
    answer: 'Yes, you can cancel your Premium subscription at any time. You\'ll continue to have access to Premium features until the end of your billing period.'
  },
  {
    question: 'How does the family plan work?',
    answer: 'With the Premium plan, you can add up to 5 family members. Each member will have their own account with full Premium features, all managed from your account.'
  },
  {
    question: 'Will my subscription automatically renew?',
    answer: 'Yes, subscriptions automatically renew to ensure continuous protection. You\'ll be notified before renewal and can cancel anytime.'
  },
  {
    question: 'Is my payment information secure?',
    answer: 'Yes, we use industry-standard encryption for all payments and never store your full credit card details on our servers.'
  }
];
