-- dropUsersTable.sql
-- SQL script to drop the users table
-- Run this in Supabase SQL Editor

-- Step 1: Verify the table exists and is empty
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE tablename = 'users' 
AND schemaname = 'public';

-- Step 2: Check if there are any remaining records
SELECT COUNT(*) as remaining_records 
FROM users;

-- Step 3: Drop the users table
-- This will remove the table structure completely
DROP TABLE IF EXISTS users CASCADE;

-- Step 4: Verify the table is gone
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE tablename = 'users' 
AND schemaname = 'public';

-- If the above query returns no results, the table has been successfully dropped!
