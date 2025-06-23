'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import Button from '@/components/ui/Button'
import CreateHabitModal from '@/components/CreateHabitModal'
import HabitList from '@/components/HabitList'
import ProgressCalendar from '@/components/ProgressCalendar'
import { Plus, Sparkles } from 'lucide-react'
import { useSession, signIn, signOut } from 'next-auth/react'
import SignInModal from '@/components/SignInModal'
import SignUpModal from '@/components/SignUpModal'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${theme.colors.primary[25]} 0%, ${theme.colors.background} 100%);
  padding: ${theme.spacing[8]} ${theme.spacing[4]};
  position: relative;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[6]} ${theme.spacing[3]};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    padding: ${theme.spacing[12]} ${theme.spacing[4]};
  }
  
  /* Zen-like background texture - more subtle */
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 20%, rgba(0, 0, 0, 0.002) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.002) 0%, transparent 50%);
    pointer-events: none;
    z-index: -1;
  }
`

const Content = styled.div`
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  animation: zenFadeIn 1.5s ease-out;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    max-width: 100%;
  }
`

const Title = styled.h1`
  font-size: clamp(1.875rem, 6vw, ${theme.typography.fontSize['3xl']});
  font-weight: ${theme.typography.fontWeight.light};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
  letter-spacing: -0.02em;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-bottom: ${theme.spacing[3]};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    margin-bottom: ${theme.spacing[6]};
  }
`

const Subtitle = styled.p`
  font-size: clamp(1rem, 3vw, ${theme.typography.fontSize.lg});
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[12]};
  line-height: ${theme.typography.lineHeight.loose};
  font-weight: ${theme.typography.fontWeight.normal};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-bottom: ${theme.spacing[8]};
    line-height: ${theme.typography.lineHeight.relaxed};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    margin-bottom: ${theme.spacing[16]};
  }
`

const EmptyState = styled.div`
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[12]};
  margin-bottom: ${theme.spacing[8]};
  border: 1px solid ${theme.colors.gray[100]};
  box-shadow: ${theme.shadows.xs};
  transition: all ${theme.transitions.normal};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[8]};
    margin-bottom: ${theme.spacing[6]};
    border-radius: ${theme.borderRadius.lg};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    padding: ${theme.spacing[16]};
    margin-bottom: ${theme.spacing[12]};
  }
  
  &:hover {
    box-shadow: ${theme.shadows.sm};
  }
`

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  background-color: ${theme.colors.primary[100]};
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing[6]};
  color: ${theme.colors.primary[600]};
  opacity: 0.7;
  transition: all ${theme.transitions.normal};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    width: 64px;
    height: 64px;
    margin-bottom: ${theme.spacing[4]};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    margin-bottom: ${theme.spacing[8]};
  }
  
  &:hover {
    opacity: 1;
    transform: scale(1.05);
  }
`

const EmptyTitle = styled.h2`
  font-size: clamp(1.25rem, 4vw, ${theme.typography.fontSize.xl});
  font-weight: ${theme.typography.fontWeight.light};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[3]};
  letter-spacing: -0.01em;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-bottom: ${theme.spacing[2]};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    margin-bottom: ${theme.spacing[4]};
  }
`

const EmptyDescription = styled.p`
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.loose};
  margin-bottom: ${theme.spacing[6]};
  font-weight: ${theme.typography.fontWeight.normal};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-bottom: ${theme.spacing[4]};
    line-height: ${theme.typography.lineHeight.relaxed};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    margin-bottom: ${theme.spacing[8]};
  }
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
  transition: all ${theme.transitions.normal};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-top: ${theme.spacing[4]};
    padding: ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.md};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    margin-top: ${theme.spacing[8]};
    padding: ${theme.spacing[6]};
    border-radius: ${theme.borderRadius.xl};
  }
  
  &:hover {
    background-color: ${theme.colors.gray[25]};
  }
`

const SignInText = styled.div`
  margin-bottom: ${theme.spacing[2]};
  font-weight: ${theme.typography.fontWeight.normal};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-bottom: ${theme.spacing[1]};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    margin-bottom: ${theme.spacing[3]};
  }
`

const SignInLink = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary[600]};
  cursor: pointer;
  font-weight: ${theme.typography.fontWeight.medium};
  transition: color ${theme.transitions.normal};
  min-height: 44px;
  min-width: 44px;
  
  &:hover {
    color: ${theme.colors.primary[700]};
  }
`

const HabitsContainer = styled.div`
  text-align: left;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin: 0 -${theme.spacing[3]};
  }
`

const AddHabitButton = styled.div`
  text-align: center;
  margin-top: ${theme.spacing[8]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-top: ${theme.spacing[6]};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    margin-top: ${theme.spacing[12]};
  }
`

const ZenButton = styled(Button)`
  transition: all ${theme.transitions.zen};
  font-weight: ${theme.typography.fontWeight.medium};
  min-height: 48px;
  min-width: 160px;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
    max-width: 280px;
    min-height: 52px;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }
  
  &:active {
    transform: translateY(0);
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
  transition: all ${theme.transitions.normal};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-top: ${theme.spacing[6]};
    padding: ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.md};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    margin-top: ${theme.spacing[12]};
    padding: ${theme.spacing[6]};
    border-radius: ${theme.borderRadius.xl};
  }
  
  &:hover {
    background-color: ${theme.colors.gray[25]};
  }
`

const SaveProgressLink = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  font-weight: ${theme.typography.fontWeight.medium};
  margin-left: ${theme.spacing[1]};
  transition: color ${theme.transitions.normal};
  min-height: 44px;
  min-width: 44px;
  
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
  animation: zenFadeIn 1.5s ease-out 0.4s forwards;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    gap: ${theme.spacing[4]};
    margin-bottom: ${theme.spacing[6]};
    flex-direction: column;
    align-items: center;
  }
  
  @media (min-width: ${theme.breakpoints.md}) {
    gap: ${theme.spacing[8]};
    margin-bottom: ${theme.spacing[10]};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    gap: ${theme.spacing[8]};
    margin-bottom: ${theme.spacing[12]};
  }
`

const ZenFeature = styled.div`
  text-align: center;
  color: ${theme.colors.text.muted};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.normal};
  letter-spacing: 0.01em;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.xs};
    min-width: 100px;
  }
`

const CalendarSection = styled.div`
  margin-top: ${theme.spacing[8]};
  margin-bottom: ${theme.spacing[6]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-top: ${theme.spacing[6]};
    margin-bottom: ${theme.spacing[4]};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    margin-top: ${theme.spacing[12]};
    margin-bottom: ${theme.spacing[8]};
  }
`

const CalendarTitle = styled.h2`
  font-size: clamp(1.5rem, 4vw, ${theme.typography.fontSize['2xl']});
  font-weight: ${theme.typography.fontWeight.light};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
  letter-spacing: -0.02em;
  text-align: center;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-bottom: ${theme.spacing[3]};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    margin-bottom: ${theme.spacing[6]};
  }
`

const CalendarDescription = styled.p`
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin-bottom: ${theme.spacing[6]};
  line-height: ${theme.typography.lineHeight.loose};
  font-weight: ${theme.typography.fontWeight.normal};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-bottom: ${theme.spacing[4]};
    line-height: ${theme.typography.lineHeight.relaxed};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    margin-bottom: ${theme.spacing[8]};
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

        {/* Progress Calendar Section */}
        {habits.length > 0 && (
          <CalendarSection>
            <CalendarTitle>Reflect on Your Progress</CalendarTitle>
            <CalendarDescription>
              See your habit completion patterns and celebrate your mindful journey. 
              Each filled day represents a step toward inner peace.
            </CalendarDescription>
            <ProgressCalendar 
              habitLogs={habits
                .filter(habit => habit.lastCompleted)
                .map(habit => ({
                  id: habit.id.toString(),
                  habitId: habit.id.toString(),
                  completedAt: new Date(habit.lastCompleted!)
                }))
              }
            />
          </CalendarSection>
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