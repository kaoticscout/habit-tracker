'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface TestScenario {
  name: string
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

export default function DebugPage() {
  const { data: session } = useSession()
  const [scenarios, setScenarios] = useState<Record<string, TestScenario>>({})
  const [selectedScenario, setSelectedScenario] = useState('')
  const [testHabits, setTestHabits] = useState<Habit[]>([])
  const [selectedHabit, setSelectedHabit] = useState('')
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [streakCalculations, setStreakCalculations] = useState<any[]>([])
  const [output, setOutput] = useState<string[]>([])

  const addOutput = (message: string) => {
    setOutput(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    if (session) {
      loadScenarios()
      loadTestHabits()
    }
  }, [session])

  const loadScenarios = async () => {
    try {
      const response = await fetch('/api/debug/test-habits?action=list-scenarios')
      const data = await response.json()
      setScenarios(data.details || {})
      addOutput('Loaded test scenarios')
    } catch (error) {
      addOutput(`Error loading scenarios: ${error}`)
    }
  }

  const loadTestHabits = async () => {
    try {
      const response = await fetch('/api/habits')
      const data = await response.json()
      const testHabits = data.habits?.filter((h: Habit) => h.title.startsWith('Test ')) || []
      setTestHabits(testHabits)
      addOutput(`Found ${testHabits.length} test habits`)
    } catch (error) {
      addOutput(`Error loading habits: ${error}`)
    }
  }

  const setupScenario = async () => {
    if (!selectedScenario) return

    try {
      const response = await fetch(`/api/debug/test-habits?action=setup&scenario=${selectedScenario}`)
      const data = await response.json()
      addOutput(`Set up scenario: ${data.message}`)
      await loadTestHabits()
    } catch (error) {
      addOutput(`Error setting up scenario: ${error}`)
    }
  }

  const simulateToggle = async () => {
    if (!selectedHabit || !testDate) return

    try {
      const response = await fetch(`/api/debug/test-habits?action=simulate-toggle&habitId=${selectedHabit}&date=${testDate}`)
      const data = await response.json()
      
      if (data.details) {
        addOutput(`Toggle result: ${data.details.logAction}`)
        addOutput(`Streak: ${data.details.oldStreak} → ${data.details.newStreak}`)
        addOutput(`Best: ${data.details.oldBestStreak} → ${data.details.newBestStreak}`)
      }
      
      await loadTestHabits()
      await inspectHabit()
    } catch (error) {
      addOutput(`Error simulating toggle: ${error}`)
    }
  }

  const inspectHabit = async () => {
    if (!selectedHabit) return

    try {
      const response = await fetch(`/api/debug/test-habits?action=inspect&habitId=${selectedHabit}&date=${testDate}`)
      const data = await response.json()
      
      setLogs(data.logs || [])
      setStreakCalculations(data.streakCalculations || [])
      addOutput(`Inspected habit: ${data.habit?.title}`)
    } catch (error) {
      addOutput(`Error inspecting habit: ${error}`)
    }
  }

  const quickTest = async (scenario: string, days: number[]) => {
    addOutput(`\n=== Quick Test: ${scenario} ===`)
    
    // Setup scenario
    const setupResp = await fetch(`/api/debug/test-habits?action=setup&scenario=${scenario}`)
    const setupData = await setupResp.json()
    addOutput(`Setup: ${setupData.message}`)
    
    // Reload habits
    await loadTestHabits()
    
    // Get the first test habit
    const habitsResp = await fetch('/api/habits')
    const habitsData = await habitsResp.json()
    const testHabit = habitsData.habits?.find((h: Habit) => h.title.startsWith('Test '))
    
    if (!testHabit) {
      addOutput('No test habit found')
      return
    }

    // Test different days
    for (const dayOffset of days) {
      const testDate = new Date()
      testDate.setDate(testDate.getDate() + dayOffset)
      const dateStr = testDate.toISOString().split('T')[0]
      
      const toggleResp = await fetch(`/api/debug/test-habits?action=simulate-toggle&habitId=${testHabit.id}&date=${dateStr}`)
      const toggleData = await toggleResp.json()
      
      if (toggleData.details) {
        addOutput(`Day ${dayOffset > 0 ? '+' : ''}${dayOffset}: ${toggleData.details.logAction}, Streak: ${toggleData.details.newStreak}`)
      }
    }
    
    addOutput('Quick test completed\n')
  }

  if (!session) {
    return <div className="p-8">Please sign in to access debug tools</div>
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🐛 Habit Debug Tools</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Scenarios</h2>
            <select 
              value={selectedScenario} 
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Select a scenario</option>
              {Object.entries(scenarios).map(([key, scenario]) => (
                <option key={key} value={key}>{scenario.name}</option>
              ))}
            </select>
            <button 
              onClick={setupScenario}
              disabled={!selectedScenario}
              className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-gray-300"
            >
              Setup Scenario
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Manual Testing</h2>
            <select 
              value={selectedHabit} 
              onChange={(e) => setSelectedHabit(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Select a test habit</option>
              {testHabits.map(habit => (
                <option key={habit.id} value={habit.id}>
                  {habit.title} ({habit.frequency}) - Streak: {habit.currentStreak}
                </option>
              ))}
            </select>
            
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            
            <div className="flex gap-2">
              <button 
                onClick={simulateToggle}
                disabled={!selectedHabit}
                className="flex-1 bg-green-500 text-white p-2 rounded disabled:bg-gray-300"
              >
                Toggle Habit
              </button>
              <button 
                onClick={inspectHabit}
                disabled={!selectedHabit}
                className="flex-1 bg-purple-500 text-white p-2 rounded disabled:bg-gray-300"
              >
                Inspect
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Quick Tests</h2>
            <div className="space-y-2">
              <button 
                onClick={() => quickTest('daily-streak', [-1, 0, 1])}
                className="w-full bg-orange-500 text-white p-2 rounded text-sm"
              >
                Test Daily Streak (Yesterday, Today, Tomorrow)
              </button>
              <button 
                onClick={() => quickTest('weekly-sunday', [0])}
                className="w-full bg-red-500 text-white p-2 rounded text-sm"
              >
                Test Weekly Sunday Bug
              </button>
              <button 
                onClick={() => quickTest('production-bug', [0])}
                className="w-full bg-yellow-500 text-white p-2 rounded text-sm"
              >
                Test Production Bug Scenario
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Output Log</h2>
            <div className="bg-gray-100 p-4 rounded h-64 overflow-y-auto text-sm font-mono">
              {output.map((line, i) => (
                <div key={i} className="mb-1">{line}</div>
              ))}
            </div>
            <button 
              onClick={() => setOutput([])}
              className="mt-2 bg-gray-500 text-white px-4 py-1 rounded text-sm"
            >
              Clear Log
            </button>
          </div>

          {logs.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Habit Logs</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {logs.map(log => (
                  <div key={log.id} className={`p-2 rounded text-sm ${log.completed ? 'bg-green-100' : 'bg-red-100'}`}>
                    <span className="font-mono">{log.dateStr}</span>
                    <span className={`ml-2 ${log.completed ? 'text-green-600' : 'text-red-600'}`}>
                      {log.completed ? '✓' : '✗'}
                    </span>
                    {log.updatedDuringToggle && <span className="ml-2 text-blue-600 text-xs">TOGGLED</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {streakCalculations.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Streak Calculations</h2>
              <div className="space-y-1 text-sm">
                {streakCalculations.map((calc, i) => (
                  <div key={i} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>{calc.date} ({calc.dayOfWeek})</span>
                    <span className="font-bold">Streak: {calc.calculatedStreak}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 