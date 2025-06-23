'use client'

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { theme } from '@/styles/theme'
import Button from '@/components/ui/Button'
import { X, Target, TrendingUp, Calendar, Heart, Book, Coffee, Clock, Plus, DollarSign } from 'lucide-react'

interface CreateHabitModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (habit: { title: string; category: string; frequency: string }) => void
  editingHabit?: any
}

const Overlay = styled.div`
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

const Modal = styled.div`
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[10]};
  max-width: 480px;
  width: 100%;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.08);
  animation: zenSlideIn 0.4s ease-out;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[8]};
    max-width: 100%;
    border-radius: ${theme.borderRadius.lg};
    max-height: 85vh;
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[6]};
  position: relative;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-bottom: ${theme.spacing[4]};
  }
`

const Title = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.lg};
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: ${theme.spacing[4]};
  right: ${theme.spacing[4]};
  background: none;
  border: none;
  color: ${theme.colors.text.disabled};
  cursor: pointer;
  padding: ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
  transition: all ${theme.transitions.normal};
  min-height: 44px;
  min-width: 44px;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    top: ${theme.spacing[3]};
    right: ${theme.spacing[3]};
  }
  
  &:hover {
    color: ${theme.colors.text.secondary};
    background-color: ${theme.colors.gray[50]};
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
  margin-top: ${theme.spacing[4]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    gap: ${theme.spacing[5]};
    margin-top: ${theme.spacing[3]};
  }
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    gap: ${theme.spacing[1]};
  }
`

const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.normal};
  letter-spacing: 0.01em;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.xs};
  }
`

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing[4]} ${theme.spacing[5]};
  border: none;
  border-bottom: 1px solid ${theme.colors.gray[200]};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  background-color: transparent;
  transition: all ${theme.transitions.normal};
  min-height: 48px;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 52px;
  }
  
  &:focus {
    outline: none;
    border-bottom-color: ${theme.colors.primary[400]};
    background-color: ${theme.colors.primary[50]};
  }
  
  &::placeholder {
    color: ${theme.colors.text.disabled};
    font-weight: ${theme.typography.fontWeight.normal};
  }
`

const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing[4]} ${theme.spacing[5]};
  border: none;
  border-bottom: 1px solid ${theme.colors.gray[200]};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  background-color: transparent;
  transition: all ${theme.transitions.normal};
  min-height: 48px;
  cursor: pointer;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 52px;
  }
  
  &:focus {
    outline: none;
    border-bottom-color: ${theme.colors.primary[400]};
    background-color: ${theme.colors.primary[50]};
  }
  
  option {
    background-color: ${theme.colors.background};
    color: ${theme.colors.text.primary};
  }
`

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${theme.spacing[3]};
  margin-top: ${theme.spacing[2]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: ${theme.spacing[2]};
  }
`

const CategoryButton = styled.button<{ selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${props => props.selected ? theme.colors.primary[300] : theme.colors.gray[200]};
  background-color: ${props => props.selected ? theme.colors.primary[50] : 'transparent'};
  color: ${props => props.selected ? theme.colors.primary[700] : theme.colors.text.secondary};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.normal};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  min-height: 72px;
  text-align: center;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    font-size: ${theme.typography.fontSize.xs};
    min-height: 64px;
    gap: ${theme.spacing[1]};
  }
  
  &:hover {
    border-color: ${theme.colors.primary[400]};
    background-color: ${theme.colors.primary[25]};
    color: ${theme.colors.primary[600]};
  }
  
  svg {
    opacity: ${props => props.selected ? 1 : 0.5};
    transition: opacity ${theme.transitions.normal};
  }
  
  &:hover svg {
    opacity: 1;
  }
`

const SuggestionsTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.base};
    margin-bottom: ${theme.spacing[3]};
  }
`

const SuggestionsGrid = styled.div`
  display: grid;
  gap: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[6]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    gap: ${theme.spacing[1]};
    margin-bottom: ${theme.spacing[4]};
  }
`

const SuggestionButton = styled.button<{ selected: boolean }>`
  text-align: left;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${props => props.selected ? theme.colors.primary[300] : theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.md};
  background-color: ${props => props.selected ? theme.colors.primary[50] : 'transparent'};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  min-height: 48px;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    min-height: 44px;
  }
  
  &:hover {
    border-color: ${theme.colors.primary[400]};
    background-color: ${theme.colors.primary[25]};
  }
`

const SuggestionText = styled.span<{ selected: boolean }>`
  color: ${props => props.selected ? theme.colors.primary[700] : theme.colors.text.primary};
  font-weight: ${props => props.selected ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal};
  font-size: ${theme.typography.fontSize.sm};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize.xs};
  }
`

const FrequencyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: ${theme.spacing[3]};
  margin-top: ${theme.spacing[2]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: ${theme.spacing[2]};
  }
`

const FrequencyButton = styled.button<{ selected: boolean }>`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${props => props.selected ? theme.colors.primary[300] : theme.colors.gray[200]};
  background-color: ${props => props.selected ? theme.colors.primary[50] : 'transparent'};
  color: ${props => props.selected ? theme.colors.primary[700] : theme.colors.text.secondary};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.normal};
  cursor: pointer;
  transition: all ${theme.transitions.normal};
  min-height: 48px;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    font-size: ${theme.typography.fontSize.xs};
    min-height: 44px;
  }
  
  &:hover {
    border-color: ${theme.colors.primary[400]};
    background-color: ${theme.colors.primary[25]};
    color: ${theme.colors.primary[600]};
  }
`

const CustomHabitInput = styled.div`
  margin-top: ${theme.spacing[4]};
  animation: zenFadeIn 0.3s ease-out;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    margin-top: ${theme.spacing[3]};
  }
`

const CreateButton = styled.button`
  width: 100%;
  background-color: ${theme.colors.primary[500]};
  border: none;
  color: white;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  padding: ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.lg};
  transition: all ${theme.transitions.normal};
  margin-top: ${theme.spacing[6]};
  min-height: 48px;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[3]};
    font-size: 16px; /* Prevents zoom on iOS */
    min-height: 52px;
    margin-top: ${theme.spacing[4]};
  }
  
  &:hover {
    background-color: ${theme.colors.primary[600]};
    transform: translateY(-1px);
    box-shadow: 0 4px 16px ${theme.colors.primary[200]};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: ${theme.colors.gray[200]};
    color: ${theme.colors.text.disabled};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`

const CustomHabitButton = styled.button`
  width: 100%;
  background: none;
  border: 1px solid ${theme.colors.gray[200]};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.normal};
  cursor: pointer;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.lg};
  transition: all ${theme.transitions.normal};
  min-height: 48px;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    font-size: ${theme.typography.fontSize.xs};
    min-height: 44px;
  }
  
  &:hover {
    border-color: ${theme.colors.primary[300]};
    background-color: ${theme.colors.primary[25]};
    color: ${theme.colors.primary[600]};
  }
`

const categories = [
  { id: 'fitness', name: 'Fitness', icon: TrendingUp },
  { id: 'productivity', name: 'Productivity', icon: Target },
  { id: 'wellness', name: 'Wellness', icon: Heart },
  { id: 'learning', name: 'Learning', icon: Book },
  { id: 'finance', name: 'Finance', icon: DollarSign },
  { id: 'other', name: 'Other', icon: Plus },
]

const suggestions = {
  fitness: [
    'Exercise for 30 minutes',
    'Take 10,000 steps',
    'Do 20 push-ups',
    'Stretch for 10 minutes',
    'Go for a walk',
  ],
  productivity: [
    'Read for 30 minutes',
    'Write in journal',
    'Plan tomorrow',
    'Declutter workspace',
    'Review goals',
  ],
  wellness: [
    'Drink 8 glasses of water',
    'Meditate for 10 minutes',
    'Get 8 hours of sleep',
    'Take vitamins',
    'Practice gratitude',
  ],
  learning: [
    'Learn something new',
    'Practice a skill',
    'Read a book chapter',
    'Watch educational video',
    'Study for 30 minutes',
  ],
  finance: [
    'Track expenses',
    'Save $10',
    'Review budget',
    'Check bank balance',
    'Read financial news',
  ],
  other: [
    'Call a friend',
    'Cook a meal',
    'Listen to music',
    'Take photos',
    'Write a letter',
  ],
}

const customFrequencyOptions = [
  'Every 2 days',
  'Every 3 days', 
  'Every 4 days',
  'Every 5 days',
  'Weekdays only',
  'Weekends only',
  'Every Monday',
  'Every Friday'
]

export default function CreateHabitModal({ isOpen, onClose, onSave, editingHabit }: CreateHabitModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedHabit, setSelectedHabit] = useState<string>('')
  const [selectedFrequency, setSelectedFrequency] = useState<string>('daily')
  const [selectedCustomFrequency, setSelectedCustomFrequency] = useState<string>('')
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false)
  const [customHabitText, setCustomHabitText] = useState<string>('')

  useEffect(() => {
    if (editingHabit) {
      setSelectedCategory(editingHabit.category)
      setSelectedHabit(editingHabit.title)
      
      const isCustom = !['daily', 'weekly', 'monthly'].includes(editingHabit.frequency)
      if (isCustom) {
        setSelectedFrequency('custom')
        setSelectedCustomFrequency(editingHabit.frequency)
      } else {
        setSelectedFrequency(editingHabit.frequency)
        setSelectedCustomFrequency('')
      }
    } else {
      setSelectedCategory('')
      setSelectedHabit('')
      setSelectedFrequency('daily')
      setSelectedCustomFrequency('')
      setShowCustomInput(false)
      setCustomHabitText('')
    }
  }, [editingHabit, isOpen])

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setSelectedHabit('')
    setShowCustomInput(false)
    setCustomHabitText('')
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setSelectedHabit(suggestion)
    setShowCustomInput(false)
    setCustomHabitText('')
  }

  const handleFrequencySelect = (frequency: string) => {
    setSelectedFrequency(frequency)
    if (frequency !== 'custom') {
      setSelectedCustomFrequency('')
    }
  }

  const handleCustomFrequencySelect = (customFreq: string) => {
    setSelectedCustomFrequency(customFreq)
  }

  const handleCustomHabit = () => {
    setShowCustomInput(true)
    setSelectedHabit('')
  }

  const handleCustomHabitInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomHabitText(value)
    setSelectedHabit(value)
  }

  const handleSave = () => {
    if (selectedHabit) {
      const frequency = selectedFrequency === 'custom' ? selectedCustomFrequency : selectedFrequency
      onSave({
        title: selectedHabit,
        category: selectedCategory,
        frequency: frequency,
      })
      onClose()
      setSelectedCategory('')
      setSelectedHabit('')
      setSelectedFrequency('daily')
      setSelectedCustomFrequency('')
      setShowCustomInput(false)
      setCustomHabitText('')
    }
  }

  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{editingHabit ? 'Edit Habit' : 'Create New Habit'}</Title>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Form>
          <Label>Select a category</Label>
          <CategoryGrid>
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <CategoryButton
                  key={category.id}
                  selected={selectedCategory === category.id}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleCategorySelect(category.id)
                  }}
                >
                  <Icon size={24} />
                  {category.name}
                </CategoryButton>
              )
            })}
          </CategoryGrid>

          {selectedCategory && (
            <>
              <SuggestionsTitle>
                Popular {categories.find(c => c.id === selectedCategory)?.name} Habits
              </SuggestionsTitle>
              <SuggestionsGrid>
                {suggestions[selectedCategory as keyof typeof suggestions]?.map((suggestion) => (
                  <SuggestionButton
                    key={suggestion}
                    selected={selectedHabit === suggestion}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleSuggestionSelect(suggestion)
                    }}
                  >
                    <SuggestionText selected={selectedHabit === suggestion}>{suggestion}</SuggestionText>
                  </SuggestionButton>
                ))}
              </SuggestionsGrid>
              {!showCustomInput ? (
                <CustomHabitButton onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleCustomHabit()
                }}>
                  + Add custom habit
                </CustomHabitButton>
              ) : (
                <CustomHabitInput>
                  <Input
                    type="text"
                    placeholder="Type your custom habit..."
                    value={customHabitText}
                    onChange={handleCustomHabitInput}
                    autoFocus
                  />
                </CustomHabitInput>
              )}
            </>
          )}

          <InputGroup>
            <Label>Frequency</Label>
            <Select value={selectedFrequency} onChange={(e) => handleFrequencySelect(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </Select>
          </InputGroup>

          {selectedFrequency === 'custom' && (
            <InputGroup>
              <Label>Custom Frequency</Label>
              <Select value={selectedCustomFrequency} onChange={(e) => handleCustomFrequencySelect(e.target.value)}>
                {customFrequencyOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Select>
            </InputGroup>
          )}
        </Form>

        <CreateButton 
          onClick={handleSave}
          disabled={!selectedHabit || (selectedFrequency === 'custom' && !selectedCustomFrequency)}
        >
          {editingHabit ? 'Update Habit' : 'Create Habit'}
        </CreateButton>
      </Modal>
    </Overlay>
  )
} 