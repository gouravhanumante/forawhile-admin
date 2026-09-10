import { apiClient } from './client';

export type NoticeType = 'MAINTENANCE' | 'ANNOUNCEMENT';
export type NoticeAudience = 'ALL' | 'CUSTOMERS' | 'COMPANIONS';

export interface Notice {
  id: string;
  type: NoticeType;
  audience: NoticeAudience;
  title: string;
  message: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeInput {
  type: NoticeType;
  audience: NoticeAudience;
  title: string;
  message: string;
}

export const noticesApi = {
  list: (): Promise<Notice[]> => apiClient.get('/admin/notices'),
  create: (input: NoticeInput): Promise<Notice> => apiClient.post('/admin/notices', input),
  update: (id: string, input: Partial<NoticeInput>): Promise<Notice> => apiClient.patch(`/admin/notices/${id}`, input),
  setActive: (id: string, isActive: boolean): Promise<Notice> =>
    apiClient.patch(`/admin/notices/${id}/active`, { isActive }),
  delete: (id: string): Promise<{ deleted: true }> => apiClient.delete(`/admin/notices/${id}`),
};
