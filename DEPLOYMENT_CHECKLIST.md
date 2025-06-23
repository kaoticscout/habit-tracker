# Deployment Checklist for Vercel

## ✅ Pre-Deployment Checklist

### Code & Build
- [x] Build passes successfully (`npm run build`)
- [x] No critical TypeScript errors
- [x] All tests pass (`npm run test`)
- [x] Git repository is clean and pushed to GitHub

### Configuration Files
- [x] `vercel.json` configured with cron job
- [x] `.env.example` updated with all required variables
- [x] `.gitignore` excludes `.env` files
- [x] `package.json` has all required dependencies

### Documentation
- [x] `DEPLOYMENT.md` with detailed instructions
- [x] `SUPABASE_SETUP.md` with Supabase-specific guide
- [x] `README.md` updated with project info
- [x] `DAILY_HABIT_CHECK.md` for cron job documentation

## 🚀 Deployment Steps

### 1. Set Up Supabase Database (Recommended)

**📖 Detailed Guide**: Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete instructions.

**Quick Steps:**
- [ ] Create Supabase account at [supabase.com](https://supabase.com)
- [ ] Create new project with strong password
- [ ] Save project reference ID and password
- [ ] Get connection string from Settings → Database
- [ ] Set up database schema using Prisma or SQL

### 2. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment with Supabase"
git push origin main
```

### 3. Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure environment variables (see below)
4. Deploy!

### 4. Essential Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Supabase Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Authentication (CRITICAL - update URL after deployment)
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="your-secure-nextauth-secret"

# JWT Security
JWT_SECRET="your-secure-jwt-secret"
JWT_EXPIRES_IN="7d"

# Daily Habit Check Cron
CRON_SECRET="your-secure-cron-secret"

# Environment
NODE_ENV="production"
```

### 5. Generate Secure Secrets

Use these commands to generate secure secrets:

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# JWT_SECRET
openssl rand -hex 32

# CRON_SECRET
openssl rand -hex 32
```

### 6. Database Schema Setup

Choose your preferred method:

#### Option A: Prisma Migration (Recommended)
```bash
# Locally with production DATABASE_URL
npx prisma generate
npx prisma migrate deploy
```

#### Option B: Supabase SQL Editor
- Copy schema from [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- Paste in Supabase Dashboard → SQL Editor
- Execute the schema creation script

### 7. Post-Deployment Verification

After successful deployment:

1. **Update NEXTAUTH_URL**: Change to your actual Vercel URL
2. **Test core features**:
   - [ ] Homepage loads without errors
   - [ ] Guest mode works (create sample habits)
   - [ ] Sign up creates new account
   - [ ] Sign in works with created account
   - [ ] Data migration preserves localStorage data
   - [ ] Dashboard shows user's habits
   - [ ] Progress calendar displays correctly
   - [ ] Habit toggling works and persists
   - [ ] Mobile responsive design works

3. **Verify database integration**:
   - [ ] Check Supabase dashboard shows user data
   - [ ] Verify habits and logs are created
   - [ ] Test data persistence across sessions

4. **Verify cron job**:
   - [ ] Check Vercel Functions tab for daily-check
   - [ ] Test endpoint manually with cron secret
   - [ ] Monitor execution logs for errors

## 🔧 Troubleshooting

### Supabase-Specific Issues

**Database Connection Error**
- [ ] Verify password in connection string
- [ ] Check project reference ID is correct
- [ ] Ensure Supabase project is fully initialized (wait 2-3 minutes)
- [ ] Confirm connection string includes `?pgbouncer=true&connection_limit=1`

**Schema Migration Issues**
- [ ] Check if tables already exist in Supabase dashboard
- [ ] Verify Prisma schema matches database structure
- [ ] Use `npx prisma db push` for development/testing
- [ ] Check foreign key constraints are properly set

**Performance Issues**
- [ ] Monitor connection pool usage in Supabase
- [ ] Check query performance in Supabase Reports
- [ ] Verify indexes are created correctly

### General Deployment Issues

**Build Fails**
- Check TypeScript errors: `npm run type-check`
- Verify all imports and dependencies
- Check build logs in Vercel Dashboard

**Authentication Issues**
- Verify `NEXTAUTH_URL` matches deployment URL exactly
- Check `NEXTAUTH_SECRET` is set and secure
- Ensure no trailing slashes in URLs

**Environment Variables Not Working**
- Verify exact variable names match
- Check variable values don't have quotes
- Redeploy after adding new environment variables

## 📊 Supabase Dashboard Monitoring

After deployment, monitor these in your Supabase dashboard:

### Database Tab
- [ ] Tables are created correctly
- [ ] Data is being inserted properly
- [ ] Indexes are functioning

### SQL Editor
- [ ] Can run queries successfully
- [ ] Performance looks good

### Reports Tab
- [ ] API requests are within limits
- [ ] Database size is reasonable
- [ ] No excessive connection usage

## 📝 Post-Deployment Tasks

### Required
- [ ] Update `NEXTAUTH_URL` to production URL
- [ ] Test all critical user flows
- [ ] Verify daily habit check cron job
- [ ] Monitor initial usage and errors

### Optional Enhancements

1. **Custom Domain**
   - Add domain in Vercel Dashboard
   - Update `NEXTAUTH_URL` to custom domain
   - Redeploy application

2. **Monitoring & Analytics**
   - Enable Vercel Analytics
   - Set up error monitoring (Sentry)
   - Monitor Supabase usage and performance

3. **Performance Optimization**
   - Monitor function execution times
   - Optimize database queries if needed
   - Consider implementing caching

4. **Backup & Security**
   - Verify Supabase automatic backups
   - Set up additional monitoring alerts
   - Review security settings

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ App loads without errors at your Vercel URL
- ✅ Guest mode creates and displays sample habits
- ✅ User registration/login flow works completely
- ✅ Data migration preserves all localStorage data
- ✅ Supabase dashboard shows user data correctly
- ✅ Daily habit check runs automatically (check after 24 hours)
- ✅ All major features work as expected on mobile and desktop
- ✅ Progress calendar displays accurate historical data

## 🚀 Go Live Checklist

Final steps before announcing your app:

- [ ] Test with multiple user accounts
- [ ] Verify all edge cases work (empty states, errors, etc.)
- [ ] Check mobile experience thoroughly
- [ ] Test daily habit check system
- [ ] Monitor for any errors in first 24 hours
- [ ] Prepare user documentation if needed

---

**Ready to deploy Routinely with Supabase? Let's make it live! 🌟** 