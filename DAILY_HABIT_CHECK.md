# Daily Habit Check System

## Overview

The daily habit check system automatically processes all users' habits at the end of each day to ensure accurate historical tracking. This system creates log entries for habits that weren't manually completed during the day, marking them as incomplete to maintain a complete activity history.

## How It Works

1. **Daily Execution**: The system runs once per day (typically at midnight)
2. **Habit Analysis**: It checks all active habits for all users
3. **Frequency Filtering**: Only processes habits that should be tracked on the current day based on their frequency settings
4. **Log Creation**: Creates `completed: false` entries for habits that don't have any log for the current day
5. **Historical Accuracy**: Ensures the progress calendar shows accurate data for all days

## Supported Frequencies

The system intelligently handles different habit frequencies:

- **Daily**: Tracked every day
- **Weekly**: Tracked on Mondays
- **Monthly**: Tracked on the 1st of each month
- **Weekdays Only**: Monday through Friday
- **Weekends Only**: Saturday and Sunday
- **Specific Days**: Every Monday, Tuesday, etc.
- **Custom Intervals**: Every 2 days, Every 3 days, etc. (calculated from habit creation date)

## API Endpoint

### `POST /api/habits/daily-check`

**Security**: Requires `Authorization: Bearer {CRON_SECRET}` header

**Response Example**:
```json
{
  "message": "Daily habit check completed",
  "processedHabits": 25,
  "createdLogs": 8,
  "date": "2024-01-15T00:00:00.000Z"
}
```

## Setup Instructions

### 1. Environment Variables

Add to your `.env` file:
```env
CRON_SECRET="your-secure-random-string-here"
```

Generate a secure secret:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

### 2. Production Deployment Options

#### Option A: Vercel Cron Jobs (Recommended for Vercel)

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/habits/daily-check",
      "schedule": "0 0 * * *"
    }
  ]
}
```

Note: Vercel cron jobs automatically include the correct authorization headers.

#### Option B: External Cron Service

Use services like:
- **Cron-job.org**
- **EasyCron**
- **GitHub Actions**

Example cURL command:
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  https://yourdomain.com/api/habits/daily-check
```

#### Option C: Server Cron (Self-hosted)

Add to your server's crontab:
```bash
# Run daily at midnight
0 0 * * * curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://yourdomain.com/api/habits/daily-check
```

#### Option D: GitHub Actions

Create `.github/workflows/daily-check.yml`:
```yaml
name: Daily Habit Check
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  daily-check:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Daily Check
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json" \
            ${{ secrets.APP_URL }}/api/habits/daily-check
```

Add secrets in GitHub repository settings:
- `CRON_SECRET`: Your cron secret
- `APP_URL`: Your application URL

### 3. Testing

Run the test script locally:
```bash
# Ensure your .env file has CRON_SECRET set
npm install node-fetch  # If not already installed
node scripts/test-daily-check.js
```

Or test manually:
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  http://localhost:3000/api/habits/daily-check
```

## Important Considerations

### Timezone Handling

- The system uses UTC for consistency
- Consider your users' timezones when scheduling
- You may want to run the job slightly after midnight to account for any late activity

### Performance

- The endpoint processes all active habits in the database
- Consider adding pagination for very large user bases
- Monitor execution time and add timeouts if needed

### Error Handling

- Failed executions won't break existing functionality
- Users can still manually mark habits as complete
- Consider setting up monitoring/alerting for failed runs

### Data Integrity

- The system only creates missing log entries
- Existing logs (completed or incomplete) are never modified
- Manual user actions always take precedence

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check `CRON_SECRET` environment variable
   - Verify the Authorization header format

2. **500 Internal Server Error**
   - Check database connectivity
   - Review server logs for specific errors

3. **No logs created**
   - Verify habits exist and are active
   - Check if logs already exist for the day
   - Confirm frequency settings match the current day

### Debugging

Enable detailed logging by checking the API response and server logs. The endpoint returns useful statistics about processed habits and created logs.

## Future Enhancements

Potential improvements:
- Timezone-aware scheduling per user
- Configurable grace periods before marking incomplete
- Batch processing for large datasets
- Retry logic for failed executions
- Email notifications for streak breaks 