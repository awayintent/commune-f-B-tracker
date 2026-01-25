import { Opening, MonthlyCounts } from './types';

/**
 * Fetches opening data from Google Sheets published as CSV
 * The sheet should be published to web as CSV format
 */
export async function fetchOpenings(): Promise<Opening[]> {
  const csvUrl = import.meta.env.VITE_OPENINGS_CSV_URL;
  
  console.log('Openings CSV URL:', csvUrl);
  
  if (!csvUrl) {
    console.warn('VITE_OPENINGS_CSV_URL not configured, returning empty array');
    return [];
  }

  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch openings: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    console.log('Openings CSV Text (first 500 chars):', csvText.substring(0, 500));
    console.log('Total Openings CSV length:', csvText.length);
    
    const openings = parseCSV(csvText);
    return openings;
  } catch (error) {
    console.error('Error fetching openings:', error);
    return [];
  }
}

/**
 * Parse CSV text into Opening objects
 */
function parseCSV(csvText: string): Opening[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    return [];
  }

  // Skip header row
  const dataLines = lines.slice(1);
  
  const openings: Opening[] = [];
  
  for (const line of dataLines) {
    // Simple CSV parser - handles quoted fields
    const fields = parseCSVLine(line);
    
    // Debug logging
    console.log(`Opening Row: ${fields[2]}, Fields: ${fields.length}, Published field: "${fields[12]}"`);
    
    // Need at least business name to be valid
    if (fields.length < 3 || !fields[2]) {
      console.log(`Skipping opening row - insufficient fields or no business name`);
      continue; // Skip incomplete rows
    }

    const publishedValue = fields[12]?.trim();
    const isPublished = publishedValue === 'TRUE' || publishedValue === 'true';
    
    console.log(`Opening Business: ${fields[2]}, Published value: "${publishedValue}", Is published: ${isPublished}`);

    const opening = {
      opening_id: fields[0] || '',
      added_at: fields[1] || '',
      business_name: fields[2] || '',
      outlet_name: fields[3] || '',
      address: fields[4] || '',
      postal_code: fields[5] || '',
      category: fields[6] || '',
      opening_date: fields[7] || '',
      description: fields[8] || '',
      source_urls: fields[9] || '',
      tags: fields[10] || '',
      image_url: fields[11] || '',
      published: isPublished,
    };

    // Only include published openings
    if (opening.published) {
      console.log(`✅ Including opening: ${opening.business_name}`);
      openings.push(opening);
    } else {
      console.log(`❌ Excluding opening: ${opening.business_name} (published=${publishedValue})`);
    }
  }
  
  console.log(`Total openings parsed: ${openings.length}`);

  return openings;
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // Field separator
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Add the last field
  fields.push(currentField);

  return fields;
}

/**
 * Get the most recent N openings sorted by added_at date
 */
export function getRecentOpenings(openings: Opening[], n: number = 3): Opening[] {
  const sorted = [...openings].sort((a, b) => {
    const dateA = new Date(a.added_at || a.opening_date);
    const dateB = new Date(b.added_at || b.opening_date);
    return dateB.getTime() - dateA.getTime();
  });

  return sorted.slice(0, n);
}

/**
 * Get monthly counts of openings
 * Returns counts keyed by 'YYYY-MM' and 'YYYY'
 */
export function getMonthlyOpeningCounts(openings: Opening[]): MonthlyCounts {
  const counts: MonthlyCounts = {};

  for (const opening of openings) {
    // Use opening_date or added_at for counting
    const dateStr = opening.opening_date || opening.added_at;
    if (!dateStr) continue;

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) continue;

      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const yearMonth = `${year}-${month}`;

      // Increment year count
      counts[year] = (counts[year] || 0) + 1;

      // Increment year-month count
      counts[yearMonth] = (counts[yearMonth] || 0) + 1;
    } catch (error) {
      console.warn('Invalid opening date:', dateStr);
    }
  }

  return counts;
}

/**
 * Get available years from openings data
 */
export function getAvailableYears(openings: Opening[]): string[] {
  const years = new Set<string>();

  for (const opening of openings) {
    const dateStr = opening.opening_date || opening.added_at;
    if (!dateStr) continue;

    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        years.add(date.getFullYear().toString());
      }
    } catch (error) {
      // Skip invalid dates
    }
  }

  return Array.from(years).sort().reverse();
}

/**
 * Format a date string for display
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return date.toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return dateStr;
  }
}
