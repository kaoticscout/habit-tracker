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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${theme.spacing[4]};
`

const Modal = styled.div`
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  max-width: 500px;
  width: 100%;
  box-shadow: ${theme.shadows.xl};
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[6]};
`

const Title = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  padding: ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.base};
  
  &:hover {
    background-color: ${theme.colors.gray[100]};
  }
`

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing[3]};
  margin-bottom: ${theme.spacing[6]};
`

const CategoryButton = styled.button<{ $selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${theme.spacing[4]};
  border: 2px solid ${({ $selected }) => $selected ? theme.colors.primary[500] : theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${({ $selected }) => $selected ? theme.colors.primary[50] : theme.colors.background};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    border-color: ${theme.colors.primary[400]};
    background-color: ${theme.colors.primary[50]};
  }
`

const CategoryIcon = styled.div`
  color: ${theme.colors.primary[600]};
  margin-bottom: ${theme.spacing[2]};
`

const CategoryName = styled.span`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
`

const SuggestionsTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
`

const SuggestionsGrid = styled.div`
  display: grid;
  gap: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[6]};
`

const SuggestionButton = styled.button`
  text-align: left;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.background};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    border-color: ${theme.colors.primary[300]};
    background-color: ${theme.colors.primary[50]};
  }
`

const SuggestionText = styled.span`
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.base};
`

const CustomHabitInput = styled.input`
  width: 100%;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  background-color: ${theme.colors.background};
  margin-bottom: ${theme.spacing[4]};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
  }
  
  &::placeholder {
    color: ${theme.colors.text.disabled};
  }
`

const Actions = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  justify-content: flex-end;
`

const FrequencySection = styled.div`
  margin-bottom: ${theme.spacing[6]};
`

const FrequencyTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
`

const FrequencyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing[3]};
`

const FrequencyButton = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 2px solid ${({ $selected }) => $selected ? theme.colors.primary[500] : theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.md};
  background-color: ${({ $selected }) => $selected ? theme.colors.primary[50] : theme.colors.background};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    border-color: ${theme.colors.primary[400]};
    background-color: ${theme.colors.primary[50]};
  }
`

const FrequencyText = styled.span`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
`

const CustomFrequencyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing[2]};
  margin-top: ${theme.spacing[3]};
`

const CustomFrequencyButton = styled.button<{ $selected: boolean }>`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border: 1px solid ${({ $selected }) => $selected ? theme.colors.primary[500] : theme.colors.gray[200]};
  border-radius: ${theme.borderRadius.sm};
  background-color: ${({ $selected }) => $selected ? theme.colors.primary[50] : theme.colors.background};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
  
  &:hover {
    border-color: ${theme.colors.primary[400]};
    background-color: ${theme.colors.primary[50]};
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

        <CategoryGrid>
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <CategoryButton
                key={category.id}
                $selected={selectedCategory === category.id}
                onClick={() => handleCategorySelect(category.id)}
              >
                <CategoryIcon>
                  <Icon size={24} />
                </CategoryIcon>
                <CategoryName>{category.name}</CategoryName>
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
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  <SuggestionText>{suggestion}</SuggestionText>
                </SuggestionButton>
              ))}
            </SuggestionsGrid>

            {!showCustomInput ? (
              <Button $variant="ghost" $fullWidth onClick={handleCustomHabit}>
                + Add custom habit
              </Button>
            ) : (
              <CustomHabitInput
                type="text"
                placeholder="Type your custom habit..."
                value={customHabitText}
                onChange={handleCustomHabitInput}
                autoFocus
              />
            )}

            <FrequencySection>
              <FrequencyTitle>How often?</FrequencyTitle>
              <FrequencyGrid>
                <FrequencyButton
                  $selected={selectedFrequency === 'daily'}
                  onClick={() => handleFrequencySelect('daily')}
                >
                  <Clock size={16} />
                  <FrequencyText>Daily</FrequencyText>
                </FrequencyButton>
                <FrequencyButton
                  $selected={selectedFrequency === 'weekly'}
                  onClick={() => handleFrequencySelect('weekly')}
                >
                  <Calendar size={16} />
                  <FrequencyText>Weekly</FrequencyText>
                </FrequencyButton>
                <FrequencyButton
                  $selected={selectedFrequency === 'monthly'}
                  onClick={() => handleFrequencySelect('monthly')}
                >
                  <Calendar size={16} />
                  <FrequencyText>Monthly</FrequencyText>
                </FrequencyButton>
                <FrequencyButton
                  $selected={selectedFrequency === 'custom'}
                  onClick={() => handleFrequencySelect('custom')}
                >
                  <Target size={16} />
                  <FrequencyText>Custom</FrequencyText>
                </FrequencyButton>
              </FrequencyGrid>
              
              {selectedFrequency === 'custom' && (
                <CustomFrequencyGrid>
                  {customFrequencyOptions.map((option) => (
                    <CustomFrequencyButton
                      key={option}
                      $selected={selectedCustomFrequency === option}
                      onClick={() => handleCustomFrequencySelect(option)}
                    >
                      {option}
                    </CustomFrequencyButton>
                  ))}
                </CustomFrequencyGrid>
              )}
            </FrequencySection>
          </>
        )}

        <Actions>
          <Button $variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!selectedHabit || (selectedFrequency === 'custom' && !selectedCustomFrequency)}
          >
            {editingHabit ? 'Update Habit' : 'Create Habit'}
          </Button>
        </Actions>
      </Modal>
    </Overlay>
  )
} 