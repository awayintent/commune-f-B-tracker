# Singapore F&B Closure Tracker 🍽️

A web application that tracks F&B business closures in Singapore, serving as a lead magnet for the Commune Asia publication.

## Features

- 📊 **Live Closure Counter** - See how many F&B businesses closed in any month/year
- 🔄 **Real-time Data** - Automatically syncs with Google Sheets
- 📝 **Public Submissions** - Community can submit closure reports via Google Forms
- ✅ **Review Workflow** - Admin approval system with validation and duplicate detection
- 📱 **Telegram Notifications** - Get alerted when submissions need review
- 📰 **RSS Monitoring** - Automatically collect closure headlines from news sources
- 🎨 **Modern UI** - Beautiful, responsive design built with React and Tailwind CSS

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **TypeScript** - Type safety

### Backend
- **Google Sheets** - Database
- **Google Forms** - Submission intake
- **Google Apps Script** - Automation and validation
- **Telegram Bot** - Notifications

## Quick Start

### Prerequisites

- Node.js 18+ (Python 3.11.9 for any additional scripting)
- Google Account (for Sheets, Forms, Apps Script)
- Telegram account (optional, for notifications)
- Railway account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Commune_Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Google Sheets & Apps Script**
   - Follow [SETUP_GUIDE.md](SETUP_GUIDE.md) to set up:
     - Google Sheets with Closures & Submissions tabs
     - Google Form linked to Submissions
     - Apps Script for automation
   - Publish the Closures sheet to web as CSV

4. **Configure environment variables**
   
   For local development, create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your URLs
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173

6. **Build for production**
   ```bash
   npm run build
   ```

7. **Deploy to Railway**
   - See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) for detailed instructions
   - Quick: Push to GitHub → Connect to Railway → Add env vars → Deploy!

## Project Structure

```
Commune_Tracker/
├── src/
│   ├── app/
│   │   ├── components/         # React components
│   │   │   ├── Header.tsx
│   │   │   ├── HeadlineCounter.tsx
│   │   │   ├── RecentClosures.tsx
│   │   │   ├── MainTable.tsx
│   │   │   ├── SubmissionCTA.tsx
│   │   │   ├── EventsAndArticles.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ui/             # shadcn/ui components
│   │   ├── data/               # Data layer
│   │   │   ├── types.ts        # TypeScript types
│   │   │   └── closures.ts     # Data fetching logic
│   │   ├── config/             # Configuration
│   │   │   └── env.ts          # Environment config
│   │   └── App.tsx             # Main app component
│   └── styles/                 # CSS files
├── google-apps-script/         # Backend automation
│   └── Code.gs                 # Apps Script code
├── PRD_SG_FnB_Closure_Tracker.md  # Product requirements
├── SETUP_GUIDE.md              # Detailed setup instructions
├── PRIVACY_AND_SECURITY.md     # Privacy & security guide
└── README.md                   # This file
```

## Data Flow

1. **Public Submission**
   - User submits closure via Google Form
   - Form data lands in **Submissions** sheet
   - Apps Script validates the submission
   - Telegram notification sent if review needed

2. **Admin Review**
   - Admin reviews submission in Sheets
   - Sets `review_action` to Accept/Reject/Merge
   - Apps Script processes the action
   - If accepted, creates record in **Closures** sheet

3. **Frontend Display**
   - Frontend fetches **Closures** sheet as CSV
   - Displays data in HeadlineCounter and RecentClosures
   - Shows full database in embedded iframe

4. **RSS Monitoring** (Optional)
   - Apps Script fetches RSS feeds periodically
   - Identifies closure-related headlines
   - Adds candidates to **Candidates** sheet
   - Admin can promote candidates to submissions

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_CLOSURES_CSV_URL` | Google Sheets CSV export URL | `https://docs.google.com/...` |
| `VITE_SHEETS_EMBED_URL` | Google Sheets embed URL | `https://docs.google.com/...` |
| `VITE_GOOGLE_FORM_URL` | Google Form submission URL | `https://docs.google.com/forms/...` |
| `VITE_SUBSTACK_URL` | Substack newsletter URL | `https://commune-asia.substack.com` |

### Apps Script Properties

Set these in Apps Script > Project Settings > Script Properties:

| Property | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID |
| `SEQ_C` | Closure ID sequence (start with 0) |
| `SEQ_S` | Submission ID sequence (start with 0) |
| `SEQ_H` | Candidate ID sequence (start with 0) |

## Deployment

### Frontend Deployment

The frontend can be deployed to any static hosting service:

**Vercel:**
```bash
npm install -g vercel
vercel
```

**Netlify:**
```bash
npm run build
# Upload dist/ folder to Netlify
```

**GitHub Pages:**
```bash
npm run build
# Deploy dist/ folder to gh-pages branch
```

### Backend (Apps Script)

The Apps Script runs directly in Google's infrastructure - no deployment needed! Just set up the triggers as described in the [SETUP_GUIDE.md](SETUP_GUIDE.md).

## Validation Rules

The Apps Script automatically validates submissions with these rules:

**Hard Reject Flags:**
- `SPAM_GIBBERISH_NAME` - Very short or invalid business name
- `SPAM_PROFANITY_OR_ALLEGATION` - Contains profanity or accusations

**Review Required Flags:**
- `MISSING_EVIDENCE_URL` - No source URL provided
- `MISSING_AREA_AND_ADDRESS` - Both area and address missing
- `DATES_INCONSISTENT` - Last day before announced date
- `POSSIBLE_DUPLICATE` - Matches existing closure
- `WEAK_DETAILS` - Insufficient information

## Privacy & Security

This application handles user submissions with care. Personal information (submitter names and contact details) is kept private and never published.

**Key Privacy Features:**
- ✅ Only business data is published (Closures sheet)
- 🔒 Personal data stays private (Submissions sheet)
- ✅ GDPR/PDPA compliant architecture
- 🔒 Data separation by design

For detailed privacy information, see [PRIVACY_AND_SECURITY.md](PRIVACY_AND_SECURITY.md).

## Contributing

This is a private project for Commune Asia. For questions or suggestions, please contact the project owner.

## License

All rights reserved. This project is proprietary and confidential.

## Credits

- **Design**: Exported from Figma
- **Development**: Built with React, Vite, and Tailwind CSS
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide Icons](https://lucide.dev/)

---

**Built with ❤️ for the Singapore F&B community**
