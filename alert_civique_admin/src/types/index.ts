export interface AdminUser {
  userId: number
  firstname: string
  lastname: string
  name: string
  email: string
  phone?: string
  active: boolean
  registrationDate: string | number[]
  roles: Array<{ name: string } | string>
}

export interface AdminReport {
  reportId: number
  description: string
  createdAt: string | number[]
  status: string
  priority?: string
  anonymous: boolean
  userId?: number
  alertType?: string
  senderName?: string
  latitude?: number
  longitude?: number
  locationText?: string
}

export interface AdminAlert {
  reportMessageId: number
  alertType: string
  senderName: string
  reason: string
  createdAt: string | number[]
  userId?: number
  reportId?: number
}

export interface AdminStream {
  liveStreamId?: number
  id?: number
  filePath?: string
  streamUrl?: string
  userId?: number
  user?: { userId: number }
  createdAt?: string | number[]
  status?: string
}

export interface AdminEmergency {
  emergenciesAlertId?: number
  id?: number
  recipientEmail?: string
  message?: string
  description?: string
  createdAt?: string | number[]
  sentAt?: string | number[]
}

export interface LoginResponse {
  token: string
  userId: number
  email: string
  firstname: string
  lastname: string
  isAdmin: boolean
}

export type Section =
  | 'dashboard'
  | 'alerts'
  | 'reports'
  | 'users'
  | 'streams'
  | 'emergencies'
  | 'authorities'

export type ToastType = 'success' | 'error' | 'info'
export interface Toast {
  id: number
  message: string
  type: ToastType
}
