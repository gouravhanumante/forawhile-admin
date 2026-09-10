import { apiClient } from './client';

export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface VerificationRequestView {
  id: string;
  docType: string;
  status: VerificationStatus;
  note: string | null;
  createdAt: string;
  companionId: string;
  companion: { nickname: string | null; city: string | null; phone: string; photoUrl: string | null };
  docUrl: string | null;
  selfieUrl: string | null;
  hasSelfie: boolean;
  reviewerId: string | null;
  updatedAt: string;
}

export const verificationApi = {
  list: (status?: VerificationStatus): Promise<VerificationRequestView[]> =>
    apiClient.get(`/verification/requests${status ? `?status=${status}` : ''}`),
  decide: (id: string, status: 'APPROVED' | 'REJECTED', note?: string): Promise<VerificationRequestView> =>
    apiClient.patch(`/verification/requests/${id}`, { status, note }),
};
