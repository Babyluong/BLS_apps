// scripts/testChecklistTable.js
// Test script to verify checklist_results table exists and is working

import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testChecklistTable() {
  console.log('Testing checklist_results table...');
  
  try {
    // Test 1: Check if table exists
    console.log('1. Checking if table exists...');
    const { data: tableData, error: tableError } = await supabase
      .from('checklist_results')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table does not exist or has issues:', tableError);
      return false;
    }
    
    console.log('✅ Table exists and is accessible');
    
    // Test 2: Check table structure
    console.log('2. Checking table structure...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'checklist_results' });
    
    if (columnsError) {
      console.log('⚠️  Could not get column info, but table exists');
    } else {
      console.log('✅ Table structure:', columns);
    }
    
    // Test 3: Try to insert a test record
    console.log('3. Testing insert...');
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
      participant_name: 'Test User',
      participant_ic: '123456789012',
      checklist_type: 'infant-choking',
      score: 5,
      total_items: 10,
      status: 'PASS',
      checklist_details: { test: true },
      comments: 'Test record'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('checklist_results')
      .insert(testData)
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      return false;
    }
    
    console.log('✅ Insert successful:', insertData);
    
    // Test 4: Clean up test record
    console.log('4. Cleaning up test record...');
    const { error: deleteError } = await supabase
      .from('checklist_results')
      .delete()
      .eq('id', insertData[0].id);
    
    if (deleteError) {
      console.error('⚠️  Could not clean up test record:', deleteError);
    } else {
      console.log('✅ Test record cleaned up');
    }
    
    console.log('🎉 All tests passed! The checklist_results table is working correctly.');
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Alternative simple test
async function simpleTest() {
  console.log('Running simple test...');
  
  try {
    const { data, error } = await supabase
      .from('checklist_results')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Simple test failed:', error);
      console.log('The table might not exist. Please run the SQL script to create it.');
      return false;
    }
    
    console.log('✅ Simple test passed! Table exists and is accessible.');
    return true;
  } catch (err) {
    console.error('❌ Simple test error:', err);
    return false;
  }
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
  simpleTest();
}

export { testChecklistTable, simpleTest };