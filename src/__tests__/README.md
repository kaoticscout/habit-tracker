# Habit Tracker Test Suite

This directory contains comprehensive unit and integration tests for the habit tracking logic, specifically focusing on the complex timezone and streak calculation issues that were resolved.

## Test Files

### `habitCalculations.test.ts` - Frontend Logic Tests (18 tests)
Tests the frontend habit calculation logic that determines whether habits are completed for display purposes.

**Key Coverage:**
- **Weekly Boundary Calculations**: Ensures Monday-Sunday week definition works correctly across all days
- **Sunday Edge Case**: Specifically tests the critical bug where Sunday calculations were incorrect
- **Timezone Handling**: Tests handling of UTC vs local timezone differences
- **Production Bug Scenario**: Recreates the exact scenario from production logs
- **Date String Comparisons**: Tests the fix using `split('T')[0]` for timezone-agnostic comparisons

**Critical Test:** "should handle the critical Sunday edge case" - validates the fix for `dayOfWeek === 0 ? 6 : dayOfWeek - 1`

### `streakCalculation.test.ts` - Server-Side Logic Tests (22 tests)
Tests the server-side streak calculation algorithms that run in the toggle API.

**Key Coverage:**
- **Daily Streak Logic**: Consecutive day counting with proper gap handling
- **Weekly Streak Logic**: Consecutive week counting with Monday-Sunday boundaries
- **The Critical Bug**: Tests the fix where unchecked habits return `0` instead of finding previous completed days
- **Timezone Mixing**: Tests scenarios with logs in different timezone formats
- **Edge Cases**: Month/year boundaries, DST transitions

**Critical Tests:**
- "should return 0 when habit is unchecked (the bug we fixed)" - validates the main streak bug fix
- "should correctly handle Sunday when dayOfWeek is 0" - validates the Sunday calculation fix

### `toggleApiIntegration.test.ts` - End-to-End Integration Tests (13 tests)
Simulates the complete toggle API workflow including state management and immediate streak updates.

**Key Coverage:**
- **Complete Toggle Flow**: Check → streak calculation → state update
- **Multiple Toggles**: Check → uncheck → check again scenarios
- **Weekly vs Daily**: Both habit types with different calculation logic
- **Production Scenarios**: Real scenarios that failed in production
- **State Preservation**: Ensures `updatedDuringToggle` flags and best streaks are handled correctly

**Critical Tests:**
- "should handle the production bug scenario with mixed timezone logs" - validates the complete fix
- "should uncheck weekly habit and reset streak" - ensures weekly unchecking works correctly

## Bug Fixes Validated

### 1. Timezone Issues
- **Problem**: Server calculated dates in UTC, frontend expected local timezone
- **Fix**: Client sends `today.toISOString()` in request body
- **Tests**: All files test timezone mixing scenarios

### 2. Sunday Week Calculation Bug
- **Problem**: `today.getDate() - today.getDay() + 1` put Sunday in next week
- **Fix**: `dayOfWeek === 0 ? 6 : dayOfWeek - 1`
- **Tests**: `habitCalculations.test.ts` "critical Sunday edge case"

### 3. Streak Calculation Bug
- **Problem**: Unchecking returned streak of "most recent completed day" instead of 0
- **Fix**: Check if target date is completed FIRST, return 0 if not
- **Tests**: `streakCalculation.test.ts` "should return 0 when habit is unchecked"

### 4. Date Comparison Issues
- **Problem**: Timezone-sensitive Date object comparisons failed
- **Fix**: String-based comparison using `date.toISOString().split('T')[0]`
- **Tests**: All files use this pattern extensively

### 5. Weekly Boundary Overlaps
- **Problem**: Days could be counted in multiple weeks due to timezone boundaries
- **Fix**: Clean date arithmetic using `new Date(year, month, day)` construction
- **Tests**: Integration tests validate no double-counting

## Running the Tests

```bash
# Run all tests
npm test -- src/__tests__

# Run specific test file
npm test -- src/__tests__/habitCalculations.test.ts
npm test -- src/__tests__/streakCalculation.test.ts
npm test -- src/__tests__/toggleApiIntegration.test.ts

# Run with verbose output
npm test -- src/__tests__ --verbose
```

## Test Architecture

The tests are structured in three layers:

1. **Unit Tests** (`habitCalculations.test.ts`, `streakCalculation.test.ts`): Test individual calculation functions in isolation
2. **Integration Tests** (`toggleApiIntegration.test.ts`): Test the complete workflow with a simulated API
3. **Edge Case Coverage**: Each file includes boundary conditions, timezone variations, and production scenarios

This comprehensive test suite ensures that the complex habit tracking logic works correctly across different timezones, habit frequencies, and edge cases that previously caused production issues. 