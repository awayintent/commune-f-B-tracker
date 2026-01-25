// Type definitions for the closure tracker data

export interface Closure {
  closure_id: string;
  added_at: string;
  business_name: string;
  outlet_name: string;
  address: string;
  postal_code: string;
  category: string;
  last_day: string;
  description: string;
  source_urls: string;
  tags: string;
  image_url: string;
  published: boolean;
}

export interface Opening {
  opening_id: string;
  added_at: string;
  business_name: string;
  outlet_name: string;
  address: string;
  postal_code: string;
  category: string;
  opening_date: string;
  description: string;
  source_urls: string;
  tags: string;
  image_url: string;
  published: boolean;
}

export interface MonthlyCounts {
  [key: string]: number; // Format: 'YYYY-MM' or 'YYYY'
}
