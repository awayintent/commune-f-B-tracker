/**
 * Curated F&B Industry Resources
 * 
 * Update this file to add/remove events and articles.
 * Events and articles should be high-quality, authoritative sources
 * that genuinely help F&B operators avoid business failure.
 */

export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  url?: string;
}

export interface Article {
  id: number;
  title: string;
  source: string;
  url: string;
}

/**
 * Upcoming F&B Industry Events
 * 
 * Sources to check regularly:
 * - Eventbrite Singapore: https://www.eventbrite.sg (search: "F&B", "Restaurant", "Food Business")
 * - Peatix Singapore: https://peatix.com/search?country=SG (search: "F&B", "Restaurant")
 * - LinkedIn Events: https://www.linkedin.com/events (follow Restaurant Association of Singapore)
 * 
 * Update monthly with relevant Singapore F&B events.
 * Focus on: networking, workshops, industry conferences, business development.
 */
export const events: Event[] = [
  {
    id: 1,
    title: "F&B Industry Networking & Insights",
    date: "Feb 27, 2026",
    location: "Suntec Convention Centre",
    url: "https://www.eventbrite.sg"
  },
  {
    id: 2,
    title: "Restaurant Business Operations Workshop",
    date: "Mar 8, 2026",
    location: "NTUC Centre",
    url: "https://peatix.com"
  },
  {
    id: 3,
    title: "Singapore F&B Summit 2026",
    date: "Mar 15-17, 2026",
    location: "Marina Bay Sands",
    url: "https://www.linkedin.com/events"
  }
];

/**
 * High-Quality F&B Industry Articles
 * 
 * Criteria for inclusion:
 * - Authoritative sources (industry experts, established publications)
 * - Actionable insights for F&B operators
 * - Asia/Singapore-focused or universally applicable
 * - No fluff, no tabloid content
 * - Real operational value
 * 
 * Primary sources to monitor:
 * - Restaurant 101 (David Mann): https://davidrmann3.substack.com
 * - Insight Out by Carbonate: https://www.carbonateinsights.com
 * - Snaxshot: https://www.snaxshot.com
 * 
 * Update this section monthly with the latest articles from these sources.
 */
export const articles: Article[] = [
  {
    id: 1,
    title: "Why Ghost Kitchens Failed (And What's Coming Next)",
    source: "Restaurant 101 by David Mann",
    url: "https://davidrmann3.substack.com/p/why-ghost-kitchens-failed-and-whats"
  },
  {
    id: 2,
    title: "Inside Scoop: Sharp insights for hospitality and F&B brands",
    source: "Insight Out by Carbonate",
    url: "https://www.carbonateinsights.com"
  },
  {
    id: 3,
    title: "Product trends and market insights for F&B",
    source: "Snaxshot",
    url: "https://www.snaxshot.com"
  },
  {
    id: 4,
    title: "Rising costs push more F&B outlets to close in Singapore",
    source: "The Straits Times",
    url: "https://www.straitstimes.com/singapore"
  },
  {
    id: 5,
    title: "F&B Industry Trends and Insights",
    source: "Channel NewsAsia",
    url: "https://www.channelnewsasia.com/singapore"
  }
];
