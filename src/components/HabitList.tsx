'use client'

import React, { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { CheckCircle, Circle, CheckSquare, Clock, Edit, Trash2, AlertTriangle, X, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
  order?: number
  lastUpdated?: number
}

interface HabitListProps {
  habits: Habit[]
  onToggleHabit: (habitId: string) => void
  onEditHabit?: (habit: Habit) => void
  onDeleteHabit?: (habitId: string) => void
  onReorderHabits?: (reorderedHabits: Habit[]) => void
}

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
`

const HabitItem = styled.div<{ $isDragging?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  padding: ${theme.spacing[4]} 0;
  padding-right: ${theme.spacing[4]};
  border-bottom: 1px solid ${theme.colors.gray[100]};
  transition: ${({ $isDragging }) => $isDragging ? 'none' : `all ${theme.transitions.normal}`};
  overflow: hidden;
  background-color: ${({ $isDragging }) => $isDragging ? theme.colors.primary[50] : 'transparent'};
  opacity: ${({ $isDragging }) => $isDragging ? 0.95 : 1};
  z-index: ${({ $isDragging }) => $isDragging ? 1000 : 'auto'};
  will-change: ${({ $isDragging }) => $isDragging ? 'transform' : 'auto'};
  transform: ${({ $isDragging }) => $isDragging ? 'translate3d(0, 0, 0)' : 'none'};
  
  &:last-child {
    border-bottom: none;
  }
  
  ${({ $isDragging }) => !$isDragging && `
    &:hover {
      background-color: ${theme.colors.gray[50]};
      margin: 0 -${theme.spacing[4]};
      padding-left: ${theme.spacing[4]};
      padding-right: ${theme.spacing[4]};
      border-radius: ${theme.borderRadius.md};
      transform: translateY(-1px);
      box-shadow: ${theme.shadows.sm};
    }
  `}
`

const DragHandle = styled.div`
  display: flex;
  align-items: center;
  color: ${theme.colors.gray[400]};
  margin-right: ${theme.spacing[3]};
  cursor: grab;
  opacity: 0.3;
  transition: all ${theme.transitions.normal};
  
  &:active {
    cursor: grabbing;
  }
  
  &:hover {
    opacity: 0.8;
    color: ${theme.colors.gray[600]};
  }
  
  ${HabitItem}:hover & {
    opacity: 0.6;
  }
`

const Checkbox = styled.button<{ $completed: boolean; $completedThisWeek?: boolean; $completedEarlierThisWeek?: boolean }>`
  background: none;
  border: none;
  cursor: ${({ $completedThisWeek, $completed }) => {
    // For weekly/monthly habits, disable if completed this week/month but not today
    // Allow interaction if completed today (even if it's a weekly/monthly habit)
    if ($completedThisWeek && !$completed) return 'not-allowed'
    return 'pointer'
  }};
  color: ${({ $completed, $completedThisWeek }) => {
    // For weekly/monthly habits completed this week/month but not today, show gray
    if ($completedThisWeek && !$completed) return theme.colors.text.disabled
    if ($completed) return theme.colors.success // Green for completed today
    return theme.colors.gray[300] // Gray for not completed
  }};
  margin-right: ${theme.spacing[4]};
  transition: all ${theme.transitions.normal};
  position: relative;
  
  &:hover {
    color: ${({ $completed, $completedThisWeek }) => {
      // For weekly/monthly habits completed this week/month but not today, stay gray
      if ($completedThisWeek && !$completed) return theme.colors.text.disabled
      if ($completed) return theme.colors.success // Stay green
      return theme.colors.primary[400] // Blue for hover on incomplete
    }};
    transform: ${({ $completedThisWeek, $completed }) => {
      // For weekly/monthly habits completed this week/month but not today, no transform
      if ($completedThisWeek && !$completed) return 'none'
      return 'scale(1.05)'
    }};
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`

const ConfirmationModal = styled.div`
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.xl};
  padding: ${theme.spacing[6]};
  max-width: 400px;
  width: 90%;
  margin: ${theme.spacing[4]};
`

const ConfirmationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  margin-bottom: ${theme.spacing[4]};
`

const WarningIcon = styled.div`
  color: ${theme.colors.warning};
  display: flex;
  align-items: center;
`

const ConfirmationTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
`

const ConfirmationMessage = styled.div`
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[6]};
  line-height: 1.5;
`

const HabitName = styled.span`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`

const WarningText = styled.div`
  margin-top: ${theme.spacing[3]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.warning};
`

const ConfirmationActions = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  justify-content: flex-end;
`

const CancelButton = styled.button`
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.background};
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  
  &:hover {
    background-color: ${theme.colors.gray[50]};
    border-color: ${theme.colors.gray[400]};
  }
`

const DeleteButton = styled.button`
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border: none;
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.error};
  color: white;
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  
  &:hover {
    background-color: #dc2626;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`

const SortingHint = styled.div`
  text-align: center;
  padding: ${theme.spacing[4]} 0;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  opacity: 0.8;
  margin-bottom: ${theme.spacing[2]};
  background-color: ${theme.colors.gray[25]};
  border-radius: ${theme.borderRadius.md};
  margin: 0 -${theme.spacing[4]} ${theme.spacing[4]} -${theme.spacing[4]};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.gray[100]};
`

// Sortable Item Component
const SortableHabitItem = React.memo(function SortableHabitItem({ 
  habit, 
  onToggle, 
  onEdit, 
  onDelete 
}: { 
  habit: Habit
  onToggle: (id: string) => void
  onEdit?: (habit: Habit) => void
  onDelete?: (habit: Habit) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id })

  const style = useMemo(() => {
    const transformStyle = transform 
      ? `translate3d(${transform.x || 0}px, ${transform.y || 0}px, 0)` 
      : undefined
    
    return {
      transform: transformStyle,
      transition: isDragging ? 'none' : transition,
      zIndex: isDragging ? 999 : 'auto',
      willChange: isDragging ? 'transform' : 'auto',
    }
  }, [transform, transition, isDragging])

  const { completed, completedThisWeek, completedEarlierThisWeek, streak } = useMemo(() => {
    console.log(`🔄 [MEMO] Calculating status for ${habit.title}`, {
      logsCount: habit.logs.length,
      frequency: habit.frequency,
      currentStreak: habit.currentStreak,
      lastUpdated: habit.lastUpdated
    })
    
    let isCompletedToday = false
    let isCompletedThisWeek = false
    let isCompletedEarlierThisWeek = false
    
    // Handle different frequencies differently
    if (habit.frequency.toLowerCase() === 'weekly') {
      // For weekly habits, check if completed any time this week
      const today = new Date()
      const startOfWeek = new Date(today)
      
      // Calculate Monday of this week (handle Sunday = 0 case)
      const dayOfWeek = today.getDay()
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // If Sunday, go back 6 days to Monday
      startOfWeek.setDate(today.getDate() - daysFromMonday)
      startOfWeek.setHours(0, 0, 0, 0)
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6) // Sunday of this week
      endOfWeek.setHours(23, 59, 59, 999)
      
      console.log(`🗓️ [MEMO] Weekly calculation for ${habit.title}:`, {
        today: today.toISOString(),
        startOfWeek: startOfWeek.toISOString(),
        endOfWeek: endOfWeek.toISOString(),
        allLogs: habit.logs.map(log => ({
          date: new Date(log.date).toISOString(),
          completed: log.completed
        }))
      })
      
      // Check if there's any completed log this week using string-based comparison
      const thisWeekLogs = habit.logs.filter(log => {
        const logDate = new Date(log.date)
        
        // Use date strings to avoid timezone comparison issues
        const logDateStr = logDate.toISOString().split('T')[0] // "2025-06-29"
        const startOfWeekStr = startOfWeek.toISOString().split('T')[0] // "2025-06-23" 
        const endOfWeekStr = endOfWeek.toISOString().split('T')[0] // "2025-06-29"
        
        const isInWeek = logDateStr >= startOfWeekStr && logDateStr <= endOfWeekStr
        const isCompleted = log.completed
        
        console.log(`🗓️ [MEMO] Checking log for ${habit.title}:`, {
          logDate: logDate.toISOString(),
          logDateStr,
          startOfWeekStr,
          endOfWeekStr,
          isInWeek,
          isCompleted,
          includeInWeek: isInWeek && isCompleted
        })
        
        return isInWeek && isCompleted
      })
      
      console.log(`🗓️ [MEMO] This week's completed logs for ${habit.title}:`, thisWeekLogs.length)
      isCompletedThisWeek = thisWeekLogs.length > 0
      
      // For weekly habits, check if completed TODAY specifically
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const todayLog = habit.logs.find(log => {
        const logDate = new Date(log.date)
        const logDateStr = logDate.toISOString().split('T')[0]
        const todayDateStr = todayOnly.toISOString().split('T')[0]
        return logDateStr === todayDateStr
      })
      
      isCompletedToday = todayLog ? todayLog.completed : false
      
      // Check if completed earlier this week (not today)
      isCompletedEarlierThisWeek = isCompletedThisWeek && !isCompletedToday
    } else if (habit.frequency.toLowerCase() === 'monthly') {
      // For monthly habits, check if completed any time this month
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      endOfMonth.setHours(23, 59, 59, 999)
      
      console.log(`🗓️ [MEMO] Monthly calculation for ${habit.title}:`, {
        today: today.toISOString(),
        startOfMonth: startOfMonth.toISOString(),
        endOfMonth: endOfMonth.toISOString(),
        allLogs: habit.logs.map(log => ({
          date: new Date(log.date).toISOString(),
          completed: log.completed
        }))
      })
      
      // Check if there's any completed log this month using string-based comparison
      const thisMonthLogs = habit.logs.filter(log => {
        const logDate = new Date(log.date)
        
        // Use date strings to avoid timezone comparison issues
        const logDateStr = logDate.toISOString().split('T')[0] // "2025-06-29"
        const startOfMonthStr = startOfMonth.toISOString().split('T')[0] // "2025-06-01" 
        const endOfMonthStr = endOfMonth.toISOString().split('T')[0] // "2025-06-30"
        
        const isInMonth = logDateStr >= startOfMonthStr && logDateStr <= endOfMonthStr
        const isCompleted = log.completed
        
        console.log(`🗓️ [MEMO] Checking log for ${habit.title}:`, {
          logDate: logDate.toISOString(),
          logDateStr,
          startOfMonthStr,
          endOfMonthStr,
          isInMonth,
          isCompleted,
          includeInMonth: isInMonth && isCompleted
        })
        
        return isInMonth && isCompleted
      })
      
      console.log(`🗓️ [MEMO] This month's completed logs for ${habit.title}:`, thisMonthLogs.length)
      isCompletedThisWeek = thisMonthLogs.length > 0 // Reuse the variable for monthly habits
      
      // For monthly habits, check if completed TODAY specifically
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const todayLog = habit.logs.find(log => {
        const logDate = new Date(log.date)
        const logDateStr = logDate.toISOString().split('T')[0]
        const todayDateStr = todayOnly.toISOString().split('T')[0]
        return logDateStr === todayDateStr
      })
      
      isCompletedToday = todayLog ? todayLog.completed : false
      
      // Check if completed earlier this month (not today)
      isCompletedEarlierThisWeek = isCompletedThisWeek && !isCompletedToday
    } else {
      // For daily habits, look for today's specific log
      const today = new Date()
      const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      
      // Find log that matches today's date
      const todayLog = habit.logs.find(log => {
        const logDate = new Date(log.date)
        
        // Compare using date strings (YYYY-MM-DD) to avoid timezone issues
        const logDateStr = logDate.toISOString().split('T')[0]
        const todayDateStr = todayOnly.toISOString().split('T')[0]
        
        const match = logDateStr === todayDateStr
        console.log(`🔍 [MEMO] Comparing dates for ${habit.title}:`, {
          logDate: logDate.toISOString(),
          today: todayOnly.toISOString(),
          logDateStr,
          todayDateStr,
          match,
          logCompleted: log.completed,
          logId: log.id
        })
        
        return match
      })
      
      isCompletedToday = todayLog ? todayLog.completed : false
      isCompletedThisWeek = false // Not applicable for daily habits
      isCompletedEarlierThisWeek = false // Not applicable for daily habits
    }
    
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
        let currentDateStr = new Date(sortedLogs[0].date).toISOString().split('T')[0]
        
        // If today is completed, start streak from today
        if (isCompletedToday) {
          const today = new Date()
          const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
          currentDateStr = todayOnly.toISOString().split('T')[0]
          streak = 1
        }
        
              // Count consecutive days backwards using date comparison
      for (let i = isCompletedToday ? 1 : 0; i < sortedLogs.length; i++) {
        const logDate = new Date(sortedLogs[i].date)
        const logDateOnly = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate())
        
        // Calculate expected date for consecutive day
        const today = new Date()
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const expectedDate = new Date(todayOnly)
        expectedDate.setDate(todayOnly.getDate() - (isCompletedToday ? i : i + 1))
        
        if (logDateOnly.getTime() === expectedDate.getTime()) {
          streak++
        } else {
          break
        }
      }
      }
    }
    
    console.log(`✅ [MEMO] Result for ${habit.title}:`, {
      completed: isCompletedToday,
      completedThisWeek: isCompletedThisWeek,
      completedEarlierThisWeek: isCompletedEarlierThisWeek,
      frequency: habit.frequency,
      shouldBeGray: isCompletedThisWeek && !isCompletedToday,
      shouldBeDisabled: isCompletedThisWeek && !isCompletedToday,
      period: habit.frequency.toLowerCase() === 'weekly' ? 'week' : habit.frequency.toLowerCase() === 'monthly' ? 'month' : 'day',
      streak,
      allLogs: habit.logs.map(log => ({ 
        date: new Date(log.date).toISOString(), 
        completed: log.completed 
      })),
      todayLogs: habit.logs.filter(log => {
        const logDate = new Date(log.date)
        const today = new Date()
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        
        // Compare using date strings (YYYY-MM-DD) to avoid timezone issues
        const logDateStr = logDate.toISOString().split('T')[0]
        const todayDateStr = todayOnly.toISOString().split('T')[0]
        return logDateStr === todayDateStr
      }).map(log => ({ date: log.date, completed: log.completed }))
    })
    
    return {
      completed: isCompletedToday,
      completedThisWeek: isCompletedThisWeek,
      completedEarlierThisWeek: isCompletedEarlierThisWeek,
      streak
    }
  }, [habit.logs, habit.currentStreak, habit.frequency, habit.lastUpdated])

  return (
    <HabitItem 
      ref={setNodeRef} 
      style={style} 
      $isDragging={isDragging}
    >
      <DragHandle {...attributes} {...listeners}>
        <GripVertical size={16} />
      </DragHandle>
      
      <Checkbox
        $completed={completed}
        $completedThisWeek={completedThisWeek}
        $completedEarlierThisWeek={completedEarlierThisWeek}
        onClick={() => {
          console.log(`🔍 [CHECKBOX] Click on ${habit.title}:`, {
            completed,
            completedThisWeek,
            completedEarlierThisWeek,
            frequency: habit.frequency,
            shouldPreventToggle: (habit.frequency.toLowerCase() === 'weekly' || habit.frequency.toLowerCase() === 'monthly') && completedThisWeek && !completed
          })
          // Prevent toggling if completed this week/month but not today (for weekly/monthly habits)
          // Allow toggling if completed today (even if it's a weekly/monthly habit)
          if ((habit.frequency.toLowerCase() === 'weekly' || habit.frequency.toLowerCase() === 'monthly') && completedThisWeek && !completed) {
            console.log(`🚫 [CHECKBOX] Preventing toggle for ${habit.title} - completed this ${habit.frequency.toLowerCase()} but not today`)
            return
          }
          console.log(`✅ [CHECKBOX] Allowing toggle for ${habit.title}`)
          onToggle(habit.id)
        }}
        aria-label={`${completed ? 'Unmark' : 'Mark'} ${habit.title} as ${completed ? 'incomplete' : 'complete'}`}
      >
        {(completed || (habit.frequency.toLowerCase() === 'weekly' && completedThisWeek) || (habit.frequency.toLowerCase() === 'monthly' && completedThisWeek)) ? (
          <CheckCircle size={24} />
        ) : (
          <Circle size={24} />
        )}
      </Checkbox>
      
      <HabitContent>
        <HabitTitle 
          $completed={completed}
          style={{
            color: completed ? theme.colors.text.disabled : theme.colors.text.primary,
            textDecoration: completed ? 'line-through' : 'none'
          }}
        >
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
        {onEdit && (
          <ActionButton
            $variant="edit"
            onClick={() => onEdit(habit)}
            aria-label={`Edit ${habit.title}`}
          >
            <Edit size={16} />
          </ActionButton>
        )}
        
        {onDelete && (
          <ActionButton
            $variant="delete"
            onClick={() => onDelete(habit)}
            aria-label={`Delete ${habit.title}`}
          >
            <Trash2 size={16} />
          </ActionButton>
        )}
      </ActionButtons>
    </HabitItem>
  )
})

export default function HabitList({ 
  habits, 
  onToggleHabit, 
  onEditHabit, 
  onDeleteHabit,
  onReorderHabits 
}: HabitListProps) {
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null)
  const [orderedHabits, setOrderedHabits] = useState(habits)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Update ordered habits when props change
  useEffect(() => {
    setOrderedHabits(habits)
  }, [habits])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = orderedHabits.findIndex((habit) => habit.id === active.id)
      const newIndex = orderedHabits.findIndex((habit) => habit.id === over?.id)
      
      const newOrder = arrayMove(orderedHabits, oldIndex, newIndex)
      setOrderedHabits(newOrder)
      
      // Notify parent component about the reorder
      onReorderHabits?.(newOrder)
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

  if (orderedHabits.length === 0) {
    return (
      <Container>
        <EmptyState>
          No habits yet
        </EmptyState>
      </Container>
    )
  }

  return (
    <Container>
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[]}
      >
        <SortableContext 
          items={orderedHabits.map(h => h.id)}
          strategy={verticalListSortingStrategy}
        >
          {orderedHabits.map((habit) => (
            <SortableHabitItem
              key={habit.id}
              habit={habit}
              onToggle={onToggleHabit}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </SortableContext>
      </DndContext>
      
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