import {
  loginSchema,
  registerSchema,
  createHabitSchema,
  updateHabitSchema,
  createHabitLogSchema,
  updateHabitLogSchema,
} from '../validation'

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      }
      
      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email address')
      }
    })

    it('rejects short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123',
      }
      
      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 6 characters')
      }
    })
  })

  describe('registerSchema', () => {
    it('validates correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
      }
      
      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('validates registration data without name', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      }
      
      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('createHabitSchema', () => {
    it('validates correct habit data', () => {
      const validData = {
        title: 'Exercise daily',
        description: 'Work out for 30 minutes',
        frequency: 'daily' as const,
        target: 1,
        color: '#3B82F6',
      }
      
      const result = createHabitSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('uses default values when not provided', () => {
      const minimalData = {
        title: 'Exercise daily',
      }
      
      const result = createHabitSchema.safeParse(minimalData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.frequency).toBe('daily')
        expect(result.data.target).toBe(1)
        expect(result.data.color).toBe('#3B82F6')
      }
    })

    it('rejects empty title', () => {
      const invalidData = {
        title: '',
        description: 'Work out for 30 minutes',
      }
      
      const result = createHabitSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Title is required')
      }
    })

    it('rejects invalid color format', () => {
      const invalidData = {
        title: 'Exercise daily',
        color: 'blue',
      }
      
      const result = createHabitSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid color format')
      }
    })
  })

  describe('updateHabitSchema', () => {
    it('validates correct update data', () => {
      const validData = {
        title: 'Updated exercise habit',
        isActive: false,
      }
      
      const result = updateHabitSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('allows partial updates', () => {
      const partialData = {
        title: 'Updated title',
      }
      
      const result = updateHabitSchema.safeParse(partialData)
      expect(result.success).toBe(true)
    })
  })

  describe('createHabitLogSchema', () => {
    it('validates correct habit log data', () => {
      const validData = {
        habitId: 'clh1234567890abcdef',
        date: '2023-12-01T00:00:00.000Z',
        completed: true,
        notes: 'Completed successfully',
      }
      
      const result = createHabitLogSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects invalid habit ID', () => {
      const invalidData = {
        habitId: 'invalid-id',
        date: '2023-12-01T00:00:00.000Z',
        completed: true,
      }
      
      const result = createHabitLogSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid habit ID')
      }
    })

    it('rejects invalid date format', () => {
      const invalidData = {
        habitId: 'clh1234567890abcdef',
        date: '2023-12-01',
        completed: true,
      }
      
      const result = createHabitLogSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid date format')
      }
    })
  })

  describe('updateHabitLogSchema', () => {
    it('validates correct update data', () => {
      const validData = {
        completed: false,
        notes: 'Updated notes',
      }
      
      const result = updateHabitLogSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('allows partial updates', () => {
      const partialData = {
        completed: true,
      }
      
      const result = updateHabitLogSchema.safeParse(partialData)
      expect(result.success).toBe(true)
    })
  })
}) 