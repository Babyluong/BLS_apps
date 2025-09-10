# BLS Results Combination Implementation

This implementation combines data from `quiz_sessions` and `checklist_results` tables into a unified `bls_result` table to reduce confusion when loading results in the BLS Results screen.

## Overview

The BLS application now uses a unified data structure where:
- **Pre-test and Post-test results** are stored in `quiz_sessions` table
- **Checklist results** are stored in `checklist_results` table  
- **Combined results** are stored in `bls_result` table for easy access

## Files Created/Modified

### New Files
1. **`combineBLSResults.js`** - Main script to combine data from individual tables into bls_result
2. **`testCombinedBLSResults.js`** - Test script to verify the implementation
3. **`runBLSCombination.js`** - Simple script to run the combination process
4. **`BLS_COMBINATION_README.md`** - This documentation file

### Modified Files
1. **`services/blsResultsService.js`** - Updated to work with the new combined structure

## Database Schema Changes

The `bls_result` table has been enhanced with new columns:

```sql
-- New columns added to bls_result table
ALTER TABLE bls_result 
ADD COLUMN IF NOT EXISTS participant_name TEXT,
ADD COLUMN IF NOT EXISTS participant_ic TEXT,
ADD COLUMN IF NOT EXISTS pre_test_session_id UUID,
ADD COLUMN IF NOT EXISTS post_test_session_id UUID,
ADD COLUMN IF NOT EXISTS pre_test_percentage INTEGER,
ADD COLUMN IF NOT EXISTS post_test_percentage INTEGER,
ADD COLUMN IF NOT EXISTS pre_test_answers JSONB,
ADD COLUMN IF NOT EXISTS post_test_answers JSONB,
ADD COLUMN IF NOT EXISTS pre_test_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS post_test_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS checklist_results JSONB,
ADD COLUMN IF NOT EXISTS total_checklist_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_checklist_items INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS checklist_pass_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS checklist_total_count INTEGER DEFAULT 0;
```

## How to Use

### 1. Run the Combination Process

```bash
node runBLSCombination.js
```

This will:
- Update the `bls_result` table schema
- Combine data from `quiz_sessions` and `checklist_results`
- Create unified records in `bls_result` table
- Display a summary of the combination process

### 2. Test the Implementation

```bash
node testCombinedBLSResults.js
```

This will:
- Verify table structure
- Test data combination
- Test BLSResultsService methods
- Verify data integrity

### 3. Use in Your Application

The updated `BLSResultsService` provides these methods:

```javascript
import { BLSResultsService } from './services/blsResultsService.js';

// Get combined results from the unified table
const results = await BLSResultsService.getAllBLSResults();

// Get combined results by combining individual tables (real-time)
const combinedResults = await BLSResultsService.getCombinedBLSResults();

// Save new results (automatically combines data)
await BLSResultsService.saveBLSResults(resultData);
```

## Data Structure

### Combined Result Object

```javascript
{
  id: "uuid",
  user_id: "uuid",
  participant_name: "John Doe",
  participant_ic: "123456789012",
  
  // Pre-test data
  pre_test_score: 25,
  pre_test_percentage: 83,
  pre_test_session_id: "uuid",
  pre_test_answers: {...},
  pre_test_started_at: "2024-01-01T10:00:00Z",
  
  // Post-test data
  post_test_score: 28,
  post_test_percentage: 93,
  post_test_session_id: "uuid", 
  post_test_answers: {...},
  post_test_started_at: "2024-01-01T11:00:00Z",
  
  // Checklist pass/fail status
  one_man_cpr_pass: true,
  two_man_cpr_pass: false,
  adult_choking_pass: true,
  infant_choking_pass: true,
  infant_cpr_pass: false,
  
  // Checklist details
  one_man_cpr_details: { performed: [...], notPerformed: [...] },
  two_man_cpr_details: { performed: [...], notPerformed: [...] },
  adult_choking_details: { performed: [...], notPerformed: [...] },
  infant_choking_details: { performed: [...], notPerformed: [...] },
  infant_cpr_details: { performed: [...], notPerformed: [...] },
  
  // Combined checklist data
  checklist_results: {
    "one-man-cpr": { id: "uuid", score: 8, total_items: 10, status: "PASS", ... },
    "two-man-cpr": { id: "uuid", score: 5, total_items: 10, status: "FAIL", ... },
    // ... other checklist types
  },
  
  // Statistics
  total_checklist_score: 35,
  total_checklist_items: 50,
  checklist_pass_count: 3,
  checklist_total_count: 5,
  
  // Metadata
  created_at: "2024-01-01T12:00:00Z",
  updated_at: "2024-01-01T12:00:00Z"
}
```

## Benefits

1. **Unified Data Access** - All BLS results in one table
2. **Reduced Confusion** - Clear data structure for the BLS Results screen
3. **Better Performance** - Single query instead of multiple joins
4. **Comprehensive Statistics** - Easy access to combined metrics
5. **Backward Compatibility** - Original tables remain intact
6. **Real-time Updates** - Can still combine data on-the-fly if needed

## Migration Notes

- The combination process preserves all original data
- Original `quiz_sessions` and `checklist_results` tables remain unchanged
- The `bls_result` table is populated with combined data
- Existing code can be gradually migrated to use the new structure
- The `getCombinedBLSResults()` method provides real-time combination if needed

## Troubleshooting

### Common Issues

1. **Table doesn't exist**: Run the combination script to create/update the schema
2. **Permission errors**: Ensure your Supabase credentials have the necessary permissions
3. **Data not combining**: Check that participant IC numbers match between tables
4. **Missing columns**: The combination script will add missing columns automatically

### Verification

Check the combination was successful by:
1. Running the test script
2. Checking the `bls_result` table in Supabase dashboard
3. Verifying data counts match expectations
4. Testing the BLS Results screen functionality

## Support

If you encounter any issues:
1. Check the console output for error messages
2. Verify your Supabase connection and permissions
3. Ensure all required tables exist
4. Run the test script to identify specific problems

