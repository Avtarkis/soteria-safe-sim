
// Emergency Services Types
export interface EmergencyService {
  name: string;
  number: string;
}

// Emergency Contact Types - This needs to match type in emergency.d.ts
export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
}
