# Vercel Deployment Troubleshooting

This guide helps resolve common deployment issues when deploying Routinely to Vercel.

## 🚨 Common Build Errors

### 1. NextAuth Build Error

**Error Message:**
```
Build error occurred
Error: Failed to collect page data for /api/auth/[...nextauth]
```

**Root Cause:** NextAuth trying to connect to database during build without environment variables.

**✅ Solution:**

1. **Set Environment Variables BEFORE Building:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add ALL required variables (see list below)
   - **Important:** Set for all environments (Production, Preview, Development)

2. **Required Environment Variables:**
   ```bash
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
   NEXTAUTH_URL="https://your-app-name.vercel.app"
   NEXTAUTH_SECRET="your-secure-nextauth-secret"
   JWT_SECRET="your-secure-jwt-secret"
   JWT_EXPIRES_IN="7d"
   CRON_SECRET="your-secure-cron-secret"
   NODE_ENV="production"
   ```

3. **Redeploy After Setting Variables:**
   - After adding environment variables, trigger a new deployment
   - Go to Deployments tab → Click "..." → Redeploy

### 2. Database Connection Error

**Error Message:**
```
PrismaClientInitializationError: Can't reach database server
```

**✅ Solutions:**

1. **Verify DATABASE_URL Format:**
   ```bash
   # Correct Supabase format
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
   
   # Common mistakes:
   # ❌ Missing password
   # ❌ Wrong project reference
   # ❌ Missing connection parameters
   ```

2. **Check Supabase Project Status:**
   - Ensure Supabase project is fully initialized (wait 2-3 minutes after creation)
   - Verify project is not paused
   - Check connection from Supabase dashboard

3. **Test Connection Locally:**
   ```bash
   # Test with the same DATABASE_URL
   npx prisma db pull --print
   ```

### 3. Environment Variables Not Loading

**Error Message:**
```
NEXTAUTH_SECRET is not defined
```

**✅ Solutions:**

1. **Check Variable Names:**
   - Ensure exact spelling (case-sensitive)
   - No extra spaces or quotes
   - Variables set for correct environment

2. **Verify Variable Scope:**
   - Set for Production, Preview, AND Development
   - Some variables might need to be set for all environments

3. **Force Redeploy:**
   ```bash
   # Trigger new deployment
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

### 4. Prisma Schema Issues

**Error Message:**
```
Schema parsing error
```

**✅ Solutions:**

1. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   git add prisma/
   git commit -m "Update Prisma client"
   git push
   ```

2. **Verify Schema Deployment:**
   - Check if database tables exist in Supabase dashboard
   - Run migrations if needed:
   ```bash
   npx prisma migrate deploy
   ```

## 🔧 Step-by-Step Deployment Fix

### Phase 1: Environment Setup

1. **Set All Environment Variables in Vercel:**
   ```bash
   # Go to: Vercel Dashboard → Project → Settings → Environment Variables
   
   # Add these variables for ALL environments:
   DATABASE_URL="your-supabase-connection-string"
   NEXTAUTH_URL="https://your-app.vercel.app"
   NEXTAUTH_SECRET="generated-secret"
   JWT_SECRET="generated-secret"
   JWT_EXPIRES_IN="7d"
   CRON_SECRET="generated-secret"
   NODE_ENV="production"
   ```

2. **Generate Secure Secrets:**
   ```bash
   # NEXTAUTH_SECRET
   openssl rand -base64 32
   
   # JWT_SECRET
   openssl rand -hex 32
   
   # CRON_SECRET
   openssl rand -hex 32
   ```

### Phase 2: Database Setup

1. **Ensure Supabase is Ready:**
   - Project fully initialized (green status)
   - Connection string copied correctly
   - Database accessible from external connections

2. **Deploy Schema:**
   ```bash
   # Option 1: Using Prisma (recommended)
   npx prisma migrate deploy
   
   # Option 2: Manual SQL in Supabase dashboard
   # Copy schema from SUPABASE_SETUP.md
   ```

### Phase 3: Code Fixes

1. **Commit Latest Changes:**
   ```bash
   git add .
   git commit -m "Fix NextAuth configuration for Vercel"
   git push origin main
   ```

2. **Verify Build Locally:**
   ```bash
   npm run build
   # Should complete without errors
   ```

### Phase 4: Deploy

1. **Trigger New Deployment:**
   - Push to GitHub (auto-deploys)
   - Or manually redeploy from Vercel dashboard

2. **Monitor Build Logs:**
   - Watch for any new errors
   - Check function logs after deployment

## 🔍 Debugging Tools

### Vercel Dashboard

1. **Build Logs:**
   - Deployments → Click deployment → View build logs
   - Look for specific error messages

2. **Function Logs:**
   - Functions tab → Click any function
   - Real-time logs during requests

3. **Environment Variables:**
   - Settings → Environment Variables
   - Verify all variables are set correctly

### Local Testing

```bash
# Test build locally
npm run build

# Test with production env vars
vercel env pull .env.local
npm run dev

# Test database connection
npx prisma studio
```

## 🚀 Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables set in Vercel
- [ ] Supabase project is active and accessible
- [ ] Database schema is deployed
- [ ] Build passes locally (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] All tests pass (`npm run test`)

## 📞 Getting Help

### Vercel Support

1. **Check Vercel Status:** [status.vercel.com](https://status.vercel.com)
2. **Community:** [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
3. **Documentation:** [vercel.com/docs](https://vercel.com/docs)

### Supabase Support

1. **Status:** [status.supabase.com](https://status.supabase.com)
2. **Community:** [github.com/supabase/supabase/discussions](https://github.com/supabase/supabase/discussions)
3. **Documentation:** [supabase.com/docs](https://supabase.com/docs)

### NextAuth Support

1. **Documentation:** [next-auth.js.org](https://next-auth.js.org)
2. **GitHub Issues:** [github.com/nextauthjs/next-auth](https://github.com/nextauthjs/next-auth)

## 🎯 Quick Fixes

### If Build Still Fails:

1. **Remove pages config from NextAuth** (already done)
2. **Simplify NextAuth configuration** (already done)
3. **Add external packages to Next.js config** (already done)
4. **Ensure TypeScript types are correct** (already done)

### If Database Connection Fails:

1. **Double-check connection string format**
2. **Verify Supabase project status**
3. **Test connection from local environment**
4. **Check Supabase dashboard for errors**

### If Environment Variables Don't Work:

1. **Set for all environments (Production, Preview, Development)**
2. **Check for typos in variable names**
3. **Remove quotes from variable values**
4. **Redeploy after setting variables**

---

**Most Common Solution:** Set all environment variables in Vercel Dashboard and redeploy! 🚀 