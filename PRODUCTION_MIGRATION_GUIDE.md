# Production Migration Guide - Immediate Streak Updates

## 🎯 **Overview**

This guide helps you safely apply the database schema changes needed for the immediate streak updates feature to your production database.

**What's changing:** Adding `updatedDuringToggle` boolean field to the `habit_logs` table.

---

## 🚀 **Migration Options**

### **Option 1: Using the Migration Script (Recommended)**

1. **Prepare the environment:**
   ```bash
   # Ensure you have the latest code
   git pull origin main
   
   # Install dependencies
   npm install
   ```

2. **Set your production DATABASE_URL:**
   ```bash
   # Option A: Use environment variable
   export DATABASE_URL="your-production-database-url"
   
   # Option B: Create .env.production file
   echo "DATABASE_URL=your-production-database-url" > .env.production
   ```

3. **Run the migration script:**
   ```bash
   node scripts/migrate-production.js
   ```

   **Expected output:**
   ```
   🚀 Starting production database migration...
   📡 Testing database connection...
   ✅ Database connection successful
   🔍 Checking if updatedDuringToggle column exists...
   ➕ Column does not exist - proceeding with migration
   🔄 Adding updatedDuringToggle column to habit_logs table...
   ✅ Successfully added updatedDuringToggle column
   🔍 Verifying migration...
   ✅ Migration verified successfully
   📊 Updated X existing habit logs with default value (false)
   🎉 Production migration completed successfully!
   ```

### **Option 2: Manual SQL Execution**

If you prefer to run the SQL manually (e.g., in Supabase dashboard):

1. **Open your database admin panel** (Supabase, PostgreSQL client, etc.)

2. **Run this SQL script:**
   ```sql
   -- Check if the column already exists before adding it
   DO $$ 
   BEGIN
       IF NOT EXISTS (
           SELECT 1 
           FROM information_schema.columns 
           WHERE table_name = 'habit_logs' 
           AND column_name = 'updatedDuringToggle'
           AND table_schema = 'public'
       ) THEN
           ALTER TABLE habit_logs 
           ADD COLUMN "updatedDuringToggle" BOOLEAN NOT NULL DEFAULT false;
           
           RAISE NOTICE 'Added updatedDuringToggle column to habit_logs table';
       ELSE
           RAISE NOTICE 'updatedDuringToggle column already exists';
       END IF;
   END $$;
   ```

3. **Verify the migration:**
   ```sql
   SELECT 
       column_name, 
       data_type, 
       is_nullable, 
       column_default
   FROM information_schema.columns 
   WHERE table_name = 'habit_logs' 
       AND table_schema = 'public'
       AND column_name = 'updatedDuringToggle';
   ```

### **Option 3: Using Prisma Migrate (Advanced)**

⚠️ **Warning:** This approach requires careful consideration in production.

1. **Generate and apply migration:**
   ```bash
   # Set production DATABASE_URL
   export DATABASE_URL="your-production-database-url"
   
   # Generate Prisma client
   npx prisma generate
   
   # Apply pending migrations
   npx prisma migrate deploy
   ```

---

## 🔍 **Pre-Migration Checklist**

- [ ] **Backup your database** before making any changes
- [ ] **Test the migration** on a staging environment first
- [ ] **Verify database connectivity** from your local environment
- [ ] **Check database permissions** (need ALTER TABLE permission)
- [ ] **Confirm the habit_logs table exists** in your database
- [ ] **Review current application traffic** (consider maintenance window)

---

## 🛡️ **Safety Features**

### **The migration is safe because:**
- ✅ **Non-destructive:** Only adds a new column, doesn't modify existing data
- ✅ **Default value:** All existing rows get `false` by default (safe)
- ✅ **Idempotent:** Can be run multiple times safely
- ✅ **Backwards compatible:** Old code won't break if column exists
- ✅ **Quick operation:** Adding a boolean column is fast even on large tables

### **Rollback plan (if needed):**
```sql
-- Remove the column if you need to rollback
ALTER TABLE habit_logs DROP COLUMN IF EXISTS "updatedDuringToggle";
```

---

## 🚀 **Post-Migration Steps**

1. **Deploy updated application code:**
   ```bash
   # Deploy to your hosting platform (Vercel, etc.)
   git push origin main
   ```

2. **Test the feature:**
   - [ ] Create a test habit
   - [ ] Check/uncheck it and verify immediate streak updates
   - [ ] Wait for daily reset and verify no double counting
   - [ ] Check logs for any errors

3. **Monitor production:**
   - [ ] Watch application logs for errors
   - [ ] Monitor database performance
   - [ ] Check user feedback/reports

---

## 🔧 **Troubleshooting**

### **Migration script fails:**
```bash
❌ Migration failed: connection timeout
```
**Solutions:**
- Check DATABASE_URL is correct
- Verify database is accessible from your location
- Check firewall/network restrictions
- Ensure database server is running

### **Permission denied:**
```bash
❌ Migration failed: permission denied for table habit_logs
```
**Solutions:**
- Use a database user with ALTER TABLE permissions
- Check if you're using the correct database role
- Contact your database administrator

### **Column already exists:**
```bash
✅ Column already exists - no migration needed
```
**Result:** This is normal! The migration is designed to be safe to run multiple times.

---

## 📊 **Impact Assessment**

### **Database Impact:**
- **Storage:** Minimal increase (~1 byte per habit log row)
- **Performance:** No impact on existing queries
- **Indexes:** No new indexes needed
- **Constraints:** Simple NOT NULL with default value

### **Application Impact:**
- **Downtime:** None required (backwards compatible)
- **API Changes:** Enhanced responses, not breaking changes
- **User Experience:** Immediate improvement (instant streak updates)

---

## 📝 **Verification Commands**

After migration, verify everything is working:

```bash
# Check column exists
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`
  SELECT column_name, data_type, column_default 
  FROM information_schema.columns 
  WHERE table_name = 'habit_logs' AND column_name = 'updatedDuringToggle'
\`.then(console.log).finally(() => prisma.\$disconnect())
"

# Test the toggle API
curl -X POST "https://your-app.vercel.app/api/habits/HABIT_ID/toggle" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie"
```

---

## 🎉 **Success Criteria**

✅ **Migration is successful when:**
- [ ] `updatedDuringToggle` column exists in `habit_logs` table
- [ ] All existing habit logs have `updatedDuringToggle = false`
- [ ] Application deploys without errors
- [ ] Habit toggle API returns streak values immediately
- [ ] Daily reset skips habits that were toggled during the day
- [ ] No errors in application logs

**You're ready to enjoy immediate streak updates!** 🚀 