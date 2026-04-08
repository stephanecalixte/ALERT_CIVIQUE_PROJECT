// ─── Correspond à LoginRequestDTO (Java) ─────────────────────────────────────
export interface LoginRequest {
  username: string;   // email utilisé comme username
  password: string;
}

// ─── Contact de confiance saisi à l'inscription ───────────────────────────────
export interface TrustedContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  smsEnabled: boolean;
}

// ─── Correspond à UserRegisterRequestDto (Java) ───────────────────────────────
export interface UserRegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  birthdate: string; // YYYY-MM-DD → LocalDate Java
  trustedContacts: {
    person1: TrustedContactInput;
    person2: TrustedContactInput;
    person3: TrustedContactInput;
  };
}

// ─── Correspond à Roles entity (Java) ────────────────────────────────────────
export interface Role {
  roleId: number;
  name: string;
}

// ─── Correspond à UserResponseDto (Java) ─────────────────────────────────────
export interface UserResponse {
  id: number;           // Long id
  firstname: string;
  lastname: string;
  email: string;
  birthdate?: string;   // dd-MM-yyyy
  active?: boolean;
  createdAt?: string;   // dd-MM-yyyy HH:mm:ss
  roles?: Role[];
}

// ─── Correspond à UserDto (Java) ─────────────────────────────────────────────
export interface UserDto {
  userId?: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
}
