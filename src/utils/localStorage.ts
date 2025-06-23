// Utility functions for localStorage management

const STORAGE_KEYS = {
  HABITS: 'routinely-habits',
  USER_PREFERENCES: 'routinely-preferences',
  THEME: 'routinely-theme',
} as const

export const clearAllAppData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
  console.log('All app localStorage data cleared')
}

export const clearHabitsData = () => {
  localStorage.removeItem(STORAGE_KEYS.HABITS)
  console.log('Habits localStorage data cleared')
}

export const getHabitsData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HABITS)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Error parsing habits data from localStorage:', error)
    return null
  }
}

export const setHabitsData = (habits: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits))
  } catch (error) {
    console.error('Error saving habits data to localStorage:', error)
  }
}

export const hasGuestData = () => {
  const habitsData = getHabitsData()
  return habitsData && Array.isArray(habitsData) && habitsData.length > 0
} 