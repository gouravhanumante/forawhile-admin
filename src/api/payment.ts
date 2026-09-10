import { apiClient } from './client';

export interface PaymentView {
  id: string;
  bookingId: string;
  provider: string;
  amountPaise: number;
  commissionPaise: number;
  payoutPaise: number;
  currency: string;
  status: string;
}

export const paymentApi = {
  release: (bookingId: string): Promise<PaymentView> => apiClient.post(`/bookings/${bookingId}/payment/release`),
};
