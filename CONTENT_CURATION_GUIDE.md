# Content Curation Guide

This guide explains how to update the **Events** and **Articles** sections on the Commune Tracker.

## Where to Update Content

Edit: `src/app/data/resources.ts`

After editing, run:
```bash
npm run build
git add -A
git commit -m "Update events and articles"
git push origin main
```

---

## 📰 Article Sources to Monitor

### 1. **Restaurant 101 by David Mann**
- URL: https://davidrmann3.substack.com
- Focus: Restaurant operations, business failures, industry trends
- Why: Sharp operational insights, no-BS analysis of what works/fails
- Update frequency: Check weekly for new posts

### 2. **Insight Out by Carbonate**
- URL: https://www.carbonateinsights.com
- Focus: Hospitality and F&B brand insights
- Why: Out-of-the-box ideas, actionable insights for brands
- Update frequency: Check bi-weekly

### 3. **Snaxshot**
- URL: https://www.snaxshot.com
- Focus: Product trends, market insights for F&B
- Why: Product oracle, trend spotting
- Update frequency: Check bi-weekly

### 4. **Local Singapore Sources**
- The Straits Times F&B section: https://www.straitstimes.com/singapore
- Channel NewsAsia F&B: https://www.channelnewsasia.com/singapore
- Why: Local context, Singapore-specific closures and trends
- Update frequency: Check weekly

---

## 📅 Event Sources to Monitor

### 1. **Eventbrite Singapore**
- URL: https://www.eventbrite.sg
- Search terms: "F&B", "Restaurant", "Food Business", "Hospitality"
- Focus: Industry workshops, networking events, conferences
- Update frequency: Check monthly

### 2. **Peatix Singapore**
- URL: https://peatix.com/search?country=SG
- Search terms: "F&B", "Restaurant", "Food", "Culinary"
- Focus: Industry events, workshops, meetups
- Update frequency: Check monthly

### 3. **LinkedIn Events**
- URL: https://www.linkedin.com/events
- Follow: Restaurant Association of Singapore, F&B industry groups
- Focus: Industry networking, conferences, professional development
- Update frequency: Check weekly

---

## Content Criteria

### For Articles:
✅ **Include:**
- Authoritative sources (industry experts, established publications)
- Actionable insights for F&B operators
- Asia/Singapore-focused or universally applicable
- Real operational value (finance, labor, marketing, operations)
- Post-mortem analysis of closures

❌ **Exclude:**
- US-centric content (unless universally applicable)
- Fluff pieces or tabloid content
- Listicles without substance
- Promotional content disguised as articles

### For Events:
✅ **Include:**
- Singapore-based events
- Networking opportunities
- Workshops with practical skills
- Industry conferences
- Business development sessions

❌ **Exclude:**
- Consumer food festivals (unless B2B component)
- Promotional events
- Events outside Singapore (unless major regional conferences)

---

## Quick Update Template

### Adding a New Article:
```typescript
{
  id: 6, // Increment from last ID
  title: "Your Article Title Here",
  source: "Source Name",
  url: "https://full-article-url.com"
}
```

### Adding a New Event:
```typescript
{
  id: 4, // Increment from last ID
  title: "Event Name",
  date: "Mar 15, 2026", // Format: "MMM DD, YYYY" or "MMM DD-DD, YYYY"
  location: "Venue Name, Area",
  url: "https://event-registration-url.com"
}
```

---

## Maintenance Schedule

**Weekly:**
- Check Restaurant 101 for new posts
- Check LinkedIn Events
- Check local Singapore news for F&B stories

**Bi-weekly:**
- Check Insight Out by Carbonate
- Check Snaxshot

**Monthly:**
- Update all events (remove past events, add upcoming)
- Refresh articles with latest content
- Remove outdated articles (older than 3-6 months unless evergreen)

---

## Notes

- Keep 3-5 events maximum (only upcoming events)
- Keep 4-6 articles maximum (most recent/relevant)
- Prioritize quality over quantity
- Update dates regularly to remove past events
- Archive great evergreen content for future reference
