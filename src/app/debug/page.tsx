'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { theme } from '@/styles/theme'

interface TestScenario {
  name: string
  description: string
  habits: {
    title: string
    frequency: string
    logs: { date: string; completed: boolean }[]
  }[]
}

interface Habit {
  id: string
  title: string
  frequency: string
  currentStreak: number
  bestStreak: number
}

interface HabitLog {
  id: string
  date: string
  dateStr: string
  completed: boolean
  updatedDuringToggle?: boolean
}

interface StreakCalculation {
  date: string
  dayOfWeek: string
  calculatedStreak: number
}

const scenarios: Record<string, TestScenario> = {
  'daily-streak': {
    name: 'Daily Streak Test',
    description: 'Tests basic daily streak functionality with consecutive days',
    habits: [
      {
        title: 'Test Daily Exercise',
        frequency: 'daily',
        logs: [
          { date: '2025-01-01', completed: true },
          { date: '2025-01-02', completed: true },
          { date: '2025-01-03', completed: true },
          { date: '2025-01-04', completed: false },
          { date: '2025-01-05', completed: true },
          { date: '2025-01-06', completed: true }
        ]
      }
    ]
  },
  'weekly-sunday': {
    name: 'Weekly Sunday Bug Test',
    description: 'Tests the Sunday week boundary bug in weekly habits',
    habits: [
      {
        title: 'Test Weekly Review',
        frequency: 'weekly',
        logs: [
          { date: '2025-01-05', completed: true }, // Sunday
          { date: '2025-01-12', completed: true }, // Next Sunday
          { date: '2025-01-19', completed: false }, // Missing week
          { date: '2025-01-26', completed: true } // Should reset streak
        ]
      }
    ]
  },
  'production-bug': {
    name: 'Production Bug Reproduction',
    description: 'Reproduces the production bug with timezone issues',
    habits: [
      {
        title: 'Test Production Habit',
        frequency: 'daily',
        logs: [
          { date: '2025-01-01', completed: true },
          { date: '2025-01-02', completed: true },
          { date: '2025-01-03', completed: true },
          { date: '2025-01-04', completed: true },
          { date: '2025-01-05', completed: true },
          { date: '2025-01-06', completed: true },
          { date: '2025-01-07', completed: true },
          { date: '2025-01-08', completed: true },
          { date: '2025-01-09', completed: true },
          { date: '2025-01-10', completed: true },
          { date: '2025-01-11', completed: true },
          { date: '2025-01-12', completed: true },
          { date: '2025-01-13', completed: true },
          { date: '2025-01-14', completed: true },
          { date: '2025-01-15', completed: true },
          { date: '2025-01-16', completed: true },
          { date: '2025-01-17', completed: true },
          { date: '2025-01-18', completed: true },
          { date: '2025-01-19', completed: true },
          { date: '2025-01-20', completed: true },
          { date: '2025-01-21', completed: true },
          { date: '2025-01-22', completed: true },
          { date: '2025-01-23', completed: true },
          { date: '2025-01-24', completed: true },
          { date: '2025-01-25', completed: true },
          { date: '2025-01-26', completed: true },
          { date: '2025-01-27', completed: true },
          { date: '2025-01-28', completed: true },
          { date: '2025-01-29', completed: true },
          { date: '2025-01-30', completed: true },
          { date: '2025-01-31', completed: true },
          { date: '2025-02-01', completed: true },
          { date: '2025-02-02', completed: true },
          { date: '2025-02-03', completed: true },
          { date: '2025-02-04', completed: true },
          { date: '2025-01-05', completed: true },
          { date: '2025-02-06', completed: true },
          { date: '2025-02-07', completed: true },
          { date: '2025-02-08', completed: true },
          { date: '2025-02-09', completed: true },
          { date: '2025-02-10', completed: true },
          { date: '2025-02-11', completed: true },
          { date: '2025-02-12', completed: true },
          { date: '2025-02-13', completed: true },
          { date: '2025-02-14', completed: true },
          { date: '2025-02-15', completed: true },
          { date: '2025-02-16', completed: true },
          { date: '2025-02-17', completed: true },
          { date: '2025-02-18', completed: true },
          { date: '2025-02-19', completed: true },
          { date: '2025-02-20', completed: true },
          { date: '2025-02-21', completed: true },
          { date: '2025-02-22', completed: true },
          { date: '2025-02-23', completed: true },
          { date: '2025-02-24', completed: true },
          { date: '2025-02-25', completed: true },
          { date: '2025-02-26', completed: true },
          { date: '2025-02-27', completed: true },
          { date: '2025-02-28', completed: true }
        ]
      }
    ]
  },
  'timezone-mix': {
    name: 'Timezone Mix Test',
    description: 'Tests timezone edge cases with mixed date handling',
    habits: [
      {
        title: 'Test Timezone Habit',
        frequency: 'daily',
        logs: [
          { date: '2025-01-01', completed: true },
          { date: '2025-01-02', completed: true },
          { date: '2025-01-03', completed: true },
          { date: '2025-01-04', completed: true },
          { date: '2025-01-05', completed: true },
          { date: '2025-01-06', completed: true },
          { date: '2025-01-07', completed: true },
          { date: '2025-01-08', completed: true },
          { date: '2025-01-09', completed: true },
          { date: '2025-01-10', completed: true },
          { date: '2025-01-11', completed: true },
          { date: '2025-01-12', completed: true },
          { date: '2025-01-13', completed: true },
          { date: '2025-01-14', completed: true },
          { date: '2025-01-15', completed: true },
          { date: '2025-01-16', completed: true },
          { date: '2025-01-17', completed: true },
          { date: '2025-01-18', completed: true },
          { date: '2025-01-19', completed: true },
          { date: '2025-01-20', completed: true },
          { date: '2025-01-21', completed: true },
          { date: '2025-01-22', completed: true },
          { date: '2025-01-23', completed: true },
          { date: '2025-01-24', completed: true },
          { date: '2025-01-25', completed: true },
          { date: '2025-01-26', completed: true },
          { date: '2025-01-27', completed: true },
          { date: '2025-01-28', completed: true },
          { date: '2025-01-29', completed: true },
          { date: '2025-01-30', completed: true },
          { date: '2025-01-31', completed: true },
          { date: '2025-02-01', completed: true },
          { date: '2025-02-02', completed: true },
          { date: '2025-02-03', completed: true },
          { date: '2025-02-04', completed: true },
          { date: '2025-01-05', completed: true },
          { date: '2025-02-06', completed: true },
          { date: '2025-02-07', completed: true },
          { date: '2025-02-08', completed: true },
          { date: '2025-02-09', completed: true },
          { date: '2025-02-10', completed: true },
          { date: '2025-02-11', completed: true },
          { date: '2025-02-12', completed: true },
          { date: '2025-02-13', completed: true },
          { date: '2025-02-14', completed: true },
          { date: '2025-02-15', completed: true },
          { date: '2025-02-16', completed: true },
          { date: '2025-02-17', completed: true },
          { date: '2025-02-18', completed: true },
          { date: '2025-02-19', completed: true },
          { date: '2025-02-20', completed: true },
          { date: '2025-02-21', completed: true },
          { date: '2025-02-22', completed: true },
          { date: '2025-02-23', completed: true },
          { date: '2025-02-24', completed: true },
          { date: '2025-02-25', completed: true },
          { date: '2025-02-26', completed: true },
          { date: '2025-02-27', completed: true },
          { date: '2025-02-28', completed: true }
        ]
      }
    ]
  },
  'toggle-streak-preservation': {
    name: 'Toggle Streak Preservation Test',
    description: 'Tests that checking/unchecking only affects current day, not entire streak',
    habits: [
      {
        title: 'Test Toggle Streak',
        frequency: 'daily',
        logs: [
          { date: '2025-06-25', completed: true },
          { date: '2025-06-26', completed: true },
          { date: '2025-06-27', completed: true },
          { date: '2025-06-28', completed: true },
          { date: '2025-06-29', completed: true },
          { date: '2025-06-30', completed: true }
        ]
      }
    ]
  },
  'daily-toggle-test': {
    name: 'Daily Toggle Test',
    description: 'Tests daily habit toggle behavior with existing streak',
    habits: [
      {
        title: 'Test Daily Toggle',
        frequency: 'daily',
        logs: [
          { date: '2025-06-20', completed: true },
          { date: '2025-06-21', completed: true },
          { date: '2025-06-22', completed: true },
          { date: '2025-06-23', completed: true },
          { date: '2025-06-24', completed: true },
          { date: '2025-06-25', completed: true },
          { date: '2025-06-26', completed: true },
          { date: '2025-06-27', completed: true },
          { date: '2025-06-28', completed: true },
          { date: '2025-06-29', completed: true }
        ]
      }
    ]
  },
  'weekly-toggle-test': {
    name: 'Weekly Toggle Test',
    description: 'Tests weekly habit toggle behavior with existing streak',
    habits: [
      {
        title: 'Test Weekly Toggle',
        frequency: 'weekly',
        logs: [
          { date: '2025-06-01', completed: true },
          { date: '2025-06-08', completed: true },
          { date: '2025-06-15', completed: true },
          { date: '2025-06-22', completed: true },
          { date: '2025-06-29', completed: true }
        ]
      }
    ]
  },
  'streak-integrity-test': {
    name: 'Streak Integrity Test',
    description: 'Tests that toggling doesn\'t break existing streak integrity',
    habits: [
      {
        title: 'Test Streak Integrity',
        frequency: 'daily',
        logs: [
          { date: '2025-06-15', completed: true },
          { date: '2025-06-16', completed: true },
          { date: '2025-06-17', completed: true },
          { date: '2025-06-18', completed: true },
          { date: '2025-06-19', completed: true },
          { date: '2025-06-20', completed: true },
          { date: '2025-06-21', completed: true },
          { date: '2025-06-22', completed: true },
          { date: '2025-06-23', completed: true },
          { date: '2025-06-24', completed: true },
          { date: '2025-06-25', completed: true },
          { date: '2025-06-26', completed: true },
          { date: '2025-06-27', completed: true },
          { date: '2025-06-28', completed: true },
          { date: '2025-06-29', completed: true }
        ]
      }
    ]
  }
}

// Component: Tab Navigation
function TabNavigation({ activeTab, onTabChange }: { 
  activeTab: string
  onTabChange: (tab: 'scenarios' | 'manual' | 'inspect') => void 
}) {
  const tabs = [
    { key: 'scenarios', label: '🎯 Scenarios', desc: 'Pre-built tests' },
    { key: 'manual', label: '🎮 Manual', desc: 'Custom testing' },
    { key: 'inspect', label: '🔍 Inspect', desc: 'View details' }
  ]

  return (
    <div style={{ display: 'flex', borderBottom: `1px solid ${theme.colors.gray[200]}` }}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key as any)}
          style={{
            flex: 1,
            padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
            fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium,
            borderBottom: `2px solid ${activeTab === tab.key ? theme.colors.primary[500] : 'transparent'}`,
            color: activeTab === tab.key ? theme.colors.primary[600] : theme.colors.text.secondary,
            backgroundColor: activeTab === tab.key ? theme.colors.primary[50] : 'transparent',
            transition: theme.transitions.normal,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: theme.spacing[1]
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab.key) {
              e.currentTarget.style.color = theme.colors.text.primary;
              e.currentTarget.style.backgroundColor = theme.colors.gray[50];
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.key) {
              e.currentTarget.style.color = theme.colors.text.secondary;
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <div>{tab.label}</div>
          <div style={{ fontSize: theme.typography.fontSize.xs, opacity: 0.75 }}>{tab.desc}</div>
        </button>
      ))}
    </div>
  )
}

// Component: Scenarios Tab
function ScenariosTab({ 
  selectedScenario, 
  onScenarioChange, 
  onSetupScenario, 
  onRunQuickTest, 
  onRunAllTests, 
  onRunToggleTests,
  onRunQuickToggleTest,
  quickTests,
  isLoading,
  theme
}: {
  selectedScenario: string
  onScenarioChange: (scenario: string) => void
  onSetupScenario: () => void
  onRunQuickTest: (key: string, days: number[]) => void
  onRunAllTests: () => void
  onRunToggleTests: () => void
  onRunQuickToggleTest: () => void
  quickTests: Array<{ key: string; label: string; days: number[]; color: string }>
  isLoading: boolean
  theme: any
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4] }}>
      <div>
        <label style={{
          display: 'block',
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing[2]
        }}>
          Choose Test Scenario
        </label>
        <select 
          value={selectedScenario} 
          onChange={(e) => onScenarioChange(e.target.value)}
          style={{
            width: '100%',
            padding: theme.spacing[3],
            border: `1px solid ${theme.colors.gray[300]}`,
            borderRadius: theme.borderRadius.lg,
            fontSize: theme.typography.fontSize.base,
            backgroundColor: theme.colors.background,
            color: theme.colors.text.primary,
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = theme.colors.primary[500];
            e.target.style.boxShadow = `0 0 0 2px ${theme.colors.primary[100]}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = theme.colors.gray[300];
            e.target.style.boxShadow = 'none';
          }}
        >
          <option value="">Select a scenario...</option>
          {Object.entries(scenarios).map(([key, scenario]) => (
            <option key={key} value={key}>{scenario.name}</option>
          ))}
        </select>
      </div>

      {selectedScenario && (
        <div style={{
          backgroundColor: theme.colors.primary[50],
          padding: theme.spacing[4],
          borderRadius: theme.borderRadius.lg,
          border: `1px solid ${theme.colors.primary[200]}`
        }}>
          <h3 style={{
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.primary[900],
            marginBottom: theme.spacing[2]
          }}>
            {scenarios[selectedScenario].name}
          </h3>
          <p style={{
            color: theme.colors.primary[700],
            fontSize: theme.typography.fontSize.sm
          }}>
            {scenarios[selectedScenario].description}
          </p>
        </div>
      )}

      <button 
        onClick={onSetupScenario}
        disabled={!selectedScenario || isLoading}
        style={{
          width: '100%',
          backgroundColor: !selectedScenario || isLoading ? theme.colors.gray[300] : theme.colors.primary[600],
          color: 'white',
          padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
          borderRadius: theme.borderRadius.lg,
          fontWeight: theme.typography.fontWeight.medium,
          border: 'none',
          cursor: !selectedScenario || isLoading ? 'not-allowed' : 'pointer',
          transition: theme.transitions.normal,
          fontSize: theme.typography.fontSize.base
        }}
        onMouseEnter={(e) => {
          if (selectedScenario && !isLoading) {
            e.currentTarget.style.backgroundColor = theme.colors.primary[700];
          }
        }}
        onMouseLeave={(e) => {
          if (selectedScenario && !isLoading) {
            e.currentTarget.style.backgroundColor = theme.colors.primary[600];
          }
        }}
      >
        {isLoading ? 'Setting up...' : '🚀 Setup Scenario'}
      </button>

      <div style={{ borderTop: `1px solid ${theme.colors.gray[200]}`, paddingTop: theme.spacing[4] }}>
        <h3 style={{
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing[3]
        }}>Quick Tests</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
          {quickTests.map(test => (
            <button 
              key={test.key}
              onClick={() => onRunQuickTest(test.key, test.days)}
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: isLoading ? theme.colors.gray[300] : test.color,
                color: 'white',
                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                borderRadius: theme.borderRadius.base,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: theme.transitions.normal
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              {test.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${theme.colors.gray[200]}`, paddingTop: theme.spacing[4] }}>
        <h3 style={{
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing[3]
        }}>Comprehensive Testing</h3>
        <button 
          onClick={onRunAllTests}
          disabled={isLoading}
          style={{
            width: '100%',
            backgroundColor: isLoading ? theme.colors.gray[300] : theme.colors.success,
            color: 'white',
            padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
            borderRadius: theme.borderRadius.lg,
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.bold,
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: theme.transitions.normal,
            boxShadow: isLoading ? 'none' : `0 4px 6px ${theme.colors.success}40`,
            marginBottom: theme.spacing[2]
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = theme.colors.success[700];
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 6px 12px ${theme.colors.success}50`;
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = theme.colors.success;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 6px ${theme.colors.success}40`;
            }
          }}
        >
          🚀 Run All Tests ({quickTests.length} scenarios)
        </button>
        <button 
          onClick={onRunToggleTests}
          disabled={isLoading}
          style={{
            width: '100%',
            backgroundColor: isLoading ? theme.colors.gray[300] : theme.colors.warning,
            color: 'white',
            padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
            borderRadius: theme.borderRadius.lg,
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.bold,
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: theme.transitions.normal,
            boxShadow: isLoading ? 'none' : `0 4px 6px ${theme.colors.warning}40`,
            marginBottom: theme.spacing[2]
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = theme.colors.warning[700];
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 6px 12px ${theme.colors.warning}50`;
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = theme.colors.warning;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 6px ${theme.colors.warning}40`;
            }
          }}
        >
          🔄 Toggle Behavior Tests
        </button>
        <button 
          onClick={onRunQuickToggleTest}
          disabled={isLoading}
          style={{
            width: '100%',
            backgroundColor: isLoading ? theme.colors.gray[300] : theme.colors.error,
            color: 'white',
            padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
            borderRadius: theme.borderRadius.lg,
            fontSize: theme.typography.fontSize.base,
            fontWeight: theme.typography.fontWeight.bold,
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: theme.transitions.normal,
            boxShadow: isLoading ? 'none' : `0 4px 6px ${theme.colors.error}40`
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = theme.colors.error[700];
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = `0 6px 12px ${theme.colors.error}50`;
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = theme.colors.error;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = `0 4px 6px ${theme.colors.error}40`;
            }
          }}
        >
          🔍 Quick Toggle Bug Test
        </button>
        <p style={{
          color: theme.colors.text.secondary,
          fontSize: theme.typography.fontSize.sm,
          marginTop: theme.spacing[2],
          textAlign: 'center'
        }}>
          Tests checking/unchecking behavior and streak integrity
        </p>
      </div>
    </div>
  )
}

// Component: Manual Tab
function ManualTab({ 
  testHabits, 
  selectedHabit, 
  onHabitChange, 
  testDate, 
  onDateChange, 
  onToggle, 
  onInspect, 
  isLoading 
}: {
  testHabits: Habit[]
  selectedHabit: string
  onHabitChange: (habitId: string) => void
  testDate: string
  onDateChange: (date: string) => void
  onToggle: () => void
  onInspect: () => void
  isLoading: boolean
}) {
  const quickDates = [-1, 0, 1].map(offset => {
    const date = new Date()
    date.setDate(date.getDate() + offset)
    return {
      offset,
      dateStr: date.toISOString().split('T')[0],
      label: offset === -1 ? 'Yesterday' : offset === 0 ? 'Today' : 'Tomorrow'
    }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4] }}>
      <div>
        <label style={{
          display: 'block',
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing[2]
        }}>
          Select Test Habit
        </label>
        <select 
          value={selectedHabit} 
          onChange={(e) => onHabitChange(e.target.value)}
          style={{
            width: '100%',
            padding: theme.spacing[3],
            border: `1px solid ${theme.colors.gray[300]}`,
            borderRadius: theme.borderRadius.lg,
            fontSize: theme.typography.fontSize.base,
            backgroundColor: theme.colors.background,
            color: theme.colors.text.primary,
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = theme.colors.primary[500];
            e.target.style.boxShadow = `0 0 0 2px ${theme.colors.primary[100]}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = theme.colors.gray[300];
            e.target.style.boxShadow = 'none';
          }}
        >
          <option value="">Choose a habit...</option>
          {testHabits.map(habit => (
            <option key={habit.id} value={habit.id}>
              {habit.title} ({habit.frequency}) - Streak: {habit.currentStreak}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label style={{
          display: 'block',
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing[2]
        }}>
          Test Date
        </label>
        <input
          type="date"
          value={testDate}
          onChange={(e) => onDateChange(e.target.value)}
          style={{
            width: '100%',
            padding: theme.spacing[3],
            border: `1px solid ${theme.colors.gray[300]}`,
            borderRadius: theme.borderRadius.lg,
            fontSize: theme.typography.fontSize.base,
            backgroundColor: theme.colors.background,
            color: theme.colors.text.primary,
            outline: 'none'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = theme.colors.primary[500];
            e.target.style.boxShadow = `0 0 0 2px ${theme.colors.primary[100]}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = theme.colors.gray[300];
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing[2] }}>
        <button 
          onClick={onToggle}
          disabled={!selectedHabit || isLoading}
          style={{
            backgroundColor: !selectedHabit || isLoading ? theme.colors.gray[300] : theme.colors.success,
            color: 'white',
            padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
            borderRadius: theme.borderRadius.lg,
            fontWeight: theme.typography.fontWeight.medium,
            border: 'none',
            cursor: !selectedHabit || isLoading ? 'not-allowed' : 'pointer',
            transition: theme.transitions.normal,
            fontSize: theme.typography.fontSize.base
          }}
          onMouseEnter={(e) => {
            if (selectedHabit && !isLoading) {
              e.currentTarget.style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedHabit && !isLoading) {
              e.currentTarget.style.opacity = '1';
            }
          }}
        >
          🔄 Toggle
        </button>
        <button 
          onClick={onInspect}
          disabled={!selectedHabit || isLoading}
          style={{
            backgroundColor: !selectedHabit || isLoading ? theme.colors.gray[300] : theme.colors.primary[600],
            color: 'white',
            padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
            borderRadius: theme.borderRadius.lg,
            fontWeight: theme.typography.fontWeight.medium,
            border: 'none',
            cursor: !selectedHabit || isLoading ? 'not-allowed' : 'pointer',
            transition: theme.transitions.normal,
            fontSize: theme.typography.fontSize.base
          }}
          onMouseEnter={(e) => {
            if (selectedHabit && !isLoading) {
              e.currentTarget.style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedHabit && !isLoading) {
              e.currentTarget.style.opacity = '1';
            }
          }}
        >
          🔍 Inspect
        </button>
      </div>

      {selectedHabit && (
        <div style={{
          backgroundColor: theme.colors.gray[50],
          padding: theme.spacing[4],
          borderRadius: theme.borderRadius.lg
        }}>
          <h4 style={{
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing[2]
          }}>Quick Date Tests</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: theme.spacing[2] }}>
            {quickDates.map(({ offset, dateStr, label }) => (
              <button
                key={offset}
                onClick={() => onDateChange(dateStr)}
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  backgroundColor: theme.colors.background,
                  border: `1px solid ${theme.colors.gray[300]}`,
                  padding: `${theme.spacing[2]} ${theme.spacing[2]}`,
                  borderRadius: theme.borderRadius.base,
                  cursor: 'pointer',
                  transition: theme.transitions.normal,
                  color: theme.colors.text.primary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.gray[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.background;
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Component: Inspect Tab
function InspectTab({ logs, streakCalculations }: {
  logs: HabitLog[]
  streakCalculations: StreakCalculation[]
}) {
  if (logs.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: `${theme.spacing[8]} 0`,
        color: theme.colors.text.secondary
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: theme.spacing[2] }}>🔍</div>
        <p>Select a habit and click "Inspect" to view details</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4] }}>
      <div>
        <h3 style={{
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing[3]
        }}>Habit Logs</h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing[2],
          maxHeight: '16rem',
          overflowY: 'auto'
        }}>
          {logs.map(log => (
            <div key={log.id} style={{
              padding: theme.spacing[3],
              borderRadius: theme.borderRadius.lg,
              fontSize: theme.typography.fontSize.sm,
              backgroundColor: log.completed ? theme.colors.success + '20' : theme.colors.error + '20',
              border: `1px solid ${log.completed ? theme.colors.success + '40' : theme.colors.error + '40'}`
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{
                  fontFamily: theme.typography.fontFamily.mono.join(', '),
                  fontWeight: theme.typography.fontWeight.medium
                }}>{log.dateStr}</span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[2]
                }}>
                  <span style={{
                    fontSize: theme.typography.fontSize.lg,
                    color: log.completed ? theme.colors.success : theme.colors.error
                  }}>
                    {log.completed ? '✓' : '✗'}
                  </span>
                  {log.updatedDuringToggle && (
                    <span style={{
                      fontSize: theme.typography.fontSize.xs,
                      backgroundColor: theme.colors.primary[100],
                      color: theme.colors.primary[800],
                      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                      borderRadius: theme.borderRadius.base
                    }}>
                      TOGGLED
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {streakCalculations.length > 0 && (
        <div>
          <h3 style={{
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing[3]
          }}>Streak Calculations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2] }}>
            {streakCalculations.map((calc, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: theme.spacing[3],
                backgroundColor: theme.colors.gray[50],
                borderRadius: theme.borderRadius.lg,
                fontSize: theme.typography.fontSize.sm
              }}>
                <div>
                  <span style={{
                    fontFamily: theme.typography.fontFamily.mono.join(', '),
                    fontWeight: theme.typography.fontWeight.medium
                  }}>{calc.date}</span>
                  <span style={{
                    color: theme.colors.text.secondary,
                    marginLeft: theme.spacing[2]
                  }}>({calc.dayOfWeek})</span>
                </div>
                <span style={{
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.primary[600]
                }}>
                  Streak: {calc.calculatedStreak}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Component: Console Output
function ConsoleOutput({ output, onClear }: {
  output: string[]
  onClear: () => void
}) {
  return (
    <div style={{
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.sm,
      border: `1px solid ${theme.colors.gray[200]}`
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing[4],
        borderBottom: `1px solid ${theme.colors.gray[200]}`
      }}>
        <h2 style={{
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text.primary
        }}>📟 Console Output</h2>
        <button 
          onClick={onClear}
          style={{
            fontSize: theme.typography.fontSize.sm,
            backgroundColor: theme.colors.gray[100],
            padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
            borderRadius: theme.borderRadius.base,
            border: 'none',
            cursor: 'pointer',
            transition: theme.transitions.normal,
            color: theme.colors.text.primary
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.gray[200];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.gray[100];
          }}
        >
          Clear
        </button>
      </div>
      <div style={{ padding: theme.spacing[4] }}>
        <div style={{
          backgroundColor: '#1a1a1a',
          color: '#4ade80',
          padding: theme.spacing[4],
          borderRadius: theme.borderRadius.lg,
          height: '20rem',
          overflowY: 'auto',
          fontFamily: theme.typography.fontFamily.mono.join(', '),
          fontSize: theme.typography.fontSize.sm
        }}>
          {output.length === 0 ? (
            <div style={{ color: '#6b7280', fontStyle: 'italic' }}>Console output will appear here...</div>
          ) : (
            output.map((line, i) => (
              <div key={i} style={{ marginBottom: theme.spacing[1], lineHeight: 1.6 }}>
                {line}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// Component: Status Cards
function StatusCards({ testHabits, logs, selectedHabit }: {
  testHabits: Habit[]
  logs: HabitLog[]
  selectedHabit: string
}) {
  const currentStreak = selectedHabit ? testHabits.find(h => h.id === selectedHabit)?.currentStreak || 0 : 0

  const cards = [
    { icon: '🎯', label: 'Test Habits', value: testHabits.length, bgColor: theme.colors.primary[100] },
    { icon: '📊', label: 'Total Logs', value: logs.length, bgColor: theme.colors.success + '20' },
    { icon: '🔥', label: 'Current Streak', value: currentStreak, bgColor: theme.colors.primary[100] }
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: theme.spacing[4]
    }}>
      {cards.map(card => (
        <div key={card.label} style={{
          backgroundColor: theme.colors.background,
          padding: theme.spacing[6],
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows.sm,
          border: `1px solid ${theme.colors.gray[200]}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              backgroundColor: card.bgColor,
              padding: theme.spacing[3],
              borderRadius: theme.borderRadius.lg
            }}>
              <span style={{ fontSize: '1.5rem' }}>{card.icon}</span>
            </div>
            <div style={{ marginLeft: theme.spacing[4] }}>
              <p style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.secondary
              }}>{card.label}</p>
              <p style={{
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary
              }}>{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Component: Help Card
function HelpCard() {
  return (
    <div style={{
      backgroundColor: theme.colors.primary[50],
      border: `1px solid ${theme.colors.primary[200]}`,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing[6]
    }}>
      <h3 style={{
        fontSize: theme.typography.fontSize.lg,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.primary[900],
        marginBottom: theme.spacing[3]
      }}>💡 Quick Start Guide</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[2], color: theme.colors.primary[800] }}>
        <p>• <strong>Scenarios Tab:</strong> Use pre-built test scenarios to quickly reproduce bugs</p>
        <p>• <strong>Manual Tab:</strong> Create custom tests by selecting habits and dates</p>
        <p>• <strong>Inspect Tab:</strong> View detailed logs and streak calculations</p>
        <p>• <strong>Quick Tests:</strong> One-click automated testing of critical scenarios</p>
      </div>
    </div>
  )
}

// Main Component
export default function DebugPage() {
  const { data: session } = useSession()
  const [selectedScenario, setSelectedScenario] = useState('')
  const [testHabits, setTestHabits] = useState<Habit[]>([])
  const [selectedHabit, setSelectedHabit] = useState('')
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [streakCalculations, setStreakCalculations] = useState<StreakCalculation[]>([])
  const [output, setOutput] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'scenarios' | 'manual' | 'inspect'>('scenarios')

  const quickTests = [
    { key: 'daily-streak', label: '📅 Daily Streak', days: [-1, 0, 1], color: theme.colors.success },
    { key: 'weekly-sunday', label: '📆 Sunday Bug', days: [0], color: theme.colors.error },
    { key: 'production-bug', label: '🐛 Production Bug', days: [0], color: theme.colors.warning },
    { key: 'timezone-mix', label: '🌍 Timezone Test', days: [0, 1], color: theme.colors.primary[600] },
    { key: 'long-streak-recovery', label: '🔥 Long Streak', days: [0, 1, 2], color: theme.colors.success },
    { key: 'weekly-streak-complex', label: '📊 Complex Weekly', days: [0, 1], color: theme.colors.primary[600] },
    { key: 'timezone-boundary', label: '⏰ Timezone Boundary', days: [0, 1], color: theme.colors.warning },
    { key: 'multi-habit-scenario', label: '🎯 Multi-Habit', days: [0], color: theme.colors.success },
    { key: 'streak-edge-cases', label: '🔍 Edge Cases', days: [0, 1], color: theme.colors.error },
    { key: 'holiday-break', label: '🏖️ Holiday Break', days: [0, 1, 2], color: theme.colors.warning },
    { key: 'inconsistent-user', label: '🎲 Inconsistent', days: [0, 1, 2], color: theme.colors.primary[600] },
    { key: 'year-boundary', label: '🎆 Year Boundary', days: [0, 1], color: theme.colors.success },
    { key: 'streak-recovery-challenge', label: '🔥 Streak Recovery Challenge', days: [0, 1, 2], color: theme.colors.success },
    { key: 'weekly-streak-master', label: '📊 Weekly Streak Master', days: [0, 1], color: theme.colors.primary[600] },
    { key: 'timezone-chaos', label: '⏰ Timezone Chaos', days: [0, 1], color: theme.colors.warning },
    { key: 'multi-frequency-user', label: '🎯 Multi-Frequency User', days: [0], color: theme.colors.success },
    { key: 'streak-edge-master', label: '🔍 Streak Edge Master', days: [0, 1], color: theme.colors.error },
    { key: 'holiday-master', label: '🏖️ Holiday Master', days: [0, 1, 2], color: theme.colors.warning },
    { key: 'inconsistent-master', label: '🎲 Inconsistent Master', days: [0, 1, 2], color: theme.colors.primary[600] },
    { key: 'weekend-warrior', label: '🏃 Weekend Warrior', days: [0], color: theme.colors.success },
    { key: 'streak-breaker', label: '💔 Streak Breaker', days: [0, 1, 2], color: theme.colors.primary[600] },
    { key: 'toggle-streak-preservation', label: '🔄 Toggle Streak Preservation', days: [0], color: theme.colors.warning },
    { key: 'daily-toggle-test', label: '📝 Daily Toggle Test', days: [0], color: theme.colors.success },
    { key: 'weekly-toggle-test', label: '📅 Weekly Toggle Test', days: [0], color: theme.colors.primary[600] },
    { key: 'streak-integrity-test', label: '🛡️ Streak Integrity Test', days: [0], color: theme.colors.error }
  ]

  useEffect(() => {
    if (session) {
      loadTestHabits()
    }
  }, [session])

  const addOutput = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const icon = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type]
    setOutput(prev => [...prev, `${icon} [${timestamp}] ${message}`])
  }

  const loadTestHabits = async () => {
    try {
      const response = await fetch('/api/habits')
      const data = await response.json()
      const allHabits = Array.isArray(data) ? data : (data.habits || [])
      const testHabits = allHabits.filter((h: Habit) => 
        h.title.startsWith('Test ') || 
        h.title.startsWith('Daily Toggle') || 
        h.title.startsWith('Weekly Toggle') || 
        h.title.startsWith('Long Streak') || 
        h.title.startsWith('Toggle Streak')
      )
      setTestHabits(testHabits)
      addOutput(`Found ${testHabits.length} test habits (out of ${allHabits.length} total)`, 'info')
      return testHabits
    } catch (error) {
      addOutput(`Error loading habits: ${error}`, 'error')
      return []
    }
  }

  const setupScenario = async () => {
    if (!selectedScenario) return
    
    setIsLoading(true)
    try {
      addOutput(`Setting up scenario: ${scenarios[selectedScenario].name}`, 'info')
      
      const response = await fetch(`/api/debug/test-habits?action=setup&scenario=${selectedScenario}`)
      const data = await response.json()
      
      if (data.error) {
        addOutput(`Setup failed: ${data.error}`, 'error')
        return
      }
      
      addOutput(`✨ ${data.message}`, 'success')
      if (data.debug) {
        addOutput(`Created ${data.results?.length || 0} habits with ${data.results?.reduce((sum: number, r: any) => sum + r.logsCreated, 0) || 0} logs`, 'info')
      }
      
      const updatedTestHabits = await loadTestHabits()
      
      if (updatedTestHabits.length > 0) {
        const firstTestHabit = updatedTestHabits[0]
        setSelectedHabit(firstTestHabit.id)
        setActiveTab('manual')
        addOutput(`Selected habit: ${firstTestHabit.title}`, 'info')
      }
      
    } catch (error) {
      addOutput(`Setup error: ${error}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const simulateToggle = async () => {
    if (!selectedHabit || !testDate) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/debug/test-habits?action=simulate-toggle&habitId=${selectedHabit}&date=${testDate}`)
      const data = await response.json()
      
      if (data.error) {
        addOutput(`Toggle failed: ${data.error}`, 'error')
        return
      }
      
      if (data.details) {
        addOutput(`🔄 ${data.details.logAction}`, 'success')
        addOutput(`📊 Streak: ${data.details.oldStreak} → ${data.details.newStreak}`, 'info')
        if (data.details.newBestStreak > data.details.oldBestStreak) {
          addOutput(`🏆 New best streak: ${data.details.newBestStreak}`, 'success')
        }
      }
      
      await loadTestHabits()
      await inspectHabit()
    } catch (error) {
      addOutput(`Toggle error: ${error}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const inspectHabit = async (habitId?: string) => {
    const targetHabitId = habitId || selectedHabit
    if (!targetHabitId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/debug/test-habits?action=inspect&habitId=${targetHabitId}&date=${testDate}`)
      const data = await response.json()
      
      if (data.error) {
        addOutput(`Inspect failed: ${data.error}`, 'error')
        return
      }
      
      setLogs(data.logs || [])
      setStreakCalculations(data.streakCalculations || [])
      addOutput(`🔍 Inspected habit: ${data.habit?.title}`, 'success')
      setActiveTab('inspect')
    } catch (error) {
      addOutput(`Inspect error: ${error}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const runQuickTest = async (scenarioKey: string, days: number[]) => {
    setIsLoading(true)
    addOutput(`\n🚀 Running Quick Test: ${scenarios[scenarioKey].name}`, 'info')
    
    try {
      const setupResp = await fetch(`/api/debug/test-habits?action=setup&scenario=${scenarioKey}`)
      const setupData = await setupResp.json()
      
      if (setupData.error) {
        addOutput(`Quick test setup failed: ${setupData.error}`, 'error')
        return
      }
      
      addOutput(`📋 ${setupData.message}`, 'success')
      const updatedTestHabits = await loadTestHabits()
      
      if (updatedTestHabits.length === 0) {
        addOutput(`❌ No test habits found after setup (checked ${updatedTestHabits.length} habits)`, 'error')
        addOutput(`Debug info: ${JSON.stringify(setupData.debug || {})}`, 'info')
        return
      }

      addOutput(`🎯 Testing ${updatedTestHabits.length} habit(s)`, 'info')

      // Test each habit in the scenario
      for (const testHabit of updatedTestHabits) {
        addOutput(`\n📝 Testing: ${testHabit.title} (${testHabit.frequency})`, 'info')

        for (const dayOffset of days) {
          const testDate = new Date()
          testDate.setDate(testDate.getDate() + dayOffset)
          const dateStr = testDate.toISOString().split('T')[0]
          const dayName = testDate.toLocaleDateString('en-US', { weekday: 'long' })
          
          addOutput(`🔄 Toggling ${dayName} (${dateStr})...`, 'info')
          
          const toggleResp = await fetch(`/api/debug/test-habits?action=simulate-toggle&habitId=${testHabit.id}&date=${dateStr}`)
          const toggleData = await toggleResp.json()
          
          if (toggleData.details) {
            const offsetStr = dayOffset > 0 ? `+${dayOffset}` : dayOffset.toString()
            addOutput(`📅 ${dayName} (${offsetStr}): ${toggleData.details.logAction}, Streak: ${toggleData.details.newStreak}`, 'success')
          } else {
            addOutput(`Failed to toggle ${dayName}: ${toggleData.error}`, 'error')
            if (toggleData.debug) {
              addOutput(`Debug: ${JSON.stringify(toggleData.debug)}`, 'info')
            }
          }
        }
      }
      
      // Select the first habit for inspection
      const firstHabit = updatedTestHabits[0]
      setSelectedHabit(firstHabit.id)
      await inspectHabit(firstHabit.id)
      addOutput(`🎉 Quick test completed successfully!`, 'success')
    } catch (error) {
      addOutput(`Quick test error: ${error}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const runAllTests = async () => {
    setIsLoading(true)
    addOutput(`\n🚀 Starting Comprehensive Test Suite`, 'info')
    addOutput(`📋 Running ${quickTests.length} test scenarios...`, 'info')
    
    const results = []
    let passedTests = 0
    let failedTests = 0
    
    for (let i = 0; i < quickTests.length; i++) {
      const test = quickTests[i]
      addOutput(`\n${i + 1}/${quickTests.length} Running: ${test.label}`, 'info')
      
      try {
        const startTime = Date.now()
        
        // Setup scenario
        const setupResp = await fetch(`/api/debug/test-habits?action=setup&scenario=${test.key}`)
        const setupData = await setupResp.json()
        
        if (setupData.error) {
          addOutput(`❌ Setup failed: ${setupData.error}`, 'error')
          results.push({ test: test.label, status: 'FAILED', error: setupData.error, duration: 0 })
          failedTests++
          continue
        }
        
        const updatedTestHabits = await loadTestHabits()
        
        if (updatedTestHabits.length === 0) {
          addOutput(`❌ No test habits found`, 'error')
          results.push({ test: test.label, status: 'FAILED', error: 'No test habits found', duration: 0 })
          failedTests++
          continue
        }
        
        // Test each habit
        let testPassed = true
        let testErrors = []
        
        for (const testHabit of updatedTestHabits) {
          addOutput(`  Testing: ${testHabit.title}`, 'info')
          
          for (const dayOffset of test.days) {
            const testDate = new Date()
            testDate.setDate(testDate.getDate() + dayOffset)
            const dateStr = testDate.toISOString().split('T')[0]
            
            const toggleResp = await fetch(`/api/debug/test-habits?action=simulate-toggle&habitId=${testHabit.id}&date=${dateStr}`)
            const toggleData = await toggleResp.json()
            
            if (toggleData.error) {
              testErrors.push(`${dateStr}: ${toggleData.error}`)
              testPassed = false
            }
          }
        }
        
        const duration = Date.now() - startTime
        
        if (testPassed) {
          addOutput(`✅ ${test.label} - PASSED (${duration}ms)`, 'success')
          results.push({ test: test.label, status: 'PASSED', duration })
          passedTests++
        } else {
          addOutput(`❌ ${test.label} - FAILED (${duration}ms)`, 'error')
          addOutput(`   Errors: ${testErrors.join(', ')}`, 'error')
          results.push({ test: test.label, status: 'FAILED', error: testErrors.join('; '), duration })
          failedTests++
        }
        
      } catch (error) {
        addOutput(`❌ ${test.label} - ERROR: ${error instanceof Error ? error.message : String(error)}`, 'error')
        results.push({ test: test.label, status: 'ERROR', error: error instanceof Error ? error.message : String(error), duration: 0 })
        failedTests++
      }
    }
    
    // Generate comprehensive report
    addOutput(`\n📊 COMPREHENSIVE TEST REPORT`, 'info')
    addOutput(`================================`, 'info')
    addOutput(`Total Tests: ${quickTests.length}`, 'info')
    addOutput(`✅ Passed: ${passedTests}`, 'success')
    addOutput(`❌ Failed: ${failedTests}`, 'error')
    addOutput(`📈 Success Rate: ${((passedTests / quickTests.length) * 100).toFixed(1)}%`, 'info')
    
    if (failedTests > 0) {
      addOutput(`\n❌ FAILED TESTS:`, 'error')
      results.filter(r => r.status !== 'PASSED').forEach(result => {
        addOutput(`  • ${result.test}: ${result.error || 'Unknown error'}`, 'error')
      })
    }
    
    addOutput(`\n✅ PASSED TESTS:`, 'success')
    results.filter(r => r.status === 'PASSED').forEach(result => {
      addOutput(`  • ${result.test} (${result.duration}ms)`, 'success')
    })
    
    addOutput(`\n🎉 Comprehensive test suite completed!`, 'success')
    setIsLoading(false)
  }

  const runToggleTests = async () => {
    setIsLoading(true)
    addOutput(`\n🔄 Starting Toggle Behavior Tests`, 'info')
    addOutput(`📋 Testing checking/unchecking behavior...`, 'info')
    
    try {
      // Test 1: Daily habit with existing streak
      addOutput(`\n📝 Test 1: Daily Habit Toggle Test`, 'info')
      
      const setupResp1 = await fetch(`/api/debug/test-habits?action=setup&scenario=daily-toggle-test`)
      const setupData1 = await setupResp1.json()
      
      if (setupData1.error) {
        addOutput(`❌ Setup failed: ${setupData1.error}`, 'error')
        return
      }
      
      const testHabits1 = await loadTestHabits()
      if (testHabits1.length === 0) {
        addOutput(`❌ No test habits found`, 'error')
        return
      }
      
      const habit1 = testHabits1[0]
      const today = new Date().toISOString().split('T')[0]
      
      // Check initial state
      addOutput(`🔍 Initial state: ${habit1.title} - Streak: ${habit1.currentStreak}`, 'info')
      
      // Toggle today to unchecked
      const toggle1Resp = await fetch(`/api/debug/test-habits?action=simulate-toggle&habitId=${habit1.id}&date=${today}`)
      const toggle1Data = await toggle1Resp.json()
      
      if (toggle1Data.details) {
        addOutput(`🔄 Toggle 1: ${toggle1Data.details.logAction}`, 'info')
        addOutput(`📊 Streak: ${toggle1Data.details.oldStreak} → ${toggle1Data.details.newStreak}`, 'info')
        
        // Check for the specific bug
        const streakChange = toggle1Data.details.newStreak - toggle1Data.details.oldStreak
        if (Math.abs(streakChange) > 1) {
          addOutput(`🚨 BUG DETECTED: Streak changed by ${streakChange} instead of ±1!`, 'error')
        }
      }
      
      // Toggle today back to checked
      const toggle2Resp = await fetch(`/api/debug/test-habits?action=simulate-toggle&habitId=${habit1.id}&date=${today}`)
      const toggle2Data = await toggle2Resp.json()
      
      if (toggle2Data.details) {
        addOutput(`🔄 Toggle 2: ${toggle2Data.details.logAction}`, 'info')
        addOutput(`📊 Streak: ${toggle2Data.details.oldStreak} → ${toggle2Data.details.newStreak}`, 'info')
        
        // Check for the specific bug
        const streakChange = toggle2Data.details.newStreak - toggle2Data.details.oldStreak
        if (Math.abs(streakChange) > 1) {
          addOutput(`🚨 BUG DETECTED: Streak changed by ${streakChange} instead of ±1!`, 'error')
        }
      }
      
      // Toggle today to unchecked again
      const toggle3Resp = await fetch(`/api/debug/test-habits?action=simulate-toggle&habitId=${habit1.id}&date=${today}`)
      const toggle3Data = await toggle3Resp.json()
      
      if (toggle3Data.details) {
        addOutput(`🔄 Toggle 3: ${toggle3Data.details.logAction}`, 'info')
        addOutput(`📊 Streak: ${toggle3Data.details.oldStreak} → ${toggle3Data.details.newStreak}`, 'info')
        
        // Check for the specific bug
        const streakChange = toggle3Data.details.newStreak - toggle3Data.details.oldStreak
        if (Math.abs(streakChange) > 1) {
          addOutput(`🚨 BUG DETECTED: Streak changed by ${streakChange} instead of ±1!`, 'error')
        }
      }
      
      // Test 2: Weekly habit with existing streak
      addOutput(`\n📅 Test 2: Weekly Habit Toggle Test`, 'info')
      
      const setupResp2 = await fetch(`/api/debug/test-habits?action=setup&scenario=weekly-toggle-test`)
      const setupData2 = await setupResp2.json()
      
      if (setupData2.error) {
        addOutput(`❌ Setup failed: ${setupData2.error}`, 'error')
        return
      }
      
      const testHabits2 = await loadTestHabits()
      if (testHabits2.length === 0) {
        addOutput(`❌ No test habits found`, 'error')
        return
      }
      
      const habit2 = testHabits2[0]
      
      // Check initial state
      addOutput(`🔍 Initial state: ${habit2.title} - Streak: ${habit2.currentStreak}`, 'info')
      
      // Toggle today to unchecked
      const toggle4Resp = await fetch(`/api/debug/test-habits?action=simulate-toggle&habitId=${habit2.id}&date=${today}`)
      const toggle4Data = await toggle4Resp.json()
      
      if (toggle4Data.details) {
        addOutput(`🔄 Toggle 1: ${toggle4Data.details.logAction}`, 'info')
        addOutput(`📊 Streak: ${toggle4Data.details.oldStreak} → ${toggle4Data.details.newStreak}`, 'info')
        
        // Check for the specific bug
        const streakChange = toggle4Data.details.newStreak - toggle4Data.details.oldStreak
        if (Math.abs(streakChange) > 1) {
          addOutput(`🚨 BUG DETECTED: Streak changed by ${streakChange} instead of ±1!`, 'error')
        }
      }
      
      // Toggle today back to checked
      const toggle5Resp = await fetch(`/api/debug/test-habits?action=simulate-toggle&habitId=${habit2.id}&date=${today}`)
      const toggle5Data = await toggle5Resp.json()
      
      if (toggle5Data.details) {
        addOutput(`🔄 Toggle 2: ${toggle5Data.details.logAction}`, 'info')
        addOutput(`📊 Streak: ${toggle5Data.details.oldStreak} → ${toggle5Data.details.newStreak}`, 'info')
        
        // Check for the specific bug
        const streakChange = toggle5Data.details.newStreak - toggle5Data.details.oldStreak
        if (Math.abs(streakChange) > 1) {
          addOutput(`🚨 BUG DETECTED: Streak changed by ${streakChange} instead of ±1!`, 'error')
        }
      }
      
      // Test 3: Long streak integrity test
      addOutput(`\n🛡️ Test 3: Long Streak Integrity Test`, 'info')
      
      const setupResp3 = await fetch(`/api/debug/test-habits?action=setup&scenario=streak-integrity-test`)
      const setupData3 = await setupResp3.json()
      
      if (setupData3.error) {
        addOutput(`❌ Setup failed: ${setupData3.error}`, 'error')
        return
      }
      
      const testHabits3 = await loadTestHabits()
      if (testHabits3.length === 0) {
        addOutput(`❌ No test habits found`, 'error')
        return
      }
      
      const habit3 = testHabits3[0]
      
      // Check initial state
      addOutput(`🔍 Initial state: ${habit3.title} - Streak: ${habit3.currentStreak}`, 'info')
      
      // Perform multiple toggles
      for (let i = 1; i <= 5; i++) {
        const toggleResp = await fetch(`/api/debug/test-habits?action=simulate-toggle&habitId=${habit3.id}&date=${today}`)
        const toggleData = await toggleResp.json()
        
        if (toggleData.details) {
          addOutput(`🔄 Toggle ${i}: ${toggleData.details.logAction}`, 'info')
          addOutput(`📊 Streak: ${toggleData.details.oldStreak} → ${toggleData.details.newStreak}`, 'info')
          
          // Check for the specific bug
          const streakChange = toggleData.details.newStreak - toggleData.details.oldStreak
          if (Math.abs(streakChange) > 1) {
            addOutput(`🚨 BUG DETECTED: Streak changed by ${streakChange} instead of ±1!`, 'error')
          }
        }
      }
      
      // Test 4: Specific bug reproduction test
      addOutput(`\n🐛 Test 4: Specific Bug Reproduction Test`, 'info')
      addOutput(`🎯 Testing the exact scenario: 2 → 0 → 2`, 'info')
      
      const setupResp4 = await fetch(`/api/debug/test-habits?action=setup&scenario=toggle-streak-preservation`)
      const setupData4 = await setupResp4.json()
      
      if (setupData4.error) {
        addOutput(`❌ Setup failed: ${setupData4.error}`, 'error')
        return
      }
      
      const testHabits4 = await loadTestHabits()
      if (testHabits4.length === 0) {
        addOutput(`❌ No test habits found`, 'error')
        return
      }
      
      const habit4 = testHabits4[0]
      
      // Check initial state
      addOutput(`🔍 Initial state: ${habit4.title} - Streak: ${habit4.currentStreak}`, 'info')
      
      // Simulate the exact bug scenario
      const toggle6Resp = await fetch(`/api/debug/test-habits?action=simulate-toggle&habitId=${habit4.id}&date=${today}`)
      const toggle6Data = await toggle6Resp.json()
      
      if (toggle6Data.details) {
        addOutput(`🔄 Toggle 1 (should decrease by 1): ${toggle6Data.details.logAction}`, 'info')
        addOutput(`📊 Streak: ${toggle6Data.details.oldStreak} → ${toggle6Data.details.newStreak}`, 'info')
        
        const streakChange = toggle6Data.details.newStreak - toggle6Data.details.oldStreak
        if (streakChange !== -1) {
          addOutput(`🚨 BUG CONFIRMED: Expected -1, got ${streakChange}`, 'error')
        } else {
          addOutput(`✅ Correct: Streak decreased by 1`, 'success')
        }
      }
      
      const toggle7Resp = await fetch(`/api/debug/test-habits?action=simulate-toggle&habitId=${habit4.id}&date=${today}`)
      const toggle7Data = await toggle7Resp.json()
      
      if (toggle7Data.details) {
        addOutput(`🔄 Toggle 2 (should increase by 1): ${toggle7Data.details.logAction}`, 'info')
        addOutput(`📊 Streak: ${toggle7Data.details.oldStreak} → ${toggle7Data.details.newStreak}`, 'info')
        
        const streakChange = toggle7Data.details.newStreak - toggle7Data.details.oldStreak
        if (streakChange !== 1) {
          addOutput(`🚨 BUG CONFIRMED: Expected +1, got ${streakChange}`, 'error')
        } else {
          addOutput(`✅ Correct: Streak increased by 1`, 'success')
        }
      }
      
      addOutput(`\n✅ Toggle behavior tests completed!`, 'success')
      addOutput(`📋 Summary:`, 'info')
      addOutput(`   • Daily habits: Toggle should only affect current day`, 'info')
      addOutput(`   • Weekly habits: Toggle should only affect current week`, 'info')
      addOutput(`   • Long streaks: Should maintain integrity through multiple toggles`, 'info')
      addOutput(`   • Bug detection: Streak should only change by ±1 per toggle`, 'info')
      
    } catch (error) {
      addOutput(`❌ Toggle test error: ${error instanceof Error ? error.message : String(error)}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const runQuickToggleTest = async () => {
    setIsLoading(true)
    addOutput(`\n🔍 Quick Toggle Bug Test`, 'info')
    addOutput(`🎯 Testing the exact bug: 2 → 0 → 2`, 'info')
    
    try {
      // Setup a simple habit with 2-day streak
      addOutput(`\n🚀 Setting up test scenario...`, 'info')
      const setupResp = await fetch(`/api/debug/test-habits?action=setup&scenario=toggle-streak-preservation`)
      const setupData = await setupResp.json()
      
      if (setupData.error) {
        addOutput(`❌ Setup failed: ${setupData.error}`, 'error')
        return
      }
      
      addOutput(`✅ Setup completed successfully`, 'success')
      
      // Wait a moment for the database to update
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Load test habits
      addOutput(`\n📋 Loading test habits...`, 'info')
      const testHabits = await loadTestHabits()
      addOutput(`ℹ️ Found ${testHabits.length} test habits (out of 6 total)`, 'info')
      
      if (testHabits.length === 0) {
        addOutput(`❌ No test habits found after setup`, 'error')
        addOutput(`🔍 This might be a database issue. Let's try again...`, 'info')
        
        // Try one more time
        await new Promise(resolve => setTimeout(resolve, 1000))
        const retryHabits = await loadTestHabits()
        if (retryHabits.length === 0) {
          addOutput(`❌ Still no test habits found. Please check the setup process.`, 'error')
          return
        }
        addOutput(`✅ Found ${retryHabits.length} test habits on retry`, 'success')
      }
      
      const habit = testHabits[0] || (await loadTestHabits())[0]
      if (!habit) {
        addOutput(`❌ Could not find test habit`, 'error')
        return
      }
      
      const today = new Date().toISOString().split('T')[0]
      addOutput(`📅 Testing on date: ${today}`, 'info')
      
      // Let's inspect the habit to see what logs it has
      addOutput(`🔍 Inspecting habit logs...`, 'info')
      const inspectResp = await fetch(`/api/debug/test-habits?action=inspect&habitId=${habit.id}&date=${today}`)
      const inspectData = await inspectResp.json()
      
      if (inspectData.logs) {
        addOutput(`📋 Habit has ${inspectData.logs.length} logs:`, 'info')
        inspectData.logs.forEach((log: any) => {
          addOutput(`  - ${log.dateStr}: ${log.completed ? '✅' : '❌'}`, 'info')
        })
      }
      
      addOutput(`🔍 Starting with: ${habit.title} - Streak: ${habit.currentStreak}`, 'info')
      
      // First toggle: should decrease by 1
      addOutput(`\n🔄 Toggle 1: Unchecking today...`, 'info')
      const toggle1Resp = await fetch(`/api/debug/test-habits?action=simulate-toggle&habitId=${habit.id}&date=${today}`)
      const toggle1Data = await toggle1Resp.json()
      
      if (toggle1Data.details) {
        addOutput(`📊 Result: ${toggle1Data.details.oldStreak} → ${toggle1Data.details.newStreak}`, 'info')
        const change = toggle1Data.details.newStreak - toggle1Data.details.oldStreak
        if (change === -1) {
          addOutput(`✅ Correct: Decreased by 1`, 'success')
        } else {
          addOutput(`🚨 BUG: Expected -1, got ${change}`, 'error')
        }
      }
      
      // Second toggle: should increase by 1
      addOutput(`\n🔄 Toggle 2: Checking today...`, 'info')
      const toggle2Resp = await fetch(`/api/debug/test-habits?action=simulate-toggle&habitId=${habit.id}&date=${today}`)
      const toggle2Data = await toggle2Resp.json()
      
      if (toggle2Data.details) {
        addOutput(`📊 Result: ${toggle2Data.details.oldStreak} → ${toggle2Data.details.newStreak}`, 'info')
        const change = toggle2Data.details.newStreak - toggle2Data.details.oldStreak
        if (change === 1) {
          addOutput(`✅ Correct: Increased by 1`, 'success')
        } else {
          addOutput(`🚨 BUG: Expected +1, got ${change}`, 'error')
        }
      }
      
      // Third toggle: should decrease by 1 again
      addOutput(`\n🔄 Toggle 3: Unchecking today again...`, 'info')
      const toggle3Resp = await fetch(`/api/debug/test-habits?action=simulate-toggle&habitId=${habit.id}&date=${today}`)
      const toggle3Data = await toggle3Resp.json()
      
      if (toggle3Data.details) {
        addOutput(`📊 Result: ${toggle3Data.details.oldStreak} → ${toggle3Data.details.newStreak}`, 'info')
        const change = toggle3Data.details.newStreak - toggle3Data.details.oldStreak
        if (change === -1) {
          addOutput(`✅ Correct: Decreased by 1`, 'success')
        } else {
          addOutput(`🚨 BUG: Expected -1, got ${change}`, 'error')
        }
      }
      
      addOutput(`\n📋 Summary:`, 'info')
      addOutput(`   Expected pattern: 2 → 1 → 2 → 1`, 'info')
      addOutput(`   Each toggle should only change streak by ±1`, 'info')
      
    } catch (error) {
      addOutput(`❌ Quick test error: ${error instanceof Error ? error.message : String(error)}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.gray[50],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: theme.colors.background,
          padding: theme.spacing[8],
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows.md,
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing[4]
          }}>🔐 Authentication Required</h1>
          <p style={{ color: theme.colors.text.secondary }}>Please sign in to access the debug tools</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.colors.gray[50] }}>
      {/* Header */}
      <div style={{
        backgroundColor: theme.colors.background,
        boxShadow: theme.shadows.sm,
        borderBottom: `1px solid ${theme.colors.gray[200]}`
      }}>
        <div style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: `${theme.spacing[4]} ${theme.spacing[4]}`,
          paddingTop: theme.spacing[6],
          paddingBottom: theme.spacing[6]
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <h1 style={{
                fontSize: theme.typography.fontSize['3xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary
              }}>🐛 Habit Debug Console</h1>
              <p style={{
                color: theme.colors.text.secondary,
                marginTop: theme.spacing[1]
              }}>Test habit logic instantly without waiting days or weeks</p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing[4]
            }}>
              <div style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary
              }}>
                Test Habits: <span style={{
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.primary[600]
                }}>{testHabits.length}</span>
              </div>
              {isLoading && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: theme.colors.primary[600]
                }}>
                  <div style={{
                    animation: 'spin 1s linear infinite',
                    width: '1rem',
                    height: '1rem',
                    border: `2px solid ${theme.colors.primary[600]}`,
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    marginRight: theme.spacing[2]
                  }}></div>
                  Processing...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: `${theme.spacing[4]} ${theme.spacing[4]}`,
        paddingTop: theme.spacing[6],
        paddingBottom: theme.spacing[6]
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: theme.spacing[6]
        }}>
          {/* Left Sidebar - Controls */}
          <div>
            <div style={{
              backgroundColor: theme.colors.background,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.sm,
              border: `1px solid ${theme.colors.gray[200]}`
            }}>
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
              
              <div style={{ padding: theme.spacing[6] }}>
                <ScenariosTab 
                  selectedScenario={selectedScenario}
                  onScenarioChange={setSelectedScenario}
                  onSetupScenario={setupScenario}
                  onRunQuickTest={runQuickTest}
                  onRunAllTests={runAllTests}
                  onRunToggleTests={runToggleTests}
                  onRunQuickToggleTest={runQuickToggleTest}
                  quickTests={quickTests}
                  isLoading={isLoading}
                  theme={theme}
                />

                {activeTab === 'manual' && (
                  <ManualTab
                    testHabits={testHabits}
                    selectedHabit={selectedHabit}
                    onHabitChange={setSelectedHabit}
                    testDate={testDate}
                    onDateChange={setTestDate}
                    onToggle={simulateToggle}
                    onInspect={inspectHabit}
                    isLoading={isLoading}
                  />
                )}

                {activeTab === 'inspect' && (
                  <InspectTab logs={logs} streakCalculations={streakCalculations} />
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Output and Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[6] }}>
            <ConsoleOutput output={output} onClear={() => setOutput([])} />
            <StatusCards testHabits={testHabits} logs={logs} selectedHabit={selectedHabit} />
            <HelpCard />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 1024px) {
          .grid-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}