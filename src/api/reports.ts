import { apiClient } from './client';

export type ReportStatus = 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';

export interface ReportView {
  id: string;
  reporterId: string;
  targetUserId: string;
  bookingId: string | null;
  reason: string;
  details: string | null;
  status: ReportStatus;
  reviewerId: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export const reportsApi = {
  list: (status?: ReportStatus): Promise<ReportView[]> => apiClient.get(`/reports${status ? `?status=${status}` : ''}`),
  review: (
    id: string,
    status: 'REVIEWING' | 'RESOLVED' | 'DISMISSED',
    reviewNote?: string,
  ): Promise<ReportView> => apiClient.patch(`/reports/${id}`, { status, reviewNote }),
};
