// createChecklistItemsTable.js
// Create the checklist_items table with proper structure

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function createChecklistItemsTable() {
  try {
    console.log('🔧 Creating checklist_items table...\n');
    
    // First, let's check if the table exists and what columns it has
    console.log('1. Checking current table structure...');
    const { data: existingData, error: existingError } = await supabase
      .from('checklist_items')
      .select('*')
      .limit(1);
    
    if (existingError) {
      console.log('❌ Error accessing table:', existingError.message);
    } else {
      console.log('✅ Table exists, checking structure...');
    }
    
    // Try to get table info by attempting different column names
    const testColumns = ['id', 'station_id', 'item_id', 'text', 'compulsory', 'category', 'created_at', 'updated_at'];
    
    console.log('\n2. Testing which columns exist...');
    for (const col of testColumns) {
      try {
        const { error } = await supabase
          .from('checklist_items')
          .select(col)
          .limit(1);
        
        if (error) {
          console.log(`❌ Column '${col}' does not exist`);
        } else {
          console.log(`✅ Column '${col}' exists`);
        }
      } catch (err) {
        console.log(`❌ Column '${col}' error:`, err.message);
      }
    }
    
    // If the table doesn't have the right structure, we need to create it
    console.log('\n3. Creating proper table structure...');
    
    // SQL to create the table with proper structure
    const createTableSQL = `
      -- Drop table if exists (be careful in production!)
      DROP TABLE IF EXISTS checklist_items CASCADE;
      
      -- Create checklist_items table
      CREATE TABLE checklist_items (
        id TEXT PRIMARY KEY,
        station_id TEXT NOT NULL,
        item_id TEXT NOT NULL,
        text TEXT NOT NULL,
        compulsory BOOLEAN NOT NULL DEFAULT false,
        category TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create indexes for better performance
      CREATE INDEX idx_checklist_items_station_id ON checklist_items(station_id);
      CREATE INDEX idx_checklist_items_item_id ON checklist_items(item_id);
      CREATE INDEX idx_checklist_items_category ON checklist_items(category);
      
      -- Create updated_at trigger
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      CREATE TRIGGER update_checklist_items_updated_at 
          BEFORE UPDATE ON checklist_items 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
      
      -- Enable Row Level Security (RLS)
      ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
      
      -- Create RLS policies
      -- Allow all authenticated users to read checklist items
      CREATE POLICY "Anyone can view checklist items" ON checklist_items
          FOR SELECT USING (true);
      
      -- Allow authenticated users to insert checklist items
      CREATE POLICY "Authenticated users can insert checklist items" ON checklist_items
          FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      
      -- Allow authenticated users to update checklist items
      CREATE POLICY "Authenticated users can update checklist items" ON checklist_items
          FOR UPDATE USING (auth.role() = 'authenticated');
      
      -- Allow authenticated users to delete checklist items
      CREATE POLICY "Authenticated users can delete checklist items" ON checklist_items
          FOR DELETE USING (auth.role() = 'authenticated');
      
      -- Grant necessary permissions
      GRANT ALL ON checklist_items TO authenticated;
      GRANT USAGE ON SCHEMA public TO authenticated;
    `;
    
    console.log('📝 SQL to create table:');
    console.log(createTableSQL);
    
    console.log('\n⚠️  Note: You need to run this SQL in your Supabase SQL editor:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Paste the SQL above and run it');
    console.log('4. Then run the upload script again');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createChecklistItemsTable();
