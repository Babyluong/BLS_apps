// setupJawatanCategories.js
// Script to set up jawatan categories table and test categorization

import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupJawatanCategories() {
  console.log('🚀 Setting up Jawatan Categories Table...\n');
  
  try {
    // Step 1: Create the table
    console.log('📋 Creating jawatan_categories table...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS jawatan_categories (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          jawatan_name VARCHAR(255) NOT NULL UNIQUE,
          category VARCHAR(20) NOT NULL CHECK (category IN ('clinical', 'non-clinical')),
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (createError) {
      console.error('❌ Error creating table:', createError);
      return;
    }
    
    console.log('✅ Table created successfully');
    
    // Step 2: Insert clinical jawatan
    console.log('\n🏥 Inserting clinical jawatan...');
    const clinicalJawatan = [
      { name: 'PEGAWAI PERUBATAN', description: 'Medical Officer' },
      { name: 'PENOLONG PEGAWAI PERUBATAN', description: 'Assistant Medical Officer' },
      { name: 'JURURAWAT', description: 'Nurse' },
      { name: 'JURURAWAT MASYARAKAT', description: 'Community Nurse' },
      { name: 'PEMBANTU PERAWATAN KESIHATAN', description: 'Health Care Assistant' },
      { name: 'PEGAWAI PERGIGIAN', description: 'Dental Officer' },
      { name: 'JURUTERAPI PERGIGIAN', description: 'Dental Therapist' }
    ];
    
    for (const jawatan of clinicalJawatan) {
      const { error } = await supabase
        .from('jawatan_categories')
        .upsert({
          jawatan_name: jawatan.name,
          category: 'clinical',
          description: jawatan.description
        });
      
      if (error) {
        console.error(`❌ Error inserting ${jawatan.name}:`, error);
      } else {
        console.log(`✅ Inserted ${jawatan.name}`);
      }
    }
    
    // Step 3: Insert non-clinical jawatan
    console.log('\n🏢 Inserting non-clinical jawatan...');
    const nonClinicalJawatan = [
      { name: 'PEGAWAI FARMASI', description: 'Pharmacy Officer' },
      { name: 'PENOLONG PEGAWAI FARMASI', description: 'Assistant Pharmacy Officer' },
      { name: 'JURUTEKNOLOGI MAKMAL PERUBATAN', description: 'Medical Laboratory Technologist' },
      { name: 'JURUPULIH PERUBATAN CARAKERJA', description: 'Occupational Therapist' },
      { name: 'JURUPULIH FISIOTERAPI', description: 'Physiotherapist' },
      { name: 'JURU-XRAY', description: 'X-Ray Technician' },
      { name: 'PENOLONG PEGAWAI TADBIR', description: 'Assistant Administrative Officer' },
      { name: 'PEMBANTU KHIDMAT AM', description: 'General Service Assistant' },
      { name: 'PEMBANTU TADBIR', description: 'Administrative Assistant' },
      { name: 'PEMBANTU PENYEDIAAN MAKANAN', description: 'Food Preparation Assistant' },
      { name: 'PENOLONG JURUTERA', description: 'Assistant Engineer' },
      { name: 'Staff', description: 'General Staff' },
      { name: 'Administrator', description: 'System Administrator' }
    ];
    
    for (const jawatan of nonClinicalJawatan) {
      const { error } = await supabase
        .from('jawatan_categories')
        .upsert({
          jawatan_name: jawatan.name,
          category: 'non-clinical',
          description: jawatan.description
        });
      
      if (error) {
        console.error(`❌ Error inserting ${jawatan.name}:`, error);
      } else {
        console.log(`✅ Inserted ${jawatan.name}`);
      }
    }
    
    // Step 4: Test categorization
    console.log('\n🧪 Testing categorization...');
    const testJawatan = [
      'PEMBANTU PERAWATAN KESIHATAN',
      'JURUPULIH FISIOTERAPI',
      'JURURAWAT',
      'PEGAWAI FARMASI',
      'JURU-XRAY'
    ];
    
    for (const jawatan of testJawatan) {
      const { data, error } = await supabase
        .from('jawatan_categories')
        .select('category')
        .eq('jawatan_name', jawatan)
        .single();
      
      if (error) {
        console.log(`❌ Error testing ${jawatan}:`, error);
      } else {
        console.log(`✅ ${jawatan}: ${data.category}`);
      }
    }
    
    // Step 5: Show summary
    console.log('\n📊 Summary:');
    const { data: clinicalCount } = await supabase
      .from('jawatan_categories')
      .select('id', { count: 'exact' })
      .eq('category', 'clinical');
    
    const { data: nonClinicalCount } = await supabase
      .from('jawatan_categories')
      .select('id', { count: 'exact' })
      .eq('category', 'non-clinical');
    
    console.log(`   Clinical jawatan: ${clinicalCount?.length || 0}`);
    console.log(`   Non-clinical jawatan: ${nonClinicalCount?.length || 0}`);
    
    console.log('\n✅ Jawatan Categories setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
setupJawatanCategories();
