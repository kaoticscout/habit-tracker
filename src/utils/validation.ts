import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
})

export const createHabitSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  target: z.number().int().positive().default(1),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').default('#3B82F6'),
})

export const updateHabitSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  target: z.number().int().positive().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  isActive: z.boolean().optional(),
})

export const createHabitLogSchema = z.object({
  habitId: z.string().cuid('Invalid habit ID'),
  date: z.string().datetime('Invalid date format'),
  completed: z.boolean(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
})

export const updateHabitLogSchema = z.object({
  completed: z.boolean().optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreateHabitInput = z.infer<typeof createHabitSchema>
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>
export type CreateHabitLogInput = z.infer<typeof createHabitLogSchema>
export type UpdateHabitLogInput = z.infer<typeof updateHabitLogSchema> 