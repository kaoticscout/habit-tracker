-- Production Migration: Add updatedDuringToggle field to habit_logs table
-- This script is safe to run on existing production databases
-- Run this script on your production database to add the new field

-- Check if the column already exists before adding it
DO $$ 
BEGIN
    -- Add the updatedDuringToggle column if it doesn't exist
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
        RAISE NOTICE 'updatedDuringToggle column already exists in habit_logs table';
    END IF;
END $$;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'habit_logs' 
    AND table_schema = 'public'
    AND column_name = 'updatedDuringToggle'; 