import { Closure, MonthlyCounts } from './types';

/**
 * Fetches closure data from Google Sheets published as CSV
 * The sheet should be published to web as CSV format
 */
export async function fetchClosures(): Promise<Closure[]> {
  const csvUrl = import.meta.env.VITE_CLOSURES_CSV_URL;
  
  console.log('CSV URL:', csvUrl);
  
  if (!csvUrl) {
    console.warn('VITE_CLOSURES_CSV_URL not configured, returning empty array');
    return [];
  }

  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch closures: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    console.log('CSV Text (first 500 chars):', csvText.substring(0, 500));
    console.log('Total CSV length:', csvText.length);
    
    const closures = parseCSV(csvText);
    return closures;
  } catch (error) {
    console.error('Error fetching closures:', error);
    return [];
  }
}

/**
 * Parse CSV text into Closure objects
 */
function parseCSV(csvText: string): Closure[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    return [];
  }

  // Skip header row
  const dataLines = lines.slice(1);
  
  const closures: Closure[] = [];
  
  for (const line of dataLines) {
    // Simple CSV parser - handles quoted fields
    const fields = parseCSVLine(line);
    
    // Debug logging
    console.log(`Row: ${fields[2]}, Fields: ${fields.length}, Published field: "${fields[10]}"`);
    
    // Need at least business name to be valid
    if (fields.length < 3 || !fields[2]) {
      console.log(`Skipping row - insufficient fields or no business name`);
      continue; // Skip incomplete rows
    }

    const publishedValue = fields[10]?.trim();
    const isPublished = publishedValue === 'TRUE' || publishedValue === 'true';
    
    console.log(`Business: ${fields[2]}, Published value: "${publishedValue}", Is published: ${isPublished}`);

    const closure = {
      closure_id: fields[0] || '',
      added_at: fields[1] || '',
      business_name: fields[2] || '',
      outlet_name: fields[3] || '',
      address: fields[4] || '',
      category: fields[5] || '',
      last_day: fields[6] || '',
      description: fields[7] || '',
      source_urls: fields[8] || '',
      tags: fields[9] || '',
      published: isPublished,
    };

    // Only include published closures
    if (closure.published) {
      console.log(`✅ Including: ${closure.business_name}`);
      closures.push(closure);
    } else {
      console.log(`❌ Excluding: ${closure.business_name} (published=${publishedValue})`);
    }
  }
  
  console.log(`Total closures parsed: ${closures.length}`);

  return closures;
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
 * Get the most recent N closures sorted by added_at date
 */
export function getRecentClosures(closures: Closure[], n: number = 3): Closure[] {
  const sorted = [...closures].sort((a, b) => {
    const dateA = new Date(a.added_at || a.last_day);
    const dateB = new Date(b.added_at || b.last_day);
    return dateB.getTime() - dateA.getTime();
  });

  return sorted.slice(0, n);
}

/**
 * Get monthly counts of closures
 * Returns counts keyed by 'YYYY-MM' and 'YYYY'
 */
export function getMonthlyCounts(closures: Closure[]): MonthlyCounts {
  const counts: MonthlyCounts = {};

  for (const closure of closures) {
    // Use last_day or added_at for counting
    const dateStr = closure.last_day || closure.added_at;
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
      console.warn('Invalid date:', dateStr);
    }
  }

  return counts;
}

/**
 * Get available years from closures data
 */
export function getAvailableYears(closures: Closure[]): string[] {
  const years = new Set<string>();

  for (const closure of closures) {
    const dateStr = closure.last_day || closure.added_at;
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
