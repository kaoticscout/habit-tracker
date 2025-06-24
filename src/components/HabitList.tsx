'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { CheckCircle, Circle, CheckSquare, Clock, Edit, Trash2, AlertTriangle, X } from 'lucide-react'

interface HabitLog {
  id: string
  date: Date
  completed: boolean
}

interface Habit {
  id: string
  title: string
  category: string
  frequency: string
  isActive: boolean
  createdAt: Date
  logs: HabitLog[]
  currentStreak?: number
}

interface HabitListProps {
  habits: Habit[]
  onToggleHabit: (habitId: string) => void
  onEditHabit?: (habit: Habit) => void
  onDeleteHabit?: (habitId: string) => void
}

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
`

const HabitItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding: ${theme.spacing[4]} 0;
  padding-right: ${theme.spacing[4]};
  border-bottom: 1px solid ${theme.colors.gray[100]};
  transition: all ${theme.transitions.normal};
  overflow: hidden;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${theme.colors.gray[50]};
    margin: 0 -${theme.spacing[4]};
    padding-left: ${theme.spacing[4]};
    padding-right: ${theme.spacing[4]};
    border-radius: ${theme.borderRadius.md};
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.sm};
  }
`

const Checkbox = styled.button<{ $completed: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ $completed }) => $completed ? theme.colors.success : theme.colors.gray[300]};
  margin-right: ${theme.spacing[4]};
  transition: all ${theme.transitions.normal};
  
  &:hover {
    color: ${({ $completed }) => $completed ? theme.colors.success : theme.colors.primary[400]};
    transform: scale(1.05);
  }
`

const HabitContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ActionButtons = styled.div`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%) translateX(100%);
  display: flex;
  gap: ${theme.spacing[2]};
  transition: transform ${theme.transitions.normal};
  z-index: 10;
  
  ${HabitItem}:hover & {
    transform: translateY(-50%) translateX(0);
  }
`

const ActionButton = styled.button<{ $variant: 'edit' | 'delete' }>`
  width: 36px;
  height: 36px;
  border: 1px solid ${({ $variant }) => 
    $variant === 'edit' ? theme.colors.gray[200] : 'transparent'
  };
  border-radius: ${theme.borderRadius.full};
  background-color: ${({ $variant }) => 
    $variant === 'edit' ? theme.colors.background : theme.colors.error
  };
  color: ${({ $variant }) => 
    $variant === 'edit' ? theme.colors.gray[600] : 'white'
  };
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.transitions.normal};
  opacity: 0;
  transform: scale(0.8);
  box-shadow: ${theme.shadows.sm};
  
  ${HabitItem}:hover & {
    opacity: 1;
    transform: scale(1);
  }
  
  &:hover {
    background-color: ${({ $variant }) => 
      $variant === 'edit' ? theme.colors.gray[50] : '#dc2626'
    };
    transform: scale(1.05);
    box-shadow: ${theme.shadows.md};
  }
  
  &:active {
    transform: scale(0.95);
  }
`

const HabitTitle = styled.span<{ $completed: boolean }>`
  font-size: ${theme.typography.fontSize.lg};
  color: ${({ $completed }) => $completed ? theme.colors.text.disabled : theme.colors.text.primary};
  text-decoration: ${({ $completed }) => $completed ? 'line-through' : 'none'};
  transition: all ${theme.transitions.normal};
  font-weight: ${theme.typography.fontWeight.normal};
`

const HabitMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
`

const StreakCounter = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`

const StreakIcon = styled.div`
  color: ${theme.colors.text.secondary};
  display: flex;
  align-items: center;
  opacity: 0.7;
`

const StreakNumber = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
`

const FrequencyTag = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.disabled};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  opacity: 0.8;
`

const CategoryTag = styled.span`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.disabled};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: ${theme.typography.fontWeight.medium};
  opacity: 0.7;
`

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing[12]} 0;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.normal};
`

const ConfirmationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${theme.spacing[4]};
  backdrop-filter: blur(2px);
  animation: zenOverlayFadeIn 0.3s ease-out;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[3]};
  }
`

const ConfirmationModal = styled.div`
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[8]};
  max-width: 420px;
  width: 100%;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.08);
  animation: zenSlideIn 0.4s ease-out;
  position: relative;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[6]};
    max-width: 100%;
    border-radius: ${theme.borderRadius.lg};
  }
`

const ConfirmationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  margin-bottom: ${theme.spacing[4]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-bottom: ${theme.spacing[3]};
  }
`

const WarningIcon = styled.div`
  color: ${theme.colors.warning};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.warning}15;
  flex-shrink: 0;
`

const ConfirmationTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.base};
  }
`

const ConfirmationMessage = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.base};
  line-height: ${theme.typography.lineHeight.relaxed};
  margin-bottom: ${theme.spacing[6]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.sm};
    margin-bottom: ${theme.spacing[4]};
  }
`

const HabitName = styled.span`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`

const WarningText = styled.p`
  color: ${theme.colors.warning};
  font-weight: ${theme.typography.fontWeight.medium};
  margin: ${theme.spacing[3]} 0 0 0;
  font-size: ${theme.typography.fontSize.sm};
`

const ConfirmationActions = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  justify-content: flex-end;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column-reverse;
    gap: ${theme.spacing[2]};
  }
`

const CancelButton = styled.button`
  background: none;
  border: 1px solid ${theme.colors.gray[200]};
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  padding: ${theme.spacing[3]} ${theme.spacing[6]};
  border-radius: ${theme.borderRadius.base};
  transition: all ${theme.transitions.normal};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.normal};
  min-height: 44px;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    width: 100%;
  }
  
  &:hover {
    border-color: ${theme.colors.gray[300]};
    background-color: ${theme.colors.gray[50]};
    color: ${theme.colors.text.primary};
  }
`

const DeleteButton = styled.button`
  background-color: ${theme.colors.error};
  border: none;
  color: white;
  cursor: pointer;
  padding: ${theme.spacing[3]} ${theme.spacing[6]};
  border-radius: ${theme.borderRadius.base};
  transition: all ${theme.transitions.normal};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  min-height: 44px;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    width: 100%;
  }
  
  &:hover {
    background-color: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`

export default function HabitList({ habits, onToggleHabit, onEditHabit, onDeleteHabit }: HabitListProps) {
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null)

  if (habits.length === 0) {
    return (
      <Container>
        <EmptyState>
          No habits yet
        </EmptyState>
      </Container>
    )
  }

  const getHabitStatus = (habit: Habit) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Find today's log regardless of completion status
    const todayLog = habit.logs.find(log => {
      const logDate = new Date(log.date)
      logDate.setHours(0, 0, 0, 0)
      return logDate.getTime() === today.getTime()
    })
    
    // Check if today's log is completed
    const isCompletedToday = todayLog ? todayLog.completed : false
    
    // Use stored currentStreak if available, otherwise calculate
    let streak: number
    if (typeof habit.currentStreak === 'number') {
      // Use the stored streak value from the habit data
      streak = habit.currentStreak
    } else {
      // Fallback: calculate streak from logs (for backwards compatibility)
      streak = 0
      const sortedLogs = habit.logs
        .filter(log => log.completed)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      if (sortedLogs.length > 0) {
        // Start from the most recent completed day
        let currentDate = new Date(sortedLogs[0].date)
        currentDate.setHours(0, 0, 0, 0)
        
        // If today is completed, start streak from today
        if (isCompletedToday) {
          currentDate = new Date(today)
          streak = 1
        }
        
        // Count consecutive days backwards
        for (let i = isCompletedToday ? 1 : 0; i < sortedLogs.length; i++) {
          const logDate = new Date(sortedLogs[i].date)
          logDate.setHours(0, 0, 0, 0)
          
          const expectedDate = new Date(currentDate)
          expectedDate.setDate(expectedDate.getDate() - (isCompletedToday ? i : i + 1))
          
          if (logDate.getTime() === expectedDate.getTime()) {
            streak++
          } else {
            break
          }
        }
      }
    }
    
    return {
      completed: isCompletedToday,
      streak
    }
  }

  const handleEdit = (habit: Habit) => {
    onEditHabit?.(habit)
  }

  const handleDelete = (habit: Habit) => {
    setHabitToDelete(habit)
  }

  const handleConfirmDelete = () => {
    if (habitToDelete) {
      onDeleteHabit?.(habitToDelete.id)
      setHabitToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setHabitToDelete(null)
  }

  return (
    <Container>
      {habits.map((habit) => {
        const { completed, streak } = getHabitStatus(habit)
        
        return (
          <HabitItem key={habit.id}>
            <Checkbox
              $completed={completed}
              onClick={() => onToggleHabit(habit.id)}
              aria-label={`${completed ? 'Unmark' : 'Mark'} ${habit.title} as ${completed ? 'incomplete' : 'complete'}`}
            >
              {completed ? (
                <CheckCircle size={24} />
              ) : (
                <Circle size={24} />
              )}
            </Checkbox>
            
            <HabitContent>
              <HabitTitle $completed={completed}>
                {habit.title}
              </HabitTitle>
              
              <HabitMeta>
                <StreakCounter>
                  <StreakIcon>
                    <CheckSquare size={14} />
                  </StreakIcon>
                  <StreakNumber>{streak}</StreakNumber>
                </StreakCounter>
                
                <FrequencyTag>
                  <Clock size={12} />
                  {habit.frequency}
                </FrequencyTag>
                
                <CategoryTag>
                  {habit.category}
                </CategoryTag>
              </HabitMeta>
            </HabitContent>
            
            <ActionButtons>
              {onEditHabit && (
                <ActionButton
                  $variant="edit"
                  onClick={() => handleEdit(habit)}
                  aria-label={`Edit ${habit.title}`}
                >
                  <Edit size={16} />
                </ActionButton>
              )}
              
              {onDeleteHabit && (
                <ActionButton
                  $variant="delete"
                  onClick={() => handleDelete(habit)}
                  aria-label={`Delete ${habit.title}`}
                >
                  <Trash2 size={16} />
                </ActionButton>
              )}
            </ActionButtons>
          </HabitItem>
        )
      })}
      
      {habitToDelete && (
        <ConfirmationOverlay onClick={handleCancelDelete}>
          <ConfirmationModal onClick={(e) => e.stopPropagation()}>
            <ConfirmationHeader>
              <WarningIcon>
                <AlertTriangle size={24} />
              </WarningIcon>
              <ConfirmationTitle>Delete Habit</ConfirmationTitle>
            </ConfirmationHeader>
            
            <ConfirmationMessage>
              Are you sure you want to delete <HabitName>"{habitToDelete.title}"</HabitName>?
              
              <WarningText>
                This will permanently delete all progress data and cannot be undone.
              </WarningText>
            </ConfirmationMessage>
            
            <ConfirmationActions>
              <CancelButton onClick={handleCancelDelete}>
                Cancel
              </CancelButton>
              <DeleteButton onClick={handleConfirmDelete}>
                Delete Habit
              </DeleteButton>
            </ConfirmationActions>
          </ConfirmationModal>
        </ConfirmationOverlay>
      )}
    </Container>
  )
} 