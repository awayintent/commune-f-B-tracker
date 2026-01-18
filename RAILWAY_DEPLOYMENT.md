# Railway Deployment Guide

Quick guide to deploy your F&B Closure Tracker to Railway.

## Prerequisites

- ✅ Google Sheets set up with Closures sheet
- ✅ Google Form linked to Submissions sheet
- ✅ Apps Script configured and running
- ✅ Railway account (free tier available)

---

## Step 1: Prepare Your Environment Variables

You need these URLs from your Google Sheets setup:

1. **VITE_CLOSURES_CSV_URL**
   - Go to your Google Sheet
   - File > Share > Publish to web
   - Select "Closures" tab
   - Format: CSV
   - Copy the URL (looks like: `https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=0`)

2. **VITE_SHEETS_EMBED_URL**
   - File > Share > Publish to web
   - Select "Closures" tab
   - Format: Web page
   - Copy the URL (looks like: `https://docs.google.com/spreadsheets/d/.../pubhtml?widget=true&headers=false`)

3. **VITE_GOOGLE_FORM_URL**
   - Open your Google Form
   - Click Send
   - Copy the form URL (looks like: `https://docs.google.com/forms/d/e/.../viewform`)

4. **VITE_SUBSTACK_URL**
   - Your Substack publication URL (e.g., `https://commune-asia.substack.com`)

---

## Step 2: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Connect to Railway:**
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Select "Deploy from GitHub repo"
   - Authorize Railway to access your GitHub
   - Select your repository
   - Click "Deploy Now"

3. **Add Environment Variables:**
   - In Railway dashboard, click on your project
   - Go to "Variables" tab
   - Click "New Variable" and add each one:
     - `VITE_CLOSURES_CSV_URL` = (your CSV URL)
     - `VITE_SHEETS_EMBED_URL` = (your embed URL)
     - `VITE_GOOGLE_FORM_URL` = (your form URL)
     - `VITE_SUBSTACK_URL` = (your Substack URL)

4. **Trigger Redeploy:**
   - Click "Deployments" tab
   - Click "Deploy" button
   - Wait for build to complete

### Option B: Deploy from CLI

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize project:**
   ```bash
   railway init
   ```

4. **Add environment variables:**
   ```bash
   railway variables set VITE_CLOSURES_CSV_URL="your-csv-url"
   railway variables set VITE_SHEETS_EMBED_URL="your-embed-url"
   railway variables set VITE_GOOGLE_FORM_URL="your-form-url"
   railway variables set VITE_SUBSTACK_URL="your-substack-url"
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

---

## Step 3: Configure Custom Domain (Optional)

1. In Railway dashboard, go to "Settings" tab
2. Scroll to "Domains"
3. Click "Generate Domain" for a free Railway subdomain
   - You'll get: `your-project.up.railway.app`
4. Or add your custom domain:
   - Click "Custom Domain"
   - Enter your domain (e.g., `closures.commune-asia.com`)
   - Add the CNAME record to your DNS provider:
     - Type: `CNAME`
     - Name: `closures` (or `@` for root domain)
     - Value: (provided by Railway)

---

## Step 4: Verify Deployment

1. **Open your Railway URL**
   - Should see your F&B Closure Tracker

2. **Check the data loads:**
   - Headline Counter shows numbers
   - Recent Closures displays
   - Main Table iframe loads

3. **Test the buttons:**
   - "Submit a Closure" opens your form
   - "Subscribe to Newsletter" opens your Substack

---

## Troubleshooting

### Issue: Site loads but no data

**Solution:**
- Check that `VITE_CLOSURES_CSV_URL` is correct
- Verify the Closures sheet is published to web
- Check browser console for CORS errors
- Make sure the sheet has data (at least headers)

### Issue: Build fails

**Solution:**
- Check Railway build logs
- Verify all dependencies are in `package.json`
- Make sure Node.js version is compatible (we use Node 20)

### Issue: Environment variables not working

**Solution:**
- All variables must start with `VITE_` for Vite to expose them
- Redeploy after adding/changing variables
- Check variables are set in Railway dashboard

### Issue: 404 on page refresh

**Solution:**
- This is handled by `serve -s` flag in the start command
- Verify `railway.json` has the correct start command

---

## Automatic Deployments

Railway automatically redeploys when you push to your connected GitHub branch:

```bash
# Make changes
git add .
git commit -m "Update content"
git push

# Railway will automatically build and deploy
```

---

## Monitoring

**View logs:**
- Railway dashboard > Deployments > Click on deployment > View Logs

**Check metrics:**
- Railway dashboard > Metrics tab
- See requests, bandwidth, build times

---

## Cost

**Railway Free Tier:**
- $5 of free usage per month
- Enough for ~500,000 requests
- Perfect for starting out

**If you exceed free tier:**
- Pay-as-you-go pricing
- ~$0.000463 per GB-hour
- Typical small site: $5-10/month

---

## Updating Your Site

### Update Content (Google Sheets)
- Just edit your Closures sheet
- Changes appear on site within ~1 minute (browser cache)

### Update Code (Frontend)
```bash
git add .
git commit -m "Your changes"
git push
# Railway auto-deploys
```

### Update Environment Variables
- Railway dashboard > Variables > Edit
- Click "Redeploy" after changes

---

## Alternative: Deploy to Other Platforms

If you prefer not to use Railway, this app also works on:

- **Vercel** - See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Netlify** - See [DEPLOYMENT.md](DEPLOYMENT.md)
- **GitHub Pages** - See [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Support

**Railway Issues:**
- [Railway Discord](https://discord.gg/railway)
- [Railway Docs](https://docs.railway.app)

**App Issues:**
- Check [SETUP_GUIDE.md](SETUP_GUIDE.md)
- Review [TROUBLESHOOTING](#troubleshooting) above

---

**Happy deploying! 🚀**
