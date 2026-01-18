# Schema Changes Log

## Change #5: Removed `evidence_excerpt` Column

**Date:** January 18, 2026  
**Reason:** The `evidence_excerpt` field was rarely used and added unnecessary complexity. Source URLs are sufficient for verification.

### What Changed

#### Closures Sheet (Public)
**Before (12 columns):**
```
closure_id | added_at | business_name | outlet_name | address | category | status | last_day | description | source_urls | evidence_excerpt | tags
```

**After (11 columns):**
```
closure_id | added_at | business_name | outlet_name | address | category | status | last_day | description | source_urls | tags
```

**Changes:**
- ❌ Removed: `evidence_excerpt` (was column 10)
- ✅ Note: Source URLs remain for verification purposes

### Files Updated

1. **google-apps-script/Code.gs**
   - Updated `CLOSURES_COLUMNS` mapping (tags moved from 11 → 10)
   - Updated `acceptSubmission()` to not include evidence_excerpt

2. **src/app/data/types.ts**
   - Removed `evidence_excerpt: string` from Closure interface

3. **src/app/data/closures.ts**
   - Updated CSV parsing to expect 11 columns instead of 12
   - Removed evidence_excerpt field mapping

### Migration Guide

If you already have data in your sheets:

**For Closures sheet:**
1. Delete the `evidence_excerpt` column (column K)
2. Verify you now have 11 columns
3. No data loss - source URLs are preserved

**Google Apps Script:**
- Copy the updated `Code.gs` from `google-apps-script/Code.gs`
- Replace your existing script completely

### Benefits

✅ **Simpler schema** - One less column to manage  
✅ **Less redundancy** - Source URLs are sufficient for verification  
✅ **Easier maintenance** - Fewer fields to populate  
✅ **Cleaner data** - Focus on essential information

---

## Change #4: Simplified Submissions Schema

**Date:** January 18, 2026  
**Reason:** Overcomplicated schema with too many columns. Simplified to use Google Forms column names directly.

### What Changed

#### Submissions Sheet (Private)
**Before (22 columns with complex names):**
```
submission_id | submitted_at | source_type | submitter_name | submitter_contact | business_name_raw | outlet_name_raw | address_raw | closure_description | last_day | evidence_url | evidence_excerpt | notes | validation_status | validation_flags | possible_duplicate | dup_match | review_status | review_action | review_notes | reviewed_at | result_closure_id
```

**After (10 form columns + 5 review columns):**
```
Timestamp | Business Name | Outlet/Branch Name | Business Address | Last Day of Operation | Reason for Closure | Source URL | Additional Notes | Submitter Name | Submitter Contact | Validation Status | Validation Flags | Review Action | Reviewed At | Closure ID
```

**Changes:**
- ✅ Uses Google Forms column names directly (no renaming needed)
- ✅ Review columns added automatically by script
- ✅ Much simpler setup - just link form and rename tab
- ❌ Removed: submission_id, source_type, evidence_excerpt, possible_duplicate, dup_match, review_status, review_notes

---

# Schema Changes Log

## Change #3: Removed `announced_date` Column

**Date:** January 18, 2026  
**Reason:** Not all F&B closures are publicly announced. Many are discovered after the fact. The `last_day` field is more universally applicable.

### What Changed

#### Closures Sheet (Public)
**Before (13 columns):**
```
closure_id | added_at | business_name | outlet_name | address | category | status | announced_date | last_day | description | source_urls | evidence_excerpt | tags
```

**After (12 columns):**
```
closure_id | added_at | business_name | outlet_name | address | category | status | last_day | description | source_urls | evidence_excerpt | tags
```

**Changes:**
- ❌ Removed: `announced_date` (was column 7)
- ✅ Note: `last_day` can represent last day of operation OR date discovered closed

#### Submissions Sheet (Private)
**Before (23 columns):**
```
submission_id | submitted_at | source_type | submitter_name | submitter_contact | business_name_raw | outlet_name_raw | address_raw | closure_description | announced_date | last_day | evidence_url | evidence_excerpt | notes | validation_status | validation_flags | possible_duplicate | dup_match | review_status | review_action | review_notes | reviewed_at | result_closure_id
```

**After (22 columns):**
```
submission_id | submitted_at | source_type | submitter_name | submitter_contact | business_name_raw | outlet_name_raw | address_raw | closure_description | last_day | evidence_url | evidence_excerpt | notes | validation_status | validation_flags | possible_duplicate | dup_match | review_status | review_action | review_notes | reviewed_at | result_closure_id
```

**Changes:**
- ❌ Removed: `announced_date` (was column 9)

---

## Change #2: Removed `area` Column

**Date:** January 18, 2026  
**Reason:** Area/neighborhood information can be included in the address field, eliminating the need for a separate column.

### What Changed

#### Closures Sheet (Public)
**Before (14 columns):**
```
closure_id | added_at | business_name | outlet_name | address | area | category | status | announced_date | last_day | description | source_urls | evidence_excerpt | tags
```

**After (13 columns):**
```
closure_id | added_at | business_name | outlet_name | address | category | status | announced_date | last_day | description | source_urls | evidence_excerpt | tags
```

**Changes:**
- ❌ Removed: `area` (was column 5)
- ✅ Note: Include area/neighborhood in the `address` field

#### Submissions Sheet (Private)
**Before (24 columns):**
```
submission_id | submitted_at | source_type | submitter_name | submitter_contact | business_name_raw | outlet_name_raw | address_raw | area_raw | closure_description | announced_date | last_day | evidence_url | evidence_excerpt | notes | validation_status | validation_flags | possible_duplicate | dup_match | review_status | review_action | review_notes | reviewed_at | result_closure_id
```

**After (23 columns):**
```
submission_id | submitted_at | source_type | submitter_name | submitter_contact | business_name_raw | outlet_name_raw | address_raw | closure_description | announced_date | last_day | evidence_url | evidence_excerpt | notes | validation_status | validation_flags | possible_duplicate | dup_match | review_status | review_action | review_notes | reviewed_at | result_closure_id
```

**Changes:**
- ❌ Removed: `area_raw` (was column 8)

---

## Change #1: Removed Redundant `reasons` Column

**Date:** January 18, 2026  
**Reason:** The `reasons` and `closure_description` fields were redundant - both captured the same information about why a business closed.

### What Changed

#### Closures Sheet (Public)
**Before (15 columns):**
```
closure_id | added_at | business_name | outlet_name | address | area | category | status | announced_date | last_day | reasons | source_urls | evidence_excerpt | short_note | tags
```

**After (14 columns):**
```
closure_id | added_at | business_name | outlet_name | address | area | category | status | announced_date | last_day | description | source_urls | evidence_excerpt | tags
```

**Changes:**
- ❌ Removed: `reasons` (column 10)
- ❌ Removed: `short_note` (column 13)
- ✅ Renamed: `reasons` → `description` (now column 10)
- ✅ Consolidated: All closure details go into `description` field

#### Submissions Sheet (Private)
**Before (25 columns):**
```
submission_id | submitted_at | source_type | submitter_name | submitter_contact | business_name_raw | outlet_name_raw | address_raw | area_raw | closure_claim | announced_date | last_day | reasons_claimed | evidence_url | evidence_excerpt | notes | validation_status | validation_flags | possible_duplicate | dup_match | review_status | review_action | review_notes | reviewed_at | result_closure_id
```

**After (24 columns):**
```
submission_id | submitted_at | source_type | submitter_name | submitter_contact | business_name_raw | outlet_name_raw | address_raw | area_raw | closure_description | announced_date | last_day | evidence_url | evidence_excerpt | notes | validation_status | validation_flags | possible_duplicate | dup_match | review_status | review_action | review_notes | reviewed_at | result_closure_id
```

**Changes:**
- ❌ Removed: `reasons_claimed` (was column 12)
- ✅ Renamed: `closure_claim` → `closure_description` (column 9)

### Files Updated

1. **SETUP_GUIDE.md**
   - Updated Closures tab schema (Section 1.1)
   - Updated Submissions tab schema (Section 1.1)
   - Updated form field mapping (Section 2.3)
   - Removed "Reason for Closure" from optional fields

2. **src/app/data/types.ts**
   - Changed `reasons: string` → `description: string`
   - Removed `short_note: string`

3. **src/app/data/closures.ts**
   - Updated CSV parsing to expect 14 columns instead of 15
   - Changed field mapping from `reasons` → `description`

4. **google-apps-script/Code.gs**
   - Updated `COLUMNS.CLOSURES` mapping
   - Updated `COLUMNS.SUBMISSIONS` mapping
   - Changed `closure_claim` → `closure_description` throughout
   - Changed `reasons_claimed` → removed
   - Updated `acceptSubmission()` to use `closure_description`
   - Updated Telegram notification message

### Migration Guide

If you already have data in your sheets:

#### Option 1: Start Fresh (Recommended for new projects)
1. Delete all data rows (keep headers)
2. Update headers to match new schema
3. Start adding new data

#### Option 2: Migrate Existing Data

**For Closures sheet:**
1. Delete the `announced_date` column
2. Verify you now have 12 columns

**For Submissions sheet:**
1. Delete the `announced_date` column
2. Verify you now have 22 columns

**Google Apps Script:**
- Copy the updated `Code.gs` from `google-apps-script/Code.gs`
- Replace your existing script completely
- No need to change Script Properties

### Benefits of These Changes

✅ **Simpler schema** - Fewer redundant columns  
✅ **More realistic** - Not all closures are announced  
✅ **Easier form** - Fewer fields for users to fill out  
✅ **Cleaner data** - One date field instead of two  
✅ **Better UX** - More straightforward for both submitters and admins  
✅ **More flexible** - `last_day` can mean "last day" or "date discovered"

### Impact

- **Breaking Change:** Yes - existing sheets need column updates
- **Frontend Impact:** Uses `last_day` instead of `announced_date` for display
- **Backend Impact:** Column index shifts in Apps Script
- **Data Loss:** `announced_date` data will be lost (can keep `last_day`)

---

## Future Schema Considerations

Potential future changes to consider:

1. **Add `closure_type` field**: "Permanent" vs "Temporary" vs "Relocated"
2. **Add `verified_by` field**: Track who verified the closure
3. **Add `last_updated` field**: Track when record was last modified
4. **Split `source_urls`**: Use separate columns for different source types
5. **Add `coordinates` field**: Latitude/longitude for mapping

---

## Summary of All Changes

**Current Schema:**
- **Closures:** 11 columns (was 15)
- **Submissions:** 15 columns (10 form + 5 review, was 25)

**Removed Columns:**
1. `reasons` / `short_note` → Consolidated into `description`
2. `area` / `area_raw` → Include in `address` field
3. `announced_date` → Use `last_day` instead
4. `evidence_excerpt` → Source URLs are sufficient
5. Multiple submission tracking columns → Simplified to Google Forms defaults

**Benefits:**
- 27% fewer columns overall (11 vs 15 for Closures)
- Simpler, more intuitive schema
- Easier for users to submit
- Less redundant data
- More realistic for actual closure scenarios
- Direct integration with Google Forms

---

**Last Updated:** January 18, 2026
