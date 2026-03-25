import { UserRegisterRequest } from "@/models/User";
import sendData from "./SendData";

// import type { UserRegisterRequest } from '../../models/User';

export type RegisterPayload = UserRegisterRequest;

export async function registerUser(payload: any) {
  return sendData("/api/auth/register", payload);
}

export default {
  registerUser
};

