
export interface FamilyMember {
  id: string;
  name: string;
  type: 'child' | 'adult' | 'senior';
  location: {
    name: string;
    type: 'home' | 'school' | 'work' | 'other';
    coordinates: [number, number];
    lastUpdated: string;
  };
  status: 'online' | 'offline' | 'emergency';
  lastCheckIn: string;
  batteryLevel: number;
  safeZones: {
    id: string;
    name: string;
    type: 'home' | 'school' | 'work' | 'other';
    status: 'inside' | 'outside';
  }[];
  healthStatus?: {
    status: 'normal' | 'warning' | 'critical';
    description?: string;
  };
}

export interface FamilyGroup {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  members: FamilyMember[];
}

export interface FamilyInvitation {
  id: string;
  familyGroupId: string;
  email: string;
  invitationCode: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface SharingPermissions {
  id: string;
  memberId: string;
  sharesLocation: boolean;
  sharesHealth: boolean;
  sharesSafety: boolean;
  updatedAt: string;
}
