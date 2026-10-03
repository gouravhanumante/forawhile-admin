import { apiClient } from './client';

export interface AppGateState {
  maintenanceEnabled: boolean;
  maintenanceTitle: string | null;
  maintenanceMessage: string | null;
  minBuildAndroid: number;
  minBuildIos: number;
}

export const appGateApi = {
  get: (): Promise<AppGateState> => apiClient.get('/admin/app-gate'),
  update: (state: AppGateState): Promise<AppGateState> => apiClient.put('/admin/app-gate', state),
};
