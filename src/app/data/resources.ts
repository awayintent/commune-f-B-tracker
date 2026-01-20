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
 * Sources: Eventbrite, LinkedIn, industry associations
 * 
 * Update monthly with relevant Singapore F&B events
 */
export const events: Event[] = [
  {
    id: 1,
    title: "Singapore Restaurant Festival 2026",
    date: "Mar 15-17, 2026",
    location: "Marina Bay Sands",
    url: "https://www.eventbrite.sg"
  },
  {
    id: 2,
    title: "F&B Business Networking Session",
    date: "Feb 28, 2026",
    location: "The Dining Room, Suntec",
    url: "https://www.eventbrite.sg"
  },
  {
    id: 3,
    title: "Restaurant Operations Workshop",
    date: "Mar 8, 2026",
    location: "NTUC Centre",
    url: "https://www.eventbrite.sg"
  }
];

/**
 * High-Quality F&B Industry Articles
 * 
 * Criteria for inclusion:
 * - Authoritative sources (industry experts, established publications)
 * - Actionable insights for F&B operators
 * - No fluff, no tabloid content
 * - Real operational value
 * 
 * Recommended sources:
 * - Restaurant 101 (David Mann): https://davidrmann3.substack.com
 * - Eater: https://www.eater.com
 * - Restaurant Business Online: https://www.restaurantbusinessonline.com
 * - Nation's Restaurant News: https://www.nrn.com
 * - The Straits Times F&B: https://www.straitstimes.com
 * - 7shifts Resources: https://www.7shifts.com/blog
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
    title: "The Real Cost of Running a Restaurant in Singapore",
    source: "The Straits Times",
    url: "https://www.straitstimes.com/singapore/rising-costs-push-more-f-b-outlets-to-close"
  },
  {
    id: 3,
    title: "How to Calculate Restaurant Food Cost Percentage",
    source: "7shifts Restaurant Resources",
    url: "https://www.7shifts.com/blog/restaurant-food-cost"
  },
  {
    id: 4,
    title: "Restaurant Profit Margins: A Reality Check",
    source: "Restaurant Business Online",
    url: "https://www.restaurantbusinessonline.com"
  },
  {
    id: 5,
    title: "Labor Management Strategies for Restaurants",
    source: "Nation's Restaurant News",
    url: "https://www.nrn.com/workforce"
  }
];
