import { JAVA_BASE_URL } from '@/lib/config';

export interface LoginResponse {
  token: string;
  userId: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  isAdmin?: boolean;
}

export async function loginUser(email: string, password: string, userId?: number): Promise<LoginResponse> {
  const response = await fetch(`${JAVA_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || `HTTP ${response.status}`);
  const data = JSON.parse(text);
  return {
    token: data.token ?? data.accessToken ?? '',
    userId: data.userId ?? data.id ?? userId ?? 0,
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email ?? email,
    isAdmin: data.isAdmin ?? data.admin ?? false,
  };
}
