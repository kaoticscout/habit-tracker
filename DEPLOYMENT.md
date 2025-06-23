# Deploying Routinely to Vercel

This guide will walk you through deploying your Routinely habit tracker to Vercel with a PostgreSQL database.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Database**: You'll need a PostgreSQL database (we recommend Supabase - see detailed setup below)

## Step 1: Prepare Your Database

### Option A: Supabase (Recommended) 🌟

**Why Supabase?**
- Free tier with 500MB database and 50,000 monthly active users
- Excellent PostgreSQL compatibility with Prisma
- Easy-to-use dashboard and built-in monitoring
- Automatic backups and global CDN

**📖 Detailed Setup Guide**: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete step-by-step instructions.

**Quick Setup:**
1. Create account at [supabase.com](https://supabase.com)
2. Create new project with strong password
3. Get connection string from Settings → Database
4. Use format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1`

### Option B: Vercel Postgres

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to the **Storage** tab
3. Click **Create Database** → **Postgres**
4. Name your database (e.g., `routinely-db`)
5. Select your region and click **Create**

### Option C: Other PostgreSQL Providers

You can use any PostgreSQL provider like:
- **Neon** (free tier available)
- **Railway** (free tier available)
- **AWS RDS**
- **Digital Ocean**

## Step 2: Environment Variables

You'll need to set up these environment variables in Vercel:

### Required Variables

```bash
# Database (Supabase example)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Authentication (CRITICAL - update URL after deployment)
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="your-secure-nextauth-secret"

# JWT (for additional security)
JWT_SECRET="your-secure-jwt-secret"
JWT_EXPIRES_IN="7d"

# Daily Habit Check Cron
CRON_SECRET="your-secure-cron-secret"

# Environment
NODE_ENV="production"
```

### Generate Secure Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET  
openssl rand -hex 32

# Generate CRON_SECRET
openssl rand -hex 32
```

## Step 3: Deploy to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Framework Preset**: Next.js (should auto-detect)
4. **Root Directory**: `.` (default)
5. **Build Command**: `npm run build` (default)
6. **Output Directory**: `.next` (default)
7. Click **Deploy**

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No  
# - Project name? routinely (or your choice)
# - Directory? ./
# - Override settings? No
```

## Step 4: Configure Environment Variables in Vercel

1. Go to your project in the Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add all the required variables listed above
4. For **DATABASE_URL**: 
   - If using Supabase, copy from your project settings (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
   - If using Vercel Postgres, copy from your database settings
   - If using external provider, copy their connection string

## Step 5: Set Up Database Schema

After deployment, you need to initialize your database:

### For Supabase Users

Follow the detailed schema setup in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - includes both Prisma migration and manual SQL options.

### For Other Databases

#### Option A: Using Vercel Console

1. Go to your project dashboard
2. Click **Functions** tab
3. Find any API route and click to see logs
4. Or use the Vercel CLI:

```bash
vercel env pull .env.local
npm run db:migrate
```

#### Option B: Direct Database Connection

If you have database access, run these commands locally with production DATABASE_URL:

```bash
# Set production DATABASE_URL in .env.local temporarily
npx prisma migrate deploy
npx prisma generate
```

## Step 6: Verify Deployment

1. **Visit Your App**: Go to `https://your-app-name.vercel.app`
2. **Test Sign Up**: Create a new account
3. **Test Habits**: Create and toggle habits
4. **Check Cron**: The daily habit check will run automatically at midnight UTC

## Step 7: Configure Custom Domain (Optional)

1. In Vercel Dashboard → **Settings** → **Domains**
2. Add your custom domain
3. Update `NEXTAUTH_URL` environment variable to your custom domain
4. Redeploy the application

## Troubleshooting

### Common Issues

**1. Database Connection Error**
- **Supabase**: Verify password and project reference in connection string
- **General**: Ensure database allows external connections
- Check SSL requirements (`?sslmode=require` or `?pgbouncer=true`)

**2. NextAuth Configuration Error**
- Verify `NEXTAUTH_URL` matches your deployment URL
- Ensure `NEXTAUTH_SECRET` is set and secure
- Check that URL doesn't have trailing slash

**3. Build Errors**
- Check the build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript types are correct

**4. Prisma/Database Issues**
- Run `npx prisma generate` locally and commit
- Ensure database schema is migrated
- Check Prisma logs in function logs
- **Supabase**: Use the dashboard's SQL Editor to verify schema

**5. Environment Variables Not Loading**
- Verify all required env vars are set in Vercel
- Check variable names exactly match
- Redeploy after adding new environment variables

### Checking Logs

1. **Function Logs**: Vercel Dashboard → Functions → Click any function
2. **Build Logs**: Vercel Dashboard → Deployments → Click deployment
3. **Real-time Logs**: Use `vercel logs` CLI command
4. **Supabase Logs**: Check database logs in Supabase dashboard

## Daily Habit Check Verification

Your daily habit check should automatically work with Vercel Cron:

1. Check **Functions** tab in Vercel Dashboard
2. Look for `/api/habits/daily-check` executions
3. View logs to confirm successful runs
4. Test manually: `curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-app.vercel.app/api/habits/daily-check`

## Performance Tips

1. **Database Indexing**: Your schema includes optimal indexes
2. **Connection Pooling**: Supabase includes pgBouncer for connection pooling
3. **Caching**: Consider implementing Redis caching for frequent queries
4. **Monitoring**: Set up monitoring with Vercel Analytics and Supabase dashboard

## Security Checklist

- ✅ All secrets are generated securely and unique
- ✅ Environment variables are set in Vercel (not in code)
- ✅ Database connection uses SSL/pgBouncer
- ✅ NEXTAUTH_URL matches your actual domain
- ✅ `.env` files are in `.gitignore`

## Post-Deployment

1. **Monitor Performance**: Check Vercel Analytics and Supabase dashboard
2. **Set Up Monitoring**: Consider error tracking (Sentry, etc.)
3. **Backup Strategy**: Supabase includes automatic backups
4. **Domain SSL**: Verify SSL certificate is active
5. **Test All Features**: Registration, habits, calendar, daily check

## Database-Specific Resources

- **Supabase**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Complete setup guide
- **Vercel Postgres**: [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- **General**: [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

Your Routinely app should now be live and fully functional on Vercel! 🎉 