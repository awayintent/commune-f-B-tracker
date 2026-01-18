// Environment configuration
// These values come from environment variables set in .env file

export const config = {
  // Google Sheets CSV URL for fetching closure data
  closuresCsvUrl: import.meta.env.VITE_CLOSURES_CSV_URL || 
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRMNG0eWdE0-3nsn_fSNRykidtBNv7ZzoaDovPzA5fZ1tdWDzr6o7oxlvUbssb_pLLSMUzDi7FHxuiO/pub?gid=0&single=true&output=csv',
  
  // Google Sheets embed URL for iframe
  sheetsEmbedUrl: import.meta.env.VITE_SHEETS_EMBED_URL || 
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRMNG0eWdE0-3nsn_fSNRykidtBNv7ZzoaDovPzA5fZ1tdWDzr6o7oxlvUbssb_pLLSMUzDi7FHxuiO/pubhtml?gid=0&single=true&widget=true&headers=false',
  
  // Google Form URL for submissions
  googleFormUrl: import.meta.env.VITE_GOOGLE_FORM_URL || 
    'https://forms.gle/gD3XdAuVuYo2knyk9',
  
  // Substack URL for newsletter subscriptions
  substackUrl: import.meta.env.VITE_SUBSTACK_URL || 
    'https://www.commune-asia.com/',
};
