export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

export interface Habit {
  id: string
  title: string
  category: string
  frequency: string
  isActive: boolean
  order?: number
  currentStreak?: number
  bestStreak?: number
  createdAt: Date
  updatedAt: Date
  userId: string
  logs: HabitLog[]
}

export interface HabitLog {
  id: string
  date: Date
  completed: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
  habitId: string
  userId: string
}

export interface CreateHabitInput {
  title: string
  description?: string
  frequency?: 'daily' | 'weekly' | 'monthly'
  target?: number
  color?: string
}

export interface UpdateHabitInput {
  title?: string
  description?: string
  frequency?: 'daily' | 'weekly' | 'monthly'
  target?: number
  color?: string
  isActive?: boolean
}

export interface CreateHabitLogInput {
  habitId: string
  date: Date
  completed: boolean
  notes?: string
}

export interface UpdateHabitLogInput {
  completed?: boolean
  notes?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  email: string
  password: string
  name?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
} 