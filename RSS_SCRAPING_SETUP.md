# RSS Scraping Setup Guide

This document explains how to set up and use the automated RSS scraping feature for discovering F&B closure news.

## Overview

The system automatically:
1. **Fetches RSS feeds** from Singapore F&B news sources every 6-12 hours
2. **Identifies closure-related headlines** using keyword matching
3. **Saves candidates** to the `Candidates` sheet for review
4. **Converts approved candidates** to draft submissions in the `Submissions` sheet

## Setup Steps

### 1. Initialize the Candidates Sheet

In Google Apps Script:

1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. Find the function `initializeCandidatesSheet()`
4. Click **Run** (you may need to authorize the script)

This creates a new sheet called `Candidates` with the proper column headers.

### 2. Set Up Time-Driven Triggers

To run the scraper automatically:

1. In Apps Script, click the **clock icon** (Triggers) in the left sidebar
2. Click **+ Add Trigger** and configure:
   - **Function**: `fetchCandidates`
   - **Event source**: Time-driven
   - **Type**: Hour timer
   - **Interval**: Every 6 or 12 hours (your choice)
3. Click **Save**

4. Add another trigger:
   - **Function**: `draftSubmissionsFromCandidates`
   - **Event source**: Time-driven
   - **Type**: Hour timer
   - **Interval**: Every 12 hours
5. Click **Save**

### 3. Manual Testing

Before setting up triggers, test manually:

1. In Apps Script, select `fetchCandidates` from the function dropdown
2. Click **Run**
3. Check the **Execution log** for results
4. Open your Google Sheet and check the `Candidates` tab

## Workflow

### Automatic Discovery (Every 6-12 hours)

```
RSS Feeds → fetchCandidates() → New rows in CANDIDATES sheet
                                 (status = 'new')
                                      ↓
                              Telegram notification sent
```

### Admin Review Process

1. **Review new candidates** in the `Candidates` sheet
2. For promising candidates:
   - Change `status` from `new` to `queued`
   - Optionally add notes in `review_notes`
3. For irrelevant candidates:
   - Change `status` to `rejected`

### Automatic Draft Creation (Every 12 hours)

```
Candidates with status='queued' → draftSubmissionsFromCandidates()
                                              ↓
                                   New rows in SUBMISSIONS sheet
                                   (source = 'System (RSS)')
                                              ↓
                                   Standard validation & review workflow
```

## RSS Feed Sources

Currently configured sources:

- **The Straits Times** - Food section
- **Channel NewsAsia** - Food section
- **Mothership.sg** - All articles
- **Seth Lui** - Food blog
- **Daniel Food Diary** - Food blog
- **Eatbook** - Food blog

### Adding More Sources

To add more RSS feeds, edit the `RSS_FEEDS` array in `Code.gs`:

```javascript
const RSS_FEEDS = [
  'https://www.straitstimes.com/rss/food',
  'https://your-new-source.com/rss',  // Add here
  // ... more feeds
];
```

## Closure Keywords

The system looks for these keywords in headlines:

- close, closes, closed, closing
- shut, shutting, shutter
- cease, ceases, ceased, ceasing
- farewell, final day, last day
- goodbye, end of, no more
- permanently

### Customizing Keywords

Edit the `CLOSURE_KEYWORDS` array in `Code.gs`:

```javascript
const CLOSURE_KEYWORDS = [
  'close', 'closes', 'closed', 'closing',
  'your-custom-keyword',  // Add here
  // ... more keywords
];
```

## Candidates Sheet Columns

| Column | Description |
|--------|-------------|
| `candidate_id` | Unique ID (CAND-00001, CAND-00002, etc.) |
| `found_at` | When the script discovered this headline |
| `publisher` | News source name |
| `headline` | Original headline text |
| `url` | Article URL |
| `published_at` | When the article was published |
| `matched_terms` | Which closure keywords were found |
| `entity_guess` | Script's guess at business name |
| `area_guess` | Script's guess at location |
| `status` | `new` → `queued` → `promoted` or `rejected` |
| `review_notes` | Your notes during review |

## Status Values

- **`new`** - Just discovered, needs admin review
- **`queued`** - Admin approved, ready to convert to submission
- **`promoted`** - Converted to a draft submission
- **`rejected`** - Not relevant, ignored

## Tips for Effective Use

### 1. Review Daily
Check the `Candidates` sheet daily to catch time-sensitive closures quickly.

### 2. Improve Entity Guessing
The script tries to extract business names from headlines, but it's not perfect. You can:
- Edit `entity_guess` before queuing
- Add better extraction logic in `extractBusinessName()`

### 3. Enrich Before Promoting
Before changing status to `queued`, you can manually:
- Verify the business name
- Add area information
- Check if it's a duplicate

### 4. Monitor False Positives
Some headlines may match keywords but aren't actual closures (e.g., "closing time", "close to perfect"). Mark these as `rejected`.

### 5. Telegram Notifications
You'll receive notifications when:
- New candidates are found
- Candidates are promoted to draft submissions

## Troubleshooting

### No candidates appearing

1. Check the execution log in Apps Script for errors
2. Verify RSS feeds are accessible (try opening them in a browser)
3. Check if keywords are too restrictive

### Too many false positives

1. Refine the `CLOSURE_KEYWORDS` list
2. Add negative keyword filtering in `findMatchedKeywords()`
3. Improve the `extractBusinessName()` heuristic

### Script quota exceeded

Google Apps Script has quotas:
- **URL Fetch calls**: 20,000/day (free tier)
- **Execution time**: 6 min/execution

If you hit limits:
- Reduce the number of RSS feeds
- Increase the interval between runs
- Consider upgrading to Google Workspace

## Advanced: Web Search Enrichment

The PRD mentions optional web search enrichment. To add this:

1. Enable the **Custom Search API** in Google Cloud Console
2. Get an API key and Search Engine ID
3. Add a function to enrich candidates with Google Search results
4. Call it before promoting to submissions

This is optional for MVP and can be added later.

## Summary

The RSS scraping system provides a **semi-automated** approach:

✅ **Automated**: Discovery of potential closures from news sources  
✅ **Manual**: Admin review and approval before promotion  
✅ **Balanced**: Reduces manual work while maintaining data quality

This ensures you don't miss closures reported in the media while keeping full control over what gets published.
