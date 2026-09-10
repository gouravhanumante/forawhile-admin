import { apiClient } from './client';

export type PayoutStatus = 'PENDING' | 'PAID' | 'REJECTED';

export interface PayoutView {
  id: string;
  companionId: string;
  amountPaise: number;
  upiId: string;
  status: PayoutStatus;
  note: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
  companion: { nickname: string | null; city: string | null; phone: string };
}

export const payoutApi = {
  list: (status?: PayoutStatus): Promise<PayoutView[]> => apiClient.get(`/admin/payouts${status ? `?status=${status}` : ''}`),
  process: (id: string, status: 'PAID' | 'REJECTED', note?: string): Promise<PayoutView> =>
    apiClient.patch(`/admin/payouts/${id}`, { status, note }),
};
