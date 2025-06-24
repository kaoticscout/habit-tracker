@echo off
echo 🚀 Starting production database migration...

REM Load environment variables from .env.production
for /f "usebackq tokens=1,* delims==" %%a in (".env.production") do (
    if not "%%a"=="" if not "%%a"=="# Created by Vercel CLI" (
        set "%%a=%%b"
    )
)

REM Remove quotes from DATABASE_URL if present
set DATABASE_URL=%DATABASE_URL:"=%

echo ✅ Environment variables loaded
echo 📊 Running Prisma db push...

REM Run Prisma db push with the production DATABASE_URL
npx prisma db push

if %ERRORLEVEL% EQU 0 (
    echo ✅ Schema migration completed successfully!
) else (
    echo ❌ Migration failed with error code %ERRORLEVEL%
)

pause 