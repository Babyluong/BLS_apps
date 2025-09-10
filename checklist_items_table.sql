-- checklist_items_table.sql
-- Run this SQL in your Supabase SQL Editor to create the proper table structure

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
