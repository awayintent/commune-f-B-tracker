# Your Deployment Guide - Commune F&B Tracker

This is your personalized deployment guide with your actual URLs.

## ✅ Your Configuration

**Google Sheets:** https://docs.google.com/spreadsheets/d/e/2PACX-1vRMNG0eWdE0-3nsn_fSNRykidtBNv7ZzoaDovPzA5fZ1tdWDzr6o7oxlvUbssb_pLLSMUzDi7FHxuiO/pubhtml?gid=0&single=true

**Google Form:** https://forms.gle/gD3XdAuVuYo2knyk9

**Substack:** https://www.commune-asia.com/

**GitHub Repo:** https://github.com/awayintent/commune-f-B-tracker

---

## 🚀 Step 1: Test Locally

### 1.1 Install Dependencies

```bash
npm install
```

### 1.2 Start Development Server

```bash
npm run dev
```

Open http://localhost:5173

### 1.3 Verify Everything Works

- [ ] Headline Counter shows a number
- [ ] Recent Closures displays (if you have data)
- [ ] Main Table iframe loads your Google Sheet
- [ ] "Submit a Closure" button opens: https://forms.gle/gD3XdAuVuYo2knyk9
- [ ] "Subscribe to Newsletter" button opens: https://www.commune-asia.com/
- [ ] No errors in browser console (F12)

**If you see errors about fetching data:**
- Make sure your Closures sheet has at least the header row
- Check that the sheet is published to web

---

## 📤 Step 2: Push to GitHub

Your repo is already set up at: https://github.com/awayintent/commune-f-B-tracker

```bash
# Make sure you're in the project directory
cd Commune_Tracker

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial deployment setup"

# Add remote (if not already added)
git remote add origin https://github.com/awayintent/commune-f-B-tracker.git

# Push to main branch
git push -u origin main
```

---

## 🚂 Step 3: Deploy to Railway

### 3.1 Go to Railway

1. Open https://railway.app
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose: **awayintent/commune-f-B-tracker**
6. Click "Deploy Now"

### 3.2 Add Environment Variables

In Railway dashboard:

1. Click on your project
2. Go to "Variables" tab
3. Click "New Variable" and add each one:

**Variable 1:**
```
Name: VITE_CLOSURES_CSV_URL
Value: https://docs.google.com/spreadsheets/d/e/2PACX-1vRMNG0eWdE0-3nsn_fSNRykidtBNv7ZzoaDovPzA5fZ1tdWDzr6o7oxlvUbssb_pLLSMUzDi7FHxuiO/pub?gid=0&single=true&output=csv
```

**Variable 2:**
```
Name: VITE_SHEETS_EMBED_URL
Value: https://docs.google.com/spreadsheets/d/e/2PACX-1vRMNG0eWdE0-3nsn_fSNRykidtBNv7ZzoaDovPzA5fZ1tdWDzr6o7oxlvUbssb_pLLSMUzDi7FHxuiO/pubhtml?gid=0&single=true&widget=true&headers=false
```

**Variable 3:**
```
Name: VITE_GOOGLE_FORM_URL
Value: https://forms.gle/gD3XdAuVuYo2knyk9
```

**Variable 4:**
```
Name: VITE_SUBSTACK_URL
Value: https://www.commune-asia.com/
```

### 3.3 Trigger Deployment

1. Go to "Deployments" tab
2. Click "Deploy" button
3. Wait for build to complete (2-3 minutes)

### 3.4 Get Your URL

1. Go to "Settings" tab
2. Scroll to "Domains"
3. Click "Generate Domain"
4. You'll get a URL like: `commune-f-b-tracker.up.railway.app`

---

## ✅ Step 4: Test Production Site

Open your Railway URL and verify:

- [ ] Site loads
- [ ] Headline Counter works
- [ ] Recent Closures displays
- [ ] Main Table shows your Google Sheet
- [ ] Submit button opens your form
- [ ] Subscribe button opens Commune Asia
- [ ] Mobile responsive works

---

## 🎯 Step 5: Add Custom Domain (Optional)

If you want to use a custom domain like `closures.commune-asia.com`:

1. In Railway: Settings > Domains > Custom Domain
2. Enter your domain
3. Add CNAME record to your DNS:
   - Type: `CNAME`
   - Name: `closures` (or whatever subdomain)
   - Value: (provided by Railway)
4. Wait for DNS propagation (5-30 minutes)

---

## 🔄 How to Update

### Update Content (Google Sheets)
- Just edit your Closures sheet
- Changes appear on site immediately (after browser refresh)

### Update Code (Frontend)
```bash
# Make your changes
git add .
git commit -m "Your update message"
git push

# Railway automatically redeploys!
```

---

## 📊 Your URLs Summary

**Development:**
- Local: http://localhost:5173

**Production:**
- Railway: (will be generated after deployment)
- Custom domain: (optional)

**Backend:**
- Google Sheets: https://docs.google.com/spreadsheets/d/e/2PACX-1vRMNG0eWdE0-3nsn_fSNRykidtBNv7ZzoaDovPzA5fZ1tdWDzr6o7oxlvUbssb_pLLSMUzDi7FHxuiO/pubhtml?gid=0&single=true
- Google Form: https://forms.gle/gD3XdAuVuYo2knyk9
- Apps Script: (in your Google Sheet)

---

## 🆘 Troubleshooting

### Issue: No data showing on site

**Check:**
1. Is your Closures sheet published to web?
2. Does it have data (at least headers)?
3. Is the CSV URL correct? (should have `output=csv`)

**Test CSV URL:**
Open this in browser: https://docs.google.com/spreadsheets/d/e/2PACX-1vRMNG0eWdE0-3nsn_fSNRykidtBNv7ZzoaDovPzA5fZ1tdWDzr6o7oxlvUbssb_pLLSMUzDi7FHxuiO/pub?gid=0&single=true&output=csv

You should see CSV data, not HTML.

### Issue: Build fails on Railway

**Check:**
1. All environment variables are set
2. Variables start with `VITE_`
3. No syntax errors in code
4. Check Railway build logs

### Issue: Form/Substack buttons don't work

**Check:**
1. Environment variables are set correctly
2. URLs don't have typos
3. Redeploy after adding variables

---

## 📞 Support

**Railway Issues:**
- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app

**App Issues:**
- Check browser console (F12)
- Review this guide
- Check [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

**Ready to deploy? Follow the steps above! 🚀**
