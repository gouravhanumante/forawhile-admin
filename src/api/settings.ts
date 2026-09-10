import { apiClient } from './client';

export interface BusinessSetting {
  key: string;
  label: string;
  description: string;
  value: number;
  defaultValue: number;
  min: number;
  max: number;
  isOverride: boolean;
  updatedAt: string | null;
}

export const settingsApi = {
  listBusiness: (): Promise<BusinessSetting[]> => apiClient.get('/admin/settings/business'),
  updateBusiness: (settings: { key: string; value: number }[]): Promise<BusinessSetting[]> =>
    apiClient.patch('/admin/settings/business', { settings }),
};