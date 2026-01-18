# Workflow Guide: Candidates vs Submissions

## Overview

The tracker has **two separate data flows** for different types of closure reports:

1. **Candidates** → Automated scraping from news sources
2. **Submissions** → Manual community contributions via Google Form

These flows are intentionally separated because they have different validation requirements and trust levels.

---

## 1. Candidates Workflow (Automated)

### Source
- RSS feeds from news outlets (Straits Times, CNA, Seth Lui, Eatbook, etc.)
- AI-powered semantic analysis using GPT-4o-mini
- Automatic duplicate detection

### Flow
```
News Article → RSS Scraper → AI Analysis → Candidates Sheet → [Admin Review] → Closures Sheet
```

### Candidates Sheet Columns
```
candidate_id | found_at | publisher | headline | url | published_at | matched_terms | business_name | area_guess | confidence_score | ai_reason | status | closure_id
```

### Status Values
- `new` - Just discovered, needs review
- `approved` - Admin approved, ready to promote
- `duplicate` - Already exists in Closures
- `promoted` - Successfully moved to Closures
- `rejected` - Not a valid closure

### Admin Actions

#### To Promote Candidates to Closures:
1. Review candidates in the `Candidates` sheet
2. Change `status` column to `approved` for valid closures
3. Run `promoteCandidatesToClosures()` function in Apps Script
4. Candidates will be automatically:
   - Checked for duplicates (by business name)
   - Assigned a closure ID
   - Added to Closures sheet
   - Auto-published if name + area are present

#### Duplicate Handling
- Automatic duplicate detection by normalized business name
- Duplicates are marked with `status = duplicate`
- No manual intervention needed

---

## 2. Submissions Workflow (Manual)

### Source
- Google Form submissions from community contributors
- May include insider information not publicly available
- Requires manual verification

### Flow
```
Google Form → Submissions Sheet → [Validation] → [Admin Review] → Closures Sheet
```

### Submissions Sheet Columns
```
Timestamp | Business Name | Outlet/Branch Name | Business Address | Last Day of Operation | Reason for Closure | Source URL | Additional Notes | Submitter Name | Submitter Contact | Validation Status | Validation Flags | Review Action | Reviewed At | Closure ID
```

### Validation Status
- `auto_queue` - Passed all validation checks
- `needs_review` - Has validation flags, requires manual review
- `reject` - Failed critical validation (spam, gibberish, etc.)

### Review Actions
- `accept` - Move to Closures sheet
- `reject` - Mark as rejected, don't publish
- Leave blank - Still pending review

### Admin Actions

#### To Accept Submissions:
1. Review submissions in the `Submissions` sheet
2. Set `Review Action` column to `accept`
3. The `onEdit` trigger will automatically:
   - Generate a closure ID
   - Create a record in Closures sheet
   - Check if required fields are present
   - Auto-publish if all required fields filled

#### Required Fields for Auto-Publish
- Business Name
- Business Address
- Last Day of Operation

If any required field is missing, the closure is added but `published = FALSE`.

---

## 3. Closures Sheet (Public Database)

### Columns
```
closure_id | added_at | business_name | outlet_name | address | category | last_day | description | source_urls | tags | published
```

### Published Field
- `TRUE` - Visible on public website
- `FALSE` - Hidden from public, needs completion

### Making Closures Public

#### Auto-Published:
- **From Candidates:** If business name + area are present
- **From Submissions:** If business name + address + last day are present

#### Manual Publishing:
1. Fill in missing required fields (business name, address, last day)
2. Optionally add: category, tags, better description
3. Change `published` column to `TRUE`
4. Closure will appear on website within minutes

---

## 4. Key Differences

| Aspect | Candidates | Submissions |
|--------|-----------|-------------|
| **Source** | Automated scraping | Manual form |
| **Trust Level** | Pre-verified by news | Needs verification |
| **Duplicate Check** | Automatic | Manual review |
| **Validation** | AI semantic analysis | Rule-based validation |
| **Flow** | Direct to Closures | Via review workflow |
| **Required Fields** | Name + Area | Name + Address + Last Day |
| **Admin Action** | Set status to `approved` | Set action to `accept` |

---

## 5. Common Admin Tasks

### Daily Routine

1. **Check Candidates** (5 mins)
   - Review new candidates with high confidence scores
   - Mark valid ones as `approved`
   - Run `promoteCandidatesToClosures()`

2. **Review Submissions** (10 mins)
   - Check submissions with `needs_review` status
   - Verify information if needed
   - Set `Review Action` to `accept` or `reject`

3. **Complete Unpublished Closures** (as needed)
   - Filter Closures sheet for `published = FALSE`
   - Fill in missing information
   - Change `published` to `TRUE`

### Weekly Routine

1. **Run RSS Scraper**
   - Execute `fetchCandidates()` function
   - Check Telegram for notifications

2. **Clean Up**
   - Archive old rejected submissions
   - Review duplicate candidates

---

## 6. Script Functions Reference

### For Candidates
- `fetchCandidates()` - Scrape RSS feeds, analyze with AI
- `promoteCandidatesToClosures()` - Move approved candidates to Closures
- `initializeCandidatesSheet()` - Set up Candidates sheet headers

### For Submissions
- `onFormSubmit()` - Triggered when form submitted, validates data
- `onEdit()` - Triggered when Review Action changed, processes accept/reject
- `addReviewColumns()` - Add validation columns to Submissions sheet

### Utilities
- `assignMissingClosureIds()` - Assign IDs to manually added closures
- `initializeProperties()` - Reset closure ID counter

---

## 7. Troubleshooting

### Candidate not promoting?
- Check `status` is set to `approved`
- Run `promoteCandidatesToClosures()` manually
- Check logs for duplicate detection

### Submission not accepting?
- Ensure `Review Action` is exactly `accept` (case-sensitive)
- Check if `onEdit` trigger is installed
- Verify Closures sheet exists

### Closure not showing on website?
- Check `published` column is `TRUE`
- Verify CSV export is working
- Check Railway environment variables

---

## 8. Future Enhancements

- [ ] Automatic scheduling for `fetchCandidates()` (time-driven trigger)
- [ ] Automatic scheduling for `promoteCandidatesToClosures()` (daily)
- [ ] Email notifications for high-confidence candidates
- [ ] Bulk approve/reject UI for candidates
- [ ] API endpoint for real-time updates

---

**Last Updated:** January 18, 2026
