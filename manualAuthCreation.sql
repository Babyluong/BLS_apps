-- manualAuthCreation.sql
-- SQL script to manually create profiles for the 8 problem users
-- Run this in Supabase SQL Editor

-- Insert profiles for the 8 problem users
-- Note: These will have placeholder IDs since we can't create auth users via SQL

INSERT INTO profiles (id, email, full_name, ic, role, created_at, updated_at) VALUES
-- Generate random UUIDs for these users
(gen_random_uuid(), 'gracee8788@gmail.com', 'GRACE RURAN NGILO', '880708135196', 'user', NOW(), NOW()),
(gen_random_uuid(), 'myraathira53@gmail.com', 'MYRA ATHIRA BINTI OMAR', '920529126298', 'user', NOW(), NOW()),
(gen_random_uuid(), 'roketship101@gmail.com', 'AMIR LUQMAN', '950623146647', 'user', NOW(), NOW()),
(gen_random_uuid(), 'syamgunners22@gmail.com', 'SYAMSUL HARDY BIN RAMLAN', '921022136061', 'user', NOW(), NOW()),
(gen_random_uuid(), 'weywenwen93@gmail.com', 'WENDY CHANDI ANAK SAMPURAI', '930519135552', 'user', NOW(), NOW()),
(gen_random_uuid(), 'norlinaali95@gmail.com', 'NORLINA BINTI ALI', '951128126360', 'user', NOW(), NOW()),
(gen_random_uuid(), 'shahrulnizam3716@gmail.com', 'SHAHRULNIZAM BIN IBRAHIM', '960401135909', 'user', NOW(), NOW()),
(gen_random_uuid(), 'suharmies@gmail.com', 'SUHARMIE BIN SULAIMAN', '850507135897', 'user', NOW(), NOW());

-- Verify the insertions
SELECT id, email, full_name, ic, role, created_at 
FROM profiles 
WHERE ic IN (
  '880708135196', '920529126298', '950623146647', '921022136061',
  '930519135552', '951128126360', '960401135909', '850507135897'
)
ORDER BY full_name;
