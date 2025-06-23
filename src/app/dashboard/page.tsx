'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import Button from '@/components/ui/Button'
import CreateHabitModal from '@/components/CreateHabitModal'
import HabitList from '@/components/HabitList'
import { Plus, Sparkles } from 'lucide-react'
import { useSession, signIn, signOut } from 'next-auth/react'
import SignInModal from '@/components/SignInModal'
import SignUpModal from '@/components/SignUpModal'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.background} 100%);
  padding: ${theme.spacing[8]} ${theme.spacing[4]};
  position: relative;
  
  /* Zen-like background texture */
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 20%, rgba(0, 0, 0, 0.003) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.003) 0%, transparent 50%);
    pointer-events: none;
    z-index: -1;
  }
`

const Content = styled.div`
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  animation: zenFadeIn 1s ease-out;
`

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.normal};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
  letter-spacing: -0.01em;
`

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[12]};
  line-height: 1.7;
  font-weight: ${theme.typography.fontWeight.normal};
`

const EmptyState = styled.div`
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[12]};
  margin-bottom: ${theme.spacing[8]};
  border: 1px solid ${theme.colors.gray[100]};
  box-shadow: ${theme.shadows.sm};
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
  opacity: 0.8;
`

const EmptyTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.normal};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[3]};
`

const EmptyDescription = styled.p`
  color: ${theme.colors.text.secondary};
  line-height: 1.7;
  margin-bottom: ${theme.spacing[6]};
  font-weight: ${theme.typography.fontWeight.normal};
`

const SignInPrompt = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  margin-top: ${theme.spacing[6]};
  padding: ${theme.spacing[4]};
  background-color: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.gray[100]};
  text-align: center;
`

const SignInText = styled.div`
  margin-bottom: ${theme.spacing[2]};
`

const SignInLink = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary[600]};
  cursor: pointer;
  font-weight: ${theme.typography.fontWeight.medium};
  transition: color ${theme.transitions.fast};
  
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

const ZenButton = styled(Button)`
  transition: all ${theme.transitions.normal};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }
`

const SaveProgressPrompt = styled.div`
  text-align: center;
  margin-top: ${theme.spacing[8]};
  padding: ${theme.spacing[4]};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  background-color: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.gray[100]};
`

const SaveProgressLink = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  font-weight: ${theme.typography.fontWeight.medium};
  margin-left: ${theme.spacing[1]};
  transition: color ${theme.transitions.fast};
  
  &:hover {
    color: ${theme.colors.text.secondary};
  }
`

const ZenFeatures = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[8]};
  flex-wrap: wrap;
  opacity: 0;
  animation: zenFadeIn 1s ease-out 0.3s forwards;
`

const ZenFeature = styled.div`
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
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
      setHabits(prevHabits =>
        prevHabits.map(h =>
          h.id === editingHabit.id
            ? { ...h, ...habit }
            : h
        )
      )
    } else {
      // Create new habit
      const newHabit = {
        id: Date.now(),
        ...habit,
        completed: false,
        streak: 0,
        lastCompleted: null
      }
      setHabits(prevHabits => [...prevHabits, newHabit])
    }
  }

  const handleEditHabit = (habit: any) => {
    setEditingHabit(habit)
    setIsModalOpen(true)
  }

  const handleDeleteHabit = (habitId: number) => {
    setHabits(prevHabits => prevHabits.filter(h => h.id !== habitId))
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingHabit(null)
  }

  const handleToggleHabit = (habitId: number) => {
    setHabits(prevHabits =>
      prevHabits.map(habit => {
        if (habit.id === habitId) {
          const now = new Date().getTime()
          const wasCompleted = habit.completed
          const lastCompleted = habit.lastCompleted
          
          let newStreak = habit.streak
          
          if (!wasCompleted) {
            // Marking as completed
            if (lastCompleted) {
              const daysSinceLastCompleted = Math.floor((now - lastCompleted) / (1000 * 60 * 60 * 24))
              if (daysSinceLastCompleted === 1) {
                // Consecutive day
                newStreak = habit.streak + 1
              } else if (daysSinceLastCompleted > 1) {
                // Gap in streak, reset to 1
                newStreak = 1
              } else {
                // Same day, keep current streak
                newStreak = habit.streak
              }
            } else {
              // First time completing
              newStreak = 1
            }
          } else {
            // Unmarking as completed
            if (lastCompleted) {
              const daysSinceLastCompleted = Math.floor((now - lastCompleted) / (1000 * 60 * 60 * 24))
              if (daysSinceLastCompleted === 0) {
                // Same day, reduce streak
                newStreak = Math.max(0, habit.streak - 1)
              }
            }
          }
          
          return {
            ...habit,
            completed: !wasCompleted,
            streak: newStreak,
            lastCompleted: !wasCompleted ? now : null
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
        <Title>Your Peaceful Habits</Title>
        <Subtitle>
          Build mindful routines that bring calm and purpose to your daily life. 
          Each habit is a step toward inner peace and personal growth.
        </Subtitle>


        {habits.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <Sparkles size={32} />
            </EmptyIcon>
            <EmptyTitle>Begin Your Journey</EmptyTitle>
            <EmptyDescription>
              Start building peaceful habits that align with your inner goals. 
              Each small step brings you closer to a more mindful life.
            </EmptyDescription>
            <ZenButton onClick={handleCreateHabit}>
              <Plus size={20} />
              Create Your First Habit
            </ZenButton>
          </EmptyState>
        ) : (
          <HabitsContainer>
            <HabitList
              habits={habits}
              onToggleHabit={handleToggleHabit}
              onEditHabit={handleEditHabit}
              onDeleteHabit={handleDeleteHabit}
            />
            <AddHabitButton>
              <ZenButton onClick={handleCreateHabit}>
                <Plus size={20} />
                Add New Habit
              </ZenButton>
            </AddHabitButton>
          </HabitsContainer>
        )}

        {!session && habits.length > 0 && (
          <SignInPrompt>
            <SignInText>Save your progress and sync across devices</SignInText>
            <SignInLink onClick={handleSignIn}>
              Sign in to continue
            </SignInLink>
          </SignInPrompt>
        )}

        {session && (
          <SaveProgressPrompt>
            Your habits are being saved automatically
          </SaveProgressPrompt>
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