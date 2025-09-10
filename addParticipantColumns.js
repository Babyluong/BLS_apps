// addParticipantColumns.js
// Add participant_ic and participant_name columns to bls_results table

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function addParticipantColumns() {
  try {
    console.log('🔧 Adding participant_ic and participant_name columns to bls_results...\n');

    // Check current table structure
    console.log('1. Checking current table structure...');
    const { data: sampleRecord, error: sampleError } = await supabase
      .from('bls_results')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.log('❌ Error checking table structure:', sampleError.message);
      return;
    }

    if (sampleRecord && sampleRecord.length > 0) {
      console.log('Current columns:', Object.keys(sampleRecord[0]));
    }

    // Add participant_ic column
    console.log('\n2. Adding participant_ic column...');
    const { error: icError } = await supabase
      .from('bls_results')
      .select('participant_ic')
      .limit(1);

    if (icError && icError.message.includes('column "participant_ic" does not exist')) {
      console.log('Adding participant_ic column...');
      // Note: We can't add columns via Supabase client, need to do this in Supabase Dashboard
      console.log('⚠️ Please add this column manually in Supabase Dashboard:');
      console.log('ALTER TABLE bls_results ADD COLUMN participant_ic TEXT;');
    } else {
      console.log('✅ participant_ic column already exists');
    }

    // Add participant_name column
    console.log('\n3. Adding participant_name column...');
    const { error: nameError } = await supabase
      .from('bls_results')
      .select('participant_name')
      .limit(1);

    if (nameError && nameError.message.includes('column "participant_name" does not exist')) {
      console.log('Adding participant_name column...');
      console.log('⚠️ Please add this column manually in Supabase Dashboard:');
      console.log('ALTER TABLE bls_results ADD COLUMN participant_name TEXT;');
    } else {
      console.log('✅ participant_name column already exists');
    }

    console.log('\n📋 SQL Commands to run in Supabase Dashboard:');
    console.log('==============================================');
    console.log('ALTER TABLE bls_results ADD COLUMN participant_ic TEXT;');
    console.log('ALTER TABLE bls_results ADD COLUMN participant_name TEXT;');
    console.log('\nAfter adding these columns, run the update script to populate them.');

  } catch (error) {
    console.error('❌ Error adding columns:', error);
  }
}

addParticipantColumns();

