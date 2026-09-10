import { apiClient } from './client';

export type CustomerVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CustomerVerificationRequestView {
  id: string;
  status: CustomerVerificationStatus;
  note: string | null;
  createdAt: string;
  customerId: string;
  customer: { nickname: string | null; city: string | null; phone: string; photoUrl: string | null };
  selfieUrl: string;
  reviewerId: string | null;
  updatedAt: string;
}

export const customerVerificationApi = {
  list: (status?: CustomerVerificationStatus): Promise<CustomerVerificationRequestView[]> =>
    apiClient.get(`/customer-verification/requests${status ? `?status=${status}` : ''}`),
  decide: (id: string, status: 'APPROVED' | 'REJECTED', note?: string): Promise<CustomerVerificationRequestView> =>
    apiClient.patch(`/customer-verification/requests/${id}`, { status, note }),
};
