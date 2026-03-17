export interface LoginRequest {
  username: string;
  password?: string;
}

export interface UserRegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  birthdate: string; // YYYY-MM-DD
}

export interface UserResponse {
  userId: number;
  name: string;
  roleId: number;
  email: string;
  registration_date: string; // ISO
}

export interface UserDto {
  userId?: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
}

