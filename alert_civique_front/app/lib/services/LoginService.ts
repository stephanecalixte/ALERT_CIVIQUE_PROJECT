/**
 * LoginService - Placeholder implementation
 */
import sendData from "./SendData";

export async function loginUser(email: string, password: string) {
  const payload = { email, password };
  return sendData("/api/auth/login", payload);
}

export default {
  loginUser
};

