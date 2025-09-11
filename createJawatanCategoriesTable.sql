-- createJawatanCategoriesTable.sql
-- Create a standardized jawatan categories table in Supabase

-- Step 1: Create the jawatan_categories table
CREATE TABLE IF NOT EXISTS jawatan_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  jawatan_name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(20) NOT NULL CHECK (category IN ('clinical', 'non-clinical')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Insert all clinical jawatan (only the 7 specified positions)
INSERT INTO jawatan_categories (jawatan_name, category, description) VALUES
  ('PEGAWAI PERUBATAN', 'clinical', 'Medical Officer'),
  ('PENOLONG PEGAWAI PERUBATAN', 'clinical', 'Assistant Medical Officer'),
  ('JURURAWAT', 'clinical', 'Nurse'),
  ('JURURAWAT MASYARAKAT', 'clinical', 'Community Nurse'),
  ('PEMBANTU PERAWATAN KESIHATAN', 'clinical', 'Health Care Assistant'),
  ('PEGAWAI PERGIGIAN', 'clinical', 'Dental Officer'),
  ('JURUTERAPI PERGIGIAN', 'clinical', 'Dental Therapist')
ON CONFLICT (jawatan_name) DO UPDATE SET
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Step 3: Insert all non-clinical jawatan
INSERT INTO jawatan_categories (jawatan_name, category, description) VALUES
  ('PEGAWAI FARMASI', 'non-clinical', 'Pharmacy Officer'),
  ('PENOLONG PEGAWAI FARMASI', 'non-clinical', 'Assistant Pharmacy Officer'),
  ('JURUTEKNOLOGI MAKMAL PERUBATAN', 'non-clinical', 'Medical Laboratory Technologist'),
  ('JURUPULIH PERUBATAN CARAKERJA', 'non-clinical', 'Occupational Therapist'),
  ('JURUPULIH FISIOTERAPI', 'non-clinical', 'Physiotherapist'),
  ('JURU-XRAY', 'non-clinical', 'X-Ray Technician'),
  ('PENOLONG PEGAWAI TADBIR', 'non-clinical', 'Assistant Administrative Officer'),
  ('PEMBANTU KHIDMAT AM', 'non-clinical', 'General Service Assistant'),
  ('PEMBANTU TADBIR', 'non-clinical', 'Administrative Assistant'),
  ('PEMBANTU PENYEDIAAN MAKANAN', 'non-clinical', 'Food Preparation Assistant'),
  ('PENOLONG JURUTERA', 'non-clinical', 'Assistant Engineer'),
  ('Staff', 'non-clinical', 'General Staff'),
  ('Administrator', 'non-clinical', 'System Administrator')
ON CONFLICT (jawatan_name) DO UPDATE SET
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Step 4: Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_jawatan_categories_name ON jawatan_categories(jawatan_name);
CREATE INDEX IF NOT EXISTS idx_jawatan_categories_category ON jawatan_categories(category);
CREATE INDEX IF NOT EXISTS idx_jawatan_categories_active ON jawatan_categories(is_active);

-- Step 5: Create a function to get category by jawatan name
CREATE OR REPLACE FUNCTION get_jawatan_category(jawatan_input TEXT)
RETURNS VARCHAR(20) AS $$
DECLARE
  result_category VARCHAR(20);
BEGIN
  -- First try exact match
  SELECT category INTO result_category
  FROM jawatan_categories
  WHERE jawatan_name = UPPER(TRIM(jawatan_input))
  AND is_active = true;
  
  -- If no exact match, try partial match
  IF result_category IS NULL THEN
    SELECT category INTO result_category
    FROM jawatan_categories
    WHERE UPPER(TRIM(jawatan_input)) LIKE '%' || UPPER(jawatan_name) || '%'
    AND is_active = true
    LIMIT 1;
  END IF;
  
  -- If still no match, default to non-clinical
  IF result_category IS NULL THEN
    result_category := 'non-clinical';
  END IF;
  
  RETURN result_category;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create a view for easy querying
CREATE OR REPLACE VIEW jawatan_categories_view AS
SELECT 
  jawatan_name,
  category,
  description,
  is_active,
  created_at,
  updated_at
FROM jawatan_categories
WHERE is_active = true
ORDER BY category, jawatan_name;

-- Step 7: Add RLS (Row Level Security) policies
ALTER TABLE jawatan_categories ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
CREATE POLICY "Allow authenticated users to read jawatan categories" ON jawatan_categories
  FOR SELECT TO authenticated
  USING (true);

-- Allow only admins to modify
CREATE POLICY "Allow admins to modify jawatan categories" ON jawatan_categories
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Step 8: Verify the data
SELECT 'JAWATAN CATEGORIES TABLE CREATED SUCCESSFULLY!' as status;

-- Show clinical jawatan
SELECT 'CLINICAL JAWATAN:' as category_type, jawatan_name, description
FROM jawatan_categories
WHERE category = 'clinical' AND is_active = true
ORDER BY jawatan_name;

-- Show non-clinical jawatan
SELECT 'NON-CLINICAL JAWATAN:' as category_type, jawatan_name, description
FROM jawatan_categories
WHERE category = 'non-clinical' AND is_active = true
ORDER BY jawatan_name;

-- Test the function
SELECT 'FUNCTION TEST:' as test_type, 
       get_jawatan_category('JURURAWAT') as jururawat_test,
       get_jawatan_category('PEGAWAI FARMASI') as farmasi_test,
       get_jawatan_category('UNKNOWN POSITION') as unknown_test;
