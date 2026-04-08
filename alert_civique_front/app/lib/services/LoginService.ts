import { JAVA_BASE_URL } from '@/lib/config';

export interface LoginResponse {
  token: string;
  userId: number;
  email: string;
  firstname: string;
  lastname: string;
}

/**
 * POST /api/auth/login
 * Supporte les deux formats backend :
 *   - JSON  { token, userId, email, firstname, lastname }  (nouveau)
 *   - Plain text JWT string                                (ancien)
 */
export async function loginUser(
  email: string,
  password: string,
  fallbackUserId = 0,
): Promise<LoginResponse> {
  const response = await fetch(`${JAVA_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, password }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `HTTP ${response.status}`);
  }

  // Nouveau format : JSON avec userId
  try {
    const json = JSON.parse(text);
    if (json?.token) return json as LoginResponse;
  } catch {}

  // Ancien format : token plain text
  return {
    token: text,
    userId: fallbackUserId,
    email,
    firstname: '',
    lastname: '',
  };
}

export default { loginUser };
