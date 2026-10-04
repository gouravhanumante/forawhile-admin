import { apiClient } from './client';

export interface PaymentView {
  id: string;
  bookingId: string;
  provider: string;
  amountMinor: number;
  commissionMinor: number;
  payoutMinor: number;
  currency: string;
  status: string;
}

export const paymentApi = {
  release: (bookingId: string): Promise<PaymentView> => apiClient.post(`/bookings/${bookingId}/payment/release`),
};
