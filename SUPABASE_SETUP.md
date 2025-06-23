# Supabase Database Setup for Routinely

This guide will walk you through setting up Supabase as your PostgreSQL database for the Routinely habit tracker.

## Why Supabase?

- **Free Tier**: 500MB database, 50,000 monthly active users
- **PostgreSQL**: Full PostgreSQL compatibility with Prisma
- **Real-time**: Built-in real-time subscriptions (future enhancement)
- **Dashboard**: Easy-to-use database management interface
- **Global CDN**: Fast worldwide performance
- **Automatic Backups**: Built-in backup and restore

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **Start your project**
3. Sign up with GitHub (recommended) or email
4. Verify your email if required

## Step 2: Create New Project

1. Click **New Project**
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `routinely-db` (or your preference)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (perfect for starting)
4. Click **Create new project**

⏳ **Wait 2-3 minutes** for project setup to complete.

## Step 3: Get Database Connection Details

Once your project is ready:

1. Go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Select **URI** tab
4. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## Step 4: Configure Environment Variables

### For Local Development

Update your `.env` file:

```bash
# Replace with your Supabase connection string
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Keep your existing variables
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="7d"
CRON_SECRET="your-cron-secret"
NODE_ENV="development"
```

**Important Notes:**
- Replace `[YOUR-PASSWORD]` with your actual database password
- Replace `[PROJECT-REF]` with your project reference (found in project URL)
- The `?pgbouncer=true&connection_limit=1` parameters optimize for serverless environments

### For Vercel Production

Set these environment variables in Vercel Dashboard:

```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="your-secure-nextauth-secret"
JWT_SECRET="your-secure-jwt-secret"
JWT_EXPIRES_IN="7d"
CRON_SECRET="your-secure-cron-secret"
NODE_ENV="production"
```

## Step 5: Set Up Database Schema

### Option A: Using Prisma Migrate (Recommended)

1. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

2. **Run Database Migration**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Verify Schema**:
   ```bash
   npx prisma studio
   ```

### Option B: Using Supabase Dashboard

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query and paste the schema SQL:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (this matches your Prisma schema)
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "habits" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "frequency" TEXT NOT NULL DEFAULT 'daily',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "habits_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "habit_logs" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "habitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "habit_logs_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
CREATE UNIQUE INDEX "habit_logs_habitId_date_key" ON "habit_logs"("habitId", "date");

-- Add foreign key constraints
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "habits" ADD CONSTRAINT "habits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

3. Click **Run** to execute the schema

## Step 6: Test Database Connection

Test your setup locally:

```bash
# Test database connection
npm run dev

# In another terminal, test the API
curl http://localhost:3000/api/habits
```

## Step 7: Deploy to Vercel

1. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add your Supabase `DATABASE_URL`
   - Add all other required environment variables

2. **Deploy**:
   ```bash
   git add .
   git commit -m "Add Supabase database configuration"
   git push origin main
   ```

3. **Verify Production**:
   - Visit your deployed app
   - Test user registration and habit creation
   - Check that data persists correctly

## Step 8: Supabase Dashboard Features

### Database Management
- **Table Editor**: View and edit data directly
- **SQL Editor**: Run custom queries
- **Database**: Monitor performance and usage

### Monitoring
- **Logs**: View database queries and errors
- **Reports**: Usage statistics and performance metrics

### Security
- **Authentication**: Supabase Auth (optional future enhancement)
- **Row Level Security**: Advanced security policies

## Supabase Free Tier Limits

- **Database Size**: 500 MB
- **Bandwidth**: 5 GB
- **Monthly Active Users**: 50,000
- **API Requests**: 500,000/month
- **Storage**: 1 GB

These limits are very generous for a habit tracking app!

## Performance Optimization

### Connection Pooling
Your connection string already includes `pgbouncer=true` for connection pooling.

### Indexing
The schema includes optimal indexes for:
- User lookups by email
- Habit queries by user
- Log queries by habit and date

### Query Optimization
- Use Supabase's **SQL Editor** to analyze slow queries
- Monitor performance in the **Reports** section

## Backup and Recovery

### Automatic Backups
- Supabase automatically backs up your database
- Point-in-time recovery available on paid plans

### Manual Backup
```bash
# Export data using Prisma
npx prisma db pull
npx prisma db push --preview-feature
```

## Troubleshooting

### Common Issues

**Connection Error**
- Verify password in connection string
- Check project reference ID
- Ensure project is fully initialized

**Migration Fails**
- Check if tables already exist
- Verify Prisma schema matches database
- Use `npx prisma db push` for development

**Performance Issues**
- Monitor connection pool usage
- Check query performance in Supabase dashboard
- Consider upgrading to Pro plan for better performance

### Getting Help

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Community**: [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
- **Discord**: Supabase Discord community

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Configure environment variables
3. ✅ Deploy database schema
4. ✅ Test locally
5. ✅ Deploy to Vercel
6. 🔄 Monitor usage and performance
7. 🚀 Scale as your app grows

Your Routinely app is now powered by Supabase! 🎉

## Future Enhancements

Consider these Supabase features for future development:
- **Real-time subscriptions**: Live habit updates
- **Supabase Auth**: Alternative to NextAuth
- **Edge Functions**: Custom serverless functions
- **Storage**: File uploads for habit photos 