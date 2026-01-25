# F&B Openings Tracking Setup Guide

This guide explains how to set up tracking for new F&B business openings alongside closures.

## Overview

The Openings feature allows you to track:
- New restaurant/cafe/bar openings
- Concept changes (when a space transitions to a new business)
- "Coming soon" establishments
- Opening dates and details

The openings data is displayed on the homepage in a green-themed section, providing a balanced view of the F&B landscape.

---

## Step 1: Create the Openings Sheet

1. Open your Google Sheet (the one with Closures, Submissions, Candidates, Events, Articles)
2. Create a new sheet named **Openings**

---

## Step 2: Initialize the Openings Sheet

1. Open **Extensions > Apps Script**
2. The updated `Code.gs` already includes the `initializeOpeningsSheet()` function
3. Run the initialization:

### Initialize Openings Sheet
- In Apps Script, click the function dropdown
- Select `initializeOpeningsSheet`
- Click Run
- Authorize if needed
- Check your **Openings** sheet - it should now have these headers:

| Column | Description |
|--------|-------------|
| opening_id | Auto-generated ID (e.g., O00001) |
| added_at | Timestamp when added to tracker |
| business_name | Name of the business |
| outlet_name | Specific outlet/branch name (if applicable) |
| address | Full address |
| postal_code | Singapore postal code (6 digits) |
| category | Type (e.g., Cafe, Restaurant, Bar) |
| opening_date | Date the business opened/will open |
| description | Details about the opening, concept, etc. |
| source_urls | Links to news articles, announcements |
| tags | Comma-separated tags (e.g., "coffee,specialty,artisan") |
| image_url | URL to business photo |
| published | TRUE/FALSE - controls public visibility |

---

## Step 3: Add Opening Data

### Manual Entry

You can manually add openings to the sheet:

1. Click on the **Openings** sheet
2. Add a new row with the opening details
3. **Important fields:**
   - `opening_id`: Leave blank initially, or use format O00001, O00002, etc.
   - `added_at`: Use format: `2025-01-25` or `2025-01-25T10:30:00`
   - `business_name`: Required
   - `postal_code`: Required for map display (6 digits)
   - `opening_date`: Use format: `2025-02-01`
   - `published`: Set to `TRUE` to make it visible on the website

### Example Row

```
opening_id: O00001
added_at: 2025-01-25T14:00:00
business_name: The Daily Grind Cafe
outlet_name: Raffles Place
address: 1 Raffles Place, #01-01
postal_code: 048616
category: Cafe
opening_date: 2025-02-15
description: New specialty coffee shop focusing on single-origin beans and artisan pastries
source_urls: https://example.com/news/new-cafe-opening
tags: coffee,specialty,artisan
image_url: https://example.com/images/daily-grind.jpg
published: TRUE
```

---

## Step 4: Publish the Openings Sheet as CSV

1. In your Google Sheet, click on the **Openings** sheet tab
2. Go to **File > Share > Publish to web**
3. In the dropdown, select **Openings** (not "Entire Document")
4. Choose **Comma-separated values (.csv)**
5. Click **Publish**
6. Copy the generated URL (it will look like: `https://docs.google.com/spreadsheets/d/e/...`)

---

## Step 5: Configure Environment Variable

1. In your project root, create or update your `.env` file
2. Add the Openings CSV URL:

```env
VITE_OPENINGS_CSV_URL=https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_ID/pub?gid=OPENINGS_GID&single=true&output=csv
```

3. Replace the URL with the one you copied in Step 4

### Example .env file

```env
# Closures Sheet
VITE_CLOSURES_CSV_URL=https://docs.google.com/spreadsheets/d/e/.../pub?gid=0&single=true&output=csv

# Openings Sheet
VITE_OPENINGS_CSV_URL=https://docs.google.com/spreadsheets/d/e/.../pub?gid=123456&single=true&output=csv

# Events Sheet
VITE_EVENTS_CSV_URL=https://docs.google.com/spreadsheets/d/e/.../pub?gid=789012&single=true&output=csv

# Articles Sheet
VITE_ARTICLES_CSV_URL=https://docs.google.com/spreadsheets/d/e/.../pub?gid=345678&single=true&output=csv
```

---

## Step 6: Test the Integration

1. Build and run your application:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to the homepage

3. You should see a new **"New Openings"** section with green styling below the closures section

4. If you don't see any openings:
   - Check the browser console for errors
   - Verify the CSV URL is correct
   - Ensure at least one opening has `published: TRUE`
   - Check that the opening has valid data in required fields

---

## Data Sources for Openings

### Where to find opening information:

1. **News Websites:**
   - The Straits Times (Food section)
   - Channel News Asia (Lifestyle)
   - Mothership.sg
   - 8days.sg

2. **Social Media:**
   - Instagram announcements from F&B businesses
   - Facebook business pages
   - LinkedIn company updates

3. **F&B Industry Publications:**
   - Eatbook.sg
   - Sethlui.com
   - DanielFoodDiary.com

4. **Real Estate/Commercial:**
   - JTC announcements (for new food halls)
   - Mall websites (new tenant announcements)
   - Property listings showing "Coming Soon"

5. **Direct Submissions:**
   - Business owners can submit their own openings
   - Industry contacts and tips

---

## Best Practices

### Data Quality

1. **Verify opening dates:** Check multiple sources if possible
2. **Get postal codes:** Essential for map display
3. **Add good descriptions:** Help users understand what makes the business unique
4. **Include source URLs:** Builds credibility and allows verification
5. **Use high-quality images:** Makes the listing more attractive

### Publishing Strategy

1. **Preview first:** Set `published: FALSE` while verifying details
2. **Publish when confirmed:** Only set `published: TRUE` for verified openings
3. **Update regularly:** Remove or archive old openings (6+ months)
4. **Balance with closures:** Try to maintain a good mix of both

### Categories to Use

Standardize categories for consistency:
- Cafe
- Restaurant
- Bar
- Fast Food
- Food Court
- Bakery
- Dessert Shop
- Cloud Kitchen
- Food Truck
- Pop-up

---

## Maintenance

### Weekly Tasks
- Add new openings from news sources
- Verify upcoming opening dates
- Update any delayed openings

### Monthly Tasks
- Archive openings older than 6 months
- Review and update descriptions
- Check for broken image URLs
- Verify postal codes for map accuracy

---

## Troubleshooting

### Openings not showing on website

1. **Check published status:** Ensure `published: TRUE`
2. **Verify CSV URL:** Test the URL in a browser - should download CSV
3. **Check environment variable:** Ensure `.env` has correct URL
4. **Rebuild application:** Run `npm run build` after changing `.env`
5. **Check console:** Look for errors in browser developer console

### Map not showing openings

1. **Verify postal codes:** Must be exactly 6 digits
2. **Check coordinates:** Some postal codes may not geocode correctly
3. **Review console logs:** Look for geocoding errors

### Opening IDs not auto-generating

1. **Set Script Property:** In Apps Script, set `NEXT_OPENING_ID` to `0`
2. **Use manual IDs:** Format as O00001, O00002, etc.

---

## Future Enhancements

Potential features to add:

1. **Opening submission form:** Allow businesses to submit their own openings
2. **Opening vs Closing trends:** Visualize the balance over time
3. **Concept change tracking:** Track when a space transitions from one business to another
4. **Opening success tracking:** Follow up on openings to see which succeed
5. **Neighborhood analysis:** Show opening/closing patterns by area

---

## Questions?

If you encounter issues or have questions about the Openings feature, check:
1. Browser console for error messages
2. Google Apps Script execution logs
3. CSV data format and structure
4. Environment variable configuration

---

## Summary Checklist

- [ ] Created Openings sheet in Google Sheets
- [ ] Ran `initializeOpeningsSheet()` in Apps Script
- [ ] Added at least one opening with `published: TRUE`
- [ ] Published Openings sheet as CSV
- [ ] Added CSV URL to `.env` file
- [ ] Tested in development environment
- [ ] Verified openings display on homepage
- [ ] Checked map integration (if postal codes provided)

Once all items are checked, your Openings tracking is fully operational! 🎉
