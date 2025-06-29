'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import Button from '@/components/ui/Button'
import CreateHabitModal from '@/components/CreateHabitModal'
import HabitList from '@/components/HabitList'
import ProgressCalendar from '@/components/ProgressCalendar'
import { ResetCountdown } from '@/components/ResetCountdown'
import { Plus, Sparkles, TestTube, RefreshCw } from 'lucide-react'
import { useSession, signIn, signOut } from 'next-auth/react'
import SignInModal from '@/components/SignInModal'
import SignUpModal from '@/components/SignUpModal'
import { useHabits } from '@/hooks/useHabits'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${theme.colors.primary[25]} 0%, ${theme.colors.background} 100%);
  padding: ${theme.spacing[8]} ${theme.spacing[4]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[6]} ${theme.spacing[3]};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    padding: ${theme.spacing[12]} ${theme.spacing[4]};
  }
`

const Content = styled.div`
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  
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
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[8]};
    margin-bottom: ${theme.spacing[6]};
    border-radius: ${theme.borderRadius.lg};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    padding: ${theme.spacing[16]};
    margin-bottom: ${theme.spacing[12]};
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
  
  @media (max-width: ${theme.breakpoints.sm}) {
    width: 64px;
    height: 64px;
    margin-bottom: ${theme.spacing[4]};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    margin-bottom: ${theme.spacing[8]};
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

const AccountPrompt = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  margin-top: ${theme.spacing[6]};
  padding: ${theme.spacing[4]};
  background-color: ${theme.colors.gray[50]};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.gray[100]};
  text-align: center;
  
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
`

const AccountText = styled.div`
  margin-bottom: ${theme.spacing[2]};
  font-weight: ${theme.typography.fontWeight.normal};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-bottom: ${theme.spacing[1]};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    margin-bottom: ${theme.spacing[3]};
  }
`

const AccountLink = styled.button`
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

const DevTestSection = styled.div`
  background-color: ${theme.colors.primary[25]};
  border: 2px dashed ${theme.colors.primary[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
  text-align: left;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[3]};
    margin-bottom: ${theme.spacing[4]};
  }
`

const DevTestTitle = styled.h3`
  color: ${theme.colors.primary[800]};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin-bottom: ${theme.spacing[2]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`

const DevTestDescription = styled.p`
  color: ${theme.colors.primary[700]};
  font-size: ${theme.typography.fontSize.xs};
  margin-bottom: ${theme.spacing[3]};
  line-height: ${theme.typography.lineHeight.relaxed};
`

const DevTestButtons = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  flex-wrap: wrap;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
  }
`

const DevTestButton = styled.button<{ $loading?: boolean }>`
  background-color: ${theme.colors.primary[50]};
  border: 1px solid ${theme.colors.primary[300]};
  color: ${theme.colors.primary[800]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  min-height: 36px;
  
  &:hover {
    background-color: ${theme.colors.primary[100]};
    border-color: ${theme.colors.primary[400]};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${props => props.$loading && `
    opacity: 0.7;
    
    svg {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `}
`

const DevTestResult = styled.div<{ $success?: boolean; $error?: boolean }>`
  margin-top: ${theme.spacing[3]};
  padding: ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  
  ${props => props.$success && `
    background-color: ${theme.colors.primary[25]};
    border: 1px solid ${theme.colors.success};
    color: ${theme.colors.success};
  `}
  
  ${props => props.$error && `
    background-color: ${theme.colors.gray[50]};
    border: 1px solid ${theme.colors.error};
    color: ${theme.colors.error};
  `}
`

// Sample habits with different streak values and rich completion history
const sampleHabits = [
  {
    id: 1,
    title: 'Morning meditation',
    category: 'wellness',
    frequency: 'daily',
    completed: true,
    streak: 7,
    lastCompleted: new Date().getTime(),
    // Rich completion history - completed most days this month
    completionHistory: [
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).getTime(), // Yesterday
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).getTime(), // 2 days ago
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).getTime(), // 3 days ago
      new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).getTime(), // 4 days ago
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).getTime(), // 5 days ago
      new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).getTime(), // 6 days ago
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime(), // 7 days ago
      new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).getTime(), // 8 days ago
      new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).getTime(), // 9 days ago
      new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).getTime(), // 10 days ago
      new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).getTime(), // 12 days ago
      new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).getTime(), // 13 days ago
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).getTime(), // 14 days ago
      new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).getTime(), // 15 days ago
      new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).getTime(), // 16 days ago
      new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).getTime(), // 17 days ago
      new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).getTime(), // 18 days ago
      new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).getTime(), // 19 days ago
      new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).getTime(), // 20 days ago
      new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).getTime(), // 21 days ago
      new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).getTime(), // 22 days ago
      new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).getTime(), // 23 days ago
      new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).getTime(), // 24 days ago
      new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).getTime(), // 25 days ago
      new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).getTime(), // 26 days ago
      new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).getTime(), // 27 days ago
      new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).getTime(), // 28 days ago
      new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).getTime(), // 29 days ago
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime(), // 30 days ago
    ]
  },
  {
    id: 2,
    title: 'Read for 30 minutes',
    category: 'learning',
    frequency: 'daily',
    completed: false,
    streak: 3,
    lastCompleted: new Date(Date.now() - 24 * 60 * 60 * 1000).getTime(), // Yesterday
    // Moderate completion pattern
    completionHistory: [
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).getTime(), // Yesterday
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).getTime(), // 2 days ago
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).getTime(), // 3 days ago
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).getTime(), // 5 days ago
      new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).getTime(), // 6 days ago
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime(), // 7 days ago
      new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).getTime(), // 9 days ago
      new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).getTime(), // 10 days ago
      new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).getTime(), // 11 days ago
      new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).getTime(), // 13 days ago
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).getTime(), // 14 days ago
      new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).getTime(), // 15 days ago
      new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).getTime(), // 17 days ago
      new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).getTime(), // 18 days ago
      new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).getTime(), // 19 days ago
      new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).getTime(), // 21 days ago
      new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).getTime(), // 22 days ago
      new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).getTime(), // 23 days ago
      new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).getTime(), // 25 days ago
      new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).getTime(), // 26 days ago
      new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).getTime(), // 27 days ago
      new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).getTime(), // 29 days ago
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime(), // 30 days ago
    ]
  },
  {
    id: 3,
    title: 'Drink 8 glasses of water',
    category: 'wellness',
    frequency: 'daily',
    completed: true,
    streak: 12,
    lastCompleted: new Date().getTime(),
    // Very consistent completion pattern
    completionHistory: [
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).getTime(), // Yesterday
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).getTime(), // 2 days ago
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).getTime(), // 3 days ago
      new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).getTime(), // 4 days ago
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).getTime(), // 5 days ago
      new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).getTime(), // 6 days ago
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime(), // 7 days ago
      new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).getTime(), // 8 days ago
      new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).getTime(), // 9 days ago
      new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).getTime(), // 10 days ago
      new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).getTime(), // 11 days ago
      new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).getTime(), // 12 days ago
      new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).getTime(), // 13 days ago
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).getTime(), // 14 days ago
      new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).getTime(), // 15 days ago
      new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).getTime(), // 16 days ago
      new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).getTime(), // 17 days ago
      new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).getTime(), // 18 days ago
      new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).getTime(), // 19 days ago
      new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).getTime(), // 20 days ago
      new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).getTime(), // 21 days ago
      new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).getTime(), // 22 days ago
      new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).getTime(), // 23 days ago
      new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).getTime(), // 24 days ago
      new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).getTime(), // 25 days ago
      new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).getTime(), // 26 days ago
      new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).getTime(), // 27 days ago
      new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).getTime(), // 28 days ago
      new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).getTime(), // 29 days ago
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime(), // 30 days ago
    ]
  },
  {
    id: 4,
    title: 'Practice gratitude',
    category: 'wellness',
    frequency: 'daily',
    completed: false,
    streak: 0,
    lastCompleted: null,
    // Sporadic completion pattern
    completionHistory: [
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).getTime(), // 3 days ago
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime(), // 7 days ago
      new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).getTime(), // 8 days ago
      new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).getTime(), // 12 days ago
      new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).getTime(), // 15 days ago
      new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).getTime(), // 16 days ago
      new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).getTime(), // 20 days ago
      new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).getTime(), // 23 days ago
      new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).getTime(), // 27 days ago
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime(), // 30 days ago
    ]
  },
  {
    id: 5,
    title: 'Learn something new',
    category: 'learning',
    frequency: 'weekly',
    completed: true,
    streak: 5,
    lastCompleted: new Date().getTime(),
    // Weekly pattern
    completionHistory: [
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).getTime(), // Yesterday
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime(), // 7 days ago
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).getTime(), // 14 days ago
      new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).getTime(), // 21 days ago
      new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).getTime(), // 28 days ago
    ]
  },
  {
    id: 6,
    title: 'Exercise for 30 minutes',
    category: 'fitness',
    frequency: 'daily',
    completed: true,
    streak: 4,
    lastCompleted: new Date().getTime(),
    // Good but not perfect pattern
    completionHistory: [
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).getTime(), // Yesterday
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).getTime(), // 2 days ago
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).getTime(), // 3 days ago
      new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).getTime(), // 4 days ago
      new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).getTime(), // 6 days ago
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime(), // 7 days ago
      new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).getTime(), // 8 days ago
      new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).getTime(), // 9 days ago
      new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).getTime(), // 11 days ago
      new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).getTime(), // 12 days ago
      new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).getTime(), // 13 days ago
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).getTime(), // 14 days ago
      new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).getTime(), // 16 days ago
      new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).getTime(), // 17 days ago
      new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).getTime(), // 18 days ago
      new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).getTime(), // 19 days ago
      new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).getTime(), // 21 days ago
      new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).getTime(), // 22 days ago
      new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).getTime(), // 23 days ago
      new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).getTime(), // 24 days ago
      new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).getTime(), // 26 days ago
      new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).getTime(), // 27 days ago
      new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).getTime(), // 28 days ago
      new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).getTime(), // 29 days ago
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime(), // 30 days ago
    ]
  }
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const { 
    habits, 
    loading, 
    error, 
    createHabit, 
    toggleHabit, 
    deleteHabit, 
    createSampleHabits, 
    refetch,
    reorderHabits 
  } = useHabits()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<any>(null)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)
  
  // Development test state
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success?: boolean; error?: boolean; message: string } | null>(null)

  // Show loading state during migration
  if (session?.user && loading && habits.length === 0) {
    return (
      <Container>
        <Content>
          <Title>Setting up your account...</Title>
          <Subtitle>
            We're transferring your habits and progress to your secure account. 
            This will only take a moment.
          </Subtitle>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            color: theme.colors.primary[600] 
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: `3px solid ${theme.colors.primary[200]}`,
              borderTop: `3px solid ${theme.colors.primary[600]}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        </Content>
      </Container>
    )
  }

  const handleTestDailyReset = async () => {
    // Prevent multiple simultaneous executions
    if (testLoading) {
      return
    }
    
    setTestLoading(true)
    setTestResult(null)
    
    const executionId = `reset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    try {
      if (!session?.user) {
        // Handle localStorage habits for non-authenticated users
        const savedHabits = localStorage.getItem('routinely-habits')
        if (!savedHabits) {
          setTestResult({
            success: true,
            message: '✅ No habits found in localStorage to reset.'
          })
          setTestLoading(false)
          return
        }

        const localHabits = JSON.parse(savedHabits)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        console.log(`[${executionId}] Today is:`, {
          date: today.toISOString(),
          dayOfWeek: today.getDay(),
          dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()],
          isMonday: today.getDay() === 1
        })
        
        let processedCount = 0
        let weeklySkipped = 0
        let logsCreated = 0

        const resetHabits = localHabits.map((habit: any) => {
          const isWeekly = habit.frequency === 'weekly'
          const isMonday = today.getDay() === 1

          console.log(`[${executionId}] Habit "${habit.title}": frequency=${habit.frequency}, isWeekly=${isWeekly}, isMonday=${isMonday}`)

          // Skip weekly habits if it's not Monday
          if (isWeekly && !isMonday) {
            weeklySkipped++
            console.log(`[${executionId}] ⏭️ Skipping weekly habit "${habit.title}" (not Monday)`)
            return habit
          }

          processedCount++

          // Ensure habit has streak fields (for backwards compatibility)
          if (typeof habit.currentStreak === 'undefined') habit.currentStreak = 0
          if (typeof habit.bestStreak === 'undefined') habit.bestStreak = 0

          // Check if there's already a log for today
          const existingTodayLog = habit.logs.find((log: any) => {
            const logDate = new Date(log.date)
            logDate.setHours(0, 0, 0, 0)
            return logDate.getTime() === today.getTime()
          })

          if (!existingTodayLog) {
            // Add a reset log for today (incomplete)
            const newLog = {
              id: `${Date.now()}-${Math.random()}`,
              date: today,
              completed: false
            }
            logsCreated++
            return {
              ...habit,
              logs: [...habit.logs, newLog]
            }
          } else if (existingTodayLog.completed) {
            // If log exists and is completed, mark it as not completed
            const updatedLogs = habit.logs.map((log: any) => {
              if (log.id === existingTodayLog.id) {
                return { ...log, completed: false }
              }
              return log
            })
            return {
              ...habit,
              logs: updatedLogs
            }
          }

          // No changes needed - already has incomplete log for today
          return habit
        })

        // Save back to localStorage
        localStorage.setItem('routinely-habits', JSON.stringify(resetHabits))
        
        setTestResult({
          success: true,
          message: `✅ Daily reset completed for localStorage! Processed ${processedCount} habits, skipped ${weeklySkipped} weekly habits, created ${logsCreated} new logs. Check your habits below - they should now be unchecked.`
        })

        // Refresh habits immediately
        await refetch()

      } else {
        // Handle database habits for authenticated users
        const response = await fetch('/api/habits/daily-reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        const data = await response.json()
        
        if (response.ok && data.success) {
          setTestResult({
            success: true,
            message: `✅ Daily reset completed! Processed ${data.summary.processedHabits} habits, skipped ${data.summary.weeklyHabitsSkipped} weekly habits, created ${data.summary.logsCreated} new logs. Check your habits below - they should now be unchecked.`
          })
          
          // Immediately refresh habits to show unchecked state
          console.log('🔄 Refreshing habits after daily reset...')
          await refetch()
          console.log('✅ Habits refreshed after daily reset')
        } else {
          setTestResult({
            error: true,
            message: `❌ Daily reset failed: ${data.error || 'Unknown error'}`
          })
        }
      }
    } catch (error) {
      setTestResult({
        error: true,
        message: `❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setTestLoading(false)
    }
  }

  const handleRefreshHabits = () => {
    refetch()
  }

  const handleCreateHabit = () => {
    setIsModalOpen(true)
  }

  const handleSaveHabit = async (habit: { title: string; category: string; frequency: string }) => {
    try {
      if (editingHabit) {
        // Update existing habit - TODO: Implement update API
        console.log('Update habit not implemented yet')
      } else {
        // Create new habit
        await createHabit(habit)
      }
      setIsModalOpen(false)
      setEditingHabit(null)
    } catch (error) {
      console.error('Error saving habit:', error)
    }
  }

  const handleEditHabit = (habit: any) => {
    setEditingHabit(habit)
    setIsModalOpen(true)
  }

  const handleDeleteHabit = async (habitId: string) => {
    try {
      await deleteHabit(habitId)
    } catch (error) {
      console.error('Error deleting habit:', error)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingHabit(null)
  }

  const handleToggleHabit = async (habitId: string) => {
    try {
      await toggleHabit(habitId)
    } catch (error) {
      console.error('Error toggling habit:', error)
    }
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
        <Title>Your Daily Routines</Title>
        <Subtitle>
          Track your habits and build consistent routines that help you achieve your goals. 
          Every small action compounds into lasting positive change.
        </Subtitle>

        {/* Countdown Timer */}
        <ResetCountdown onManualReset={handleTestDailyReset} />

        {/* Manual Reset Section - Always show for testing streak functionality */}
        <DevTestSection>
          <DevTestTitle>
            <TestTube size={16} />
            Manual Reset
          </DevTestTitle>
          <DevTestDescription>
            Manually trigger the daily reset to test streak counting. This runs the same process as the automatic daily reset.
            Use this to verify that your streaks are counting properly when you check/uncheck habits.
          </DevTestDescription>
          <DevTestButtons>
            <DevTestButton 
              onClick={handleTestDailyReset}
              disabled={testLoading}
              $loading={testLoading}
            >
              {testLoading ? <RefreshCw size={14} /> : <TestTube size={14} />}
              {testLoading ? 'Running Reset...' : 'Trigger Daily Reset'}
            </DevTestButton>
            <DevTestButton onClick={handleRefreshHabits}>
              <RefreshCw size={14} />
              Refresh Habits
            </DevTestButton>
          </DevTestButtons>
          {testResult && (
            <DevTestResult $success={testResult.success} $error={testResult.error}>
              {testResult.message}
            </DevTestResult>
          )}
        </DevTestSection>

        {habits.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <Sparkles size={32} />
            </EmptyIcon>
            <EmptyTitle>Start Building Habits</EmptyTitle>
            <EmptyDescription>
              Create your first habit and begin building the routines that will help you 
              reach your goals. Consistency is the key to lasting change.
            </EmptyDescription>
            <ZenButton onClick={handleCreateHabit}>
              <Plus size={20} />
              Create Your First Habit
            </ZenButton>
{session?.user && (
              <div style={{ marginTop: '1rem' }}>
                <ZenButton 
                  onClick={() => createSampleHabits?.()} 
                  style={{ background: 'transparent', border: `1px solid ${theme.colors.primary[200]}`, color: theme.colors.primary[600] }}
                >
                  Try Sample Habits
                </ZenButton>
              </div>
            )}
          </EmptyState>
        ) : (
          <HabitsContainer>
            <HabitList
              habits={habits}
              onToggleHabit={handleToggleHabit}
              onEditHabit={handleEditHabit}
              onDeleteHabit={handleDeleteHabit}
              onReorderHabits={reorderHabits}
            />
            <AddHabitButton>
              <ZenButton onClick={handleCreateHabit}>
                <Plus size={20} />
                Add New Habit
              </ZenButton>
              <ZenButton 
                onClick={handleTestDailyReset}
                disabled={testLoading}
                style={{ 
                  marginLeft: '1rem', 
                  background: testLoading ? theme.colors.gray[400] : theme.colors.success,
                  borderColor: testLoading ? theme.colors.gray[400] : theme.colors.success
                }}
              >
                {testLoading ? <RefreshCw size={16} /> : <TestTube size={16} />}
                {testLoading ? 'Resetting...' : 'Test Reset'}
              </ZenButton>
            </AddHabitButton>
          </HabitsContainer>
        )}

        {/* Progress Calendar Section */}
        {habits.length > 0 && (
          <CalendarSection>
            <CalendarTitle>Track Your Progress</CalendarTitle>
            <CalendarDescription>
              Visualize your habit completion patterns and celebrate your consistency. 
              Each completed day builds momentum toward your goals.
            </CalendarDescription>
            <ProgressCalendar 
              habitLogs={habits
                .flatMap(habit => 
                  habit.logs
                    .filter(log => log.completed)
                    .map(log => ({
                      id: log.id,
                      habitId: habit.id,
                      completedAt: new Date(log.date)
                    }))
                )
              }
            />
          </CalendarSection>
        )}

        {!session && habits.length > 0 && (
          <AccountPrompt>
            <AccountText>Create an account to save your progress permanently and sync across devices</AccountText>
            <AccountLink onClick={handleSignUp}>
              Create free account
            </AccountLink>
          </AccountPrompt>
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