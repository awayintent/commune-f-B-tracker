// Type definitions for the closure tracker data

export interface Closure {
  closure_id: string;
  added_at: string;
  business_name: string;
  outlet_name: string;
  address: string;
  category: string;
  status: 'Reported' | 'Confirmed';
  last_day: string;
  description: string;
  source_urls: string;
  evidence_excerpt: string;
  tags: string;
}

export interface MonthlyCounts {
  [key: string]: number; // Format: 'YYYY-MM' or 'YYYY'
}
