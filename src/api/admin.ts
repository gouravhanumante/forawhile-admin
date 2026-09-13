import { apiClient } from './client';

export interface AdminOverview {
  pendingVerifications: number;
  pendingCustomerVerifications: number;
  openReports: number;
  heldPayments: number;
  pendingPayments: number;
}

export interface SafeUser {
  id: string;
  phone: string;
  email: string | null;
  roles: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  companionProfile: {
    nickname: string;
    city: string;
    isVerified: boolean;
    isLive: boolean;
    cancellationStrikes: number;
  } | null;
  customerProfile: { nickname: string; city: string } | null;
  reportCount: number;
  blockCount: number;
  photos: Array<{ id: string; url: string; isPrimary: boolean }>;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string | null;
  before: unknown;
  after: unknown;
  createdAt: string;
}

export interface PendingEscrowRow {
  bookingId: string;
  packageTitle: string;
  priceINR: number;
  amountPaise: number;
  scheduledStart: string;
  customerNickname: string | null;
  companionNickname: string | null;
}

export interface StuckRefundRow {
  paymentId: string;
  bookingId: string;
  packageTitle: string;
  scheduledStart: string;
  bookingStatus: string;
  amountPaise: number;
  state: 'NEEDS_ACTION' | 'PENDING_CONFIRMATION';
  updatedAt: string;
  customerNickname: string | null;
  customerPhone: string;
  companionNickname: string | null;
  companionPhone: string;
}

export interface BookingCoordinationEvidence {
  reportId: string;
  booking: {
    id: string;
    packageTitle: string;
    durationMinutes: number;
    scheduledStart: string;
    meetingArea: string;
    status: string;
    cancellationReason: string | null;
    customer: { id: string; nickname: string };
    companion: { id: string; nickname: string };
  };
  messages: Array<{
    senderId: string;
    sender: { id: string; nickname: string };
    text: string;
    createdAt: string;
  }>;
  checkIns: Array<{
    userId: string;
    user: { id: string; nickname: string };
    latitude: number;
    longitude: number;
    createdAt: string;
  }>;
}

export interface NoShowSignal {
  text: string;
  leans: 'CLAIM' | 'RESPONSE' | 'NEITHER';
  weight: number;
}

export interface PendingNoShowClaim {
  bookingId: string;
  reporterId: string;
  accusedId: string;
  reason: string | null;
  locationStatus: 'CAPTURED' | 'UNAVAILABLE' | 'DECLINED';
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  createdAt: string;
  responseText: string | null;
  responseLocationStatus: 'CAPTURED' | 'UNAVAILABLE' | 'DECLINED' | null;
  responseLatitude: number | null;
  responseLongitude: number | null;
  responseAccuracyMeters: number | null;
  respondedAt: string | null;
  reporter: { fraudStrikes: number };
  signals: NoShowSignal[];
  /** Advisory. 50 means the evidence does not lean; it never decides anything. */
  claimStrength: number;
  booking: {
    packageTitle: string;
    scheduledStart: string;
    durationMinutes: number;
    meetingArea: string;
    status: string;
    customerId: string;
    companionId: string;
    checkIns: { userId: string; latitude: number; longitude: number; createdAt: string }[];
    messages: { senderId: string; text: string; createdAt: string }[];
    customer: { customerProfile: { nickname: string } | null };
    companion: { companionProfile: { nickname: string } | null };
  };
}

export interface AdminBookingSummary {
  id: string;
  packageTitle: string;
  scheduledStart: string;
  durationMinutes: number;
  meetingArea: string;
  status: string;
  cancellationReason: string | null;
  customerId: string;
  companionId: string;
  customer: { customerProfile: { nickname: string } | null };
  companion: { companionProfile: { nickname: string } | null };
  noShowClaim: { decision: string; reporterId: string; createdAt: string } | null;
}

export interface BookingInvestigation extends AdminBookingSummary {
  reports: Array<{ id: string; status: string; reason: string; createdAt: string }>;
  noShowClaim: (AdminBookingSummary['noShowClaim'] & {
    reason: string | null;
    locationStatus: string;
    latitude: number | null;
    longitude: number | null;
    accuracyMeters: number | null;
    reviewNote: string | null;
    expiresAt: string;
  }) | null;
  messages: Array<{ senderId: string; text: string; createdAt: string }>;
  checkIns: Array<{ userId: string; latitude: number; longitude: number; createdAt: string }>;
}

export const adminApi = {
  overview: (): Promise<AdminOverview> => apiClient.get('/admin/overview'),
  getUser: (id: string): Promise<SafeUser> => apiClient.get(`/admin/users/${id}`),
  searchUsers: (query: string): Promise<SafeUser[]> => apiClient.get(`/admin/users/search?q=${encodeURIComponent(query)}`),
  userBookings: (id: string): Promise<AdminBookingSummary[]> => apiClient.get(`/admin/users/${id}/bookings`),
  bookingInvestigation: (bookingId: string): Promise<BookingInvestigation> => apiClient.get(`/admin/bookings/${bookingId}/evidence`),
  suspend: (id: string, reason: string): Promise<SafeUser> => apiClient.post(`/admin/users/${id}/suspend`, { reason }),
  unsuspend: (id: string, reason: string): Promise<SafeUser> =>
    apiClient.post(`/admin/users/${id}/unsuspend`, { reason }),
  auditLogs: (limit = 50): Promise<AuditLogEntry[]> => apiClient.get(`/admin/audit-logs?limit=${limit}`),
  pendingEscrow: (): Promise<PendingEscrowRow[]> => apiClient.get('/admin/escrow/pending'),
  stuckRefunds: (): Promise<StuckRefundRow[]> => apiClient.get('/admin/refunds/stuck'),
  resolveStuckRefund: (bookingId: string, note?: string): Promise<unknown> => apiClient.post(`/admin/refunds/${bookingId}/resolve`, { note }),
  pendingNoShowClaims: (): Promise<PendingNoShowClaim[]> => apiClient.get('/admin/no-show-claims/pending'),
  decideNoShowClaim: (bookingId: string, decision: 'CONFIRMED' | 'DISMISSED' | 'REPORTER_ABSENT', reviewNote: string): Promise<{ bookingId: string; status: string; decision: string }> =>
    apiClient.post(`/admin/bookings/${bookingId}/no-show-claim/decision`, { decision, reviewNote }),
  bookingEvidence: (reportId: string): Promise<BookingCoordinationEvidence> =>
    apiClient.get(`/admin/reports/${reportId}/booking-evidence`),
};
