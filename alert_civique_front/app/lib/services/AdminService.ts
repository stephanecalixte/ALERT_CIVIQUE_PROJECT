import { JAVA_BASE_URL } from '@/lib/config';

const BASE = JAVA_BASE_URL;

function headers(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function req<T>(method: string, path: string, token: string, body?: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(token),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}

// ── Reports ───────────────────────────────────────────────────────────────────
export interface AdminReport {
  reportId: number;
  description: string;
  createdAt: string;
  status: string;
  priority: string;
  anonymous: boolean;
  userId: number;
  latitude?: number;
  longitude?: number;
  locationText?: string;
  mediaCount?: number;
  aiConfidenceScore?: number;
}

export const AdminService = {
  // Reports
  getReports: (token: string) =>
    req<AdminReport[]>('GET', '/api/report', token),

  updateReportStatus: (id: number, status: string, token: string) =>
    req('PUT', `/api/report/${id}`, token, { status }),

  deleteReport: (id: number, token: string) =>
    req('DELETE', `/api/report/${id}`, token),

  // Users
  getUsers: (token: string) =>
    req<any[]>('GET', '/api/users', token),

  deleteUser: (id: number, token: string) =>
    req('DELETE', `/api/users/${id}`, token),

  // Live Streams
  getLiveStreams: (token: string) =>
    req<any[]>('GET', '/api/livestream', token),

  deleteLiveStream: (id: number, token: string) =>
    req('DELETE', `/api/livestream/${id}`, token),

  // Emergencies
  getEmergencies: (token: string) =>
    req<any[]>('GET', '/api/emergencies', token),

  deleteEmergency: (id: number, token: string) =>
    req('DELETE', `/api/emergencies/${id}`, token),

  // Push Notifications
  getPushNotifications: (userId: number, token: string) =>
    req<any[]>('GET', `/api/push-notifications/user/${userId}`, token),

  // Stats helpers (parallel fetches)
  async getStats(token: string) {
    const [reports, users, streams] = await Promise.allSettled([
      req<any[]>('GET', '/api/report', token),
      req<any[]>('GET', '/api/users', token),
      req<any[]>('GET', '/api/livestream', token),
    ]);
    const r = reports.status === 'fulfilled' ? reports.value : [];
    const u = users.status === 'fulfilled'   ? users.value   : [];
    const s = streams.status === 'fulfilled' ? streams.value : [];

    const byStatus = (r as AdminReport[]).reduce<Record<string, number>>((acc, rep) => {
      acc[rep.status] = (acc[rep.status] ?? 0) + 1;
      return acc;
    }, {});

    return {
      totalReports:  r.length,
      totalUsers:    u.length,
      totalStreams:  s.length,
      pending:       byStatus['PENDING']   ?? 0,
      inReview:      byStatus['IN_REVIEW'] ?? 0,
      resolved:      byStatus['RESOLVED']  ?? 0,
      rejected:      byStatus['REJECTED']  ?? 0,
    };
  },
};

export default AdminService;
