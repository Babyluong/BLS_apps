// scripts/importUsers.js
// Script to import users from your database into Supabase

import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase credentials
const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample user data from your database screenshot
const sampleUsers = [
  {
    full_name: "ABDUL RAHMAN BIN MOHAMAD BADARUDDIN",
    ic: "960109035847",
    tempat_bertugas: "Hospital Lawas",
    jawatan: "PEGAWAI FARMASI GRED UF 9",
    bla_last_year: null,
    alergik: false,
    alergik_details: null,
    asma: false,
    hamil: false,
    hamil_weeks: null,
    email: "rahmanbadaruddin@gmail.com",
    phone_number: null
  },
  {
    full_name: "AHMMAD ZAKI ISAMUDDIN BIN MOHA",
    ic: "940819136687",
    tempat_bertugas: "Klinik Pergigian Lawas",
    jawatan: "PEMANDU GRED U 1",
    bla_last_year: 2021,
    alergik: true,
    alergik_details: "UBAT (CLOXACILLIN)",
    asma: false,
    hamil: false,
    hamil_weeks: null,
    email: "zaki940852@gmail.com",
    phone_number: null
  },
  {
    full_name: "ALVIN DULAMIT",
    ic: "950123456789",
    tempat_bertugas: "Hospital Lawas",
    jawatan: "JURUPULIH PERUBATAN CARAKERJA GRED U 5",
    bla_last_year: 2020,
    alergik: false,
    alergik_details: null,
    asma: false,
    hamil: false,
    hamil_weeks: null,
    email: "alvin@example.com",
    phone_number: null
  }
];

async function importUsers() {
  console.log('🚀 Starting user import...');
  
  try {
    // Import users into the users table
    const { data, error } = await supabase
      .from('users')
      .insert(sampleUsers);

    if (error) {
      console.error('❌ Error importing users:', error);
      return;
    }

    console.log('✅ Users imported successfully:', data);
    
    // Test the import by querying the users table
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (testError) {
      console.error('❌ Error testing import:', testError);
      return;
    }

    console.log('📋 Imported users:', testData);
    
  } catch (err) {
    console.error('❌ Import failed:', err);
  }
}

// Run the import
importUsers();