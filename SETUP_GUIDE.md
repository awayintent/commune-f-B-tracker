# Singapore F&B Closure Tracker - Setup Guide

This guide will walk you through setting up the complete F&B Closure Tracker system.

## Table of Contents

1. [Google Sheets Setup](#1-google-sheets-setup)
2. [Google Form Setup](#2-google-form-setup)
3. [Google Apps Script Setup](#3-google-apps-script-setup)
4. [Telegram Bot Setup](#4-telegram-bot-setup)
5. [Frontend Setup](#5-frontend-setup)
6. [Testing](#6-testing)

---

## 1. Google Sheets Setup

### Step 1.1: Create the Sheet Structure

Your Google Sheet should have **3 tabs** with the following headers:

#### Tab 1: **Closures** (Public)

This tab powers the public website. Create these columns:

```
closure_id | added_at | business_name | outlet_name | address | category | status | last_day | description | source_urls | evidence_excerpt | tags
```

**Column Descriptions:**
- `closure_id`: Unique ID (e.g., C00001)
- `added_at`: Date added to database
- `business_name`: Name of the business
- `outlet_name`: Specific outlet/branch name
- `address`: Full address (include neighborhood/area in address)
- `category`: Type of F&B (e.g., Cafe, Restaurant, Hawker)
- `status`: "Reported" or "Confirmed"
- `last_day`: Last day of operation (or date discovered closed)
- `description`: Reason/description of closure (e.g., "Rising costs", "Lease expiry")
- `source_urls`: URLs to sources (comma-separated)
- `evidence_excerpt`: Short excerpt from source
- `tags`: Tags for categorization

#### Tab 2: **Submissions** (Private)

This tab receives form submissions directly from Google Forms:

```
Timestamp | Business Name | Outlet/Branch Name | Business Address | Last Day of Operation | Reason for Closure | Source URL | Additional Notes | Submitter Name | Submitter Contact
```

**Note:** These are the exact column names Google Forms creates. Don't rename them - the Apps Script will work with these names directly.

#### Tab 3: **Candidates** (Private)

This tab stores headlines from RSS feeds:

```
candidate_id | found_at | publisher | headline | url | published_at | matched_terms | entity_guess | area_guess | status | review_notes
```

### Step 1.2: Publish the Closures Sheet

⚠️ **IMPORTANT - PRIVACY WARNING:**
- **ONLY publish the Closures tab** - This contains business data only
- **NEVER publish the Submissions or Candidates tabs** - These contain personal information
- The Submissions tab has submitter names and contact info - keep it private!

1. In your Google Sheet, click **File > Share > Publish to web**
2. **Select ONLY the "Closures" tab** (not "Entire Document")
3. Choose **Comma-separated values (.csv)** format
4. Click **Publish**
5. **Verify** it says "Closures" in the publish dialog, not "Entire Document"
6. Copy the URL - it should look like:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0
   ```
7. Save this URL for later (you'll need it for the frontend)

### Step 1.3: Get the Embed URL

1. Click **File > Share > Publish to web** again
2. **Select ONLY the "Closures" tab** (verify it's not "Entire Document")
3. Choose **Web page** format
4. Click **Publish**
5. Copy the embed URL from the iframe code - it should look like:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/pubhtml?widget=true&headers=false
   ```

⚠️ **Double-check:** The URL should have `gid=0` (or another specific gid) in it, indicating a specific tab, not the entire sheet.

### Step 1.4: Verify Privacy Settings

**Critical Privacy Check:**

1. Go to **File > Share > Publish to web**
2. Look at the "Published content & settings" section
3. **Verify** that ONLY "Closures" is listed as published
4. If you see "Entire Document" or other tabs, click "Stop publishing" and redo Step 1.2

**Sheet Sharing Settings:**

1. Click the **Share** button (top right)
2. Under "General access", keep it as **Restricted** (not "Anyone with the link")
3. Only you (and trusted admins) should have access to the sheet itself
4. The published CSV/embed is public, but the sheet editor remains private

**What This Means:**
- ✅ Public can view Closures data (business info only)
- ❌ Public CANNOT view Submissions data (personal info)
- ❌ Public CANNOT edit anything
- ✅ Only you can review and accept submissions

---

## 2. Google Form Setup

### Step 2.1: Create the Form

1. Go to [Google Forms](https://forms.google.com)
2. Create a new form titled "Submit F&B Closure"
3. Add the following fields:

**Form Fields (in order):**

1. **Business Name** (Short answer, Required)
2. **Outlet/Branch Name** (Short answer, Optional)
3. **Business Address** (Short answer, Required) - Include neighborhood/area
4. **Last Day of Operation** (Date, Optional) - Or date discovered closed
5. **Reason for Closure** (Paragraph, Optional) - What happened?
6. **Source URL** (Short answer, Optional) - Link to news article or social media post
7. **Additional Notes** (Paragraph, Optional)
8. **Submitter Name** (Short answer, Optional) - ⚠️ Private, never published
9. **Submitter Contact** (Short answer, Optional) - ⚠️ Private, for follow-up only

**Privacy Notice for Form:**
Add this description to your form:
> "Your contact information (name and email/phone) will be kept private and used only for follow-up if needed. Only the business closure information will be published publicly."

### Step 2.2: Connect Form to Spreadsheet

1. In your form, click the **Responses** tab
2. Click the Google Sheets icon (Create Spreadsheet)
3. Select **Select existing spreadsheet**
4. Choose your main tracker spreadsheet
5. Click **Select**

**Note:** Google Forms will automatically create a new tab called "Form Responses 1"

6. **Rename the auto-created tab:**
   - Right-click on "Form Responses 1" tab
   - Click **Rename**
   - Change it to **"Submissions"**

**That's it!** No need to add extra columns. The Apps Script will work with the columns Google Forms creates.

### Step 2.3: Verify Your Submissions Tab

Your Submissions sheet should have these 10 columns (created automatically by Google Forms):

1. `Timestamp`
2. `Business Name`
3. `Outlet/Branch Name`
4. `Business Address`
5. `Last Day of Operation`
6. `Reason for Closure`
7. `Source URL`
8. `Additional Notes`
9. `Submitter Name`
10. `Submitter Contact`

**That's it!** The Apps Script will add review notes and status in separate columns as needed.

### Step 2.4: Get Form URL

1. Click **Send** button in the form
2. Copy the form URL - it should look like:
   ```
   https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform
   ```

---

## 3. Google Apps Script Setup

### Step 3.1: Open Apps Script Editor

1. In your Google Sheet, click **Extensions > Apps Script**
2. Delete any existing code
3. Copy the entire contents of `google-apps-script/Code.gs` from this repository
4. Paste it into the Apps Script editor
5. Click **Save** (💾 icon)

### Step 3.2: Initialize the Script

1. In Apps Script editor, select `initializeProperties` from the function dropdown
2. Click **Run** (▶️ icon)
3. Authorize the script when prompted
4. Check the **Execution log** to confirm it ran successfully

5. Select `addReviewColumns` from the function dropdown
6. Click **Run** (▶️ icon)
7. This adds 5 review columns to your Submissions sheet

### Step 3.3: Set Script Properties (Optional - for Telegram)

1. In Apps Script editor, click **Project Settings** (⚙️ icon)
2. Scroll to **Script Properties**
3. Click **Add script property** and add these (if you want Telegram notifications):

| Property | Value | Description |
|----------|-------|-------------|
| `TELEGRAM_BOT_TOKEN` | (see Section 4) | Your Telegram bot token (optional) |
| `TELEGRAM_CHAT_ID` | (see Section 4) | Your Telegram chat ID (optional) |

### Step 3.4: Set Up Triggers

1. In Apps Script editor, click **Triggers** (⏰ icon)
2. Click **+ Add Trigger** and create these triggers:

**Trigger 1: Form Submission Handler**
- Function: `onFormSubmit`
- Deployment: Head
- Event source: From spreadsheet
- Event type: On form submit

**Trigger 2: Review Action Handler**
- Function: `onEdit`
- Deployment: Head
- Event source: From spreadsheet
- Event type: On edit

---

## 4. Telegram Bot Setup

### Step 4.1: Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` command
3. Follow the prompts to create your bot
4. Copy the **bot token** (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. Add this to Script Properties as `TELEGRAM_BOT_TOKEN`

### Step 4.2: Get Your Chat ID

1. Search for your bot in Telegram and start a conversation
2. Send any message to your bot
3. Open this URL in your browser (replace `YOUR_BOT_TOKEN`):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
4. Look for `"chat":{"id":123456789}` in the response
5. Copy the chat ID number
6. Add this to Script Properties as `TELEGRAM_CHAT_ID`

### Step 4.3: Test Telegram Notifications

1. In Apps Script editor, select `sendTelegram` from the function dropdown
2. Modify the function temporarily to send a test message:
   ```javascript
   function testTelegram() {
     sendTelegram('✅ Test message from F&B Closure Tracker');
   }
   ```
3. Run the function
4. Check your Telegram to see if you received the message

---

## 5. Frontend Setup

### Step 5.1: Install Dependencies

```bash
# Navigate to the project directory
cd Commune_Tracker

# Install dependencies (use npm, yarn, or pnpm)
npm install
# or
pnpm install
```

### Step 5.2: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Google Sheets CSV URL (from Step 1.2)
VITE_CLOSURES_CSV_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0

# Google Sheets Embed URL (from Step 1.3)
VITE_SHEETS_EMBED_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/pubhtml?widget=true&headers=false

# Google Form URL (from Step 2.4)
VITE_GOOGLE_FORM_URL=https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform

# Substack URL (your newsletter)
VITE_SUBSTACK_URL=https://your-publication.substack.com
```

**Note:** If you don't create a `.env` file, the app will use the default URLs configured in `src/app/config/env.ts`.

### Step 5.3: Run the Development Server

```bash
npm run dev
# or
pnpm run dev
```

The app should now be running at `http://localhost:5173` (or another port shown in the terminal).

### Step 5.4: Build for Production

```bash
npm run build
# or
pnpm run build
```

The built files will be in the `dist/` directory, ready to deploy to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

---

## 6. Testing

### Test 1: Form Submission

1. Open your Google Form
2. Submit a test closure
3. Check the **Submissions** sheet - you should see:
   - `submission_id` auto-generated (e.g., S00001)
   - `submitted_at` timestamp
   - `validation_status` set to `auto_queue` or `needs_review`
   - `validation_flags` populated if there are issues
   - `review_status` set to `pending`
4. If `validation_status` is `needs_review`, check Telegram for a notification

### Test 2: Review Workflow

1. In the **Submissions** sheet, find your test submission
2. In the `review_action` column, type `Accept`
3. The script should automatically:
   - Create a new row in the **Closures** sheet
   - Set `review_status` to `accepted`
   - Set `reviewed_at` timestamp
   - Set `result_closure_id` with the new closure ID

### Test 3: Frontend Data Loading

1. Make sure you have at least one record in the **Closures** sheet
2. Open your frontend app
3. Check that:
   - **Headline Counter** shows the correct count
   - **Recent Closures** displays the latest 3 closures
   - **Complete Database** iframe shows the Google Sheet

### Test 4: Duplicate Detection

1. Submit another form with the same business name
2. Check the **Submissions** sheet:
   - `possible_duplicate` should be `yes`
   - `dup_match` should show the matching business
   - `validation_flags` should include `POSSIBLE_DUPLICATE`

---

## Troubleshooting

### Issue: Script not running on form submit

**Solution:**
- Check that the `onFormSubmit` trigger is set up correctly
- Make sure you've authorized the script
- Check the Apps Script execution log for errors

### Issue: Telegram notifications not working

**Solution:**
- Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are correct
- Make sure you've sent at least one message to your bot
- Test with the `testTelegram` function

### Issue: Frontend not loading data

**Solution:**
- Verify the CSV URL is correct and publicly accessible
- Check browser console for CORS errors
- Make sure the **Closures** sheet is published to web
- Check that the sheet has the correct column headers

### Issue: Form responses not appearing in Submissions sheet

**Solution:**
- Check that the form is linked to the correct sheet
- Verify the column mapping matches the expected structure
- Make sure the **Submissions** sheet name is exactly "Submissions"

---

## Next Steps

1. **Customize the design**: Update colors, fonts, and layout in the React components
2. **Add more validation rules**: Enhance the validation logic in Apps Script
3. **Set up RSS feeds**: Add your preferred news sources to the `fetchCandidates` function
4. **Deploy to production**: Host the frontend on Vercel, Netlify, or your preferred platform
5. **Promote the tracker**: Share on social media and your Substack newsletter

---

## Support

For questions or issues, please refer to the [PRD document](PRD_SG_FnB_Closure_Tracker.md) or create an issue in the repository.

---

**Happy tracking! 🍽️**
