'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import Button from '@/components/ui/Button'
import CreateHabitModal from '@/components/CreateHabitModal'
import HabitList from '@/components/HabitList'
import { Plus } from 'lucide-react'
import { useSession, signIn, signOut } from 'next-auth/react'
import SignInModal from '@/components/SignInModal'
import SignUpModal from '@/components/SignUpModal'

const Container = styled.div`
  min-height: 100vh;
  background-color: ${theme.colors.background};
  padding: ${theme.spacing[8]} ${theme.spacing[4]};
`

const Content = styled.div`
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
`

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
`

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[12]};
  line-height: 1.6;
`

const EmptyState = styled.div`
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[12]};
  margin-bottom: ${theme.spacing[8]};
`

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  background-color: ${theme.colors.primary[100]};
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing[6]};
  color: ${theme.colors.primary[600]};
`

const EmptyTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[3]};
`

const EmptyDescription = styled.p`
  color: ${theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: ${theme.spacing[6]};
`

const SignInPrompt = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`

const SignInLink = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary[600]};
  cursor: pointer;
  text-decoration: underline;
  font-weight: ${theme.typography.fontWeight.medium};
  
  &:hover {
    color: ${theme.colors.primary[700]};
  }
`

const HabitsContainer = styled.div`
  text-align: left;
`

const AddHabitButton = styled.div`
  text-align: center;
  margin-top: ${theme.spacing[8]};
`

const AuthBar = styled.div`
  position: absolute;
  top: ${theme.spacing[4]};
  right: ${theme.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  z-index: 20;
`

const AuthButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  padding: 0;
  margin: 0;
  &:hover {
    text-decoration: underline;
  }
`

const SaveProgressPrompt = styled.div`
  text-align: center;
  margin-top: ${theme.spacing[8]};
  padding: ${theme.spacing[4]};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`

const SaveProgressLink = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  text-decoration: underline;
  font-weight: ${theme.typography.fontWeight.medium};
  margin-left: ${theme.spacing[1]};
  
  &:hover {
    color: ${theme.colors.text.secondary};
  }
`

// Sample habits with different streak values
const sampleHabits = [
  {
    id: 1,
    title: 'Exercise for 30 minutes',
    category: 'fitness',
    frequency: 'daily',
    completed: true,
    streak: 7,
    lastCompleted: new Date().getTime()
  },
  {
    id: 2,
    title: 'Read for 30 minutes',
    category: 'productivity',
    frequency: 'daily',
    completed: false,
    streak: 3,
    lastCompleted: new Date(Date.now() - 24 * 60 * 60 * 1000).getTime() // Yesterday
  },
  {
    id: 3,
    title: 'Drink 8 glasses of water',
    category: 'wellness',
    frequency: 'daily',
    completed: true,
    streak: 12,
    lastCompleted: new Date().getTime()
  },
  {
    id: 4,
    title: 'Practice gratitude',
    category: 'wellness',
    frequency: 'daily',
    completed: false,
    streak: 0,
    lastCompleted: null
  },
  {
    id: 5,
    title: 'Learn something new',
    category: 'learning',
    frequency: 'weekly',
    completed: true,
    streak: 5,
    lastCompleted: new Date().getTime()
  }
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [habits, setHabits] = useState<any[]>(sampleHabits)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<any>(null)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)

  const handleCreateHabit = () => {
    setIsModalOpen(true)
  }

  const handleSaveHabit = (habit: { title: string; category: string; frequency: string }) => {
    if (editingHabit) {
      // Update existing habit
      setHabits(prev => 
        prev.map(h => 
          h.id === editingHabit.id 
            ? { ...h, ...habit }
            : h
        )
      )
      setEditingHabit(null)
    } else {
      // Create new habit
      setHabits(prev => [...prev, { 
        ...habit, 
        id: Date.now(), 
        completed: false,
        streak: 0,
        lastCompleted: null
      }])
    }
  }

  const handleEditHabit = (habit: any) => {
    setEditingHabit(habit)
    setIsModalOpen(true)
  }

  const handleDeleteHabit = (habitId: number) => {
    setHabits(prev => prev.filter(h => h.id !== habitId))
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingHabit(null)
  }

  const handleToggleHabit = (habitId: number) => {
    setHabits(prev => 
      prev.map(habit => {
        if (habit.id === habitId) {
          const now = new Date()
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          
          if (!habit.completed) {
            // Marking as completed
            const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted) : null
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            
            let newStreak = habit.streak || 0
            
            if (!lastCompleted || lastCompleted.getTime() === yesterday.getTime()) {
              // Consecutive day - increment streak
              newStreak += 1
            } else if (lastCompleted.getTime() !== today.getTime()) {
              // Not consecutive - reset streak to 1
              newStreak = 1
            }
            
            return {
              ...habit,
              completed: true,
              streak: newStreak,
              lastCompleted: today.getTime()
            }
          } else {
            // Marking as incomplete
            return {
              ...habit,
              completed: false
            }
          }
        }
        return habit
      })
    )
  }

  const handleSignIn = () => {
    setIsSignInModalOpen(true)
  }

  const handleSignUp = () => {
    setIsSignUpModalOpen(true)
  }

  const handleCloseSignInModal = () => {
    setIsSignInModalOpen(false)
  }

  const handleCloseSignUpModal = () => {
    setIsSignUpModalOpen(false)
  }

  const handleSwitchToSignUp = () => {
    setIsSignInModalOpen(false)
    setIsSignUpModalOpen(true)
  }

  const handleSwitchToSignIn = () => {
    setIsSignUpModalOpen(false)
    setIsSignInModalOpen(true)
  }

  return (
    <Container>
      <Content>
        <Title>Your Habits</Title>
        <Subtitle>
          Start building better habits today
        </Subtitle>

        {habits.length === 0 ? (
          <>
            <EmptyState>
              <EmptyIcon>
                <Plus size={32} />
              </EmptyIcon>
              <EmptyTitle>No habits yet</EmptyTitle>
              <EmptyDescription>
                Create your first habit to start tracking your progress
              </EmptyDescription>
              <Button $size="lg" onClick={handleCreateHabit}>
                <Plus size={20} />
                Create Habit
              </Button>
            </EmptyState>

            {!session?.user && (
              <SignInPrompt>
                Want to save your progress?{' '}
                <SignInLink onClick={handleSignIn}>
                  Sign in
                </SignInLink>
              </SignInPrompt>
            )}
          </>
        ) : (
          <>
            <HabitsContainer>
              <HabitList 
                habits={habits} 
                onToggleHabit={handleToggleHabit}
                onEditHabit={handleEditHabit}
                onDeleteHabit={handleDeleteHabit}
              />
            </HabitsContainer>

            <AddHabitButton>
              <Button $variant="secondary" onClick={handleCreateHabit}>
                <Plus size={16} />
                Add Habit
              </Button>
            </AddHabitButton>

            {!session?.user && (
              <SaveProgressPrompt>
                Sign in to save your progress
                <SaveProgressLink onClick={handleSignIn}>
                  Sign in
                </SaveProgressLink>
              </SaveProgressPrompt>
            )}
          </>
        )}
      </Content>

      <CreateHabitModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveHabit}
        editingHabit={editingHabit}
      />

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={handleCloseSignInModal}
        onSwitchToSignUp={handleSwitchToSignUp}
      />

      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={handleCloseSignUpModal}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
    </Container>
  )
} 