# Frontend Testing Checklist

Before deploying to Railway, test your frontend locally.

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Create `.env.local` file:

```env
VITE_CLOSURES_CSV_URL=https://docs.google.com/spreadsheets/d/1vqL2rl_sdehPRatTM_3fiAmK5YDQU_Ngpn2cd9bsxts/export?format=csv&gid=0
VITE_SHEETS_EMBED_URL=https://docs.google.com/spreadsheets/d/1vqL2rl_sdehPRatTM_3fiAmK5YDQU_Ngpn2cd9bsxts/pubhtml?widget=true&headers=false
VITE_GOOGLE_FORM_URL=YOUR_FORM_URL
VITE_SUBSTACK_URL=https://commune-asia.substack.com
```

Replace `YOUR_FORM_URL` with your actual Google Form URL.

## Step 3: Run Development Server

```bash
npm run dev
```

Open http://localhost:5173

## Step 4: Test Checklist

### ✅ Visual Tests

- [ ] **Header loads**
  - Commune logo appears
  - "Subscribe to Newsletter" button visible
  - Header is dark blue (#0b3860)

- [ ] **Headline Counter**
  - Shows a number (or "..." if loading)
  - Year/month selector works
  - Clicking date opens dialog
  - Can select different years/months
  - Number updates when selection changes

- [ ] **Recent Closures**
  - Shows 3 cards (or loading skeletons)
  - Each card has business name, address, date
  - "Confirmed" badge shows if applicable
  - Cards have hover effect

- [ ] **Main Table**
  - Google Sheets iframe loads
  - Shows your Closures data
  - Can scroll within iframe

- [ ] **Submission CTA**
  - Button says "Submit a Closure"
  - Has orange background (#f5903e)
  - Clicking opens your Google Form in new tab

- [ ] **Footer**
  - Displays correctly at bottom

### ✅ Data Tests

- [ ] **Data loads from Google Sheets**
  - Open browser console (F12)
  - Check for any errors
  - Verify fetch request to your CSV URL succeeds

- [ ] **Headline Counter shows real data**
  - Number matches your actual closures count
  - Changes when you select different months

- [ ] **Recent Closures shows real data**
  - Displays actual businesses from your sheet
  - Dates are formatted correctly
  - Addresses show properly

### ✅ Functionality Tests

- [ ] **Subscribe button works**
  - Clicks open Substack in new tab
  - URL is correct

- [ ] **Submit button works**
  - Clicks open Google Form in new tab
  - Form loads correctly

- [ ] **Year/Month selector works**
  - Dialog opens
  - Can select year
  - Can select month
  - Can clear month
  - Apply button works
  - Dialog closes

### ✅ Mobile Tests

- [ ] **Open DevTools** (F12)
- [ ] **Toggle device toolbar** (Ctrl+Shift+M)
- [ ] **Test on different sizes:**
  - Mobile (375px)
  - Tablet (768px)
  - Desktop (1920px)

- [ ] **Mobile layout works**
  - Header stacks properly
  - Cards stack vertically
  - Text is readable
  - Buttons are tappable

### ✅ Performance Tests

- [ ] **Page loads quickly** (< 3 seconds)
- [ ] **No console errors**
- [ ] **Images load**
- [ ] **Fonts load**

## Step 5: Test Production Build

```bash
npm run build
npm run preview
```

Open http://localhost:4173

- [ ] Production build works
- [ ] All features still work
- [ ] No console errors

## Common Issues

### Issue: "Failed to fetch closures"

**Solution:**
- Check `VITE_CLOSURES_CSV_URL` is correct
- Verify Closures sheet is published to web
- Check sheet has data (at least headers)

### Issue: Headline Counter shows 0

**Solution:**
- Check your Closures sheet has data rows
- Verify dates are in correct format
- Check browser console for errors

### Issue: Recent Closures empty

**Solution:**
- Add at least 3 rows to Closures sheet
- Verify `added_at` or `last_day` columns have dates
- Check data format matches expected schema

### Issue: Buttons don't work

**Solution:**
- Check environment variables are set
- Verify URLs don't have typos
- Check browser console for errors

## Next Steps

Once all tests pass:

1. ✅ Commit your changes
2. ✅ Push to GitHub
3. ✅ Follow [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)
4. ✅ Deploy to Railway!

---

**All tests passing? You're ready to deploy! 🚀**
