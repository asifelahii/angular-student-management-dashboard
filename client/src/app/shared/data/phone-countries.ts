export type PhoneCountry = {
  iso2: string; // e.g. 'bd'
  name: string; // e.g. 'Bangladesh'
  dialCode: string; // e.g. '+880'
  example?: string; // e.g. '01712345678'
};

export const PHONE_COUNTRIES: PhoneCountry[] = [
  // South Asia
  { iso2: 'BD', name: 'Bangladesh', dialCode: '880', example: '17xx-xxxxxx' },
  { iso2: 'IN', name: 'India', dialCode: '91', example: '9xxxx-xxxxx' },
  { iso2: 'PK', name: 'Pakistan', dialCode: '92', example: '3xx-xxxxxxx' },
  { iso2: 'LK', name: 'Sri Lanka', dialCode: '94' },
  { iso2: 'NP', name: 'Nepal', dialCode: '977' },

  // Gulf (GCC)
  { iso2: 'SA', name: 'Saudi Arabia', dialCode: '966' },
  { iso2: 'AE', name: 'United Arab Emirates', dialCode: '971' },
  { iso2: 'QA', name: 'Qatar', dialCode: '974' },
  { iso2: 'KW', name: 'Kuwait', dialCode: '965' },
  { iso2: 'OM', name: 'Oman', dialCode: '968' },
  { iso2: 'BH', name: 'Bahrain', dialCode: '973' },

  // Middle East / Muslim-majority (common)
  { iso2: 'TR', name: 'Turkey', dialCode: '90' },
  { iso2: 'EG', name: 'Egypt', dialCode: '20' },
  { iso2: 'JO', name: 'Jordan', dialCode: '962' },
  { iso2: 'LB', name: 'Lebanon', dialCode: '961' },
  { iso2: 'MA', name: 'Morocco', dialCode: '212' },
  { iso2: 'DZ', name: 'Algeria', dialCode: '213' },
  { iso2: 'TN', name: 'Tunisia', dialCode: '216' },
  { iso2: 'ID', name: 'Indonesia', dialCode: '62' },
  { iso2: 'MY', name: 'Malaysia', dialCode: '60' },

  // East / SE Asia
  { iso2: 'SG', name: 'Singapore', dialCode: '65' },
  { iso2: 'TH', name: 'Thailand', dialCode: '66' },
  { iso2: 'VN', name: 'Vietnam', dialCode: '84' },
  { iso2: 'PH', name: 'Philippines', dialCode: '63' },
  { iso2: 'JP', name: 'Japan', dialCode: '81' },
  { iso2: 'KR', name: 'South Korea', dialCode: '82' },
  { iso2: 'CN', name: 'China', dialCode: '86' },
  { iso2: 'HK', name: 'Hong Kong', dialCode: '852' },

  // Strong economies / common intl
  { iso2: 'US', name: 'United States', dialCode: '1' },
  { iso2: 'CA', name: 'Canada', dialCode: '1' },
  { iso2: 'GB', name: 'United Kingdom', dialCode: '44' },
  { iso2: 'DE', name: 'Germany', dialCode: '49' },
  { iso2: 'FR', name: 'France', dialCode: '33' },
  { iso2: 'IT', name: 'Italy', dialCode: '39' },
  { iso2: 'ES', name: 'Spain', dialCode: '34' },
  { iso2: 'NL', name: 'Netherlands', dialCode: '31' },
  { iso2: 'CH', name: 'Switzerland', dialCode: '41' },
  { iso2: 'SE', name: 'Sweden', dialCode: '46' },
  { iso2: 'NO', name: 'Norway', dialCode: '47' },
  { iso2: 'DK', name: 'Denmark', dialCode: '45' },
  { iso2: 'AU', name: 'Australia', dialCode: '61' },
  { iso2: 'NZ', name: 'New Zealand', dialCode: '64' },
];
