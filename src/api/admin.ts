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

export const adminApi = {
  overview: (): Promise<AdminOverview> => apiClient.get('/admin/overview'),
  getUser: (id: string): Promise<SafeUser> => apiClient.get(`/admin/users/${id}`),
  searchUsers: (query: string): Promise<SafeUser[]> => apiClient.get(`/admin/users/search?q=${encodeURIComponent(query)}`),
  suspend: (id: string, reason: string): Promise<SafeUser> => apiClient.post(`/admin/users/${id}/suspend`, { reason }),
  unsuspend: (id: string, reason: string): Promise<SafeUser> =>
    apiClient.post(`/admin/users/${id}/unsuspend`, { reason }),
  auditLogs: (limit = 50): Promise<AuditLogEntry[]> => apiClient.get(`/admin/audit-logs?limit=${limit}`),
  pendingEscrow: (): Promise<PendingEscrowRow[]> => apiClient.get('/admin/escrow/pending'),
  bookingEvidence: (reportId: string): Promise<BookingCoordinationEvidence> =>
    apiClient.get(`/admin/reports/${reportId}/booking-evidence`),
};
