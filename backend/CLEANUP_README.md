# Routine Cleanup

This script removes the hardcoded routine from the `lists` table since we now have a proper custom routine system.

## What This Script Does

1. **Removes the hardcoded routine** with `category = 'routine'` from the `lists` table
2. **Cleans up the database** by removing the fallback routine that's no longer needed
3. **Prepares the system** to rely entirely on user custom routines

## Why We're Doing This

- ✅ **Custom routine editor** is fully implemented and working
- ✅ **User routines table** (`user_routines`) is functional
- ✅ **Fallback system** is no longer needed
- ✅ **Cleaner database** without hardcoded data

## How to Run

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Run the cleanup script:**
   ```bash
   npm run ts-node src/scripts/remove-routine-list.ts
   ```

   Or if you have ts-node installed globally:
   ```bash
   ts-node src/scripts/remove-routine-list.ts
   ```

## What Happens After Cleanup

- **Non-logged-in users** will see a "No Routine Found" message with a login link
- **Logged-in users** will see their custom routines or a message to create their first routine
- **The system** will rely entirely on the `user_routines` table
- **No more hardcoded fallback** routine data

## Verification

After running the script, you can verify the cleanup by:

1. **Checking the database:**
   ```sql
   SELECT * FROM lists WHERE category = 'routine';
   ```
   This should return no rows.

2. **Testing the frontend:**
   - Visit the routine page without logging in
   - You should see the "No Routine Found" message
   - Log in and create a custom routine to test the new system

## Rollback (If Needed)

If you need to restore the hardcoded routine for any reason, you can:

1. **Re-run the original migration** that populated the lists table
2. **Or manually insert** the routine data back into the lists table

## Files Removed

- `backend/src/data/routine-data.ts` - Hardcoded routine data (deleted)
- `backend/src/scripts/remove-routine-list.ts` - This cleanup script (can be deleted after use)

## Next Steps

After cleanup:
1. **Test the routine page** for both logged-in and non-logged-in users
2. **Verify the custom routine editor** works correctly
3. **Delete this cleanup script** if everything is working properly
