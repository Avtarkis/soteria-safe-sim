
/**
 * Comprehensive database of global emergency numbers
 */

export interface EmergencyNumber {
  country: string;
  countryCode: string;
  police: string;
  ambulance: string;
  fire: string;
  general?: string; // Universal emergency number if available
}

/**
 * Comprehensive database of emergency numbers by country
 * This enhances our coverage beyond the original implementation
 */
export const globalEmergencyNumbers: Record<string, EmergencyNumber> = {
  // North America
  'US': { country: 'United States', countryCode: 'US', police: '911', ambulance: '911', fire: '911', general: '911' },
  'CA': { country: 'Canada', countryCode: 'CA', police: '911', ambulance: '911', fire: '911', general: '911' },
  'MX': { country: 'Mexico', countryCode: 'MX', police: '911', ambulance: '911', fire: '911', general: '911' },

  // Europe
  'GB': { country: 'United Kingdom', countryCode: 'GB', police: '999', ambulance: '999', fire: '999', general: '112' },
  'DE': { country: 'Germany', countryCode: 'DE', police: '110', ambulance: '112', fire: '112', general: '112' },
  'FR': { country: 'France', countryCode: 'FR', police: '17', ambulance: '15', fire: '18', general: '112' },
  'IT': { country: 'Italy', countryCode: 'IT', police: '113', ambulance: '118', fire: '115', general: '112' },
  'ES': { country: 'Spain', countryCode: 'ES', police: '091', ambulance: '061', fire: '080', general: '112' },
  'PT': { country: 'Portugal', countryCode: 'PT', police: '112', ambulance: '112', fire: '112', general: '112' },
  'NL': { country: 'Netherlands', countryCode: 'NL', police: '112', ambulance: '112', fire: '112', general: '112' },
  'BE': { country: 'Belgium', countryCode: 'BE', police: '101', ambulance: '100', fire: '100', general: '112' },
  'CH': { country: 'Switzerland', countryCode: 'CH', police: '117', ambulance: '144', fire: '118', general: '112' },
  'AT': { country: 'Austria', countryCode: 'AT', police: '133', ambulance: '144', fire: '122', general: '112' },
  'SE': { country: 'Sweden', countryCode: 'SE', police: '112', ambulance: '112', fire: '112', general: '112' },
  'NO': { country: 'Norway', countryCode: 'NO', police: '112', ambulance: '113', fire: '110', general: '112' },
  'FI': { country: 'Finland', countryCode: 'FI', police: '112', ambulance: '112', fire: '112', general: '112' },
  'DK': { country: 'Denmark', countryCode: 'DK', police: '112', ambulance: '112', fire: '112', general: '112' },
  'IE': { country: 'Ireland', countryCode: 'IE', police: '999', ambulance: '999', fire: '999', general: '112' },

  // Asia
  'IN': { country: 'India', countryCode: 'IN', police: '100', ambulance: '102', fire: '101', general: '112' },
  'CN': { country: 'China', countryCode: 'CN', police: '110', ambulance: '120', fire: '119', general: '110' },
  'JP': { country: 'Japan', countryCode: 'JP', police: '110', ambulance: '119', fire: '119', general: '110' },
  'KR': { country: 'South Korea', countryCode: 'KR', police: '112', ambulance: '119', fire: '119', general: '119' },
  'SG': { country: 'Singapore', countryCode: 'SG', police: '999', ambulance: '995', fire: '995', general: '999' },
  'MY': { country: 'Malaysia', countryCode: 'MY', police: '999', ambulance: '999', fire: '999', general: '999' },
  'TH': { country: 'Thailand', countryCode: 'TH', police: '191', ambulance: '1669', fire: '199', general: '191' },
  'PH': { country: 'Philippines', countryCode: 'PH', police: '911', ambulance: '911', fire: '911', general: '911' },
  'ID': { country: 'Indonesia', countryCode: 'ID', police: '110', ambulance: '118', fire: '113', general: '112' },
  'PK': { country: 'Pakistan', countryCode: 'PK', police: '15', ambulance: '1122', fire: '16', general: '15' },

  // Oceania
  'AU': { country: 'Australia', countryCode: 'AU', police: '000', ambulance: '000', fire: '000', general: '000' },
  'NZ': { country: 'New Zealand', countryCode: 'NZ', police: '111', ambulance: '111', fire: '111', general: '111' },
  'FJ': { country: 'Fiji', countryCode: 'FJ', police: '911', ambulance: '911', fire: '911', general: '911' },

  // Africa
  'ZA': { country: 'South Africa', countryCode: 'ZA', police: '10111', ambulance: '10177', fire: '10177', general: '112' },
  'NG': { country: 'Nigeria', countryCode: 'NG', police: '112', ambulance: '112', fire: '112', general: '112' },
  'EG': { country: 'Egypt', countryCode: 'EG', police: '122', ambulance: '123', fire: '180', general: '122' },
  'KE': { country: 'Kenya', countryCode: 'KE', police: '999', ambulance: '999', fire: '999', general: '999' },
  'GH': { country: 'Ghana', countryCode: 'GH', police: '191', ambulance: '193', fire: '192', general: '112' },

  // South America
  'BR': { country: 'Brazil', countryCode: 'BR', police: '190', ambulance: '192', fire: '193', general: '190' },
  'AR': { country: 'Argentina', countryCode: 'AR', police: '911', ambulance: '107', fire: '100', general: '911' },
  'CL': { country: 'Chile', countryCode: 'CL', police: '133', ambulance: '131', fire: '132', general: '133' },
  'CO': { country: 'Colombia', countryCode: 'CO', police: '123', ambulance: '123', fire: '123', general: '123' },
  'PE': { country: 'Peru', countryCode: 'PE', police: '105', ambulance: '117', fire: '116', general: '105' },

  // Middle East
  'IL': { country: 'Israel', countryCode: 'IL', police: '100', ambulance: '101', fire: '102', general: '100' },
  'SA': { country: 'Saudi Arabia', countryCode: 'SA', police: '999', ambulance: '997', fire: '998', general: '999' },
  'AE': { country: 'United Arab Emirates', countryCode: 'AE', police: '999', ambulance: '999', fire: '997', general: '999' },
  'QA': { country: 'Qatar', countryCode: 'QA', police: '999', ambulance: '999', fire: '999', general: '999' },
};

/**
 * Get regional emergency number format
 * Used as fallback when specific country is not in database
 */
export function getRegionalEmergencyNumber(countryCode: string): EmergencyNumber | null {
  // European countries use 112
  const europeanCountries = [
    'AD', 'AL', 'AT', 'BA', 'BE', 'BG', 'BY', 'CH', 'CY', 'CZ', 'DE', 'DK', 
    'EE', 'ES', 'FI', 'FR', 'GB', 'GR', 'HR', 'HU', 'IE', 'IS', 'IT', 'LI', 
    'LT', 'LU', 'LV', 'MC', 'MD', 'ME', 'MK', 'MT', 'NL', 'NO', 'PL', 'PT', 
    'RO', 'RS', 'SE', 'SI', 'SK', 'SM', 'UA', 'VA', 'XK'
  ];
  
  if (europeanCountries.includes(countryCode)) {
    return {
      country: 'Europe',
      countryCode: countryCode,
      police: '112',
      ambulance: '112',
      fire: '112',
      general: '112'
    };
  }
  
  // North American countries generally use 911
  const northAmericanCountries = ['US', 'CA', 'MX', 'PR', 'DO', 'SV', 'GT', 'BZ', 'HN', 'NI', 'CR', 'PA'];
  if (northAmericanCountries.includes(countryCode)) {
    return {
      country: 'North America',
      countryCode: countryCode,
      police: '911',
      ambulance: '911',
      fire: '911',
      general: '911'
    };
  }
  
  // If we don't have a specific regional match, return null
  return null;
}
