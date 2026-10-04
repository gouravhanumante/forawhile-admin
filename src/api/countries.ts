import { apiClient } from './client';

// Mirrors src/core/markets/countries.ts on the server; only display facts live here.
export const COUNTRIES = [
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'JP', name: 'Japan', currency: 'JPY' },
] as const;
export type CountryCode = (typeof COUNTRIES)[number]['code'];

export interface CountrySetting {
  key: string;
  label: string;
  description: string;
  min: number;
  max: number;
  value: number;
  isOverride: boolean;
}

export interface CountrySettings {
  country: CountryCode;
  hasAllProviders: boolean;
  settings: CountrySetting[];
}

export const countriesApi = {
  list: (): Promise<CountrySettings[]> => apiClient.get('/admin/settings/countries'),
  update: (country: CountryCode, settings: { key: string; value: number }[]): Promise<CountrySettings[]> =>
    apiClient.patch(`/admin/settings/countries/${country}`, { settings }),
};
