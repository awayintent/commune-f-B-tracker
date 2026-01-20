# Events & Articles Scraping Setup Guide

This guide explains how to set up automatic scraping for Events and Articles using Google Apps Script.

## Overview

The system automatically:
- **Fetches articles** from RSS feeds (Restaurant 101, Carbonate, Snaxshot)
- **Fetches events** from Eventbrite search results
- **Stores data** in Google Sheets
- **Frontend displays** the data automatically

---

## Step 1: Create New Sheets

1. Open your Google Sheet (the one with Closures, Submissions, Candidates)
2. Create two new sheets:
   - **Events**
   - **Articles**

---

## Step 2: Initialize the Sheets

1. Open **Extensions > Apps Script**
2. Your updated `Code.gs` already has the initialization functions
3. Run these functions once:

### Initialize Events Sheet
- In Apps Script, click the function dropdown
- Select `initializeEventsSheet`
- Click Run
- Authorize if needed
- Check your **Events** sheet - it should now have headers

### Initialize Articles Sheet
- Select `initializeArticlesSheet`
- Click Run
- Check your **Articles** sheet - it should now have headers

---

## Step 3: Test the Scrapers

### Test Articles Scraper
1. In Apps Script, select `fetchArticles`
2. Click Run
3. Check the **Execution log** (View > Logs)
4. Should see: "Added article: [title]"
5. Check your **Articles** sheet - should have new articles!

### Test Events Scraper
1. Select `fetchEvents`
2. Click Run
3. Check logs
4. Check your **Events** sheet - should have new events!

**Note:** Event scraping is fragile because it parses HTML. If Eventbrite changes their structure, it may break. Consider this a starting point.

---

## Step 4: Set Up Automatic Updates

### Create Time-Based Triggers

1. In Apps Script, click the clock icon (Triggers) in left sidebar
2. Click **+ Add Trigger**

#### Trigger 1: Update Events & Articles (Weekly)
- Function: `updateEventsAndArticles`
- Event source: **Time-driven**
- Type: **Week timer**
- Day: **Monday** (or your preference)
- Time: **8am - 9am**
- Click Save

This will automatically:
- Fetch new articles from RSS feeds
- Fetch new events from Eventbrite
- Clean up past events
- Send you a Telegram notification (if configured)

---

## Step 5: Publish Sheets as CSV

For the frontend to fetch this data:

1. Go to **File > Share > Publish to web**
2. Select **Events** sheet, format: **CSV**, click Publish
3. Copy the URL - it will look like:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=EVENTS_GID
   ```
4. Repeat for **Articles** sheet
5. Copy both URLs

---

## Step 6: Update Environment Variables

### For Railway Deployment:

1. Go to Railway dashboard
2. Click your project > Variables
3. Add these new variables:
   ```
   VITE_EVENTS_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=EVENTS_GID
   VITE_ARTICLES_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=ARTICLES_GID
   ```
4. Railway will automatically redeploy

### For Local Development:

1. Update your `.env` file:
   ```
   VITE_EVENTS_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=EVENTS_GID
   VITE_ARTICLES_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=ARTICLES_GID
   ```

---

## Step 7: Test the Frontend

1. Run `npm run dev` locally (or wait for Railway deployment)
2. Scroll to the "Get help before your business becomes another statistic" section
3. You should see:
   - **Upcoming Events** (from your Events sheet)
   - **Relevant Articles** (from your Articles sheet)

---

## Maintenance

### Weekly Tasks (Automated)
- ✅ Fetch new articles (runs automatically)
- ✅ Fetch new events (runs automatically)
- ✅ Clean up past events (runs automatically)

### Monthly Tasks (Manual)
- Review Events sheet and delete any irrelevant events
- Review Articles sheet and keep only the best 5-10 articles
- Manually add high-quality articles you find

---

## Customization

### Add More Article Sources

Edit `Code.gs` and add to the `ARTICLE_RSS_FEEDS` array:

```javascript
const ARTICLE_RSS_FEEDS = [
  {
    name: 'Restaurant 101',
    author: 'David Mann',
    url: 'https://davidrmann3.substack.com/feed'
  },
  // Add your new source here:
  {
    name: 'Your Source Name',
    author: 'Author Name',
    url: 'https://example.com/feed'
  }
];
```

### Adjust Event Sources

The `fetchEvents` function scrapes Eventbrite. You can:
- Add more search URLs in the `searchUrls` array
- Adjust the limit (currently 5 events per search)
- Add Peatix scraping (similar logic)

---

## Troubleshooting

### No Articles Appearing
1. Check Apps Script logs for errors
2. Verify RSS feed URLs are accessible
3. Check that Articles sheet has data
4. Verify `VITE_ARTICLES_CSV_URL` is set correctly

### No Events Appearing
1. Event scraping is fragile - check logs for errors
2. Eventbrite may have changed their HTML structure
3. Consider manually adding events to the sheet
4. Verify `VITE_EVENTS_CSV_URL` is set correctly

### Events Not Clickable
1. Make sure the `url` column is populated
2. Check that URLs are valid

---

## Manual Curation (Recommended)

While automation is nice, **manual curation gives you quality control**:

### For Events:
1. Search Eventbrite/Peatix manually
2. Add good events directly to the Events sheet
3. Delete auto-scraped events that aren't relevant

### For Articles:
1. Monitor Restaurant 101, Carbonate, Snaxshot
2. Add only the best articles manually
3. Delete auto-scraped articles that aren't helpful

**Quality > Quantity**

---

## Functions Reference

### Main Functions
- `updateEventsAndArticles()` - Run both scrapers + cleanup
- `fetchArticles()` - Scrape RSS feeds for articles
- `fetchEvents()` - Scrape Eventbrite for events
- `cleanupPastEvents()` - Remove old events

### Setup Functions
- `initializeEventsSheet()` - Create Events sheet headers
- `initializeArticlesSheet()` - Create Articles sheet headers

---

## Notes

- **Event scraping is experimental** - HTML parsing is fragile
- **Consider Eventbrite API** for production (requires authentication)
- **RSS feeds are reliable** - articles scraping should work well
- **Manual curation is encouraged** - automation is a starting point
- **Keep sheets clean** - delete old/irrelevant data regularly
