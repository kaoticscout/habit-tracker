# Immediate Streak Updates

## 🎯 **Feature Overview**

This feature enables immediate streak value updates when users check/uncheck habits, providing instant feedback without waiting for the daily reset. The implementation prevents double counting during daily resets while maintaining data consistency.

---

## 🚀 **How It Works**

### **Immediate Updates**
When a user toggles a habit:
1. ✅ **Log Creation/Update**: Creates or updates the habit log for today
2. ✅ **Streak Calculation**: Immediately calculates new current and best streak values
3. ✅ **Database Update**: Updates the habit's streak values in the database
4. ✅ **UI Update**: Returns new streak values to the frontend for instant display
5. ✅ **Flag Setting**: Marks the log with `updatedDuringToggle: true`

### **Daily Reset Integration**
During daily reset:
1. ✅ **Flag Check**: Checks if habit log has `updatedDuringToggle: true`
2. ✅ **Skip Processing**: Skips streak calculation for flagged habits
3. ✅ **Flag Clearing**: Clears the `updatedDuringToggle` flag
4. ✅ **Normal Processing**: Continues with regular reset logic for unflagged habits

---

## 🛠 **Implementation Details**

### **Database Changes**
```sql
-- Added new field to HabitLog model
ALTER TABLE habit_logs ADD COLUMN "updatedDuringToggle" BOOLEAN DEFAULT false;
```

### **API Changes**

#### **Toggle Endpoint (`/api/habits/[id]/toggle`)**
- **Before**: Only updated logs
- **After**: 
  - Updates logs with `updatedDuringToggle: true`
  - Calculates and updates streaks immediately
  - Returns streak values in response

#### **Daily Reset Endpoint (`/api/habits/daily-reset`)**
- **Before**: Processed all habits
- **After**: 
  - Skips habits with `updatedDuringToggle: true` 
  - Clears the flag after checking
  - Continues normal processing for other habits

### **Frontend Changes**

#### **useHabits Hook**
- **Before**: Calculated streaks client-side after toggle
- **After**: Uses streak values returned from toggle API

---

## 📊 **Streak Calculation Logic**

### **Daily Habits**
```javascript
// Current streak calculation
if (todayIsCompleted) {
  currentStreak = 1 + consecutiveDaysBackward
} else {
  currentStreak = 0
}

// Best streak calculation
bestStreak = Math.max(currentBestStreak, longestStreakInHistory)
```

### **Weekly Habits**
```javascript
// Current streak calculation
if (thisWeekHasCompletedLogs) {
  currentStreak = 1 + consecutiveWeeksBackward
} else {
  currentStreak = 0
}
```

---

## 🔒 **Data Consistency**

### **Race Condition Prevention**
- Uses `updatedDuringToggle` flag to prevent double counting
- Daily reset respects toggle updates made during the same day
- Flag is cleared after daily reset processing

### **Rollback Safety**
- Toggle operations are atomic (log + streak update)
- Failed streak updates don't affect log creation
- Daily reset can recover from any inconsistencies

---

## 🧪 **Testing**

### **Test Coverage**
- ✅ Immediate streak calculation accuracy
- ✅ Double counting prevention 
- ✅ Daily reset skip logic
- ✅ Flag clearing mechanism
- ✅ Frontend integration

### **Test Scenarios**
1. **First completion**: Streak goes from 0 → 1
2. **Consecutive days**: Streak increments properly
3. **Breaking streak**: Unchecking resets current streak
4. **Best streak preservation**: Best streak never decreases
5. **Daily reset integration**: Flagged habits are skipped

---

## 🎉 **Benefits**

- ✅ **Instant Feedback**: Users see streak changes immediately
- ✅ **Better UX**: No waiting for daily reset to see progress
- ✅ **Data Consistency**: Prevents double counting
- ✅ **Backward Compatible**: Existing habits continue to work
- ✅ **Performance**: Efficient flag-based skipping

---

## 🔧 **Migration Notes**

### **Database Migration**
```bash
npx prisma migrate dev --name add-updated-during-toggle-field
```

### **No Breaking Changes**
- Existing functionality remains unchanged
- Daily reset still works for habits not toggled during the day
- Frontend gracefully handles missing streak values

---

## 📝 **Usage Example**

```javascript
// User clicks habit checkbox
const response = await fetch(`/api/habits/${habitId}/toggle`, {
  method: 'POST'
})

const result = await response.json()
// result.currentStreak - immediately updated
// result.bestStreak - immediately updated
// result.completed - new completion status

// Daily reset later that day will skip this habit
// because result.updatedDuringToggle === true
``` 