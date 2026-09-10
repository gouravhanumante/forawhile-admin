import { apiClient } from './client';

export type BroadcastAudience = 'ALL' | 'CUSTOMERS' | 'COMPANIONS';

export interface BroadcastRequest {
  title: string;
  body: string;
  audience: BroadcastAudience;
}

export interface BroadcastPreview {
  recipientUsers: number;
  recipientDevices: number;
}

export interface BroadcastResult {
  recipientDevices: number;
}

export const notificationsApi = {
  preview: (body: BroadcastRequest): Promise<BroadcastPreview> =>
    apiClient.post('/admin/notifications/broadcast/preview', body),
  send: (body: BroadcastRequest): Promise<BroadcastResult> => apiClient.post('/admin/notifications/broadcast', body),
};
