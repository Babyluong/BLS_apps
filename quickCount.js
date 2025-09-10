// quickCount.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickCount() {
  try {
    const { data, error } = await supabase
      .from('bls_results')
      .select('participant_name, participant_ic')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error:', error.message);
      return;
    }

    console.log(`Total records: ${data.length}`);
    console.log('First 5 participants:');
    data.slice(0, 5).forEach((record, index) => {
      console.log(`${index + 1}. ${record.participant_name} (${record.participant_ic})`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

quickCount();

