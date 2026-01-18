# Quick Start Guide

Get your F&B Closure Tracker up and running in 15 minutes!

## Step 1: Google Sheets (5 min)

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1vqL2rl_sdehPRatTM_3fiAmK5YDQU_Ngpn2cd9bsxts/edit
2. Create 3 tabs named exactly: `Closures`, `Submissions`, `Candidates`
3. Copy headers from [SETUP_GUIDE.md](SETUP_GUIDE.md) Section 1.1
4. Publish Closures tab: **File > Share > Publish to web > CSV**
5. Save the CSV URL

## Step 2: Google Form (5 min)

1. Create form at https://forms.google.com
2. Add fields (see [SETUP_GUIDE.md](SETUP_GUIDE.md) Section 2.1)
3. Link to spreadsheet: **Responses > Link to Sheets > Select existing**
4. Google will create "Form Responses 1" - rename it to "Submissions"
5. Add missing columns (submission_id, source_type, validation fields, etc.)
6. Save the form URL

## Step 3: Apps Script (5 min)

1. In your sheet: **Extensions > Apps Script**
2. Copy code from `google-apps-script/Code.gs`
3. Add Script Properties:
   - `SEQ_C` = `0`
   - `SEQ_S` = `0`
   - `SEQ_H` = `0`
4. Create triggers:
   - `onFormSubmit` → On form submit
   - `onEdit` → On edit

## Step 4: Frontend (2 min)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file with your URLs:
   ```env
   VITE_CLOSURES_CSV_URL=<your-csv-url>
   VITE_SHEETS_EMBED_URL=<your-embed-url>
   VITE_GOOGLE_FORM_URL=<your-form-url>
   VITE_SUBSTACK_URL=https://commune-asia.substack.com
   ```

3. Run dev server:
   ```bash
   npm run dev
   ```

## Done! 🎉

Visit http://localhost:5173 to see your tracker.

## Optional: Telegram Notifications

1. Create bot with @BotFather on Telegram
2. Get bot token and chat ID
3. Add to Apps Script properties:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`

---

For detailed instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)
