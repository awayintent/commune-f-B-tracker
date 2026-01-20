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
 * MANUALLY CURATED - Update this list with real event links from:
 * - Eventbrite Singapore: https://www.eventbrite.sg/d/singapore--singapore/food-and-drink--business/
 * - Peatix Singapore: https://peatix.com/search?country=SG&q=restaurant
 * - LinkedIn Events: https://www.linkedin.com/events
 * 
 * TO UPDATE: Search those platforms monthly and add actual event URLs here
 * Leave this array EMPTY if no upcoming events (better than fake events)
 */
export const events: Event[] = [
  // ADD REAL EVENTS HERE AS YOU FIND THEM
  // Example:
  // {
  //   id: 1,
  //   title: "Event Name",
  //   date: "Mar 15, 2026",
  //   location: "Venue Name",
  //   url: "https://actual-event-url.com"
  // }
];

/**
 * High-Quality F&B Industry Articles
 * 
 * MANUALLY CURATED - Update this list with real, working article links
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
 * TO UPDATE: Replace these with actual article URLs as you find good content
 */
export const articles: Article[] = [
  {
    id: 1,
    title: "Why Ghost Kitchens Failed (And What's Coming Next)",
    source: "Restaurant 101 by David Mann",
    url: "https://davidrmann3.substack.com/p/why-ghost-kitchens-failed-and-whats"
  }
  // ADD MORE ARTICLES HERE AS YOU FIND THEM
  // Example:
  // {
  //   id: 2,
  //   title: "Your Article Title",
  //   source: "Source Name",
  //   url: "https://actual-article-url.com"
  // }
];
