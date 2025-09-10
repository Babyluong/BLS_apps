// scripts/createChecklistTable.js
// Run this script to create the checklist_results table in Supabase

import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createChecklistTable() {
  console.log('Creating checklist_results table...');
  
  const createTableSQL = `
    -- Create table for individual BLS checklist practice results
    CREATE TABLE IF NOT EXISTS checklist_results (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        -- User information
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        participant_name TEXT NOT NULL,
        participant_ic TEXT,
        
        -- Assessment details
        checklist_type TEXT NOT NULL CHECK (checklist_type IN (
            'infant-choking',
            'one-man-cpr', 
            'adult-choking',
            'infant-cpr',
            'two-man-cpr'
        )),
        
        -- Results
        score INTEGER NOT NULL DEFAULT 0,
        total_items INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL CHECK (status IN ('PASS', 'FAIL')),
        
        -- Detailed results
        checklist_details JSONB,
        comments TEXT,
        
        -- Metadata
        assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        duration_seconds INTEGER,
        
        -- Indexes for better performance
        CONSTRAINT valid_score CHECK (score >= 0 AND score <= total_items),
        CONSTRAINT valid_total_items CHECK (total_items > 0)
    );

    -- Create indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_checklist_results_user_id ON checklist_results(user_id);
    CREATE INDEX IF NOT EXISTS idx_checklist_results_checklist_type ON checklist_results(checklist_type);
    CREATE INDEX IF NOT EXISTS idx_checklist_results_status ON checklist_results(status);
    CREATE INDEX IF NOT EXISTS idx_checklist_results_created_at ON checklist_results(created_at);
    CREATE INDEX IF NOT EXISTS idx_checklist_results_participant_ic ON checklist_results(participant_ic);

    -- Create updated_at trigger
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER update_checklist_results_updated_at 
        BEFORE UPDATE ON checklist_results 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();

    -- Enable Row Level Security (RLS)
    ALTER TABLE checklist_results ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
    -- Users can only see their own results
    CREATE POLICY "Users can view own checklist results" ON checklist_results
        FOR SELECT USING (auth.uid() = user_id);

    -- Users can insert their own results
    CREATE POLICY "Users can insert own checklist results" ON checklist_results
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- Users can update their own results
    CREATE POLICY "Users can update own checklist results" ON checklist_results
        FOR UPDATE USING (auth.uid() = user_id);

    -- Users can delete their own results
    CREATE POLICY "Users can delete own checklist results" ON checklist_results
        FOR DELETE USING (auth.uid() = user_id);

    -- Admins can see all results (assuming admin role exists)
    CREATE POLICY "Admins can view all checklist results" ON checklist_results
        FOR ALL USING (
            EXISTS (
                SELECT 1 FROM profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role = 'admin'
            )
        );

    -- Grant necessary permissions
    GRANT ALL ON checklist_results TO authenticated;
    GRANT USAGE ON SCHEMA public TO authenticated;
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.error('Error creating table:', error);
      return false;
    }
    
    console.log('✅ checklist_results table created successfully!');
    return true;
  } catch (err) {
    console.error('Error:', err);
    return false;
  }
}

// Alternative method using direct SQL execution
async function createTableAlternative() {
  console.log('Creating checklist_results table using alternative method...');
  
  try {
    // Test if table exists
    const { data: testData, error: testError } = await supabase
      .from('checklist_results')
      .select('id')
      .limit(1);
    
    if (!testError) {
      console.log('✅ checklist_results table already exists!');
      return true;
    }
    
    console.log('Table does not exist, please create it manually in Supabase dashboard.');
    console.log('Copy and paste the SQL from bls/database/create_checklist_results_table.sql');
    return false;
  } catch (err) {
    console.error('Error checking table:', err);
    return false;
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createTableAlternative();
}

export { createChecklistTable, createTableAlternative };
