# Git Commands to Push Your Code

Follow these commands in order to push your code to GitHub.

## Step 1: Initialize Git (if not already done)

```bash
git init
```

## Step 2: Check Current Status

```bash
git status
```

This shows you what files will be committed.

## Step 3: Add All Files

```bash
git add .
```

## Step 4: Commit Your Changes

```bash
git commit -m "Initial commit - F&B Closure Tracker ready for deployment"
```

## Step 5: Check Your Remote

```bash
git remote -v
```

If you see your GitHub repo URL, skip to Step 7.

## Step 6: Add Remote (if needed)

```bash
git remote add origin https://github.com/awayintent/commune-f-B-tracker.git
```

## Step 7: Set Main Branch

```bash
git branch -M main
```

## Step 8: Push to GitHub

```bash
git push -u origin main
```

If you get an error about existing content, use:

```bash
git push -u origin main --force
```

⚠️ **Warning:** `--force` will overwrite the remote. Only use if you're sure!

## Step 9: Verify on GitHub

Open: https://github.com/awayintent/commune-f-B-tracker

You should see all your files!

---

## Quick Copy-Paste Version

If everything is fresh, just copy and paste these commands:

```bash
git init
git add .
git commit -m "Initial commit - F&B Closure Tracker ready for deployment"
git branch -M main
git remote add origin https://github.com/awayintent/commune-f-B-tracker.git
git push -u origin main
```

---

## Troubleshooting

### Error: "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/awayintent/commune-f-B-tracker.git
```

### Error: "failed to push some refs"

This means the remote has content. Options:

**Option 1: Pull first (safer)**
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

**Option 2: Force push (overwrites remote)**
```bash
git push -u origin main --force
```

### Error: "Permission denied"

Make sure you're logged into GitHub:
```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

Then try pushing again. You may need to authenticate via browser.

---

## After Pushing

Once your code is on GitHub:

1. ✅ Verify files at: https://github.com/awayintent/commune-f-B-tracker
2. ✅ Check that `.env.local` is NOT there (it should be gitignored)
3. ✅ Ready to deploy to Railway!

Next: Follow [YOUR_DEPLOYMENT_GUIDE.md](YOUR_DEPLOYMENT_GUIDE.md)
