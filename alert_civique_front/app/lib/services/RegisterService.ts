import { JAVA_BASE_URL } from '@/lib/config';
import { UserRegisterRequest, UserResponse } from '@/models/User';

/**
 * POST /api/auth/register
 * Java attend : UserRegisterRequestDto { firstname, lastname, email, password, phone, birthdate }
 * Java retourne : UserResponseDto { id, firstname, lastname, email, birthdate, active, createdAt, roles }
 */
export async function registerUser(payload: UserRegisterRequest): Promise<UserResponse> {
  const response = await fetch(`${JAVA_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `HTTP ${response.status}`);
  }

  return JSON.parse(text) as UserResponse;
}

export default { registerUser };
