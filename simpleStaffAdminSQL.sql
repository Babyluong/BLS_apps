-- simpleStaffAdminSQL.sql
-- Simplified SQL script - only uses profiles table

-- 1. Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS get_role_distribution();
DROP FUNCTION IF EXISTS add_staff_admin_profiles();
DROP FUNCTION IF EXISTS update_user_roles();
DROP VIEW IF EXISTS staff_admin_users;

-- 2. Create a simple function to add staff and admin profiles
CREATE OR REPLACE FUNCTION add_staff_admin_profiles()
RETURNS VOID AS $$
BEGIN
  -- Add staff users
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

  -- Add admin users
  INSERT INTO profiles (id, full_name, ic, email, role, tempat_bertugas, jawatan, created_at, updated_at)
  VALUES 
    (gen_random_uuid(), 'Shamsury bin Mohamad Majidi', '770626135291', 'shamsury.majidi@example.com', 'admin', 'BLS Training Center', 'Administrator', NOW(), NOW()),
    (gen_random_uuid(), 'JUSNIE GAMBAR', '981013125488', 'jusnie.gambar@example.com', 'admin', 'BLS Training Center', 'Administrator', NOW(), NOW())
  ON CONFLICT (ic) DO UPDATE SET
    role = EXCLUDED.role,
    jawatan = EXCLUDED.jawatan,
    updated_at = NOW();

  RAISE NOTICE 'Staff and admin profiles added successfully';
END;
$$ LANGUAGE plpgsql;

-- 3. Create a simple function to update existing users to staff/admin roles
CREATE OR REPLACE FUNCTION update_user_roles()
RETURNS VOID AS $$
BEGIN
  -- Update staff users
  UPDATE profiles SET role = 'staff', jawatan = 'Staff' WHERE ic = '860612525415';
  UPDATE profiles SET role = 'staff', jawatan = 'Staff' WHERE ic = '910404136303';
  UPDATE profiles SET role = 'staff', jawatan = 'Staff' WHERE ic = '931113136664';
  UPDATE profiles SET role = 'staff', jawatan = 'Staff' WHERE ic = '790817135874';
  UPDATE profiles SET role = 'staff', jawatan = 'Staff' WHERE ic = '921201136323';
  UPDATE profiles SET role = 'staff', jawatan = 'Staff' WHERE ic = '911007136347';
  
  -- Update admin users
  UPDATE profiles SET role = 'admin', jawatan = 'Administrator' WHERE ic = '770626135291';
  UPDATE profiles SET role = 'admin', jawatan = 'Administrator' WHERE ic = '981013125488';
  
  RAISE NOTICE 'User roles updated successfully';
END;
$$ LANGUAGE plpgsql;

-- 4. Create a simple function to check role distribution
CREATE OR REPLACE FUNCTION get_role_distribution()
RETURNS TABLE (
    role_name TEXT,
    user_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.role::TEXT as role_name,
    COUNT(*) as user_count
  FROM profiles p
  WHERE p.role IS NOT NULL
  GROUP BY p.role
  ORDER BY p.role;
END;
$$ LANGUAGE plpgsql;

-- 5. Add comments to functions
COMMENT ON FUNCTION add_staff_admin_profiles() IS 'Add staff and admin profiles to the system';
COMMENT ON FUNCTION update_user_roles() IS 'Update existing users to staff/admin roles';
COMMENT ON FUNCTION get_role_distribution() IS 'Get distribution of users by role';

-- 6. Test the functions
SELECT 'Functions created successfully!' as status;

-- 7. Instructions for manual user creation
/*
MANUAL STEPS REQUIRED:

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User" for each staff/admin user
3. Use these details for each user:

STAFF USERS:
- RINNIE ROY YABIL (860612525415) - rinnie.roy@example.com
- RAMADATUL AZAM (910404136303) - ramadatul.azam@example.com  
- FAIZATUL FARAHAIN BINTI JAKA (931113136664) - faizatul.farahain@example.com
- Felicity Buaye (790817135874) - felicity.buaye@example.com
- JOANNES MARVIN ANAK SUBAH (921201136323) - joannes.marvin@example.com
- MOHD FAQRULL IZAT BIN HANAPI (911007136347) - mohd.faqrull@example.com

ADMIN USERS:
- Shamsury bin Mohamad Majidi (770626135291) - shamsury.majidi@example.com
- JUSNIE GAMBAR (981013125488) - jusnie.gambar@example.com

4. After creating users, run: SELECT add_staff_admin_profiles();
5. Verify with: SELECT * FROM get_role_distribution();

SIMPLE QUERIES TO USE:
- Get all staff: SELECT * FROM profiles WHERE role = 'staff';
- Get all admins: SELECT * FROM profiles WHERE role = 'admin';
- Get all users: SELECT * FROM profiles WHERE role = 'user';
- Get role distribution: SELECT * FROM get_role_distribution();
*/
