// Type definitions for the closure tracker data

export interface Closure {
  closure_id: string;
  added_at: string;
  business_name: string;
  outlet_name: string;
  address: string;
  category: string;
  last_day: string;
  description: string;
  source_urls: string;
  tags: string;
  published: boolean;
}

export interface MonthlyCounts {
  [key: string]: number; // Format: 'YYYY-MM' or 'YYYY'
}
