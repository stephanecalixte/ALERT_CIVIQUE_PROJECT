import sendData from "./SendData";
import type { UserRegisterRequest } from '../../models/User';

export type RegisterPayload = UserRegisterRequest;

export async function registerUser(payload: RegisterPayload) {
  return sendData("/api/auth/register", payload);
}

