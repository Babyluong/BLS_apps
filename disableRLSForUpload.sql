-- disableRLSForUpload.sql
-- Run this SQL in Supabase to temporarily disable RLS for checklist_items upload

-- Temporarily disable RLS for checklist_items table
ALTER TABLE checklist_items DISABLE ROW LEVEL SECURITY;

-- After upload is complete, re-enable RLS with this command:
-- ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
