-- fixProfilesSQL.sql
-- Fix profiles by updating ICs and roles using SQL

-- Update staff users
UPDATE profiles 
SET 
  ic = '860612525415',
  full_name = 'RINNIE ROY YABIL',
  role = 'staff',
  jawatan = 'Staff',
  tempat_bertugas = 'BLS Training Center',
  updated_at = NOW()
WHERE email = 'rinnie.roy@example.com';

UPDATE profiles 
SET 
  ic = '910404136303',
  full_name = 'RAMADATUL AZAM',
  role = 'staff',
  jawatan = 'Staff',
  tempat_bertugas = 'BLS Training Center',
  updated_at = NOW()
WHERE email = 'ramadatul.azam@example.com';

UPDATE profiles 
SET 
  ic = '931113136664',
  full_name = 'FAIZATUL FARAHAIN BINTI JAKA',
  role = 'staff',
  jawatan = 'Staff',
  tempat_bertugas = 'BLS Training Center',
  updated_at = NOW()
WHERE email = 'faizatul.farahain@example.com';

UPDATE profiles 
SET 
  ic = '790817135874',
  full_name = 'Felicity Buaye',
  role = 'staff',
  jawatan = 'Staff',
  tempat_bertugas = 'BLS Training Center',
  updated_at = NOW()
WHERE email = 'felicity.buaye@example.com';

UPDATE profiles 
SET 
  ic = '921201136323',
  full_name = 'JOANNES MARVIN ANAK SUBAH',
  role = 'staff',
  jawatan = 'Staff',
  tempat_bertugas = 'BLS Training Center',
  updated_at = NOW()
WHERE email = 'joannes.marvin@example.com';

UPDATE profiles 
SET 
  ic = '911007136347',
  full_name = 'MOHD FAQRULL IZAT BIN HANAPI',
  role = 'staff',
  jawatan = 'Staff',
  tempat_bertugas = 'BLS Training Center',
  updated_at = NOW()
WHERE email = 'mohd.faqrull@example.com';

-- Update admin users
UPDATE profiles 
SET 
  ic = '770626135291',
  full_name = 'Shamsury bin Mohamad Majidi',
  role = 'admin',
  jawatan = 'Administrator',
  tempat_bertugas = 'BLS Training Center',
  updated_at = NOW()
WHERE email = 'shamsury.majidi@example.com';

UPDATE profiles 
SET 
  ic = '981013125488',
  full_name = 'JUSNIE GAMBAR',
  role = 'admin',
  jawatan = 'Administrator',
  tempat_bertugas = 'BLS Training Center',
  updated_at = NOW()
WHERE email = 'jusnie.gambar@example.com';

-- Verify the results
SELECT 'STAFF USERS:' as user_type, full_name, ic, email, role, jawatan 
FROM profiles 
WHERE role = 'staff' 
ORDER BY full_name;

SELECT 'ADMIN USERS:' as user_type, full_name, ic, email, role, jawatan 
FROM profiles 
WHERE role = 'admin' 
ORDER BY full_name;

-- Show role distribution
SELECT role, COUNT(*) as count 
FROM profiles 
WHERE role IS NOT NULL 
GROUP BY role 
ORDER BY role;
