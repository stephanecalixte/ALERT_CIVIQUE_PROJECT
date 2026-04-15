export interface AdminUser {
  id: number
  firstname: string
  lastname: string
  email: string
  active: boolean
  createdAt: string | number[]
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
  livestreamId?: number
  userId?: string
  startedAt?: string | number[]
  endedAt?: string | number[]
  streamUrl?: string
  status?: string
  videoUrl?: string
  mediaId?: number
  duration?: number
}

export interface AdminEmergency {
  emergencyAlertId?: number
  email?: string
  sentAt?: string | number[]
  messages?: Array<{ content?: string; text?: string; body?: string }>
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
