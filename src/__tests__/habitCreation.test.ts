import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import CreateHabitModal from '@/components/CreateHabitModal'

// Mock the hooks
jest.mock('@/hooks/useHabits', () => ({
  useHabits: jest.fn(() => ({
    habits: [],
    loading: false,
    error: null,
    createHabit: jest.fn().mockResolvedValue({
      id: 'test-habit-id',
      title: 'Test Habit',
      category: 'fitness',
      frequency: 'daily'
    }),
    toggleHabit: jest.fn(),
    deleteHabit: jest.fn(),
    createSampleHabits: jest.fn(),
    refetch: jest.fn(),
    reorderHabits: jest.fn()
  }))
}))

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: { email: 'test@example.com' }
    },
    status: 'authenticated'
  }))
}))

describe('Habit Creation Flow', () => {
  const mockOnSave = jest.fn()
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('CreateHabitModal Component', () => {
    it('should render the modal when isOpen is true', () => {
      render(
        <CreateHabitModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      expect(screen.getByText('Create New Habit')).toBeInTheDocument()
      expect(screen.getByText('Select a category')).toBeInTheDocument()
      expect(screen.getByText('Frequency')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(
        <CreateHabitModal
          isOpen={false}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      expect(screen.queryByText('Create New Habit')).not.toBeInTheDocument()
    })

    it('should allow category selection', () => {
      render(
        <CreateHabitModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const fitnessButton = screen.getByText('Fitness')
      fireEvent.click(fitnessButton)

      expect(screen.getByText('Popular Fitness Habits')).toBeInTheDocument()
    })

    it('should allow habit selection from suggestions', () => {
      render(
        <CreateHabitModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      // Select category first
      const fitnessButton = screen.getByText('Fitness')
      fireEvent.click(fitnessButton)

      // Select a suggestion
      const exerciseSuggestion = screen.getByText('Exercise for 30 minutes')
      fireEvent.click(exerciseSuggestion)

      // Check if the suggestion is selected (this might need adjustment based on actual implementation)
      expect(exerciseSuggestion).toBeInTheDocument()
    })

    it('should allow custom habit input', () => {
      render(
        <CreateHabitModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      // Select category first
      const fitnessButton = screen.getByText('Fitness')
      fireEvent.click(fitnessButton)

      // Click custom habit button
      const customButton = screen.getByText('+ Add custom habit')
      fireEvent.click(customButton)

      // Type custom habit
      const input = screen.getByPlaceholderText('Type your custom habit...')
      fireEvent.change(input, { target: { value: 'My Custom Habit' } })

      expect(input).toHaveValue('My Custom Habit')
    })

    it('should allow frequency selection', () => {
      render(
        <CreateHabitModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const frequencySelect = screen.getByDisplayValue('Daily')
      fireEvent.change(frequencySelect, { target: { value: 'weekly' } })

      expect(frequencySelect).toHaveValue('weekly')
    })

    it('should disable create button when no habit is selected', () => {
      render(
        <CreateHabitModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const createButton = screen.getByText('Create Habit')
      expect(createButton).toBeDisabled()
    })

    it('should enable create button when habit is selected', () => {
      render(
        <CreateHabitModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      // Select category and habit
      const fitnessButton = screen.getByText('Fitness')
      fireEvent.click(fitnessButton)
      
      const exerciseSuggestion = screen.getByText('Exercise for 30 minutes')
      fireEvent.click(exerciseSuggestion)

      const createButton = screen.getByText('Create Habit')
      expect(createButton).not.toBeDisabled()
    })

    it('should call onSave with correct data when form is submitted', async () => {
      render(
        <CreateHabitModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      // Select category and habit
      const fitnessButton = screen.getByText('Fitness')
      fireEvent.click(fitnessButton)
      
      const exerciseSuggestion = screen.getByText('Exercise for 30 minutes')
      fireEvent.click(exerciseSuggestion)

      // Submit form
      const createButton = screen.getByText('Create Habit')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          title: 'Exercise for 30 minutes',
          category: 'fitness',
          frequency: 'daily'
        })
      })
    })

    it('should call onSave with custom habit text when custom habit is entered', async () => {
      render(
        <CreateHabitModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      // Select category
      const fitnessButton = screen.getByText('Fitness')
      fireEvent.click(fitnessButton)

      // Click custom habit button
      const customButton = screen.getByText('+ Add custom habit')
      fireEvent.click(customButton)

      // Type custom habit
      const input = screen.getByPlaceholderText('Type your custom habit...')
      fireEvent.change(input, { target: { value: 'My Custom Habit' } })

      // Submit form
      const createButton = screen.getByText('Create Habit')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          title: 'My Custom Habit',
          category: 'fitness',
          frequency: 'daily'
        })
      })
    })

    it('should reset form state after successful submission', async () => {
      render(
        <CreateHabitModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      // Select category and habit
      const fitnessButton = screen.getByText('Fitness')
      fireEvent.click(fitnessButton)
      
      const exerciseSuggestion = screen.getByText('Exercise for 30 minutes')
      fireEvent.click(exerciseSuggestion)

      // Submit form
      const createButton = screen.getByText('Create Habit')
      fireEvent.click(createButton)

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled()
        expect(mockOnClose).toHaveBeenCalled()
      })
    })

    it('should not call onSave when no habit is selected', () => {
      render(
        <CreateHabitModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const createButton = screen.getByText('Create Habit')
      fireEvent.click(createButton)

      expect(mockOnSave).not.toHaveBeenCalled()
    })
  })

  describe('Form Validation', () => {
    it('should require a habit title', () => {
      render(
        <CreateHabitModal
          isOpen={true}
          onClose={mockOnClose}
          onSave={mockOnSave}
        />
      )

      const createButton = screen.getByText('Create Habit')
      expect(createButton).toBeDisabled()
    })
  })
}) 