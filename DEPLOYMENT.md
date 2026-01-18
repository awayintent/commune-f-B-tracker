# Deployment Guide

This guide covers deploying your F&B Closure Tracker to production.

## Prerequisites

- Completed setup from [SETUP_GUIDE.md](SETUP_GUIDE.md)
- Working local development environment
- Google Sheets published and Apps Script configured

---

## Option 1: Vercel (Recommended)

Vercel offers the easiest deployment with automatic builds and preview deployments.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
# From your project directory
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **sg-fnb-closure-tracker**
- Directory? **./** (press Enter)
- Override settings? **N**

### Step 4: Set Environment Variables

```bash
vercel env add VITE_CLOSURES_CSV_URL
vercel env add VITE_SHEETS_EMBED_URL
vercel env add VITE_GOOGLE_FORM_URL
vercel env add VITE_SUBSTACK_URL
```

Paste each value when prompted. Select **Production** for each.

### Step 5: Deploy to Production

```bash
vercel --prod
```

Your site is now live! 🎉

### Automatic Deployments

Connect your GitHub repository to Vercel for automatic deployments:

1. Go to [vercel.com](https://vercel.com)
2. Click **Import Project**
3. Select your GitHub repository
4. Add environment variables in the Vercel dashboard
5. Deploy!

Every push to `main` will automatically deploy.

---

## Option 2: Netlify

### Step 1: Build Your Site

```bash
npm run build
```

This creates a `dist/` folder with your production files.

### Step 2: Deploy to Netlify

**Option A: Drag and Drop**
1. Go to [netlify.com](https://netlify.com)
2. Drag the `dist/` folder to the deploy area
3. Done!

**Option B: Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Step 3: Set Environment Variables

1. Go to your site dashboard on Netlify
2. Click **Site settings > Environment variables**
3. Add each variable:
   - `VITE_CLOSURES_CSV_URL`
   - `VITE_SHEETS_EMBED_URL`
   - `VITE_GOOGLE_FORM_URL`
   - `VITE_SUBSTACK_URL`
4. Redeploy your site

### Continuous Deployment

1. In Netlify dashboard, click **Site settings > Build & deploy**
2. Click **Link repository**
3. Select your GitHub repository
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Click **Deploy site**

---

## Option 3: GitHub Pages

### Step 1: Update vite.config.ts

Add base path for GitHub Pages:

```typescript
export default defineConfig({
  base: '/your-repo-name/',
  plugins: [react(), tailwindcss()],
  // ... rest of config
})
```

### Step 2: Build

```bash
npm run build
```

### Step 3: Deploy

**Option A: Manual**
```bash
# Install gh-pages
npm install -D gh-pages

# Add to package.json scripts:
"deploy": "gh-pages -d dist"

# Deploy
npm run deploy
```

**Option B: GitHub Actions**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
        env:
          VITE_CLOSURES_CSV_URL: ${{ secrets.VITE_CLOSURES_CSV_URL }}
          VITE_SHEETS_EMBED_URL: ${{ secrets.VITE_SHEETS_EMBED_URL }}
          VITE_GOOGLE_FORM_URL: ${{ secrets.VITE_GOOGLE_FORM_URL }}
          VITE_SUBSTACK_URL: ${{ secrets.VITE_SUBSTACK_URL }}
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Add secrets in GitHub: **Settings > Secrets and variables > Actions**

### Step 4: Enable GitHub Pages

1. Go to **Settings > Pages**
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** / **root**
4. Save

Your site will be at: `https://your-username.github.io/your-repo-name/`

---

## Option 4: Custom Server (VPS/Cloud)

### Prerequisites
- VPS with Node.js installed (DigitalOcean, AWS, etc.)
- Domain name (optional)
- Nginx or Apache

### Step 1: Build Locally

```bash
npm run build
```

### Step 2: Upload to Server

```bash
# Using SCP
scp -r dist/* user@your-server:/var/www/closure-tracker/

# Or using rsync
rsync -avz dist/ user@your-server:/var/www/closure-tracker/
```

### Step 3: Configure Nginx

Create `/etc/nginx/sites-available/closure-tracker`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/closure-tracker;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/closure-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Environment Variables in Production

### Important Notes

1. **Never commit `.env` to Git** - It's in `.gitignore` for a reason
2. **Use your hosting platform's environment variable system**
3. **All variables must start with `VITE_`** to be accessible in the frontend
4. **Rebuild after changing environment variables**

### Default Values

If you don't set environment variables, the app uses defaults from `src/app/config/env.ts`:

```typescript
export const config = {
  closuresCsvUrl: import.meta.env.VITE_CLOSURES_CSV_URL || 
    'https://docs.google.com/spreadsheets/d/1vqL2rl_sdehPRatTM_3fiAmK5YDQU_Ngpn2cd9bsxts/export?format=csv&gid=0',
  // ... other defaults
};
```

You can update these defaults directly if you don't want to use environment variables.

---

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] Headline Counter shows data
- [ ] Recent Closures displays
- [ ] Main Table iframe loads
- [ ] "Submit a Closure" button opens correct form
- [ ] "Subscribe to Newsletter" button opens correct Substack
- [ ] Mobile responsive design works
- [ ] HTTPS enabled (if using custom domain)
- [ ] Google Analytics added (optional)
- [ ] Social media meta tags added (optional)

---

## Updating Your Site

### Vercel/Netlify (with Git integration)
```bash
git add .
git commit -m "Update content"
git push
```
Automatic deployment happens!

### Manual Deployment
```bash
npm run build
# Then re-upload dist/ folder or run deploy command
```

---

## Troubleshooting

### Issue: Environment variables not working

**Solution:**
- Make sure variables start with `VITE_`
- Rebuild after changing variables
- Check hosting platform's environment variable settings
- Verify variables are set for production environment

### Issue: 404 on page refresh

**Solution:**
- Configure your server for SPA routing
- Nginx: Use `try_files $uri $uri/ /index.html;`
- Netlify: Add `_redirects` file with `/* /index.html 200`
- Vercel: Add `vercel.json` with rewrites

### Issue: CORS errors loading Google Sheets

**Solution:**
- Make sure the sheet is published to web (not just shared)
- Use the CSV export URL, not the regular sheet URL
- Check that the sheet is publicly accessible

---

## Performance Optimization

### 1. Enable Caching

Add cache headers for static assets in your server config.

### 2. Use CDN

Vercel and Netlify include CDN by default. For custom servers, consider Cloudflare.

### 3. Optimize Images

If you add custom images, use WebP format and lazy loading.

### 4. Monitor Performance

Use tools like:
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)

---

## Support

For deployment issues:
1. Check the hosting platform's documentation
2. Review the build logs for errors
3. Verify environment variables are set correctly
4. Test locally with `npm run build && npm run preview`

---

**Happy deploying! 🚀**
