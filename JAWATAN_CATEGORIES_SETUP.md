# Jawatan Categories Standardization Setup

This guide will help you set up a standardized jawatan categorization system using a dedicated Supabase table.

## 🎯 Overview

Instead of hardcoding clinical/non-clinical jawatan lists in the code, we'll create a database table that can be easily managed and updated.

## 📋 Steps to Implement

### Step 1: Create the Database Table

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to SQL Editor

2. **Run the SQL Script**
   - Copy and paste the contents of `createJawatanCategoriesTable.sql`
   - Execute the script

3. **Verify the Table**
   - Check that the `jawatan_categories` table was created
   - Verify that all 7 clinical and 11+ non-clinical jawatan are inserted

### Step 2: Update Your Code

The new system includes:

- **Database Table**: `jawatan_categories` with all jawatan and their categories
- **Utility Functions**: `src/utils/jawatanCategoryUtils.js` for database operations
- **Updated Score Utils**: `src/utils/scoreUtils.js` now uses the database
- **Migration Script**: `migrateJawatanCategories.js` to update existing profiles

### Step 3: Run Migration (Optional)

If you want to update existing profiles with the new categorization:

```bash
node migrateJawatanCategories.js
```

## 🏥 Clinical Jawatan (Only 7 positions)

1. **PEGAWAI PERUBATAN** - Medical Officer
2. **PENOLONG PEGAWAI PERUBATAN** - Assistant Medical Officer  
3. **JURURAWAT** - Nurse
4. **JURURAWAT MASYARAKAT** - Community Nurse
5. **PEMBANTU PERAWATAN KESIHATAN** - Health Care Assistant
6. **PEGAWAI PERGIGIAN** - Dental Officer
7. **JURUTERAPI PERGIGIAN** - Dental Therapist

## 🏢 Non-Clinical Jawatan (All others)

- PEGAWAI FARMASI
- PENOLONG PEGAWAI FARMASI
- JURUTEKNOLOGI MAKMAL PERUBATAN
- JURUPULIH PERUBATAN CARAKERJA
- JURUPULIH FISIOTERAPI
- JURU-XRAY
- PENOLONG PEGAWAI TADBIR
- PEMBANTU KHIDMAT AM
- PEMBANTU TADBIR
- PEMBANTU PENYEDIAAN MAKANAN
- PENOLONG JURUTERA
- Staff
- Administrator

## 🔧 Database Functions

### `get_jawatan_category(jawatan_input)`
Returns the category for a given jawatan name.

### `jawatan_categories_view`
A view that shows only active jawatan categories.

## 📊 Benefits

1. **Centralized Management**: All jawatan categories in one place
2. **Easy Updates**: Add/modify jawatan without code changes
3. **Consistent Categorization**: Same logic across all parts of the app
4. **Audit Trail**: Track when categories were added/modified
5. **Flexible**: Can easily add new jawatan or change categories

## 🛠️ Admin Functions

### Add New Jawatan
```javascript
import { addJawatanCategory } from './src/utils/jawatanCategoryUtils';

await addJawatanCategory('NEW POSITION', 'clinical', 'Description');
```

### Update Existing Jawatan
```javascript
import { updateJawatanCategory } from './src/utils/jawatanCategoryUtils';

await updateJawatanCategory('OLD POSITION', 'non-clinical', 'New description');
```

### Get All Categories
```javascript
import { getAllJawatanCategories } from './src/utils/jawatanCategoryUtils';

const categories = await getAllJawatanCategories();
```

## 🔒 Security

- **Row Level Security (RLS)** enabled
- **Read access** for all authenticated users
- **Write access** only for admins
- **Audit trail** with created_at/updated_at timestamps

## 🚀 Usage in Your App

The existing code will automatically use the new database table:

```javascript
import { getUserCategory } from './src/utils/scoreUtils';

// This now uses the database table
const category = await getUserCategory('JURURAWAT'); // Returns 'clinical'
```

## 📝 Maintenance

### Adding New Jawatan
1. Use the admin functions in `jawatanCategoryUtils.js`
2. Or directly insert into the `jawatan_categories` table

### Changing Categories
1. Update the `jawatan_categories` table
2. Run the migration script to update existing profiles

### Monitoring
- Check the `jawatan_categories` table for all active categories
- Use the `jawatan_categories_view` for easy querying

## ✅ Verification

After setup, verify everything works:

1. **Database Table**: Check `jawatan_categories` table exists
2. **Data**: Verify all 7 clinical jawatan are marked as 'clinical'
3. **Functions**: Test `get_jawatan_category()` function
4. **App**: Test the "Highest Score" buttons in your app
5. **Profiles**: Check that existing profiles have correct categories

## 🆘 Troubleshooting

### If Database Connection Fails
- The code falls back to the hardcoded list
- Check Supabase connection settings
- Verify RLS policies are correct

### If Categories Are Wrong
- Check the `jawatan_categories` table data
- Verify the `get_jawatan_category()` function
- Run the migration script again

### If App Doesn't Load
- Check for syntax errors in the new utility files
- Verify all imports are correct
- Check Supabase service configuration

## 📞 Support

If you encounter any issues:
1. Check the Supabase logs
2. Verify the database table structure
3. Test the utility functions individually
4. Check the browser console for errors
