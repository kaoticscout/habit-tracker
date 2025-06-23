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
- [x] `README.md` updated with project info
- [x] `DAILY_HABIT_CHECK.md` for cron job documentation

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure environment variables (see below)
4. Deploy!

### 3. Essential Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Database (use Vercel Postgres or external provider)
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"

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

### 4. Generate Secure Secrets

Use these commands to generate secure secrets:

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# JWT_SECRET
openssl rand -hex 32

# CRON_SECRET
openssl rand -hex 32
```

### 5. Database Setup

#### Option A: Vercel Postgres
1. Go to Vercel Dashboard → Storage → Create Database → Postgres
2. Copy connection string to `DATABASE_URL`

#### Option B: External Provider (Neon, Supabase, Railway)
1. Create database instance
2. Copy connection string to `DATABASE_URL`

### 6. Post-Deployment

After successful deployment:

1. **Update NEXTAUTH_URL**: Change to your actual Vercel URL
2. **Test core features**:
   - [ ] Homepage loads
   - [ ] Guest mode works (create habits)
   - [ ] Sign up/sign in works
   - [ ] Data migration works
   - [ ] Dashboard shows habits
   - [ ] Progress calendar displays
   - [ ] Habit toggling works

3. **Verify cron job**:
   - [ ] Check Vercel Functions tab
   - [ ] Test daily check endpoint manually
   - [ ] Monitor execution logs

## 🔧 Troubleshooting

### Common Deployment Issues

**Build Fails**
- Check TypeScript errors: `npm run type-check`
- Verify all imports and dependencies
- Check build logs in Vercel

**Database Connection Error**
- Verify `DATABASE_URL` format
- Check SSL requirements (`?sslmode=require`)
- Ensure database allows external connections

**Authentication Issues**
- Verify `NEXTAUTH_URL` matches deployment URL
- Check `NEXTAUTH_SECRET` is set
- Ensure no trailing slashes in URLs

**Environment Variables Not Working**
- Verify exact variable names
- Check variable values don't have quotes
- Redeploy after adding new variables

## 📝 Post-Deployment Tasks

### Optional Enhancements

1. **Custom Domain**
   - Add domain in Vercel Dashboard
   - Update `NEXTAUTH_URL` to custom domain
   - Redeploy

2. **Analytics**
   - Enable Vercel Analytics
   - Set up error monitoring (Sentry)

3. **Performance**
   - Monitor function execution times
   - Set up database connection pooling
   - Consider caching strategies

4. **Backup**
   - Set up database backups
   - Document restore procedures

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ App loads without errors
- ✅ Guest mode creates sample habits
- ✅ User registration/login works
- ✅ Data migration preserves localStorage data
- ✅ Daily habit check runs automatically
- ✅ All major features work as expected

---

**Ready to deploy? Let's make Routinely live! 🚀** 