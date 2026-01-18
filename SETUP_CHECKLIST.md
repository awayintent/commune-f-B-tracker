# Setup Checklist

Use this checklist to track your progress setting up the F&B Closure Tracker.

## Phase 1: Google Sheets Setup

- [ ] Open Google Sheet at https://docs.google.com/spreadsheets/d/1vqL2rl_sdehPRatTM_3fiAmK5YDQU_Ngpn2cd9bsxts/edit
- [ ] Create tab named "Closures" with 15 columns (see SETUP_GUIDE.md)
- [ ] Create tab named "Submissions" with 25 columns (see SETUP_GUIDE.md)
- [ ] Create tab named "Candidates" with 11 columns (see SETUP_GUIDE.md)
- [ ] Publish Closures tab: File > Share > Publish to web > CSV
- [ ] Save CSV URL: `_________________________________`
- [ ] Get embed URL: File > Share > Publish to web > Web page
- [ ] Save embed URL: `_________________________________`

## Phase 2: Google Form Setup

- [ ] Create new Google Form at https://forms.google.com
- [ ] Name form "Submit F&B Closure"
- [ ] Add required fields (Business Name, Outlet, Address, Area, Description)
- [ ] Add optional fields (Dates, Reason, Source URL, Contact)
- [ ] Link form to Submissions sheet: Responses > Link to Sheets
- [ ] Test form submission - check if data appears in Submissions sheet
- [ ] Save form URL: `_________________________________`

## Phase 3: Google Apps Script Setup

- [ ] Open Apps Script: Extensions > Apps Script
- [ ] Copy code from `google-apps-script/Code.gs`
- [ ] Paste into Apps Script editor
- [ ] Save the script (💾 icon)
- [ ] Add Script Property: `SEQ_C` = `0`
- [ ] Add Script Property: `SEQ_S` = `0`
- [ ] Add Script Property: `SEQ_H` = `0`
- [ ] Create trigger: `onFormSubmit` → On form submit
- [ ] Create trigger: `onEdit` → On edit
- [ ] Run `initializeProperties` function to test
- [ ] Authorize the script when prompted

## Phase 4: Telegram Setup (Optional but Recommended)

- [ ] Open Telegram and search for @BotFather
- [ ] Send `/newbot` command
- [ ] Follow prompts to create bot
- [ ] Save bot token: `_________________________________`
- [ ] Start conversation with your bot
- [ ] Get chat ID from `https://api.telegram.org/bot<TOKEN>/getUpdates`
- [ ] Save chat ID: `_________________________________`
- [ ] Add Script Property: `TELEGRAM_BOT_TOKEN` = (your token)
- [ ] Add Script Property: `TELEGRAM_CHAT_ID` = (your chat ID)
- [ ] Test by running a test function in Apps Script

## Phase 5: Frontend Setup

- [ ] Open terminal in project directory
- [ ] Run `npm install` (or `pnpm install`)
- [ ] Create `.env` file in root directory
- [ ] Add `VITE_CLOSURES_CSV_URL` to .env
- [ ] Add `VITE_SHEETS_EMBED_URL` to .env
- [ ] Add `VITE_GOOGLE_FORM_URL` to .env
- [ ] Add `VITE_SUBSTACK_URL` to .env (or update default in env.ts)
- [ ] Run `npm run dev`
- [ ] Open http://localhost:5173 in browser
- [ ] Verify site loads without errors

## Phase 6: Testing

### Frontend Tests
- [ ] HeadlineCounter displays (may show 0 if no data yet)
- [ ] RecentClosures section displays
- [ ] MainTable iframe loads
- [ ] "Submit a Closure" button opens correct form
- [ ] "Subscribe to Newsletter" button opens correct URL
- [ ] Test on mobile device or responsive mode

### Backend Tests
- [ ] Submit test closure via form
- [ ] Check Submissions sheet for new row
- [ ] Verify submission_id is auto-generated
- [ ] Verify validation_status is set
- [ ] Check Telegram for notification (if configured)
- [ ] In Submissions sheet, set review_action to "Accept"
- [ ] Verify new row appears in Closures sheet
- [ ] Verify result_closure_id is populated
- [ ] Refresh frontend - verify new closure appears

## Phase 7: Add Initial Data

- [ ] Manually add 3-5 closure records to Closures sheet
  - Use format: C00001, C00002, etc. for closure_id
  - Fill in business_name, area, category, announced_date
  - Set status to "Confirmed"
- [ ] Refresh frontend
- [ ] Verify HeadlineCounter shows correct count
- [ ] Verify RecentClosures shows latest closures
- [ ] Verify MainTable shows all closures

## Phase 8: Deployment (When Ready)

- [ ] Choose hosting platform (Vercel, Netlify, etc.)
- [ ] Run `npm run build` to test build
- [ ] Fix any build errors
- [ ] Set up hosting account
- [ ] Add environment variables to hosting platform
- [ ] Deploy to production
- [ ] Test production site
- [ ] Update DNS if using custom domain
- [ ] Enable HTTPS

## Phase 9: Go Live

- [ ] Announce on social media
- [ ] Share in Substack newsletter
- [ ] Add link to Commune Asia website
- [ ] Monitor form submissions
- [ ] Review and accept/reject submissions daily
- [ ] Update RSS feeds list (if using)

## Phase 10: Ongoing Maintenance

- [ ] Check Submissions sheet daily for new entries
- [ ] Review and process submissions
- [ ] Monitor Telegram notifications
- [ ] Update closure records with confirmed information
- [ ] Add categories and tags to closures
- [ ] Respond to community feedback
- [ ] Update documentation as needed

---

## Quick Reference URLs

**Your Google Sheet:**
https://docs.google.com/spreadsheets/d/1vqL2rl_sdehPRatTM_3fiAmK5YDQU_Ngpn2cd9bsxts/edit

**Your Google Form:**
`_________________________________`

**Your Production Site:**
`_________________________________`

**Your Substack:**
`_________________________________`

---

## Need Help?

- 📖 Detailed instructions: [SETUP_GUIDE.md](SETUP_GUIDE.md)
- ⚡ Quick start: [QUICK_START.md](QUICK_START.md)
- 🚀 Deployment: [DEPLOYMENT.md](DEPLOYMENT.md)
- 📋 Full implementation: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

---

**Estimated Total Time: 1-2 hours**

Good luck! 🎉
