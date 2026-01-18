# Singapore F&B Closure Tracker 🍽️

Track F&B business closures in Singapore with this comprehensive web application.

**Live Site:** [Coming soon - Deploy on Railway]

**By:** [Commune Asia](https://www.commune-asia.com/)

---

## Features

- 📊 **Live Closure Counter** - See how many F&B businesses closed by month/year
- 🔄 **Real-time Data** - Automatically syncs with Google Sheets
- 📝 **Public Submissions** - Community can report closures via Google Forms
- ✅ **Admin Review System** - Validate submissions before publishing
- 📱 **Telegram Notifications** - Get alerted for new submissions
- 🎨 **Modern UI** - Beautiful, responsive design

## Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS + shadcn/ui
- TypeScript

**Backend:**
- Google Sheets (database)
- Google Forms (submissions)
- Google Apps Script (automation)
- Telegram Bot (notifications)

**Deployment:**
- Railway (recommended)
- Also works on Vercel, Netlify, GitHub Pages

## Quick Start

### Prerequisites

- Node.js 18+
- Google Account
- Railway account (for deployment)

### Local Development

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Edit .env.local with your URLs

# Start dev server
npm run dev
```

Open http://localhost:5173

### Deployment

See [YOUR_DEPLOYMENT_GUIDE.md](YOUR_DEPLOYMENT_GUIDE.md) for step-by-step Railway deployment instructions.

## Project Structure

```
commune-f-B-tracker/
├── src/
│   ├── app/
│   │   ├── components/      # React components
│   │   ├── data/            # Data fetching & types
│   │   └── config/          # Configuration
│   └── styles/              # CSS files
├── google-apps-script/      # Backend automation
├── public/                  # Static assets
└── [docs]                   # Documentation
```

## Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup instructions
- **[YOUR_DEPLOYMENT_GUIDE.md](YOUR_DEPLOYMENT_GUIDE.md)** - Deployment guide with actual URLs
- **[RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)** - General Railway deployment guide
- **[TEST_FRONTEND.md](TEST_FRONTEND.md)** - Testing checklist
- **[PRIVACY_AND_SECURITY.md](PRIVACY_AND_SECURITY.md)** - Privacy & security guide

## How It Works

1. **Public submits** closure via Google Form
2. **Apps Script validates** and flags for review
3. **Admin reviews** in Google Sheets
4. **Accepted closures** appear on public website
5. **Frontend fetches** data from published Google Sheet

## Environment Variables

Required for deployment:

```env
VITE_CLOSURES_CSV_URL=<your-google-sheets-csv-url>
VITE_SHEETS_EMBED_URL=<your-google-sheets-embed-url>
VITE_GOOGLE_FORM_URL=<your-google-form-url>
VITE_SUBSTACK_URL=<your-substack-url>
```

## Contributing

This is a private project for Commune Asia. For questions, contact the project owner.

## License

All rights reserved. © 2026 Commune Asia

---

**Built with ❤️ for the Singapore F&B community**
