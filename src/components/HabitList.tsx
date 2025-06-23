'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import { CheckCircle, Circle, CheckSquare, Clock, Edit, Trash2 } from 'lucide-react'

interface Habit {
  id: number
  title: string
  category: string
  frequency: string
  completed?: boolean
  streak?: number
}

interface HabitListProps {
  habits: Habit[]
  onToggleHabit: (habitId: number) => void
  onEditHabit?: (habit: Habit) => void
  onDeleteHabit?: (habitId: number) => void
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

export default function HabitList({ habits, onToggleHabit, onEditHabit, onDeleteHabit }: HabitListProps) {
  if (habits.length === 0) {
    return (
      <Container>
        <EmptyState>
          No habits yet
        </EmptyState>
      </Container>
    )
  }

  const handleEdit = (habit: Habit) => {
    onEditHabit?.(habit)
  }

  const handleDelete = (habitId: number) => {
    onDeleteHabit?.(habitId)
  }

  return (
    <Container>
      {habits.map((habit) => (
        <HabitItem key={habit.id}>
          <Checkbox
            $completed={habit.completed || false}
            onClick={() => onToggleHabit(habit.id)}
            aria-label={`${habit.completed ? 'Unmark' : 'Mark'} ${habit.title} as ${habit.completed ? 'incomplete' : 'complete'}`}
          >
            {habit.completed ? (
              <CheckCircle size={24} />
            ) : (
              <Circle size={24} />
            )}
          </Checkbox>
          
          <HabitContent>
            <HabitTitle $completed={habit.completed || false}>
              {habit.title}
            </HabitTitle>
            
            <HabitMeta>
              <StreakCounter>
                <StreakIcon>
                  <CheckSquare size={14} />
                </StreakIcon>
                <StreakNumber>{habit.streak || 0}</StreakNumber>
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
                onClick={() => handleDelete(habit.id)}
                aria-label={`Delete ${habit.title}`}
              >
                <Trash2 size={16} />
              </ActionButton>
            )}
          </ActionButtons>
        </HabitItem>
      ))}
    </Container>
  )
} 