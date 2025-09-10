-- addStaffAdminSQLOnly.sql
-- Add staff and admin users directly via SQL (Method 2)

-- 1. Add staff users directly to profiles table
INSERT INTO profiles (id, full_name, ic, email, role, tempat_bertugas, jawatan, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'RINNIE ROY YABIL', '860612525415', 'rinnie.roy@example.com', 'staff', 'BLS Training Center', 'Staff', NOW(), NOW()),
  (gen_random_uuid(), 'RAMADATUL AZAM', '910404136303', 'ramadatul.azam@example.com', 'staff', 'BLS Training Center', 'Staff', NOW(), NOW()),
  (gen_random_uuid(), 'FAIZATUL FARAHAIN BINTI JAKA', '931113136664', 'faizatul.farahain@example.com', 'staff', 'BLS Training Center', 'Staff', NOW(), NOW()),
  (gen_random_uuid(), 'Felicity Buaye', '790817135874', 'felicity.buaye@example.com', 'staff', 'BLS Training Center', 'Staff', NOW(), NOW()),
  (gen_random_uuid(), 'JOANNES MARVIN ANAK SUBAH', '921201136323', 'joannes.marvin@example.com', 'staff', 'BLS Training Center', 'Staff', NOW(), NOW()),
  (gen_random_uuid(), 'MOHD FAQRULL IZAT BIN HANAPI', '911007136347', 'mohd.faqrull@example.com', 'staff', 'BLS Training Center', 'Staff', NOW(), NOW())
ON CONFLICT (ic) DO UPDATE SET
  role = EXCLUDED.role,
  jawatan = EXCLUDED.jawatan,
  updated_at = NOW();

-- 2. Add admin users directly to profiles table
INSERT INTO profiles (id, full_name, ic, email, role, tempat_bertugas, jawatan, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Shamsury bin Mohamad Majidi', '770626135291', 'shamsury.majidi@example.com', 'admin', 'BLS Training Center', 'Administrator', NOW(), NOW()),
  (gen_random_uuid(), 'JUSNIE GAMBAR', '981013125488', 'jusnie.gambar@example.com', 'admin', 'BLS Training Center', 'Administrator', NOW(), NOW())
ON CONFLICT (ic) DO UPDATE SET
  role = EXCLUDED.role,
  jawatan = EXCLUDED.jawatan,
  updated_at = NOW();

-- 3. Verify the results
SELECT 'Staff and Admin users added successfully!' as status;

-- 4. Show all staff users
SELECT 'STAFF USERS:' as user_type, full_name, ic, email, role, jawatan 
FROM profiles 
WHERE role = 'staff' 
ORDER BY full_name;

-- 5. Show all admin users
SELECT 'ADMIN USERS:' as user_type, full_name, ic, email, role, jawatan 
FROM profiles 
WHERE role = 'admin' 
ORDER BY full_name;

-- 6. Show role distribution
SELECT role, COUNT(*) as count 
FROM profiles 
WHERE role IS NOT NULL 
GROUP BY role 
ORDER BY role;
