// Environment configuration
// These values MUST be set as environment variables in your deployment platform

export const config = {
  // Google Sheets CSV URL for fetching closure data
  closuresCsvUrl: import.meta.env.VITE_CLOSURES_CSV_URL,
  
  // Google Sheets CSV URL for fetching events data
  eventsCsvUrl: import.meta.env.VITE_EVENTS_CSV_URL,
  
  // Google Sheets CSV URL for fetching articles data
  articlesCsvUrl: import.meta.env.VITE_ARTICLES_CSV_URL,
  
  // Google Sheets embed URL for iframe
  sheetsEmbedUrl: import.meta.env.VITE_SHEETS_EMBED_URL,
  
  // Google Form URL for submissions
  googleFormUrl: import.meta.env.VITE_GOOGLE_FORM_URL,
  
  // Substack URL for newsletter subscriptions
  substackUrl: import.meta.env.VITE_SUBSTACK_URL,
};
