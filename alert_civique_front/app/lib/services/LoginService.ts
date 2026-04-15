import { JAVA_BASE_URL } from '@/lib/config';

export interface LoginResponse {
  token: string;
  userId: number;
  email: string;
  firstname: string;
  lastname: string;
  isAdmin: boolean;
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
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 10_000); // 10s max

  let response: Response;
  try {
    response = await fetch(`${JAVA_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }),
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === 'AbortError') {
      throw new Error('Serveur inaccessible (timeout 10s) — vérifiez votre connexion');
    }
    throw new Error('Impossible de joindre le serveur — vérifiez votre connexion');
  }
  clearTimeout(timeoutId);

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `Erreur serveur HTTP ${response.status}`);
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
    isAdmin: false,
  };
}

export default { loginUser };
